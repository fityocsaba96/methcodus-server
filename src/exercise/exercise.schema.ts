import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

type ObjectId = MongooseSchema.Types.ObjectId;

@Schema()
export class Exercise extends Document {
  @Prop()
  public createdAt: Date;

  @Prop()
  public createdBy: { type: ObjectId; ref: 'User' };

  @Prop()
  public name: string;

  @Prop()
  public description: string;

  @Prop()
  public testCases: [
    { description: string; parameters: [{ type: string; value: string }]; matcher: string; expected: { type: string; value: string } },
  ];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
