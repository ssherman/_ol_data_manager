const {
  basicValue,
  basicArrayValue,
  arrayKeyValues,
  basicTextValue,
  basicJsonValue,
  keyReferenceValue
} = require('./helpers');
const { Sequelize, DataTypes } = require('sequelize');
//

// const columnMetaData = {
//   alternate_names: [ 'array[string]' ],
//   authors: [ 'array[SimpleKey]', 'array' ],
//   bio: [ 'TypeValueText', 'string' ],
//   birth_date: [ 'string' ],
//   body: [ 'TypeValueText' ],
//   by_statement: [ 'string' ],
//   comment: [ 'string' ],
//   contributions: [ 'array[string]' ],
//   covers: [ 'array' ],
//   create: [ 'string' ],
//   created: [ 'TypeValueDatetime' ],
//   date: [ 'string' ],
//   death_date: [ 'string' ],
//   dewey_decimal_class: [ 'array[string]' ],
//   edition_name: [ 'string' ],
//   entity_type: [ 'string' ],
//   entiy_type: [ 'string' ],
//   fuller_name: [ 'string' ],
//   genres: [ 'array[string]' ],
//   id_librarything: [ 'string' ],
//   id_viaf: [ 'string' ],
//   id_wikidata: [ 'string' ],
//   key: [ 'string' ],
//   languages: [ 'array[SimpleKey]' ],
//   last_modified: [ 'TypeValueDatetime' ],
//   latest_revision: [ 'integer' ],
//   lc_classifications: [ 'array[string]' ],
//   lccn: [ 'array[string]' ],
//   links: [ 'array' ],
//   location: [ 'string' ],
//   marc: [ 'array[string]' ],
//   name: [ 'string' ],
//   notes: [ 'TypeValueText' ],
//   number_of_pages: [ 'integer' ],
//   numeration: [ 'string' ],
//   ocaid: [ 'string' ],
//   oclc_numbers: [ 'array[string]' ],
//   other_titles: [ 'array[string]' ],
//   pagination: [ 'string' ],
//   personal_name: [ 'string' ],
//   photograph: [ 'string' ],
//   photos: [ 'array' ],
//   publish_country: [ 'string' ],
//   publish_date: [ 'string' ],
//   publish_places: [ 'array[string]' ],
//   publishers: [ 'array[string]' ],
//   remote_ids: [ 'object' ],
//   revision: [ 'integer' ],
//   role: [ 'string' ],
//   series: [ 'array[string]' ],
//   source_records: [ 'array[string]' ],
//   subject_place: [ 'array[string]' ],
//   subject_time: [ 'array[string]' ],
//   subjects: [ 'array[string]' ],
//   subtitle: [ 'string' ],
//   tags: [ 'string' ],
//   title: [ 'string' ],
//   title_prefix: [ 'string' ],
//   type: [ 'SimpleKey' ],
//   website: [ 'string' ],
//   website_name: [ 'string' ],
//   wikipedia: [ 'string' ],
//   works: [ 'array[SimpleKey]' ]
// }

const transformJsonStringArray = (value) => {
  return basicArrayValue(value);
};

const transformJsonSimpleKeyArray = (value) => {
  // logic to transform array[SimpleKey]
  return arrayKeyValues(value);
};

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

const getSqlType = (columnName, columnTypes) => {
  if (columnTypes.includes('array')) {
    columnType = DataTypes.JSONB;
  } else if (columnTypes.includes('TypeValueText')) {
    columnType = DataTypes.TEXT;
  } else if (columnTypes.includes('array[string]')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`);
    }
    columnType = DataTypes.ARRAY(DataTypes.TEXT);
  } else if (columnTypes.includes('array[SimpleKey]')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`);
    }
    columnType = DataTypes.ARRAY(DataTypes.TEXT);
  } else if (columnTypes.includes('TypeValueDatetime') || columnTypes.includes('datetime')) {
    if (columnTypes.length > 2) {
      throw new Error(`Invalid metadata for column "${columnTypes}"`);
    }
    columnType = DataTypes.DATE;
  } else if (columnTypes.includes('string')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`);
    }
    columnType = DataTypes.TEXT;
  } else if (columnTypes.includes('SimpleKey')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`);
    }
    columnType = DataTypes.TEXT;
  } else if (columnTypes.includes('integer')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`);
    }
    columnType = DataTypes.TEXT;
  } else if (columnTypes.includes('object')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`);
    }
    columnType = DataTypes.JSONB;
  } else {
    throw new Error(`no mapped type for column "${columnTypes}"`);
  }

  let result = {};
  result[columnName] = columnType;
  return result;
};

const transformColumn = (types, value) => {
  let transformedValue;
  if (types.includes('array')) {
    transformedValue = transformJsonObject(value);
  } else if (types.includes('TypeValueText')) {
    transformedValue = transformJsonTypeValueText(value);
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
  }
  return transformedValue;
};

const transformRow = (row, columnMetaData) => {
  let newLine = [];
  Object.entries(columnMetaData).forEach(([column, types]) => {
    const value = row[column] ?? '';
    const transformedValue = transformColumn(types, value);
    newLine.push(transformedValue)
  });
  return newLine;
};

// function createTable(tableName, keyMetaData) {
//   console.log('creating Authors Table with keydata: ', keyMetaData);
  

//   // Use Object.entries to loop through the keyMetaData object and call getSqlType on each entry
//   const columns = Object.entries(keyMetaData).reduce((accumulator, [key, value]) => {
//     const transformed = getSqlType(key, value);
//     return { ...accumulator, ...transformed };
//   }, {});

//   createTable(tableName, columns)
//     .then(() => console.log('Done'))
//     .catch(error => console.error(error));
// }

const NON_JSON_COLUMNS = {
  record_type: [ 'string' ],
  key: [ 'string' ],
  revision: [ 'integer' ],
  last_modified: [ 'datetime' ]
}

function processAuthorsLine(line, columnMetaData, writeStream) {
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
  for (const key in NON_JSON_COLUMNS) {
    if (json.hasOwnProperty(key)) {
      delete json[key];
    }
  }

  const transformedRow = transformRow(json, columnMetaData);
  newLine.push(...transformedRow);

  let outputLine = newLine.join("\t");
  writeStream.write(outputLine + "\n");
}

module.exports = {
  processAuthorsLine
};