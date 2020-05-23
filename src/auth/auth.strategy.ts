import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthException } from 'src/lib/validation-error';
import { User } from 'src/user/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'userName',
      passwordField: 'password',
    });
  }

  public async validate(userName: string, password: string): Promise<User> {
    const validatedUser = await this.authService.validateUser(userName, password);
    if (validatedUser === undefined) {
      throw new AuthException({ userName: 'User name does not exist!' });
    } else if (validatedUser === false) {
      throw new AuthException({ password: 'Wrong password!' });
    }
    return validatedUser;
  }
}
