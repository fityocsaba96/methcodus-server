const crypto = require('crypto'),
  fs = require('fs'),
  Jasmine = require('jasmine');

module.exports = class JavascriptCodeJasmineTester {
  constructor() { }

  async test(solutionCode, testCode) {
    this._solutionCode = solutionCode;
    this._testCode = testCode;
    try {
      this._codesDirectory = this._createCodesDirectory();
      this._writeCodeToFile('index', this._solutionCode);
      this._testCodePath = this._writeCodeToFile('index.spec', this._testCode);
      this._setupBabelWithCoreJs();
      return await this._executeTests();
    } finally {
      if (this._codesDirectory) {
        this._deleteDirectory(this._codesDirectory);
      }
    }
  }

  _createCodesDirectory() {
    const path = `codes/${this._generateMD5(this._solutionCode + this._testCode)}_${Date.now()}`;
    fs.mkdirSync(path);
    return path;
  }

  _generateMD5(text) {
    return crypto
      .createHash('md5')
      .update(text)
      .digest('hex');
  }

  _writeCodeToFile(fileName, code) {
    const codePath = `${this._codesDirectory}/${fileName}.js`;
    fs.appendFileSync(codePath, code);
    return codePath;
  }

  _setupBabelWithCoreJs() {
    process.env.BABEL_DISABLE_CACHE = true;
    require('@babel/register')({
      presets: [
        [
          '@babel/env',
          {
            targets: { node: 'current' },
            useBuiltIns: 'usage',
            corejs: { version: 3, proposals: true },
          },
        ],
      ],
    });
  }

  async _executeTests() {
    const jasmine = new Jasmine();
    jasmine.clearReporters();
    const jsonResultReporter = this._getJSONResultReporter();
    jasmine.addReporter(jsonResultReporter);
    jasmine.loadConfig({ spec_files: [this._testCodePath], random: false });
    await this._executeJasmine(jasmine);
    return JSON.stringify(jsonResultReporter.results);
  }

  _getJSONResultReporter() {
    return {
      results: [],
      specDone: function(result) {
        this.results.push({
          name: result.description,
          status: { passed: 'pass', failed: 'fail' }[result.status] || 'skip',
        });
      },
    };
  }

  async _executeJasmine(jasmine) {
    return new Promise(resolve => jasmine.onComplete(resolve), jasmine.execute());
  }

  _deleteDirectory(directory) {
    if (fs.statSync(directory).isDirectory()) {
      fs.readdirSync(directory).forEach(fileName => this._deleteDirectory(`${directory}/${fileName}`));
      fs.rmdirSync(directory);
    } else {
      fs.unlinkSync(directory);
    }
  }
};
