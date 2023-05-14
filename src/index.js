#!/usr/bin/env node

const fs = require('fs')
const transformAndCreateTable = require('./create_table')
const yargs = require('yargs')
const path = require('path')
const os = require('os')

const {
  basicJsonValue,
  formatText,
  getTextValue,
  booleanValue,
  formatArray,
  formatIntegerArray
} = require('./helpers')

const JSON_KEYS_TO_IGNORE = [
  'record_type',
  'type',
  'key',
  'revision',
  'last_modified'
]

async function main () {
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

  console.log('running...')

  const inputType = argv.type
  const inputFilePath = argv.input
  const outputFilePath = argv.output
  const action = argv.action
  const tableName = argv.table_name

  let keyMetaData
  let columnMetaData

  async function writeToJSONFile (inputType, inputFilePath) {
    const tempDir = os.tmpdir()
    const fileName = `${inputType}.json`
    const filePath = path.join(tempDir, fileName)

    let data = {}

    try {
      // Read file if it already exists
      const fileContent = fs.readFileSync(filePath, 'utf8')
      data = JSON.parse(fileContent)
    } catch (err) {
      // Generate new file if it doesn't exist
      data = await getUniqueKeys(inputFilePath)
      fs.writeFileSync(filePath, JSON.stringify(data))
    }

    return data
  }

  switch (action) {
    case 'process':
      console.log('processing ', inputType)
      columnMetaData = await writeToJSONFile(inputType, inputFilePath)
      console.log('column data: ', columnMetaData)

      processData(inputFilePath, outputFilePath, columnMetaData)
      break
    case 'keys':
      console.log('getting unique keys for ', inputType)
      columnMetaData = await getUniqueKeys(inputFilePath)
      getUniqueKeys(inputFilePath, columnMetaData)
      break
    case 'create':
      if (tableName == null) {
        throw new Error('table_name parameter is required when creating a table.')
      }
      console.log('creating table for ', inputType)
      columnMetaData = await writeToJSONFile(inputType, inputFilePath)
      transformAndCreateTable(tableName, columnMetaData)
      break
  }
}

main().catch((err) => {
  console.error('An error occurred:', err)
})

async function getUniqueKeys (inputFilePath) {
  try {
    const keys = await getUniqueJsonKeysWithTypesSorted(inputFilePath)
    console.log(keys)
    return keys
  } catch (err) {
    console.error(err)
    return []
  }
}

function filteredColumnMetaData (columnMetaData) {
  return Object.fromEntries(
    Object.entries(columnMetaData).filter(
      ([column]) => !JSON_KEYS_TO_IGNORE.includes(column)
    )
  )
}

function generateHeaders (columnMetaData) {
  const requiredColumns = ['record_type', 'key', 'revision', 'last_modified']
  const allHeaders = requiredColumns.concat(Object.keys(filteredColumnMetaData(columnMetaData)))
  return allHeaders.join('\t')
}

const readline = require('readline')

function processData (inputFilePath, outputFilePath, columnMetaData) {
  // create a read stream for the input file
  const readStream = fs.createReadStream(inputFilePath, { encoding: 'utf8', highWaterMark: 64 * 1024 })

  // create a write stream for the output file
  const writeStream = fs.createWriteStream(outputFilePath, { encoding: 'utf8' })

  // Write the header line to the output file
  writeStream.write(`${generateHeaders(columnMetaData)}\n`)

  const rl = readline.createInterface({ input: readStream })

  let waitingForDrain = false

  const processLineAndWrite = (line) => {
    const transformedLine = processLine(line, filteredColumnMetaData(columnMetaData))

    // If writeStream.write() returns false, the write stream buffer is full and we need to wait for the 'drain' event
    if (!writeStream.write(transformedLine + '\n')) {
      waitingForDrain = true
    } else {
      waitingForDrain = false
    }
  }

  rl.on('line', (line) => {
    processLineAndWrite(line)

    if (waitingForDrain) {
      rl.pause()
    }
  })

  writeStream.on('drain', () => {
    if (waitingForDrain) {
      waitingForDrain = false
      rl.resume()
    }
  })

  rl.on('close', () => {
    writeStream.end()
  })
}

function convertTypeValueInput (input) {
  const parts = input.split('/')
  const lastPart = parts[parts.length - 1]
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
}

