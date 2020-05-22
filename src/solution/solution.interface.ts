export type Test = {
  language: string;
  solutionCode: string;
  testCode: string;
  type: 'code' | 'json';
};

export type TestResults = {
  results?: TestResult[];
  error?: string;
};

export type TestResult = { name: string; status: string };
