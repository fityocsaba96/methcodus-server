import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop(Date)
  public registeredAt: Date;

  @Prop(String)
  public userName: string;

  @Prop(String)
  public name: string;

  @Prop(String)
  public email: string;

  @Prop(String)
  public passwordHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
