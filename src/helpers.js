const fs = require('fs')

const nullValue = 'NULLNULL'
function basicValue(value) {
  if (!value || value.toString().trim() === '') {
    return nullValue;
  } else {
    return cleanupText(value);
  }
}

// function escapeQuotesInObject(obj) {
//   if (typeof obj !== 'object' || obj === null) {
//     return obj;
//   }
  
//   if (Array.isArray(obj)) {
//     return obj.map(escapeQuotesInObject);
//   }
  
//   const newObj = {};
//   for (let key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       const value = obj[key];
//       if (typeof value === 'string') {
//         newObj[key] = value.replace(/"/g, '\\\\"');
//       } else {
//         newObj[key] = escapeQuotesInObject(value);
//       }
//     }
//   }
  
//   return newObj;
// }

function jsonValueReplacer(key, value) {
  // Filtering out properties
  if (typeof value === "string") {
    return removeSpecialChars(value);
  }
  return value;
}

function basicJsonValue (value) {
  let newValue = '';
  if (!value || value.toString().trim() === '') {
    return nullValue
  } else if (Array.isArray(value) && value.length > 0 && value[0].type) { 
    newValue = JSON.stringify(value, jsonValueReplacer)
  } else if (Array.isArray(value)) {
    newValue = value.map(item => ({type: '/type/text', value: item}))
    newValue = JSON.stringify(newValue, jsonValueReplacer)
  } else {
    newValue = JSON.stringify(value, jsonValueReplacer);
  }
  return '"' + newValue.replace(/"/g, '""') + '"';
}

function booleanValue (value) {
  if (!value || value.toString().trim() === '') {
    return 0
  } else {
    return value === 'true' ? 1 : 0
  }
}

function removeSpecialChars(value) {
  return value.toString().replace(/\r/g, '').replace(/\n/g, '').replace(/\t/g, '').replace(/\\/g, '');
}

function cleanupText(value) {
  let strValue = removeSpecialChars(value);

  if (strValue.includes('"')) {
    strValue = strValue.replace(/"/g, '""');
    strValue = `"${strValue}"`;
  }

  return strValue;
}

function basicArrayValue(input) {
  if (!input || input.length === 0) {
    return '{}';
  }

  const formattedInput = input.map(item => `""${item.replace(/\\/g, '').replace(/"/g, '\\""')}""`);
  return `"{${formattedInput.join(',')}}"`;
}

function arrayKeyValues (values) {
  if (!Array.isArray(values) || !values.length) {
    return '{}'
  } else {
    return '{' + values.map(x => keyReferenceValue(x)).filter(n => n).join(',') + '}'
  }
}

function getTextValue(value) {
  // Case: Array
  if (Array.isArray(value)) {
    return value.map(item => getTextValue(item));
  }

  // Case 1: null, undefined, or an empty string
  if (value === null || value === undefined || value === "") {
    return "NULLNULL";
  }
  
  // Case 2: a non-empty plain JavaScript string
  if (typeof value === "string") {
    return value;
  }

  // Case 3: a JavaScript object with a type and value field
  if (typeof value === "object" && value.hasOwnProperty("type") && value.hasOwnProperty("value")) {
    return value.value;
  }

  // Case 4: a JavaScript object with a single key field
  if (typeof value === "object" && Object.keys(value).length === 1 && value.hasOwnProperty("key")) {
    return value.key;
  }

  // If the value is not one of the options above, raise an exception
  throw new Error("Invalid value provided.");
}


function keyReferenceValue (value) {
  // return value !== undefined ? value.split('/').slice(-1)[0] : undefined
  return value !== undefined ? value.key : nullValue
  //return value
}

function arrayBasicTextValue (values) {
  if (!Array.isArray(values) || !values.length) {
    return '{}'
  } else {
    let newValues = values.map(x => basicTextValue(x)).filter(n => n)
    return basicArrayValue(newValues)
  }
}

function basicTextValue (value) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return nullValue
  } else if (typeof value === 'object' && !value.value) {
    return nullValue
  } else {
    const output = value.value || value
    return cleanupText(output)
  }
}

function getSimpleKeyValue(obj) {
  if (!obj || !obj.hasOwnProperty('key')) {
    return null;
  }
  return obj.key;
}

module.exports = {
  basicValue,
  booleanValue,
  basicArrayValue,
  arrayKeyValues,
  basicTextValue,
  basicJsonValue,
  keyReferenceValue,
  arrayBasicTextValue,
  getTextValue
}


// select array['"V"'::text];