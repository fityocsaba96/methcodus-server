import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolutionController } from './solution.controller';
import { SolutionService } from './solution.service';
import { SolutionSchema } from './solution.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Solution', schema: SolutionSchema }])],
  controllers: [SolutionController],
  providers: [SolutionService],
})
export class SolutionModule {}
