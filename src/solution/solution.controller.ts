import { Controller, Get, UseGuards, Request, Response, Post, UsePipes, Body, Query } from '@nestjs/common';
import { SolutionService } from './solution.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Solution } from './solution.schema';
import { map, pick, all, propEq, includes } from 'ramda';
import { validationPipe, ValidationException } from '../lib/validation-error';
import { FullTestResults, TestResults } from './solution.interface';
import { TestOrCreateSolutionDto } from './solution.dto';
import { ExerciseService } from '../exercise/exercise.service';
import { Types } from 'mongoose';
import { User } from '../user/user.schema';

@Controller('solutions')
export class SolutionController {
  constructor(private readonly solutionService: SolutionService, private readonly exerciseService: ExerciseService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  public async getMine(@Request() request: ExpressRequest): Promise<Partial<Solution>[]> {
    return map(
      pick(['solvedAt', 'exercise', 'programmingLanguage', 'softwareDevelopmentMethod', 'pairUser', 'code']),
      await this.solutionService.findAllByUserAndPopulate((request.user as any)._id),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(validationPipe)
  public async testOrCreate(
    @Request() request: ExpressRequest,
    @Response() response: ExpressResponse,
    @Query('testOnly') testOnly: string,
    @Body() testOrCreateSolutionDto: TestOrCreateSolutionDto,
  ): Promise<FullTestResults | void> {
    const fullTestResults = await this.runAllTests(testOrCreateSolutionDto);
    if (testOnly !== 'false' || !this.isAllTestsPassed(fullTestResults)) {
      response.status(200).send(fullTestResults);
    } else {
      await this.solutionService.insertMany(this.getSolutionsToInsert(testOrCreateSolutionDto, request.user));
      response.status(204).send();
    }
  }

  private async runAllTests(testOrCreateSolutionDto: TestOrCreateSolutionDto): Promise<FullTestResults> {
    const fullTestResults: FullTestResults = {
      builtInTestResults: await this.runTests(testOrCreateSolutionDto, 'json'),
    };
    if (includes(testOrCreateSolutionDto.softwareDevelopmentMethod, ['tdd', 'ping-pong'])) {
      fullTestResults.ownTestResults = await this.runTests(testOrCreateSolutionDto, 'code');
    }
    return fullTestResults;
  }

  private async runTests(testOrCreateSolutionDto: TestOrCreateSolutionDto, type: 'json' | 'code'): Promise<TestResults> {
    return await this.solutionService.test({
      language: testOrCreateSolutionDto.programmingLanguage,
      type,
      solutionCode: testOrCreateSolutionDto.solutionCode,
      testCode: type === 'json' ? await this.getTestJson(testOrCreateSolutionDto) : testOrCreateSolutionDto.testCode,
    });
  }

  private async getTestJson(testOrCreateSolutionDto: TestOrCreateSolutionDto): Promise<string> {
    const exercise = await this.exerciseService.findById(testOrCreateSolutionDto.exerciseId, false);
    if (exercise === null) {
      throw new ValidationException(['Exercise with this ID does not exist!']);
    }
    return JSON.stringify({ functionCallCode: testOrCreateSolutionDto.functionCallCode, testCases: exercise.testCases });
  }

  private isAllTestsPassed(fullTestResults: FullTestResults): boolean {
    return (
      this.isTestsPassed(fullTestResults.builtInTestResults) &&
      (fullTestResults.ownTestResults === undefined || this.isTestsPassed(fullTestResults.ownTestResults))
    );
  }

  private isTestsPassed(testResults: TestResults): boolean {
    return testResults.error === undefined && all(propEq('status', 'pass'), testResults.results);
  }

  private getSolutionsToInsert(testOrCreateSolutionDto: TestOrCreateSolutionDto, user: Partial<User>): Partial<Solution>[] {
    const solutions: Partial<Solution>[] = [
      {
        ...testOrCreateSolutionDto,
        user: Types.ObjectId(user._id),
        exercise: Types.ObjectId(testOrCreateSolutionDto.exerciseId),
        code: testOrCreateSolutionDto.solutionCode,
      },
    ];
    if (includes(testOrCreateSolutionDto.softwareDevelopmentMethod, ['pair-programming', 'ping-pong'])) {
      solutions[0].pairUser = Types.ObjectId(testOrCreateSolutionDto.pairUserId);
      solutions.push({ ...solutions[0], user: solutions[0].pairUser, pairUser: solutions[0].user });
    }
    return solutions;
  }
}
