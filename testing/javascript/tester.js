const JasmineTestCodeGenerator = require('./jasmine-test-code-generator'),
  JavascriptCodeJasmineTester = require('./javascript-code-jasmine-tester');

(async () => {
  let { SOLUTION_CODE: solutionCode, TEST_CODE: testCode, TEST_JSON: testJson } = process.env;
  let testResults;
  try {
    if (testJson !== undefined) {
      testCode = new JasmineTestCodeGenerator().generate(testJson);
    }
    testResults = await new JavascriptCodeJasmineTester().test(solutionCode, testCode);
  } catch (error) {
    process.exit(error instanceof SyntaxError ? 1 : 255);
  }
  process.stdout.write(testResults);
})();
