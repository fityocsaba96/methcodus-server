import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolutionController } from './solution.controller';
import { SolutionService } from './solution.service';
import { SolutionSchema, Solution } from './solution.schema';
import { ExerciseModule } from '../exercise/exercise.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Solution.name, schema: SolutionSchema }]), ExerciseModule],
  controllers: [SolutionController],
  providers: [SolutionService],
})
export class SolutionModule {}
