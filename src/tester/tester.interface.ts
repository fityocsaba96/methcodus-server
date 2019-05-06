export interface CodeTest {
  readonly language: string;
  readonly solutionCode: string;
  readonly testCode: string;
}

export interface JsonTest {
  readonly language: string;
  readonly solutionCode: string;
  readonly testJson: string;
}
