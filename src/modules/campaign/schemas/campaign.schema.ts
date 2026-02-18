import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Schema embarcado para questões da campanha
@Schema({ _id: true })
export class CampaignQuestion {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;

  @Prop({ default: 'audio', enum: ['audio', 'buttons'] })
  responseMode: 'audio' | 'buttons';

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ type: String, trim: true })
  explanation?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CampaignQuestionSchema = SchemaFactory.createForClass(CampaignQuestion);

export type CampaignDocument = Campaign & Document;

@Schema({
  timestamps: true,
  collection: 'campaigns'
})
export class Campaign {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  hasStarted: boolean;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({ 
    type: [{ type: Types.ObjectId, ref: 'Group' }], 
    default: [] 
  })
  groups: Types.ObjectId[];

  @Prop({ 
    type: [CampaignQuestionSchema], 
    default: [] 
  })
  questions: CampaignQuestion[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
