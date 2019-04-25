const JavascriptCodeJasmineTester = require('./javascript-code-jasmine-tester');

(async () => {
  const { SOLUTION_CODE: solutionCode, TEST_CODE: testCode } = process.env;
  let testResults;
  try {
    testResults = await new JavascriptCodeJasmineTester().test(solutionCode, testCode);
  } catch (error) {
    process.exit(error instanceof SyntaxError ? 1 : 255);
  }
  process.stdout.write(testResults);
})();
