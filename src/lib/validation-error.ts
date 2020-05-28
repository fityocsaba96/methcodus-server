import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { validate as classValidatorValidate, ValidatorOptions, ValidationError } from 'class-validator';

export type ErrorResponse = { errors: string[] };

export class ValidationException extends HttpException {
  constructor(errors: ErrorResponse['errors']) {
    super({ errors }, HttpStatus.BAD_REQUEST);
  }
}

export class AuthException extends HttpException {
  constructor(errors: ErrorResponse['errors']) {
    super({ errors }, HttpStatus.UNAUTHORIZED);
  }
}

const collectValidationErrors = (validationErrors: ValidationError[]): string[] => {
  const validationErrorMessages: string[] = [];
  for (const validationError of validationErrors) {
    if (validationError.constraints !== undefined) {
      validationErrorMessages.push(...Object.values(validationError.constraints));
    }
    if (validationError.children !== undefined) {
      validationErrorMessages.push(...collectValidationErrors(validationError.children));
    }
  }
  return validationErrorMessages;
};

const exceptionFactory = (validationErrors: ValidationError[]): ValidationException =>
  new ValidationException(collectValidationErrors(validationErrors));

const validatorOptions: ValidatorOptions = { whitelist: true };

export const validationPipe = new ValidationPipe({ exceptionFactory, ...validatorOptions });

export const validate = async (object: any): Promise<void> => {
  const validationErrors = await classValidatorValidate(object, validatorOptions);
  if (validationErrors.length !== 0) {
    throw exceptionFactory(validationErrors);
  }
};
