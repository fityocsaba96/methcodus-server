import { Module } from '@nestjs/common';
import { PairProgrammingRequestController } from './pair-programming-request.controller';

@Module({
  controllers: [PairProgrammingRequestController],
})
export class PairProgrammingRequestModule {}
