import { Controller, Inject } from '@nestjs/common';
import * as LRUCache from 'lru-cache';
import { Schema } from 'mongoose';
import { PairProgrammingRequest } from './pair-programming-request.interface';

@Controller('pair-programming-requests')
export class PairProgrammingRequestController {
  constructor(
    @Inject('pair-programming-requests-cache')
    private readonly pairProgrammingRequestsCache: LRUCache<Schema.Types.ObjectId, PairProgrammingRequest>,
  ) {}
}
