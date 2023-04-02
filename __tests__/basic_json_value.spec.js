// Import the basicArrayValue function
const { basicJsonValue } = require('../src/helpers')

// Write a test case using Jest
test('basicJsonValue should return the expected JSON string', () => {
  // Define a sample input array
  const input = { viaf: '11565164', wikidata: 'Q4665459', isni: '0000000080908836' }

  // Define the expected output JSON string
  const expectedOutput = '"{""viaf"":""11565164"",""wikidata"":""Q4665459"",""isni"":""0000000080908836""}"'

  // Call the basicArrayValue function with the input array
  const actualOutput = basicJsonValue(input)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput)
})
