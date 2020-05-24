import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';

const mongooseModule = MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]);

@Module({
  imports: [mongooseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, mongooseModule],
})
export class UserModule {}
