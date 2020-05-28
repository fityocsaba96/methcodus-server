import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { validate } from '../lib/validation-error';
import { LoginDto } from './auth.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  public async canActivate(context: ExecutionContext): Promise<any> {
    const body = context.switchToHttp().getRequest().body;
    await validate(Object.assign(new LoginDto(), body));
    return super.canActivate(context);
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class WebSocketJwtAuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const webSocketContext = context.switchToWs();
    const client = webSocketContext.getClient();
    if (client.authenticated === true) {
      return true;
    }
    const data = webSocketContext.getData();
    if (typeof data !== 'string' || data.substring(0, 6) !== 'Bearer') {
      return false;
    }
    const jwtToken = data.substring(7);
    let payload: any;
    try {
      payload = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY, { ignoreExpiration: true });
    } catch {
      return false;
    }
    client.user = { _id: payload.sub, userName: payload.username };
    client.authenticated = true;
    return true;
  }
}
