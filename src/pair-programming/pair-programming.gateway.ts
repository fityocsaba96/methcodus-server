import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { PairProgrammingRequestService } from '../pair-programming-request/pair-programming-request.service';
import { UseGuards } from '@nestjs/common';
import { WebSocketJwtAuthGuard } from '../auth/auth.guard';
import { Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { AddPairProgrammingRequestDto, PairEditedCodeDto } from './pair-programming.dto';
import { User } from '../user/user.schema';
import { pipe, omit, assoc } from 'ramda';

@WebSocketGateway({ namespace: 'pair-programming' })
export class PairProgrammingGateway implements OnGatewayDisconnect {
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

  @UseGuards(WebSocketJwtAuthGuard)
  @SubscribeMessage('pair-connected')
  public async onPairConnected(@ConnectedSocket() socket: Socket): Promise<void> {
    const pairProgrammingRequest = this.pairProgrammingRequestService.remove((socket as any).user._id);
    if (pairProgrammingRequest !== undefined) {
      const partialData = { softwareDevelopmentMethod: pairProgrammingRequest.softwareDevelopmentMethod };
      const pairSocket = pairProgrammingRequest.pairUser.socket;
      (socket as any).data = assoc('pairSocket', pairSocket, partialData);
      (pairSocket as any).data = assoc('pairSocket', socket, partialData);
      [socket, pairSocket].forEach(clientSocket => clientSocket.emit('pair-connected'));
    }
  }

  @UseGuards(WebSocketJwtAuthGuard)
  @SubscribeMessage('pair-edited-code')
  public async onPairEditedCode(@MessageBody() pairEditedCodeDto: PairEditedCodeDto, @ConnectedSocket() socket: Socket): Promise<void> {
    const pairSocket = (socket as any).data.pairSocket;
    const socketsToEmit = (socket as any).data.softwareDevelopmentMethod === 'pair-programming' ? [socket, pairSocket] : [pairSocket];
    socketsToEmit.forEach(clientSocket => clientSocket.emit('pair-edited-code', pairEditedCodeDto));
  }

  @UseGuards(WebSocketJwtAuthGuard)
  @SubscribeMessage('forward-to-pair')
  public async onForwardToPair(@MessageBody() forwardToPairDto: any, @ConnectedSocket() socket: Socket): Promise<void> {
    (socket as any).data.pairSocket.emit('forward-to-pair', forwardToPairDto);
  }

  public handleDisconnect(socket: Socket): void {
    const pairSocket: Socket = (socket as any).data?.pairSocket;
    if (pairSocket !== undefined && !pairSocket.disconnected) {
      pairSocket.emit('pair-disconnected');
    }
  }
}
