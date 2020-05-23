import { Module } from '@nestjs/common';
import { PairProgrammingGateway } from './pair-programming.gateway';
import { PairProgrammingRequestModule } from 'src/pair-programming-request/pair-programming-request.module';

@Module({
  imports: [PairProgrammingRequestModule],
  providers: [PairProgrammingGateway],
})
export class PairProgrammingModule {}
