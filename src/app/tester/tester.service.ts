import { Injectable } from '@nestjs/common';
import { exec as execCallback } from 'child_process';
import { resolve } from 'path';
import { promisify } from 'util';
import { Test } from './tester.interface';

const exec = promisify(execCallback);

@Injectable()
export class TesterService {
  public async test(test: Test): Promise<any> {
    const command = { javascript: 'node javascript-code-tester.js', java: 'java -cp .:* JavaCodeTester' }[
      test.language
    ];
    if (!command) {
      return { error: { message: 'Language is not supported!' } };
    }
    return await this.runTestCommand(test, command);
  }

  private async runTestCommand(test: Test, command: string): Promise<any> {
    try {
      const { stdout } = await exec(command, {
        cwd: resolve(__dirname, `../../../testing/${test.language}`),
        env: {
          SOLUTION_CODE: test.solution.code,
          [test.test.type === 'code' ? 'TEST_CODE' : 'TEST_JSON']: test.test.code,
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
}
