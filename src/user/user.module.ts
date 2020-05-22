import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';

const mongooseModuleWithUserSchema = MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]);
@Module({
  imports: [mongooseModuleWithUserSchema],
  controllers: [UserController],
  providers: [UserService],
  exports: [mongooseModuleWithUserSchema],
})
export class UserModule {}
