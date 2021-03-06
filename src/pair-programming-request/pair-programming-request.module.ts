import { Module } from '@nestjs/common';
import * as LRUCache from 'lru-cache';
import { PairProgrammingRequestController } from './pair-programming-request.controller';
import { PairProgrammingRequest } from './pair-programming-request.interface';
import { PairProgrammingRequestService } from './pair-programming-request.service';

const pairProgrammingRequestsCacheProvider = {
  provide: 'pair-programming-requests-cache',
  useValue: new LRUCache<string, PairProgrammingRequest>({
    maxAge: Number(process.env.PAIR_PROGRAMMING_REQUESTS_MAX_AGE),
  }),
};

@Module({
  controllers: [PairProgrammingRequestController],
  providers: [PairProgrammingRequestService, pairProgrammingRequestsCacheProvider],
  exports: [PairProgrammingRequestService],
})
export class PairProgrammingRequestModule {}
