export type Test = {
  language: string;
  solution: {
    code: string;
  };
  test: {
    code: string;
    type: 'code' | 'json';
  };
};
