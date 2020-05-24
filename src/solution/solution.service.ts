import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { exec as execCallback } from 'child_process';
import { resolve } from 'path';
import { promisify } from 'util';
import { Solution } from './solution.schema';
import { Test, TestResults } from './solution.interface';
import { Exercise } from 'src/exercise/exercise.schema';
import { User } from 'src/user/user.schema';

const exec = promisify(execCallback);

@Injectable()
export class SolutionService {
  constructor(
    @InjectModel(Solution.name) private readonly solutionModel: Model<Solution>,
    @InjectModel(Exercise.name) private readonly exerciseModel: Model<Exercise>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  public async findAllByUserAndPopulate(user: string): Promise<Solution[]> {
    return this.solutionModel
      .find({ user: Types.ObjectId(user) as any })
      .populate('exercise', ['_id', 'name'], this.exerciseModel)
      .populate('pairUser', 'userName', this.userModel);
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
