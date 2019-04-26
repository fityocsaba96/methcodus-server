module.exports = class JasmineTestCodeGenerator {
  constructor() { }

  generate(testJson) {
    this._testJson = testJson;
    return '';
  }
};
