import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { PairProgrammingRequestService } from 'src/pair-programming-request/pair-programming-request.service';
import { UseGuards } from '@nestjs/common';
import { WebSocketJwtAuthGuard } from 'src/auth/auth.guard';

@WebSocketGateway({ namespace: 'pair-programming' })
export class PairProgrammingGateway {
  constructor(private readonly pairProgrammingRequestService: PairProgrammingRequestService) {}

  @UseGuards(WebSocketJwtAuthGuard)
  @SubscribeMessage('authenticate')
  public async onAuthenticate(): Promise<boolean> {
    return true;
  }
}
