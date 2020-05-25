import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { PairProgrammingRequestService } from 'src/pair-programming-request/pair-programming-request.service';
import { UseGuards } from '@nestjs/common';
import { WebSocketJwtAuthGuard } from 'src/auth/auth.guard';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { AddPairProgrammingRequestDto } from './pair-programming.dto';
import { User } from 'src/user/user.schema';
import { pipe, omit, assoc } from 'ramda';

@WebSocketGateway({ namespace: 'pair-programming' })
export class PairProgrammingGateway {
  constructor(private readonly pairProgrammingRequestService: PairProgrammingRequestService, private readonly userService: UserService) {}

  @UseGuards(WebSocketJwtAuthGuard)
  @SubscribeMessage('authenticate')
  public async onAuthenticate(): Promise<boolean> {
    return true;
  }

  @UseGuards(WebSocketJwtAuthGuard)
  @SubscribeMessage('add-pair-programming-request')
  public async onAddPairProgrammingRequest(
    @MessageBody() addPairProgrammingRequestDto: AddPairProgrammingRequestDto,
    @ConnectedSocket() socket: Socket,
  ): Promise<Partial<User> | { errors: string[] }> {
    const pairUser = await this.userService.findByUserName(addPairProgrammingRequestDto.pairUserName);
    if (pairUser === null) {
      return { errors: ['User with this user name does not exist!'] };
    }
    this.pairProgrammingRequestService.insert(
      pairUser._id.toString(),
      pipe(
        omit(['pairUserName']),
        assoc('pairUser', { _id: (socket as any).user._id, userName: (socket as any).user.userName, socket }),
      )(addPairProgrammingRequestDto),
    );
    return { _id: pairUser._id };
  }
}
