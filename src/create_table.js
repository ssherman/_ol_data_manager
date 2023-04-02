// createTable.js
const sequelize = require('./db')
const { DataTypes } = require('sequelize')

async function createTable (tableName, columns) {
  const modelAttributes = {}

  for (const [columnName, type] of Object.entries(columns)) {
    modelAttributes[columnName] = {
      type,
      primaryKey: columnName === 'key'
    }
  }

  const NewTable = sequelize.define(tableName, modelAttributes, {
    freezeTableName: true,
    timestamps: false
  })

  await NewTable.sync({ force: true })
  console.log('Table created successfully!')
}

function transformAndCreateTable (tableName, keyMetaData) {
  console.log('creating Authors Table with keydata: ', keyMetaData)

  // Use Object.entries to loop through the keyMetaData object and call getSqlType on each entry
  const columns = Object.entries(keyMetaData).reduce((accumulator, [key, value]) => {
    const transformed = getSqlType(key, value)
    return { ...accumulator, ...transformed }
  }, {})

  createTable(tableName, columns)
    .then(() => console.log('Done'))
    .catch(error => console.error(error))
}

const getSqlType = (columnName, columnTypes) => {
  let columnType
  if (columnTypes.includes('array')) {
    columnType = DataTypes.JSONB
  } else if (columnTypes.includes('TypeValueText')) {
    columnType = DataTypes.TEXT
  } else if (columnTypes.includes('array[string]')) {
    // if (columnTypes.length !== 1) {
    //   throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`);
    // }
    columnType = DataTypes.ARRAY(DataTypes.TEXT)
  } else if (columnTypes.includes('array[SimpleKey]')) {
    columnType = DataTypes.ARRAY(DataTypes.TEXT)
  } else if (columnTypes.includes('TypeValueDatetime') || columnTypes.includes('datetime')) {
    if (columnTypes.length > 2) {
      throw new Error(`Invalid metadata for column "${columnTypes}"`)
    }
    columnType = DataTypes.DATE
  } else if (columnTypes.includes('string')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`)
    }
    columnType = DataTypes.TEXT
  } else if (columnTypes.includes('SimpleKey')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`)
    }
    columnType = DataTypes.TEXT
  } else if (columnTypes.includes('integer')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`)
    }
    columnType = DataTypes.TEXT
  } else if (columnTypes.includes('object')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`)
    }
    columnType = DataTypes.JSONB
  } else if (columnTypes.includes('boolean')) {
    if (columnTypes.length !== 1) {
      throw new Error(`Invalid metadata for column "${columnTypes}": expected a single type`)
    }
    columnType = DataTypes.BOOLEAN
  } else {
    throw new Error(`no mapped type for column "${columnTypes}"`)
  }

  const result = {}
  result[columnName] = columnType
  return result
}

module.exports = transformAndCreateTable
