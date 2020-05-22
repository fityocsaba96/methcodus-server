import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Solution extends Document {
  @Prop()
  public solvedAt: Date;

  @Prop()
  public user: { type: MongooseSchema.Types.ObjectId; ref: 'User' };

  @Prop()
  public pairUser: { type: MongooseSchema.Types.ObjectId; ref: 'User' };

  @Prop()
  public exercise: { type: MongooseSchema.Types.ObjectId; ref: 'Exercise' };

  @Prop()
  public programmingLanguage: string;

  @Prop()
  public softwareDevelopmentMethod: string;

  @Prop()
  public code: string;
}

export const SolutionSchema = SchemaFactory.createForClass(Solution);
