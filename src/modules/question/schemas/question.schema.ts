import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({
  timestamps: true,
  collection: 'questions'
})
export class Question {
  @Prop({ required: true, trim: true })
  question: string;

  @Prop({ required: true, trim: true })
  answer: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ default: 'multiple_choice', enum: ['multiple_choice', 'true_false', 'open_ended'] })
  type: string;

  @Prop({ default: 'easy', enum: ['easy', 'medium', 'hard'] })
  difficulty: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  category: string;

  @Prop({ type: String, trim: true })
  explanation: string;

  @Prop({ type: Types.ObjectId, ref: 'Campaign' })
  campaign: Types.ObjectId;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String, trim: true })
  name: string; // Nome do estudante

  @Prop({ type: String })
  profilePicture: string; // URL da foto de perfil

  @Prop({ type: Date })
  answeredAt: Date; // Quando foi respondida

  @Prop({ type: Date })
  expired: Date; // Data de expiração

  @Prop({ type: Boolean, default: false })
  return: boolean;

  @Prop({ type: String })
  retornoAluno: string; // Resposta dada pelo aluno

  @Prop({ type: String })
  nota: string; // Nota atribuída pelo professor

  @Prop({ type: String })
  resposta: string; // Feedback do professor

  @Prop({ type: String })
  urlAudioAluno: string; // URL do áudio enviado pelo aluno

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);