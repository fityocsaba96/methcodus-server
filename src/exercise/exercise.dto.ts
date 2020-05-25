import { MinLength, IsArray, ArrayNotEmpty, ValidateNested, IsIn, IsString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { IsValidValueOfType } from '../lib/validation-decorator';

class CreateExerciseTestCaseTypeAndValueDto {
  @IsIn(['integer', 'double', 'boolean', 'string', 'integer array', 'double array', 'boolean array', 'string array'], {
    message:
      'Type in test case must be one of "integer", "double", "boolean", "string", "integer array", "double array", "boolean array" or "string array"!',
  })
  public readonly type: string;

  @IsString({ message: 'Value in test case must be a string!' })
  @IsValidValueOfType('type', { message: 'Value in test case must be valid according to its type!' })
  public readonly value: string;
}

class CreateExerciseTestCaseDto {
  @MinLength(1, { message: 'Test case description cannot be empty!' })
  public readonly description: string;

  @IsIn(['not equals', 'equals'], { message: 'Test case matcher must be either "not equals" or "equals"!' })
  public readonly matcher: string;

  @Type(() => CreateExerciseTestCaseTypeAndValueDto)
  @ValidateNested({ message: 'Test case expected must be an object!' })
  public readonly expected: CreateExerciseTestCaseTypeAndValueDto;

  @IsArray({ message: 'Test case parameters must be an array!' })
  @Type(() => CreateExerciseTestCaseTypeAndValueDto)
  @ValidateNested({ each: true, message: 'Test case parameter must be an object!' })
  public readonly parameters: CreateExerciseTestCaseTypeAndValueDto[];
}

export class CreateExerciseDto {
  @MinLength(1, { message: 'Name cannot be empty!' })
  public readonly name: string;

  @MinLength(1, { message: 'Description cannot be empty!' })
  public readonly description: string;

  @ArrayNotEmpty({ message: 'There must be at least one test case!' })
  @IsArray({ message: 'Test cases must be an array!' })
  @Type(() => CreateExerciseTestCaseDto)
  @ValidateNested({ each: true, message: 'Test case must be an object!' })
  public readonly testCases: CreateExerciseTestCaseDto[];
}

export class GetExerciseParams {
  @IsMongoId({ message: 'ID must be a valid MongoDB Object ID!' })
  public readonly _id: string;
}
