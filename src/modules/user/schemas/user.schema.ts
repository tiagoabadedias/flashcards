import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  googleId: string;

  @Prop()
  avatar: string;

  @Prop({
    type: Object,
    default: {
      version: 1,
      completed: false,
    },
  })
  onboarding: {
    version: number;
    completed: boolean;
    completedAt?: Date;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
