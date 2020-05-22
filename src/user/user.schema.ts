import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop()
  public registeredAt: Date;

  @Prop()
  public userName: string;

  @Prop()
  public name: string;

  @Prop()
  public email: string;

  @Prop()
  public passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
