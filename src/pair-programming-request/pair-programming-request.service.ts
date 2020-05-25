import { Inject, Injectable } from '@nestjs/common';
import * as LRUCache from 'lru-cache';
import { PairProgrammingRequest } from './pair-programming-request.interface';

@Injectable()
export class PairProgrammingRequestService {
  constructor(
    @Inject('pair-programming-requests-cache')
    private readonly pairProgrammingRequestsCache: LRUCache<string, PairProgrammingRequest>,
  ) {}

  public find(_id: string): PairProgrammingRequest {
    return this.pairProgrammingRequestsCache.get(_id);
  }

  public insert(_id: string, pairProgrammingRequest: PairProgrammingRequest): void {
    this.pairProgrammingRequestsCache.set(_id, pairProgrammingRequest);
  }
}
