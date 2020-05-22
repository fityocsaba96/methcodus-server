import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseModule } from './exercise/exercise.module';
import { UserModule } from './user/user.module';
import { SolutionModule } from './solution/solution.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI, { useNewUrlParser: true }), ExerciseModule, SolutionModule, UserModule],
})
export class AppModule {}
