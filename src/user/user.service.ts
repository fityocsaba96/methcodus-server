import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto, UpdateUserDto } from './user.dto';
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
    user.passwordHash = await this.hash(createUserDto.password);
    return user.save();
  }

  public async findByUserName(userName: string): Promise<User> {
    return this.userModel.findOne({ userName });
  }

  public async update(_id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(_id, {
      name: updateUserDto.name,
      email: updateUserDto.email,
      passwordHash: await this.hash(updateUserDto.password),
    });
  }

  private hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
