module.exports = class JasmineTestCodeGenerator {
  constructor() { }

  generate(testJson) {
    this._testJson = testJson;
    this._testCode = '';
    addSolutionImporter();
    return this._testCode;
  }

  addSolutionImporter() {
    this._testCode += `{
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
};
