import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/user.schema';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) {}

  public async validateUser(userName: string, password: string): Promise<User | false | undefined> {
    const user = await this.userService.findByUserName(userName);
    if (user === null) {
      return undefined;
    }
    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
    return !passwordsMatch ? false : user;
  }

  public generateJWT(user: User): { access_token: string } {
    return {
      access_token: this.jwtService.sign({ username: user.userName, sub: user._id }),
    };
  }
}
