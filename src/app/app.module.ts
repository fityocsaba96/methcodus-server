import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TesterModule } from './tester/tester.module';
import { ExerciseModule } from 'src/exercise/exercise.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI, { useNewUrlParser: true }), TesterModule, ExerciseModule],
})
export class AppModule {}
