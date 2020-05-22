import { Schema } from 'mongoose';
import { Socket } from 'socket.io';

export type PairProgrammingRequest = {
  exerciseId: Schema.Types.ObjectId;
  programmingLanguage: string;
  softwareDevelopmentMethod: string;
  pairUser: {
    id: Schema.Types.ObjectId;
    userName: string;
    socket: Socket;
  };
};
