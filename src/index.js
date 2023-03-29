const fs = require('fs')
const transformAndCreateTable = require('./create_table')
const yargs = require('yargs')
const typeOpts = ['editions', 'works', 'authors']
const path = require('path');
const {
  basicValue,
  basicArrayValue,
  arrayKeyValues,
  basicTextValue,
  basicJsonValue,
  keyReferenceValue,
  arrayBasicTextValue
} = require('./helpers');

async function main() {

  const argv = yargs
  .option('input', {
    alias: 'i',
    describe: 'Input file path',
    type: 'string',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    describe: 'Output file path',
    type: 'string',
    demandOption: false
  })
  .option('type', {
    alias: 't',
    describe: 'File type',
    type: 'string',
    demandOption: true
  })
  .option('action', {
    alias: 'a',
    describe: 'Action (process, or keys)',
    type: 'string',
    demandOption: true,
    default: 'process'
  })
  .option('table_name', {
    alias: 'n',
    describe: 'Table name to create',
    type: 'string',
    demandOption: false
  })
  .argv

  console.log("running...");

  const inputType = argv.type
  const inputFilePath = argv.input
  const outputFilePath = argv.output
  const action = argv.action;
  const tableName = argv.table_name;

  let keyMetaData;
  let columnMetaData;

  switch (action) {
    case 'process':
      console.log('processing ', inputType);
      columnMetaData = await getUniqueKeys(inputFilePath);
      processData(inputFilePath, outputFilePath, columnMetaData);
      break;
    case 'keys':
      console.log('getting unique keys for ', inputType);
      columnMetaData = await getUniqueKeys(inputFilePath);
      getUniqueKeys(inputFilePath, columnMetaData);
      break;
    case 'create':
      if (tableName == null) {
        throw new Error("table_name parameter is required when creating a table.");
      }
      console.log('creating table for ', inputType);
      keyMetaData = await getUniqueKeys(inputFilePath, null);
      transformAndCreateTable(tableName, keyMetaData);
      break;
    case 'import':
      if (tableName == null) {
        throw new Error("table_name parameter is required when creating a table.");
      }
      console.log('importing data for: ', inputType);
      const absoluteFilePath = path.resolve(inputFilePath);
      importDataFromTsv(tableName, absoluteFilePath)
      console.log('Absolute file path:', absoluteFilePath);

      break;
  }
}

main().catch((err) => {
  console.error('An error occurred:', err);
});

async function getUniqueKeys(inputFilePath) {
  try {
    const keys = await getUniqueJsonKeysWithTypesSorted(inputFilePath);
    console.log(keys);
    return keys;
  } catch (err) {
    console.error(err);
    return [];
  }
}


function processData (inputFilePath, outputFilePath, columnMetaData) {
  // create a read stream for the input file
  const readStream = fs.createReadStream(inputFilePath, { encoding: 'utf8', highWaterMark: 64 * 1024 })

  // create a write stream for the output file
  const writeStream = fs.createWriteStream(outputFilePath, { encoding: 'utf8' })

  const filteredColumnMetaData = Object.fromEntries(
    Object.entries(columnMetaData).filter(
      ([column]) => !JSON_KEYS_TO_IGNORE.includes(column)
    )
  );

  const requiredColumns = ['record_type', 'key', 'revision', 'last_modified'];
  const allHeaders = requiredColumns.concat(Object.keys(filteredColumnMetaData));
  // console.log("allHeaders: ", allHeaders);

  // Join the headers with a tab character
  const headerLine = allHeaders.join('\t');

  // Write the header line to the output file
  writeStream.write(`${headerLine}\n`);

  let remaining = ''
  readStream.on('data', (chunk) => {
    const lines = (remaining + chunk).split('\n')

    // keep the last incomplete line
    remaining = lines.pop()

    // let line_index = 0
    for (const line of lines) {
      // console.log(line);
      // console.log(filteredColumnMetaData);
      processLine(line, filteredColumnMetaData, writeStream)
      // line_index += 1
      // if (line_index >= 2)
      //   exit()
    }
  })

  readStream.on('end', () => {
    // process the last incomplete line, if any
    if (remaining) {
      processLine(remaining, filteredColumnMetaData, writeStream)
    }
    writeStream.end()
  })
}

function convertTypeValueInput(input) {
  const parts = input.split('/');
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}


