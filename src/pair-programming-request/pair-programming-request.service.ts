import { Inject, Injectable } from '@nestjs/common';
import * as LRUCache from 'lru-cache';
import { PairProgrammingRequest } from './pair-programming-request.interface';

@Injectable()
export class PairProgrammingRequestService {
  constructor(
    @Inject('pair-programming-requests-cache')
    private readonly pairProgrammingRequestsCache: LRUCache<string, PairProgrammingRequest>,
  ) {}

  public find(id: string): PairProgrammingRequest {
    return this.pairProgrammingRequestsCache.get(id);
  }
}
