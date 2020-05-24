import { Strategy as LocalPassportStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JWTPassportStrategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthException } from 'src/lib/validation-error';
import { User } from 'src/user/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(LocalPassportStrategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'userName',
      passwordField: 'password',
    });
  }

  public async validate(userName: string, password: string): Promise<User> {
    const validatedUser = await this.authService.validateUser(userName, password);
    if (validatedUser === undefined) {
      throw new AuthException(['User name does not exist!']);
    } else if (validatedUser === false) {
      throw new AuthException(['Wrong password!']);
    }
    return validatedUser;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(JWTPassportStrategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: true,
    });
  }

  public validate(payload: any): Partial<User> {
    return { _id: payload.sub, userName: payload.username };
  }
}