function getType(value) {
  if (typeof value === 'string') {
    return 'string';
  } else if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string')) {
      return 'array[string]';
    } else if (value.every((v) => getType(v) === 'SimpleKey')) {
      return 'array[SimpleKey]';
    } else if (value.every((v) => getType(v) === 'TypeValueText')) {
      return 'array[TypeValueText]';
    } else if (value.every((v) => getType(v) === 'TypeValueDatetime')) {
      return 'array[TypeValueDatetime]';
    }
    return 'array';
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    if (Object.keys(value).length === 2 && 'type' in value && 'value' in value) {
      return `TypeValue${convertTypeValueInput(value.type)}`;
    } else if (Object.keys(value).length === 1 && 'key' in value) {
      return 'SimpleKey';
    }
    return 'object';
  } else if (typeof value === 'number' && Number.isInteger(value)) {
    return 'integer';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else {
    return 'unknown';
  }
}

function processLineForKeys(line, keysWithTypes) {
  const columns = line.split('\t');
  const jsonStr = columns[4];
  const json = JSON.parse(jsonStr);
  const keys = Object.keys(json);
  for (const key of keys) {
    if (JSON_KEYS_TO_IGNORE.includes(key)) {
      continue; // Skip processing keys in JSON_KEYS_TO_IGNORE
    }

    if (!keysWithTypes[key]) {
      keysWithTypes[key] = new Set();
    }
    const type = getType(json[key]);
    keysWithTypes[key].add(type);
  }
}

function sortKeysWithTypes(keysWithTypes) {
  const sortedKeys = Object.keys(keysWithTypes).sort();
  const sortedKeysWithTypes = {};

  sortedKeysWithTypes['record_type'] = ['string']
  sortedKeysWithTypes['key'] = ['string']
  sortedKeysWithTypes['revision'] = ['integer']
  sortedKeysWithTypes['last_modified'] = ['datetime']
  
  for (const key of sortedKeys) {
    sortedKeysWithTypes[key] = Array.from(keysWithTypes[key]);
  }
  return sortedKeysWithTypes;
}

function getUniqueJsonKeysWithTypesSorted(filePath) {
  const keysWithTypes = {};
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

  let remaining = '';
  fileStream.on('data', (chunk) => {
    const lines = (remaining + chunk).split(/\r?\n/);
    remaining = lines.pop();
    for (const line of lines) {
      processLineForKeys(line, keysWithTypes);
    }
  });

  return new Promise((resolve, reject) => {
    fileStream.on('end', () => {
      if (remaining) {
        try {
          processLineForKeys(remaining, keysWithTypes);
        } catch (err) {
          reject(err);
        }
      }
      resolve(sortKeysWithTypes(keysWithTypes));
    });

    fileStream.on('error', (err) => {
      reject(err);
    });
  });
}

const transformJsonStringArray = (value) => {
  return basicArrayValue(value);
};

const transformJsonSimpleKeyArray = (value) => {
  // logic to transform array[SimpleKey]
  return arrayKeyValues(value);
};

const transformJsonTypeValueTextArray = (value) => {
  return arrayBasicTextValue(value);
}

const transformJsonTypeValueText = (value) => {
  // logic to transform TypeValueText
  return basicTextValue(value);
};

const transformJsonTypeValueDatetime = (value) => {
  // logic to transform TypeValueDatetime
  return basicTextValue(value);
};

const transformJsonString = (value) => {
  // logic to transform string
  return basicValue(value);
};

const transformJsonObject = (value) => {
  // logic to transform array
  return basicJsonValue(value);
};

const transformJsonSimpleKey = (value) => {
  // logic to transform SimpleKey
  return keyReferenceValue(value);
};

const transformInteger = (value) => {
  // logic to transform integer
  return basicValue(value);
};

