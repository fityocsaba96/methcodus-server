import { Schema } from 'mongoose';
import { Socket } from 'socket.io';

export type PairProgrammingRequest = {
  exerciseId: string;
  programmingLanguage: string;
  softwareDevelopmentMethod: string;
  pairUser: {
    id: string;
    userName: string;
    socket: Socket;
  };
};
