import { ValidationError, HttpException, HttpStatus } from '@nestjs/common';
import { values, mapObjIndexed, indexBy, prop, pipe } from 'ramda';

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

export const transformValidationErrors = pipe(
  indexBy<ValidationError>(prop('property')),
  mapObjIndexed(error => values(error.constraints)[0]),
  errors => new ValidationException(errors),
);
