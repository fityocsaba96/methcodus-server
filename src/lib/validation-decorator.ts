import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { split, pipe, all, test } from 'ramda';

export const IsValidValueOfType = (typePropertyName: string, options?: ValidationOptions) => (object: any, propertyName: string) => {
  const integerRegex = /^([+-]?[1-9]\d*|0)$/;
  const doubleRegex = /^[+-]?([0-9]*[.])?[0-9]+$/;
  const validateArrayItems = (predicate, value) => pipe(split('|'), all(predicate))(value);
  registerDecorator({
    name: 'isValidValueOfType',
    target: object.constructor,
    propertyName,
    constraints: [typePropertyName],
    options,
    validator: {
      validate(value: any, args: ValidationArguments) {
        const type = args.object[typePropertyName];
        switch (type) {
          case 'integer':
            return test(integerRegex, value);
          case 'double':
            return test(doubleRegex, value);
          case 'boolean':
            return value === 'true' || value === 'false';
          case 'string':
            return true;
          case 'integer array':
            return validateArrayItems(test(integerRegex), value);
          case 'double array':
            return validateArrayItems(test(doubleRegex), value);
          case 'boolean array':
            return validateArrayItems(item => item === 'true' || item === 'false', value);
          case 'string array':
            return true;
        }
      },
    },
  });
};
