import { MinLength } from 'class-validator';

export class LoginDto {
  @MinLength(1, { message: 'User name cannot be empty!' })
  public readonly userName: string;

  @MinLength(6, { message: 'Password cannot be shorter than 6 characters!' })
  public readonly password: string;
}
