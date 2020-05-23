import { WebSocketGateway } from '@nestjs/websockets';
import { PairProgrammingRequestService } from 'src/pair-programming-request/pair-programming-request.service';

@WebSocketGateway({ namespace: 'pair-programming' })
export class PairProgrammingGateway {
  constructor(private readonly pairProgrammingRequestService: PairProgrammingRequestService) {}
}
