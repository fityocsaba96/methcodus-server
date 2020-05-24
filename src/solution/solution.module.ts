import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolutionController } from './solution.controller';
import { SolutionService } from './solution.service';
import { SolutionSchema } from './solution.schema';
import { ExerciseModule } from 'src/exercise/exercise.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Solution', schema: SolutionSchema }]), ExerciseModule, UserModule],
  controllers: [SolutionController],
  providers: [SolutionService],
})
export class SolutionModule {}
