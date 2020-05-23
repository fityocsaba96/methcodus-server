import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  public async existsUserName(userName: string): Promise<boolean> {
    return this.userModel.exists({ userName });
  }

  public async insert(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    user.registeredAt = new Date();
    user.passwordHash = await bcrypt.hash(createUserDto.password, 10);
    return user.save();
  }
}
