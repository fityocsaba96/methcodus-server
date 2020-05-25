import { IsMongoId, IsIn, MinLength, MaxLength, ValidateIf } from 'class-validator';
import { includes } from 'ramda';

export class TestOrCreateSolutionDto {
  @IsMongoId({ message: 'Exercise ID must be a valid MongoDB Object ID!' })
  public readonly exerciseId: string;

  @IsIn(['javascript', 'java'], { message: 'Programming language must be either "javascript" or "java"!' })
  public readonly programmingLanguage: string;

  @IsIn(['none', 'tdd', 'pair-programming', 'ping-pong'], {
    message: 'Software development method must be one of "none", "tdd", "pair-programming" or "ping-pong"!',
  })
  public readonly softwareDevelopmentMethod: string;

  @MinLength(1, { message: 'Function call code cannot be empty!' })
  public readonly functionCallCode: string;

  @MinLength(1, { message: 'Solution code cannot be empty!' })
  @MaxLength(5000, { message: 'Solution code cannot be longer than 5000 characters!' })
  public readonly solutionCode: string;

  @ValidateIf((testOrCreateSolutionDto: TestOrCreateSolutionDto) =>
    includes(testOrCreateSolutionDto.softwareDevelopmentMethod, ['tdd', 'ping-pong']),
  )
  @MinLength(1, { message: 'Test code cannot be empty!' })
  @MaxLength(5000, { message: 'Test code cannot be longer than 5000 characters!' })
  public readonly testCode: string;

  @ValidateIf((testOrCreateSolutionDto: TestOrCreateSolutionDto) =>
    includes(testOrCreateSolutionDto.softwareDevelopmentMethod, ['pair-programming', 'ping-pong']),
  )
  @IsMongoId({ message: 'Pair user ID must be a valid MongoDB Object ID!' })
  public readonly pairUserId: string;
}
