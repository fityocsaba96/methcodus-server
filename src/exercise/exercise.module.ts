import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { ExerciseSchema } from './exercise.schema';
import { UserModule } from 'src/user/user.module';

const mongooseModule = MongooseModule.forFeature([{ name: 'Exercise', schema: ExerciseSchema }]);

@Module({
  imports: [mongooseModule, UserModule],
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [mongooseModule, ExerciseService],
})
export class ExerciseModule {}
