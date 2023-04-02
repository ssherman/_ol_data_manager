// Import the basicArrayValue function
const { removeSpecialChars } = require('../src/helpers')

// Write a test case using Jest
test('removes newlines', () => {
  // Define a sample input array
  const input = '"A Sterling/Lark book."\nIncludes index.'

  // Define the expected output JSON string
  const expectedOutput = '"A Sterling/Lark book."Includes index.'

  // Call the basicArrayValue function with the input array
  const actualOutput = removeSpecialChars(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})
