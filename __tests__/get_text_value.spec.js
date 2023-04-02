// Import the basicArrayValue function
const { getTextValue } = require('../src/helpers')

// Write a test case using Jest
test('getTextValue should return the expected JSON string', () => {
  // Define a sample input array
  const input = ['a', 'b', 'c']

  // Define the expected output JSON string
  const expectedOutput = ['a', 'b', 'c']

  // Call the basicArrayValue function with the input array
  const actualOutput = getTextValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})

test('getTextValue handles double quotes correctly', () => {
  // Define a sample input array
  const input = ['"V"']

  // Define the expected output JSON string
  const expectedOutput = ['"V"']

  // Call the basicArrayValue function with the input array
  const actualOutput = getTextValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})

test('getTextValue handles strings with commas', () => {
  // Define a sample input array
  const input = [
    'Braun, G.',
    'Braun, Günter,',
    'Braun, Günther',
    "Pulaoên, Chün t'ê"
  ]

  // Define the expected output JSON string
  const expectedOutput = ['Braun, G.', 'Braun, Günter,', 'Braun, Günther', "Pulaoên, Chün t'ê"]

  // Call the basicArrayValue function with the input array
  const actualOutput = getTextValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})

test('getTextValue handles null', () => {
  // Define a sample input array
  const input = []

  // Define the expected output JSON string
  const expectedOutput = []

  // Call the basicArrayValue function with the input array
  const actualOutput = getTextValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})

test('getTextValue handles bug1', () => {
  // Define a sample input array
  const input = [
    'H. H. Munro (\\\"Saki\\\")'
  ]

  // Define the expected output JSON string
  const expectedOutput = ['H. H. Munro (\\"Saki\\")']

  // Call the basicArrayValue function with the input array
  const actualOutput = getTextValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})

test('simpleKey', () => {
  const input = [{ key: '/works/OL14894249W' }]

  const expectedOutput = ['/works/OL14894249W']

  // Call the basicArrayValue function with the input array
  const actualOutput = getTextValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})

test('number', () => {
  const input = 286

  const expectedOutput = 286

  // Call the basicArrayValue function with the input array
  const actualOutput = getTextValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})
