import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { exec as execCallback } from 'child_process';
import { resolve } from 'path';
import { promisify } from 'util';
import { Solution } from './solution.schema';
import { Test, TestResults } from './solution.interface';
import { map, assoc } from 'ramda';

const exec = promisify(execCallback);

@Injectable()
export class SolutionService {
  constructor(@InjectModel(Solution.name) private readonly solutionModel: Model<Solution>) {}

  public async findAllByUserAndPopulate(user: string): Promise<Solution[]> {
    return this.solutionModel
      .find({ user: Types.ObjectId(user) })
      .populate('exercise', ['_id', 'name'])
      .populate('pairUser', 'userName');
  }

  public async insertMany(solutions: Partial<Solution>[]): Promise<Solution[]> {
    return this.solutionModel.insertMany(map(assoc('solvedAt', new Date()), solutions));
  }

  public async test(test: Test): Promise<TestResults> {
    const command = { javascript: 'node javascript-code-tester.js', java: 'java -cp .:* JavaCodeTester' }[test.language];
    if (!command) {
      return { error: 'Language is not supported!' };
    }
    return await this.runTestCommand(test, command);
  }

  private async runTestCommand(test: Test, command: string): Promise<TestResults> {
    try {
      const { stdout } = await exec(command, {
        cwd: resolve(__dirname, `../../testing/${test.language}`),
        env: {
          SOLUTION_CODE: test.solutionCode,
          [test.type === 'code' ? 'TEST_CODE' : 'TEST_JSON']: test.testCode,
        },
      });
      return {
        results: JSON.parse(stdout.toString()),
      };
    } catch (error) {
      return {
        error: { 1: 'Syntax error!', 2: 'Compilation error!', 255: 'Unidentified error!' }[error.code],
      };
    }
  }
}
