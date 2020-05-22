import { Inject, Injectable } from '@nestjs/common';
import * as LRUCache from 'lru-cache';
import { Schema } from 'mongoose';
import { PairProgrammingRequest } from './pair-programming-request.interface';

@Injectable()
export class PairProgrammingRequestService {
  constructor(
    @Inject('pair-programming-requests-cache')
    private readonly pairProgrammingRequestsCache: LRUCache<Schema.Types.ObjectId, PairProgrammingRequest>,
  ) {}
}
