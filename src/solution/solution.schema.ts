import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../user/user.schema';
import { Exercise } from '../exercise/exercise.schema';

@Schema()
export class Solution extends Document {
  @Prop(Date)
  public solvedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  public user: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  public pairUser: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Exercise.name })
  public exercise: Types.ObjectId;

  @Prop(String)
  public programmingLanguage: string;

  @Prop(String)
  public softwareDevelopmentMethod: string;

  @Prop(String)
  public code: string;
}

export const SolutionSchema = SchemaFactory.createForClass(Solution);