const transformColumn = (types, value) => {
  let transformedValue;
  if (types.includes('array')) {
    transformedValue = transformJsonObject(value);
  } else if (types.includes('TypeValueText')) {
    transformedValue = transformJsonTypeValueText(value);
  } else if (types.includes('array[TypeValueText]')) {
    transformedValue = transformJsonTypeValueTextArray(value);
  } else if (types.includes('array[string]')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`);
    }
    transformedValue = transformJsonStringArray(value);
  } else if (types.includes('array[SimpleKey]')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`);
    }
    transformedValue = transformJsonSimpleKeyArray(value);
  } else if (types.includes('TypeValueDatetime')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`);
    }
    transformedValue = transformJsonTypeValueDatetime(value);
  } else if (types.includes('string')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`);
    }
    transformedValue = transformJsonString(value);
  } else if (types.includes('SimpleKey')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`);
    }
    transformedValue = transformJsonSimpleKey(value);
  } else if (types.includes('integer')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`);
    }
    transformedValue = transformInteger(value);
  } else if (types.includes('object')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`);
    }
    transformedValue = transformJsonObject(value);
  }
  return transformedValue;
};

const transformRow = (row, columnMetaData) => {
  let newLine = [];
  Object.entries(columnMetaData).forEach(([column, types]) => {
    const value = row[column] ?? '';
    const transformedValue = transformColumn(types, value);
    // console.log(`${column} : ${transformedValue}`)
    newLine.push(transformedValue)
  });
  return newLine;
};

const JSON_KEYS_TO_IGNORE = [
  'record_type',
  'type',
  'key',
  'revision',
  'last_modified'
]

function processLine(line, columnMetaData, writeStream) {
  const parts = line.split('\t');

  const record_type = parts[0];
  const key = parts[1];
  const revision = parts[2];
  const last_modified = parts[3];

  let newLine = [];
  newLine.push(basicValue(record_type));
  newLine.push(basicValue(key));
  newLine.push(basicValue(revision));
  newLine.push(basicValue(last_modified));

  const json = JSON.parse(parts[4]);

  // delete any existing keys
  for (const key of JSON_KEYS_TO_IGNORE) {
    if (json.hasOwnProperty(key)) {
      delete json[key];
    }
  }

  // console.log(json);

  const transformedRow = transformRow(json, columnMetaData);
  // console.log(transformedRow);
  newLine.push(...transformedRow);

  let outputLine = newLine.join("\t");
  writeStream.write(outputLine + "\n");
}


function getUniqueJsonKeysWithTypes(filePath) {
  const keysWithTypes = {};

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

  let remaining = '';
  fileStream.on('data', (chunk) => {
    const lines = (remaining + chunk).split(/\r?\n/);
    remaining = lines.pop();
    for (const line of lines) {
      const columns = line.split('\t');
      const jsonStr = columns[4];
      const json = JSON.parse(jsonStr);
      const keys = Object.keys(json);
      for (const key of keys) {
        if (!keysWithTypes[key]) {
          keysWithTypes[key] = new Set();
        }
        const type = getType(json[key]);
        keysWithTypes[key].add(type);
      }
    }
  });

  return new Promise((resolve, reject) => {
    fileStream.on('end', () => {
      if (remaining) {
        try {
          const columns = remaining.split('\t');
          const jsonStr = columns[4];
          const json = JSON.parse(jsonStr);
          const keys = Object.keys(json);
          for (const key of keys) {
            if (!keysWithTypes[key]) {
              keysWithTypes[key] = new Set();
            }
            const type = getType(json[key]);
            keysWithTypes[key].add(type);
          }
          resolve(keysWithTypes);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(keysWithTypes);
      }
    });

    fileStream.on('error', (err) => {
      reject(err);
    });
  });
}

function getUniqueJsonKeys(filePath) {
  const uniqueKeys = new Set();

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });

  let remaining = '';
  fileStream.on('data', (chunk) => {
    const lines = (remaining + chunk).split(/\r?\n/);
    remaining = lines.pop();
    for (const line of lines) {
      const columns = line.split('\t');
      const jsonStr = columns[4];
      const json = JSON.parse(jsonStr);
      const keys = Object.keys(json);
      for (const key of keys) {
        uniqueKeys.add(key);
      }
    }
  });

  return new Promise((resolve, reject) => {
    fileStream.on('end', () => {
      if (remaining) {
        try {
          const columns = remaining.split('\t');
          const jsonStr = columns[4];
          const json = JSON.parse(jsonStr);
          const keys = Object.keys(json);
          for (const key of keys) {
            uniqueKeys.add(key);
          }
          resolve(Array.from(uniqueKeys));
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(Array.from(uniqueKeys));
      }
    });

    fileStream.on('error', (err) => {
      reject(err);
    });
  });
}