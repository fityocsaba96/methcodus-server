import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../user/user.schema';

@Schema()
export class Exercise extends Document {
  @Prop(Date)
  public createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  public createdBy: Types.ObjectId;

  @Prop(String)
  public name: string;

  @Prop(String)
  public description: string;

  @Prop([
    { description: String, parameters: [{ type: String, value: String }], matcher: String, expected: { type: String, value: String } },
  ])
  public testCases: {
    description: string;
    parameters: { type: string; value: string }[];
    matcher: string;
    expected: { type: string; value: string };
  }[];
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
