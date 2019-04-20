const crypto = require('crypto'),
  fs = require('fs'),
  Jasmine = require('jasmine');

(async () => {
  let codesDirectory;
  try {
    const { SOLUTION_CODE: solutionCode, TEST_CODE: testCode } = process.env;
    codesDirectory = createCodesDirectory(solutionCode, testCode);
    const testCodePath = (writeCodeToFile(codesDirectory, 'index', solutionCode),
    writeCodeToFile(codesDirectory, 'index.spec', testCode));
    setupBabelWithCoreJs();
    const testResults = await executeTests(testCodePath, codesDirectory);
    deleteDirectory(codesDirectory);
    process.stdout.write(testResults);
  } catch (error) {
    exit(255, codesDirectory);
  }
})();

function createCodesDirectory(solutionCode, testCode) {
  const path = `codes/${generateMD5(solutionCode + testCode)}_${Date.now()}`;
  fs.mkdirSync(path);
  return path;
}

function generateMD5(text) {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex');
}

function writeCodeToFile(codesDirectory, fileName, code) {
  const codePath = `${codesDirectory}/${fileName}.js`;
  fs.appendFileSync(codePath, code);
  return codePath;
}

function setupBabelWithCoreJs() {
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
    cache: false,
  });
}

async function executeTests(testCodePath, codesDirectory) {
  const jasmine = new Jasmine();
  jasmine.clearReporters();
  const jsonResultReporter = getJSONResultReporter();
  jasmine.addReporter(jsonResultReporter);
  jasmine.loadConfig({ spec_files: [testCodePath], random: false });
  await executeJasmine(jasmine, codesDirectory);
  return JSON.stringify(jsonResultReporter.results);
}

function getJSONResultReporter() {
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

async function executeJasmine(jasmine, codesDirectory) {
  try {
    await new Promise(resolve => jasmine.onComplete(resolve), jasmine.execute());
  } catch (error) {
    if (error instanceof SyntaxError) {
      exit(1, codesDirectory);
    } else {
      throw error;
    }
  }
}

function exit(exitCode, deletableDirectory) {
  if (deletableDirectory) {
    deleteDirectory(deletableDirectory);
  }
  process.exit(exitCode);
}

function deleteDirectory(directory) {
  if (fs.statSync(directory).isDirectory()) {
    fs.readdirSync(directory).forEach(fileName => deleteDirectory(`${directory}/${fileName}`));
    fs.rmdirSync(directory);
  } else {
    fs.unlinkSync(directory);
  }
}
