// Import the basicArrayValue function
const { basicArrayValue } = require('../src/helpers');

// Write a test case using Jest
test('basicArrayValue should return the expected JSON string', () => {
  // Define a sample input array
  const input = ['a', 'b', 'c'];

  // Define the expected output JSON string
  const expectedOutput = '"{""a"",""b"",""c""}"';

  // Call the basicArrayValue function with the input array
  const actualOutput = basicArrayValue(input);

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput);
});

test('basicArrayValue handles double quotes correctly', () => {
  // Define a sample input array
  const input = ['"V"'];

  // Define the expected output JSON string
  const expectedOutput = '"{""\\""V\\""""}"';

  // Call the basicArrayValue function with the input array
  const actualOutput = basicArrayValue(input);

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput);
});

test('basicArrayValue handles strings with commas', () => {
  // Define a sample input array
  const input = [
    "Braun, G.",
    "Braun, Günter,",
    "Braun, Günther",
    "Pulaoên, Chün t'ê"
  ]

  // Define the expected output JSON string
  const expectedOutput = '"{""Braun, G."",""Braun, Günter,"",""Braun, Günther"",""Pulaoên, Chün t\'ê""}"';

  // Call the basicArrayValue function with the input array
  const actualOutput = basicArrayValue(input);
  console.log(actualOutput)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput);
});

test('basicArrayValue handles bug1', () => {
  // Define a sample input array
  const input = [
    "H. H. Munro (\\\"Saki\\\")",
  ]

  // Define the expected output JSON string
  const expectedOutput = '"{""H. H. Munro (\""Saki\"")""}"';

  // Call the basicArrayValue function with the input array
  const actualOutput = basicArrayValue(input);
  console.log(actualOutput)

  // Assert that the actual output matches the expected output
  expect(actualOutput).toEqual(expectedOutput);
});
