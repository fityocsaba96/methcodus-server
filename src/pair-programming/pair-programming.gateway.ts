import { WebSocketGateway } from '@nestjs/websockets';
import { PairProgrammingService } from './pair-programming.service';

@WebSocketGateway({ namespace: 'pair-programming' })
export class PairProgrammingGateway {
  constructor(private readonly pairProgrammingService: PairProgrammingService) {}
}
