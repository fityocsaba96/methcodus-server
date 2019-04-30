module.exports = class JasmineTestCodeGenerator {
  constructor() { }

  generate(testJson) {
    this._test = JSON.parse(testJson);
    return `${this._getSolutionImporterCode()} ${this._generateTestCasesCode()}`;
  }

  _getSolutionImporterCode() {
    return `{
      const imports = require('.');
      const importToGlobal = ([name, imported]) =>
        (global[typeof imported === 'function' ? imported.name : name] = imported);
      if (typeof imports === 'object') {
        Object.entries(imports).forEach(importToGlobal);
      } else {
        importToGlobal(['default', imports]);
      }
    }`;
  }

  _generateTestCasesCode() {
    let testCasesCode = '';
    this._test.testCases.forEach(testCase => {
      testCasesCode += this._generateTestCaseCode(testCase);
    });
    return testCasesCode;
  }

  _generateTestCaseCode(testCase) {
    const { description, parameters, matcher, expected } = testCase,
      { functionCallCode } = this._test;
    return `it(${this._generateStringCode(description)}, () =>
      expect(${functionCallCode}(${this._generateParametersCode(parameters)}))
        .${this._generateMatcherNameCode(matcher, expected)}(${this._generateLiteralCode(expected)})
    );`;
  }

  _generateParametersCode(parameters) {
    return parameters.map(parameter => this._generateLiteralCode(parameter)).join(',');
  }

  _generateLiteralCode(literal) {
    switch (literal.type) {
      case 'integer':
        return this._generateIntegerCode(literal.value);
      case 'double':
        return this._generateDoubleCode(literal.value);
      case 'boolean':
        return this._generateBooleanCode(literal.value);
      case 'string':
        return this._generateStringCode(literal.value);
      case 'integer array':
        return this._generateArrayCode(literal.value, this._generateIntegerCode);
      case 'double array':
        return this._generateArrayCode(literal.value, this._generateDoubleCode);
      case 'boolean array':
        return this._generateArrayCode(literal.value, this._generateBooleanCode);
      case 'string array':
        return this._generateArrayCode(literal.value, this._generateStringCode);
    }
  }

  _generateIntegerCode(value) {
    return value;
  }

  _generateDoubleCode(value) {
    return value;
  }

  _generateBooleanCode(value) {
    return value;
  }

  _generateStringCode(value) {
    return JSON.stringify(value);
  }

  _generateArrayCode(value, generateElementCode) {
    return `[${value.split(/(?<!\\)\|/)
      .map(element => element.replace(/\\\|/g, '|'))
      .map(generateElementCode)
      .join(',')}]`;
  }

  _generateMatcherNameCode(matcher, expected) {
    const expectsArray = /^(integer|double|boolean|string) array$/.test(expected.type);
    switch (matcher) {
      case 'equals':
        return expectsArray ? 'toEqual' : 'toBe';
      case 'not equals':
        return expectsArray ? 'not.toEqual' : 'not.toBe';
    }
  }
};
