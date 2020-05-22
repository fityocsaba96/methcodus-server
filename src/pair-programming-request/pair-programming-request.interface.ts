import { Schema } from 'mongoose';

export type PairProgrammingRequest = {
  exerciseId: Schema.Types.ObjectId;
  programmingLanguage: string;
  softwareDevelopmentMethod: string;
  pairUser: {
    id: Schema.Types.ObjectId;
    userName: string;
    socket: any;
  };
};
