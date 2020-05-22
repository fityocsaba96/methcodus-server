import { Module } from '@nestjs/common';
import { PairProgrammingGateway } from './pair-programming.gateway';
import { PairProgrammingRequestModule } from 'src/pair-programming-request/pair-programming-request.module';
import { PairProgrammingService } from './pair-programming.service';

@Module({
  imports: [PairProgrammingRequestModule],
  providers: [PairProgrammingGateway, PairProgrammingService],
})
export class PairProgrammingModule {}
