const nullValue = 'NULLNULL'

function jsonValueReplacer (key, value) {
  // Filtering out properties
  if (typeof value === 'string') {
    return removeSpecialChars(value)
  }
  return value
}

function basicJsonValue (value) {
  let newValue = ''
  if (!value || value.toString().trim() === '') {
    return nullValue
  } else if (Array.isArray(value) && value.length > 0 && value[0].type) {
    newValue = JSON.stringify(value, jsonValueReplacer)
  } else if (Array.isArray(value)) {
    newValue = value.map(item => ({ type: '/type/text', value: item }))
    newValue = JSON.stringify(newValue, jsonValueReplacer)
  } else {
    newValue = JSON.stringify(value, jsonValueReplacer)
  }
  return '"' + newValue.replace(/"/g, '""') + '"'
}

function booleanValue (value) {
  if (!value || value.toString().trim() === '') {
    return 0
  } else {
    return value === 'true' ? 1 : 0
  }
}

function removeSpecialChars (value) {
  if (value === null) {
    return null
  }
  const v = value.toString().replace(/\r/g, '').replace(/\n/g, '').replace(/\t/g, '').replace(/\\/g, '')
  return v
}

function formatArray (input) {
  if (!input || input.length === 0 || input === nullValue) {
    return '{}'
  }

  if (!Array.isArray(input)) {
    input = [input]
  }
  const formattedInput = input.map(item => `""${removeSpecialChars(item).replace(/\\/g, '').replace(/"/g, '\\""')}""`)
  return `"{${formattedInput.join(',')}}"`
}

function formatText (value) {
  let strValue = removeSpecialChars(value)

  if (strValue.includes('"')) {
    strValue = `""${strValue.replace(/"/g, '\\""')}""`
  }

  return strValue
}

function getTextValue (value) {
  // Case: Array
  if (Array.isArray(value)) {
    return value.map(x => getTextValue(x))
    // return basicArrayValue(value)
  }

  // Case: Number
  if (typeof value === 'number') {
    return value
  }

  // Case 1: null, undefined, or an empty string
  if (value === null || value === undefined || value === '') {
    return nullValue
  }

  // Case 2: a non-empty plain JavaScript string
  if (typeof value === 'string') {
    return value
  }

  // Case 3: a JavaScript object with a type and value field
  if (
    typeof value === 'object' &&
    Object.prototype.hasOwnProperty.call(value, 'type') &&
    Object.prototype.hasOwnProperty.call(value, 'value')
  ) {
    return value.value
  }

  // Case 4: a JavaScript object with a single key field
  if (
    typeof value === 'object' &&
    Object.keys(value).length === 1 &&
    Object.prototype.hasOwnProperty.call(value, 'key')
  ) {
    return value.key
  }

  // If the value is not one of the options above, raise an exception
  throw new Error(`Invalid value provided: ${value}`)
}

module.exports = {
  booleanValue,
  formatArray,
  basicJsonValue,
  getTextValue,
  formatText,
  removeSpecialChars
}
