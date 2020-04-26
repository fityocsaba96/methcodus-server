import { watch, existsSync } from 'fs';
import { resolve } from 'path';
import { TesterService } from './tester.service';
import { Test } from './tester.interface';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

describe('tester service', () => {
  describe('test', () => {
    describe('javascript tester with test code', () => {
      it('should test multiple describes', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `
              describe('', () => it('[X]', () => {}));
              describe('', () => it('[Y]', () => {}));`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'pass' },
          ],
        });
      });

      it('should test nested describe', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `
              describe('', () => {
                it('[X]', () => {});
                describe('', () => it('[Y]', () => {}));
              });`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'pass' },
          ],
        });
      });

      it('should return empty array on empty code', async () => {
        expect(
          await testJavascriptWithCode({
            solutionCode: '',
            testCode: '',
          }),
        ).toEqual({
          results: [],
        });
      });

      it('should return pass status on passed test case', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `it('[X]', () => expect(true).toBe(true));`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should return fail status on failed test case', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `it('[X]', () => expect(true).toBe(false));`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'fail' }],
        });
      });

      it('should return skip status on skipped test case', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `
              it('[X]', () => {});
              xit('[Y]', () => {});`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'skip' },
          ],
        });
      });

      it('should return skip status for test cases in skipped describe', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `
              describe('', () => {
                it('[X]', () => {});
                xdescribe('', () => {
                  it('[Y]', () => {});
                  it('[Z]', () => {});
                });
              });`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'skip' },
            { name: '[Z]', status: 'skip' },
          ],
        });
      });

      it('should work with commonjs modules', async () => {
        expect(
          await testJavascriptWithCode({
            solutionCode: `module.exports = () => 42;`,
            testCode: `it('[X]', () => expect(require('.')()).toBe(42));`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should work with es6 modules', async () => {
        expect(
          await testJavascriptWithCode({
            solutionCode: `export const get = () => 42;`,
            testCode: `
              import { get } from '.';
              it('[X]', () => expect(get()).toBe(42));`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should use corejs polyfills', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `it('[X]', () => expect(Map.of([42, 24]).get(42)).toBe(24));`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should complete all testings when started multiple testing processes', async () => {
        expect(
          await Promise.all(
            Array.from({ length: 10 }).map((_, i) =>
              testJavascriptWithCode({
                testCode: `it('[X+${i}]', () => {});`,
              }),
            ),
          ),
        ).toEqual(
          Array.from({ length: 10 }).map((_, i) => ({
            results: [{ name: `[X+${i}]`, status: 'pass' }],
          })),
        );
      }, 40000);

      it('should create codes folder and delete it after successful test', async () => {
        let renamed = false;
        let folderName;
        const watcher = watch(resolve(__dirname, '../../../testing/javascript/codes'), (event, fileName) => {
          if (event === 'rename' && fileName !== 'codes') {
            renamed = true;
            folderName = fileName;
          }
        });
        expect(
          await testJavascriptWithCode({
            testCode: `it('[X]', () => expect(true).toBe(true));`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
        watcher.close();
        expect(renamed).toBeTruthy();
        expect(existsSync(resolve(__dirname, `../../../testing/javascript/codes/${folderName}`))).toBeFalsy();
      });

      it('should create codes folder and delete it after erroneous test', async () => {
        let renamed = false;
        let folderName;
        const watcher = watch(resolve(__dirname, '../../../testing/javascript/codes'), (event, fileName) => {
          if (event === 'rename' && fileName !== 'codes') {
            renamed = true;
            folderName = fileName;
          }
        });
        expect(
          await testJavascriptWithCode({
            testCode: '.',
          }),
        ).toEqual({
          error: { message: 'Syntax error!' },
        });
        watcher.close();
        expect(renamed).toBeTruthy();
        expect(existsSync(resolve(__dirname, `../../../testing/javascript/codes/${folderName}`))).toBeFalsy();
      });

      it('should return fail status on testing non-exported function', async () => {
        expect(
          await testJavascriptWithCode({
            solutionCode: `const get = () => 42;`,
            testCode: `it('[X]', () => expect(get()).toBe(42));`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'fail' }],
        });
      });

      it('should return fail status on error', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: `it('[X]', () => { throw new Error(); });`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'fail' }],
        });
      });

      it('should return error message on syntax errors', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: '.',
          }),
        ).toEqual({
          error: { message: 'Syntax error!' },
        });
      });

      it('should return error message on other errors', async () => {
        expect(
          await testJavascriptWithCode({
            testCode: 'get();',
          }),
        ).toEqual({
          error: { message: 'Unidentified error!' },
        });
      });
    });

    describe('java tester with test code', () => {
      it('should test when class has the same name as the tester class', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class JavaCodeTester {
                @Test @DisplayName("[X]") public void $() {}
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should test multiple test classes', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class One {
                @Test @DisplayName("[X]") public void $() {}
              }
              class Two {
                @Test @DisplayName("[Y]") public void $() {}
              }`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'pass' },
          ],
        });
      });

      it('should test nested test classes', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Outer {
                @Test @DisplayName("[X]") public void $() {}
                @Nested public class Inner {
                  @Test @DisplayName("[Y]") public void $() {}
                }
              }`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'pass' },
          ],
        });
      });

      it('should test when main test class is package private', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              class Tests {
                @Test @DisplayName("[X]") public void $() {}
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should test when solution and test are in different package', async () => {
        expect(
          await testJavaWithCode({
            solutionCode: `
              package some;
              public class Solution {
                public static int get() {
                  return 42;
                }
              }`,
            testCode: `
              package other;
              import some.Solution;
              ${getJUnitImports()}
              public class Tests {
                @Test @DisplayName("[X]") public void $() {
                  assertEquals(42, Solution.get());
                }
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should test when solution and test are in the same package', async () => {
        expect(
          await testJavaWithCode({
            solutionCode: `
              package same;
              public class Solution {
                public static int get() {
                  return 42;
                }
              }`,
            testCode: `
              package same;
              ${getJUnitImports()}
              public class Tests {
                @Test @DisplayName("[X]") public void $() {
                  assertEquals(42, Solution.get());
                }
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should return empty array on empty code', async () => {
        expect(
          await testJavaWithCode({
            solutionCode: '',
            testCode: '',
          }),
        ).toEqual({
          results: [],
        });
      });

      it('should use test function name as test name when no name given', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Tests {
                @Test public void X() {}
              }`,
          }),
        ).toEqual({
          results: [{ name: 'X()', status: 'pass' }],
        });
      });

      it('should return pass status on passed test case', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Tests {
                @Test @DisplayName("[X]") public void $() {
                  assertEquals(true, true);
                }
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
      });

      it('should return fail status on failed test case', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Tests {
                @Test @DisplayName("[X]") public void $() {
                  assertEquals(true, false);
                }
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'fail' }],
        });
      });

      it('should return skip status on skipped test case', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Tests {
                @Test @DisplayName("[X]") public void $() {}
                @Disabled @Test @DisplayName("[Y]") public void $$() {}
              }`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'skip' },
          ],
        });
      });

      it('should return skip status for test cases in skipped test class', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Outer {
                @Test @DisplayName("[X]") public void $() {}
                @Disabled @Nested public class Inner {
                  @Test @DisplayName("[Y]") public void $() {}
                  @Test @DisplayName("[Z]") public void $$() {}
                }
              }`,
          }),
        ).toEqual({
          results: [
            { name: '[X]', status: 'pass' },
            { name: '[Y]', status: 'skip' },
            { name: '[Z]', status: 'skip' },
          ],
        });
      });

      it('should complete all testings when started multiple testing processes', async () => {
        expect(
          await Promise.all(
            Array.from({ length: 10 }).map((_, i) =>
              testJavaWithCode({
                testCode: `${getJUnitImports()}
                  public class Tests {
                    @Test @DisplayName("[X+${i}]") public void $() {}
                  }`,
              }),
            ),
          ),
        ).toEqual(
          Array.from({ length: 10 }).map((_, i) => ({
            results: [{ name: `[X+${i}]`, status: 'pass' }],
          })),
        );
      }, 40000);

      it('should create codes folder and delete it after successful test', async () => {
        let renamed = false;
        let folderName;
        const watcher = watch(resolve(__dirname, '../../../testing/java/codes'), (event, fileName) => {
          if (event === 'rename' && fileName !== 'codes') {
            renamed = true;
            folderName = fileName;
          }
        });
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Tests {
                @Test @DisplayName("[X]") public void $() {}
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'pass' }],
        });
        watcher.close();
        expect(renamed).toBeTruthy();
        expect(existsSync(resolve(__dirname, `../../../testing/javascript/codes/${folderName}`))).toBeFalsy();
      });

      it('should create codes folder and delete it after erroneous test', async () => {
        let renamed = false;
        let folderName;
        const watcher = watch(resolve(__dirname, '../../../testing/java/codes'), (event, fileName) => {
          if (event === 'rename' && fileName !== 'codes') {
            renamed = true;
            folderName = fileName;
          }
        });
        expect(
          await testJavaWithCode({
            testCode: '.',
          }),
        ).toEqual({
          error: { message: 'Syntax error!' },
        });
        watcher.close();
        expect(renamed).toBeTruthy();
        expect(existsSync(resolve(__dirname, `../../../testing/javascript/codes/${folderName}`))).toBeFalsy();
      });

      it('should return fail status on exception', async () => {
        expect(
          await testJavaWithCode({
            testCode: `${getJUnitImports()}
              public class Tests {
                @Test @DisplayName("[X]") public void $() throws Exception {
                  throw new Exception();
                }
              }`,
          }),
        ).toEqual({
          results: [{ name: '[X]', status: 'fail' }],
        });
      });

      it('should return error message on syntax errors', async () => {
        expect(
          await testJavaWithCode({
            testCode: '.',
          }),
        ).toEqual({
          error: { message: 'Syntax error!' },
        });
      });

      it('should return error message on compilation errors', async () => {
        expect(
          await testJavaWithCode({
            testCode: 'import not.exists;',
          }),
        ).toEqual({
          error: { message: 'Compilation error!' },
        });
      });
    });

    describe('unified json tester', () => {
      it('should return empty array on zero test cases', async () => {
        const testJson = `
          {
            "testCases": []
          }`;
        expect(await testJavascriptWithJson({ testJson })).toEqual({
          results: [],
        });
        expect(await testJavaWithJson({ testJson })).toEqual({
          results: [],
        });
      });

      it(`should test on function with integer as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'integer',
            passValue: '42',
            failValue: '41',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static int identity(int param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it(`should test on function with double as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'double',
            passValue: '42.5',
            failValue: '42.4',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static double identity(double param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it(`should test on function with boolean as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'boolean',
            passValue: 'true',
            failValue: 'false',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static boolean identity(boolean param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it(`should test on function with string as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'string',
            passValue: 'something',
            failValue: 'nothing',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static String identity(String param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it(`should test on function with integer array as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'integer array',
            passValue: '42|23|666',
            failValue: '42|23|667',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static int[] identity(int[] param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it(`should test on function with double array as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'double array',
            passValue: '42.5|666.3',
            failValue: '42.4|666.3',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static double[] identity(double[] param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it(`should test on function with boolean array as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'boolean array',
            passValue: 'true',
            failValue: 'false',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static boolean[] identity(boolean[] param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it(`should test on function with string array as parameter and return value using equals and not equals matchers,
      both with pass and fail statuses`, async () => {
        const getJsonTests = (functionCallCode: string) =>
          generateIdentityFunctionJsonTests({
            functionCallCode,
            type: 'string array',
            passValue: 'some|thing|is|wrong',
            failValue: 'some|things|are|wrong',
          });
        let { testJson, testResults } = getJsonTests('identity');
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => param;`,
            testJson,
          }),
        ).toEqual(testResults);
        ({ testJson, testResults } = getJsonTests('Solution.identity'));
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static String[] identity(String[] param) {
                  return param;
                }
              }`,
            testJson,
          }),
        ).toEqual(testResults);
      });

      it('should test with function of new instance', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [
                  {
                    "type": "integer",
                    "value": "42"
                  }
                ],
                "matcher": "equals",
                "expected": {
                  "type": "integer",
                  "value": "42"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'pass' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `
              export class Solution {
                identity(param) {
                  return param;
                }
              }`,
            testJson: getTestJson('new Solution().identity'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public int identity(int param) {
                  return param;
                }
              }`,
            testJson: getTestJson('new Solution().identity'),
          }),
        ).toEqual(testResults);
      });

      it('should test on zero parameters', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [],
                "matcher": "equals",
                "expected": {
                  "type": "integer",
                  "value": "42"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'pass' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const get = () => 42;`,
            testJson: getTestJson('get'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static int get() {
                  return 42;
                }
              }`,
            testJson: getTestJson('Solution.get'),
          }),
        ).toEqual(testResults);
      });

      it('should test on multiple parameters', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [
                  {
                    "type": "integer",
                    "value": "1"
                  },
                  {
                    "type": "integer",
                    "value": "2"
                  },
                  {
                    "type": "integer",
                    "value": "3"
                  }
                ],
                "matcher": "equals",
                "expected": {
                  "type": "integer",
                  "value": "6"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'pass' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const sumOf3 = (a, b, c) => a + b + c;`,
            testJson: getTestJson('sumOf3'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static int sumOf3(int a, int b, int c) {
                  return a + b + c;
                }
              }`,
            testJson: getTestJson('Solution.sumOf3'),
          }),
        ).toEqual(testResults);
      });

      it('should test when parameter and return value is different', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [
                  {
                    "type": "integer array",
                    "value": "42|53|64"
                  }
                ],
                "matcher": "equals",
                "expected": {
                  "type": "integer",
                  "value": "3"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'pass' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const arrayLength = array => array.length;`,
            testJson: getTestJson('arrayLength'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static int arrayLength(int[] array) {
                  return array.length;
                }
              }`,
            testJson: getTestJson('Solution.arrayLength'),
          }),
        ).toEqual(testResults);
      });

      it('should not split string array on escaped delimiter', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [
                  {
                    "type": "string array",
                    "value": "should\\\\|not|split|here"
                  }
                ],
                "matcher": "equals",
                "expected": {
                  "type": "string",
                  "value": "should|not"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'pass' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const getFirst = array => array[0];`,
            testJson: getTestJson('getFirst'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static String getFirst(String[] array) {
                  return array[0];
                }
              }`,
            testJson: getTestJson('Solution.getFirst'),
          }),
        ).toEqual(testResults);
      });

      it('should resolve a double escaped delimiter as single escaped one in string array', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [
                  {
                    "type": "string array",
                    "value": "should\\\\\\\\|not|split|here"
                  }
                ],
                "matcher": "equals",
                "expected": {
                  "type": "string",
                  "value": "should\\\\|not"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'pass' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const getFirst = array => array[0];`,
            testJson: getTestJson('getFirst'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static String getFirst(String[] array) {
                  return array[0];
                }
              }`,
            testJson: getTestJson('Solution.getFirst'),
          }),
        ).toEqual(testResults);
      });

      it('should escape string literals', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [
                  {
                    "type": "string",
                    "value": "some\\"other\\\\nthing"
                  }
                ],
                "matcher": "equals",
                "expected": {
                  "type": "integer",
                  "value": "17"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'pass' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const stringLength = string => string.length;`,
            testJson: getTestJson('stringLength'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static int stringLength(String string) {
                  return string.length();
                }
              }`,
            testJson: getTestJson('Solution.stringLength'),
          }),
        ).toEqual(testResults);
      });

      it('should return wrong results on wrong type of return value', async () => {
        const getTestJson = (functionCallCode: string) => `
          {
            "functionCallCode": "${functionCallCode}",
            "testCases": [
              {
                "description": "[X]",
                "parameters": [
                  {
                    "type": "integer",
                    "value": "42"
                  }
                ],
                "matcher": "equals",
                "expected": {
                  "type": "integer",
                  "value": "42"
                }
              }
            ]
          }`;
        const testResults = { results: [{ name: '[X]', status: 'fail' }] };
        expect(
          await testJavascriptWithJson({
            solutionCode: `export const identity = param => '';`,
            testJson: getTestJson('identity'),
          }),
        ).toEqual(testResults);
        expect(
          await testJavaWithJson({
            solutionCode: `
              public class Solution {
                public static String identity(int param) {
                  return "";
                }
              }`,
            testJson: getTestJson('Solution.identity'),
          }),
        ).toEqual(testResults);
      });

      describe('javascript version', () => {
        it('should import commonjs exported non-objects', async () => {
          expect(
            await testJavascriptWithJson({
              solutionCode: `
                const get = () => 42;
                module.exports = get;`,
              testJson: `
                {
                  "functionCallCode": "get",
                  "testCases": [
                    {
                      "description": "[X]",
                      "parameters": [],
                      "matcher": "equals",
                      "expected": {
                        "type": "integer",
                        "value": "42"
                      }
                    }
                  ]
                }`,
            }),
          ).toEqual({
            results: [{ name: '[X]', status: 'pass' }],
          });
        });

        it('should import es6 exported function', async () => {
          expect(
            await testJavascriptWithJson({
              solutionCode: `export const get = () => 42;`,
              testJson: `
                {
                  "functionCallCode": "get",
                  "testCases": [
                    {
                      "description": "[X]",
                      "parameters": [],
                      "matcher": "equals",
                      "expected": {
                        "type": "integer",
                        "value": "42"
                      }
                    }
                  ]
                }`,
            }),
          ).toEqual({
            results: [{ name: '[X]', status: 'pass' }],
          });
        });

        it('should import es6 default exported function', async () => {
          expect(
            await testJavascriptWithJson({
              solutionCode: `
                const get = () => 42;
                export default get;`,
              testJson: `
                {
                  "functionCallCode": "get",
                  "testCases": [
                    {
                      "description": "[X]",
                      "parameters": [],
                      "matcher": "equals",
                      "expected": {
                        "type": "integer",
                        "value": "42"
                      }
                    }
                  ]
                }`,
            }),
          ).toEqual({
            results: [{ name: '[X]', status: 'pass' }],
          });
        });

        it('should return wrong results on wrong type of parameter', async () => {
          expect(
            await testJavascriptWithJson({
              solutionCode: `export const getFirst = array => array[0];`,
              testJson: `
                {
                  "functionCallCode": "getFirst",
                  "testCases": [
                    {
                      "description": "[X]",
                      "parameters": [
                        {
                          "type": "integer",
                          "value": "42"
                        }
                      ],
                      "matcher": "equals",
                      "expected": {
                        "type": "string",
                        "value": "some"
                      }
                    }
                  ]
                }`,
            }),
          ).toEqual({
            results: [{ name: '[X]', status: 'fail' }],
          });
        });

        it('should return fail status on non-existing function call code', async () => {
          expect(
            await testJavascriptWithJson({
              testJson: `
                {
                  "functionCallCode": "notExists",
                  "testCases": [
                    {
                      "description": "[X]",
                      "parameters": [],
                      "matcher": "equals",
                      "expected": {
                        "type": "string",
                        "value": "some"
                      }
                    }
                  ]
                }`,
            }),
          ).toEqual({
            results: [{ name: '[X]', status: 'fail' }],
          });
        });
      });

      describe('java version', () => {
        it('should return compilation error message on wrong type of parameter', async () => {
          expect(
            await testJavaWithJson({
              solutionCode: `
                public class Solution {
                  public static String getFirst(String[] array) {
                    return array[0];
                  }
                }`,
              testJson: `
                {
                  "functionCallCode": "Solution.getFirst",
                  "testCases": [
                    {
                      "description": "[X]",
                      "parameters": [
                        {
                          "type": "integer",
                          "value": "42"
                        }
                      ],
                      "matcher": "equals",
                      "expected": {
                        "type": "string",
                        "value": "some"
                      }
                    }
                  ]
                }`,
            }),
          ).toEqual({
            error: { message: 'Compilation error!' },
          });
        });

        it('should return compilation error message on non-existing function call code', async () => {
          expect(
            await testJavaWithJson({
              testJson: `
                {
                  "functionCallCode": "Solution.notExists",
                  "testCases": [
                    {
                      "description": "[X]",
                      "parameters": [],
                      "matcher": "equals",
                      "expected": {
                        "type": "string",
                        "value": "some"
                      }
                    }
                  ]
                }`,
            }),
          ).toEqual({
            error: { message: 'Compilation error!' },
          });
        });
      });
    });

    it('should return error when there is no such language', async () => {
      expect(
        await test({
          language: 'not-exists',
          solutionCode: '',
          testCode: '',
          type: 'code',
        }),
      ).toEqual({
        error: { message: 'Language is not supported!' },
      });
    });
  });
});

async function test(testData: Test): Promise<any> {
  return new TesterService().test(testData);
}

async function testJavascriptWithCode({ solutionCode = '', testCode = '' }): Promise<any> {
  return test({ language: 'javascript', solutionCode, testCode, type: 'code' });
}

async function testJavascriptWithJson({ solutionCode = '', testJson = '' }): Promise<any> {
  return test({ language: 'javascript', solutionCode, testCode: testJson, type: 'json' });
}

async function testJavaWithCode({ solutionCode = '', testCode = '' }): Promise<any> {
  return test({ language: 'java', solutionCode, testCode, type: 'code' });
}

async function testJavaWithJson({ solutionCode = '', testJson = '' }): Promise<any> {
  return test({ language: 'java', solutionCode, testCode: testJson, type: 'json' });
}

function generateIdentityFunctionJsonTests({ functionCallCode, type, passValue, failValue }): any {
  return {
    testJson: `
      {
        "functionCallCode": "${functionCallCode}",
        "testCases": [
          {
            "description": "[X+0]",
            "parameters": [
              {
                "type": "${type}",
                "value": "${passValue}"
              }
            ],
            "matcher": "equals",
            "expected": {
              "type": "${type}",
              "value": "${passValue}"
            }
          },
          {
            "description": "[X+1]",
            "parameters": [
              {
                "type": "${type}",
                "value": "${passValue}"
              }
            ],
            "matcher": "not equals",
            "expected": {
              "type": "${type}",
              "value": "${failValue}"
            }
          },
          {
            "description": "[X+2]",
            "parameters": [
              {
                "type": "${type}",
                "value": "${passValue}"
              }
            ],
            "matcher": "equals",
            "expected": {
              "type": "${type}",
              "value": "${failValue}"
            }
          },
          {
            "description": "[X+3]",
            "parameters": [
              {
                "type": "${type}",
                "value": "${passValue}"
              }
            ],
            "matcher": "not equals",
            "expected": {
              "type": "${type}",
              "value": "${passValue}"
            }
          }
        ]
      }`,
    testResults: {
      results: [
        { name: '[X+0]', status: 'pass' },
        { name: '[X+1]', status: 'pass' },
        { name: '[X+2]', status: 'fail' },
        { name: '[X+3]', status: 'fail' },
      ],
    },
  };
}

function getJUnitImports(): string {
  return `
    import org.junit.jupiter.api.Disabled;
    import org.junit.jupiter.api.DisplayName;
    import org.junit.jupiter.api.Nested;
    import org.junit.jupiter.api.Test;
    import static org.junit.jupiter.api.Assertions.assertEquals;`;
}
