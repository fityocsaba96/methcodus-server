import { WebSocketGateway } from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import * as LRUCache from 'lru-cache';
import { Schema } from 'mongoose';
import { PairProgrammingRequest } from 'src/pair-programming-request/pair-programming-request.interface';

@WebSocketGateway({ namespace: 'pair-programming' })
export class PairProgrammingGateway {
  constructor(
    @Inject('pair-programming-requests-cache')
    private readonly pairProgrammingRequestsCache: LRUCache<Schema.Types.ObjectId, PairProgrammingRequest>,
  ) {}
}