function getType (value) {
  if (typeof value === 'string') {
    return 'string'
  } else if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string' || v === null)) {
      return 'array[string]'
    } else if (value.every((v) => getType(v) === 'integer')) {
      return 'array[Integer]'
    } else if (value.every((v) => getType(v) === 'SimpleKey')) {
      return 'array[SimpleKey]'
    } else if (value.every((v) => getType(v) === 'TypeValueText')) {
      return 'array[TypeValueText]'
    } else if (value.every((v) => getType(v) === 'TypeValueDatetime')) {
      return 'array[TypeValueDatetime]'
    }
    return 'array'
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    if (Object.keys(value).length === 2 && 'type' in value && 'value' in value) {
      return `TypeValue${convertTypeValueInput(value.type)}`
    } else if (Object.keys(value).length === 1 && 'key' in value) {
      return 'SimpleKey'
    }
    return 'object'
  } else if (typeof value === 'number' && Number.isInteger(value)) {
    return 'integer'
  } else if (typeof value === 'boolean') {
    return 'boolean'
  } else {
    return 'unknown'
  }
}

function processLineForKeys (line, keysWithTypes) {
  const columns = line.split('\t')
  const jsonStr = columns[4]
  const json = JSON.parse(jsonStr)
  const keys = Object.keys(json)
  for (const key of keys) {
    if (JSON_KEYS_TO_IGNORE.includes(key)) {
      continue // Skip processing keys in JSON_KEYS_TO_IGNORE
    }

    if (!keysWithTypes[key]) {
      keysWithTypes[key] = new Set()
    }
    const type = getType(json[key])
    keysWithTypes[key].add(type)
  }
}

function sortKeysWithTypes (keysWithTypes) {
  const sortedKeys = Object.keys(keysWithTypes).sort()
  const sortedKeysWithTypes = {}

  sortedKeysWithTypes.record_type = ['string']
  sortedKeysWithTypes.key = ['string']
  sortedKeysWithTypes.revision = ['integer']
  sortedKeysWithTypes.last_modified = ['datetime']

  for (const key of sortedKeys) {
    sortedKeysWithTypes[key] = Array.from(keysWithTypes[key])
  }
  return sortedKeysWithTypes
}

function getUniqueJsonKeysWithTypesSorted (filePath) {
  const keysWithTypes = {}
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' })

  let remaining = ''
  fileStream.on('data', (chunk) => {
    const lines = (remaining + chunk).split(/\r?\n/)
    remaining = lines.pop()
    for (const line of lines) {
      processLineForKeys(line, keysWithTypes)
    }
  })

  return new Promise((resolve, reject) => {
    fileStream.on('end', () => {
      if (remaining) {
        try {
          processLineForKeys(remaining, keysWithTypes)
        } catch (err) {
          reject(err)
        }
      }
      resolve(sortKeysWithTypes(keysWithTypes))
    })

    fileStream.on('error', (err) => {
      reject(err)
    })
  })
}

const transformColumn = (types, value) => {
  let transformedValue
  if (types.includes('array')) {
    transformedValue = basicJsonValue(value)
  } else if (types.includes('TypeValueText')) {
    transformedValue = formatText(getTextValue(value))
  } else if (types.includes('array[TypeValueText]')) {
    transformedValue = formatArray(getTextValue(value))
  } else if (types.includes('array[string]')) {
    transformedValue = formatArray(getTextValue(value))
  } else if (types.includes('array[SimpleKey]')) {
    transformedValue = formatArray(getTextValue(value))
  } else if (types.includes('array[Integer]')) {
    transformedValue = formatIntegerArray(value)
  } else if (types.includes('TypeValueDatetime')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`)
    }
    // transformedValue = transformJsonTypeValueDatetime(value);
    transformedValue = formatText(getTextValue(value))
  } else if (types.includes('string')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`)
    }
    transformedValue = formatText(getTextValue(value))
  } else if (types.includes('SimpleKey')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`)
    }
    transformedValue = formatText(getTextValue(value))
  } else if (types.includes('integer')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`)
    }
    transformedValue = getTextValue(value)
  } else if (types.includes('object')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`)
    }
    transformedValue = basicJsonValue(value)
  } else if (types.includes('boolean')) {
    if (types.length !== 1) {
      throw new Error(`Invalid metadata for column "${types}": expected a single type`)
    }
    transformedValue = booleanValue(value)
  }
  return transformedValue
}

const transformRow = (row, columnMetaData) => {
  const newLine = []
  Object.entries(columnMetaData).forEach(([column, types]) => {
    const value = row[column] ?? ''
    const transformedValue = transformColumn(types, value)
    newLine.push(transformedValue)
  })
  return newLine
}

function processLine (line, columnMetaData) {
  const parts = line.split('\t')

  const recordType = parts[0]
  const key = parts[1]
  const revision = parts[2]
  const lastModified = parts[3]

  const newLine = []
  newLine.push(formatText(recordType))
  newLine.push(formatText(key))
  newLine.push(formatText(revision))
  newLine.push(formatText(lastModified))

  const json = JSON.parse(parts[4])

  // delete any existing keys
  for (const key of JSON_KEYS_TO_IGNORE) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      delete json[key]
    }
  }

  const transformedRow = transformRow(json, columnMetaData)
  newLine.push(...transformedRow)

  return newLine.join('\t')
}
