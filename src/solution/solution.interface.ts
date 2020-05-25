export type Test = {
  language: string;
  solutionCode: string;
  testCode: string;
  type: 'code' | 'json';
};

export type FullTestResults = {
  builtInTestResults: TestResults;
  ownTestResults?: TestResults;
};

export type TestResults = {
  results?: TestResult[];
  error?: string;
};

type TestResult = { name: string; status: string };
