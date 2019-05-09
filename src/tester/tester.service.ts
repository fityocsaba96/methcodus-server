import { Injectable } from '@nestjs/common';
import { exec as execCallback } from 'child_process';
import { resolve } from 'path';
import { promisify } from 'util';
import { CodeTest, JsonTest } from './tester.interface';

const exec = promisify(execCallback);

@Injectable()
export class TesterService {
  async test(test: CodeTest | JsonTest): Promise<object> {
    let command;
    switch (test.language) {
      case 'javascript':
        command = 'node javascript-code-tester.js';
        break;
      case 'java':
        command = 'java -cp .:* JavaCodeTester';
        break;
      default:
        return { error: { message: 'Language is not supported!' } };
    }
    return await this.runTestCommand(test, command);
  }

  private async runTestCommand(test: CodeTest | JsonTest, command: string): Promise<object> {
    try {
      const { stdout } = await exec(command, {
        cwd: resolve(__dirname, `../../testing/${test.language}`),
        env: {
          SOLUTION_CODE: test.solutionCode,
          ...(this.isCodeTest(test) ? { TEST_CODE: test.testCode } : { TEST_JSON: test.testJson }),
        },
      });
      return {
        results: JSON.parse(stdout.toString()),
      };
    } catch (error) {
      return {
        error: {
          message: { 1: 'Syntax error!', 2: 'Compilation error!', 255: 'Unidentified error!' }[error.code],
        },
      };
    }
  }

  private isCodeTest(test: CodeTest | JsonTest): test is CodeTest {
    return (test as CodeTest).testCode !== undefined;
  }
}
