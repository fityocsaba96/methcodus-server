import { ValidationError, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(errors: any) {
    super({ errors }, HttpStatus.BAD_REQUEST);
  }
}

export class AuthException extends HttpException {
  constructor(errors: any) {
    super({ errors }, HttpStatus.UNAUTHORIZED);
  }
}

const collectValidationErrors = (validationErrors: ValidationError[]) => {
  const validationErrorMessages = [];
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

export const validationPipe = new ValidationPipe({
  exceptionFactory: validationErrors => new ValidationException(collectValidationErrors(validationErrors)),
  whitelist: true,
});
