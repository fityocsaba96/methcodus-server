import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './auth.guard';
import { Request as ExpressRequest } from 'express';
import { User } from '../user/user.schema';
import { AccessToken } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  public async login(@Request() request: ExpressRequest): Promise<AccessToken> {
    return this.authService.generateJWT(request.user as User);
  }
}
