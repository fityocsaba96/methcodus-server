import { MinLength, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @MinLength(1, { message: 'Name cannot be empty!' })
  public readonly name: string;

  @IsEmail(undefined, { message: 'Email must be an email!' })
  public readonly email: string;

  @MinLength(6, { message: 'Password cannot be shorter than 6 characters!' })
  public readonly password: string;

  @MinLength(6, { message: 'Password confirmation cannot be shorter than 6 characters!' })
  public readonly passwordConfirmation: string;
}

export class CreateUserDto extends UpdateUserDto {
  @MinLength(1, { message: 'User name cannot be empty!' })
  public readonly userName: string;
}
