import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

type ObjectId = MongooseSchema.Types.ObjectId;

@Schema()
export class Solution extends Document {
  @Prop()
  public solvedAt: Date;

  @Prop()
  public user: { type: ObjectId; ref: 'User' };

  @Prop()
  public pairUser: { type: ObjectId; ref: 'User' };

  @Prop()
  public exercise: { type: ObjectId; ref: 'Exercise' };

  @Prop()
  public programmingLanguage: string;

  @Prop()
  public softwareDevelopmentMethod: string;

  @Prop()
  public code: string;
}

export const SolutionSchema = SchemaFactory.createForClass(Solution);
