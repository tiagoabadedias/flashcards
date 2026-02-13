import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from '../question/schemas/question.schema';
import { Campaign, CampaignDocument } from '../campaign/schemas/campaign.schema';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  async findAll(userId: string) {
    const students = await this.questionModel.aggregate([
      { $match: { userId: userId } }, // Usar string diretamente, não ObjectId
      // Adicionar campo para conversão de campaign string para ObjectId se necessário
      {
        $addFields: {
          campaignObjectId: {
            $cond: [
              { $type: '$campaign' },
              { $toObjectId: '$campaign' },
              '$campaign'
            ]
          }
        }
      },
      // Lookup para pegar os dados da campanha
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignObjectId',
          foreignField: '_id',
          as: 'campaignDetails',
        },
      },
      // Unwind para desnormalizar o array de campaignDetails
      {
        $unwind: {
          path: '$campaignDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$phoneNumber',
          name: { $first: '$name' },
          lastActive: { $max: '$answeredAt' },
          totalQuestions: { $sum: 1 },
          // Coletar campanhas únicas com ID e Nome
          campaigns: { 
            $addToSet: { 
              id: '$campaign', 
              name: { 
                $ifNull: ['$campaignDetails.name', 'Campanha Sem Nome'] 
              }
            } 
          },
        },
      },
      {
        $project: {
          phoneNumber: '$_id',
          name: 1,
          lastActive: 1,
          totalQuestions: 1,
          totalCampaigns: { $size: '$campaigns' },
          campaigns: 1,
          _id: 0,
        },
      },
      { $sort: { lastActive: -1 } },
    ]);

    return students;
  }

  async findOne(userId: string, phoneNumber: string) {
    // Usar userId como string, não ObjectId
    const result = await this.questionModel.aggregate([
      { 
        $match: { 
          userId: userId, // String match
          phoneNumber: phoneNumber 
        } 
      },
      // Adicionar campo para conversão de campaign string para ObjectId se necessário
      {
        $addFields: {
          campaignObjectId: {
            $cond: [
              { $type: '$campaign' },
              { $toObjectId: '$campaign' },
              '$campaign'
            ]
          }
        }
      },
      // Join com campanhas para pegar o nome
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignObjectId',
          foreignField: '_id',
          as: 'campaignDetails'
        }
      },
      {
        $unwind: {
          path: '$campaignDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      // Ordenar por data para garantir histórico consistente
      { $sort: { answeredAt: -1 } },
      // Primeiro agrupamento: Por Campanha (Trilha)
      {
        $group: {
          _id: '$campaign',
          campaignName: { 
            $first: { 
              $ifNull: ['$campaignDetails.name', 'Campanha Sem Nome'] 
            } 
          },
          studentName: { $first: '$name' }, // Preservar nome do aluno
          totalQuestions: { $sum: 1 },
          totalScore: { 
            $sum: { 
              $cond: [
                { $eq: ['$nota', null] }, 
                0, 
                { $toDouble: '$nota' } // Converter string nota para numero
              ] 
            } 
          },
          questions: {
            $push: {
              questionId: '$_id',
              question: '$question',
              answer: '$retornoAluno',
              score: '$nota',
              answeredAt: '$answeredAt',
              feedback: '$resposta',
              audioUrl: '$urlAudioAluno' // Adicionando campo de áudio
            }
          }
        }
      },
      // Projetar os dados da campanha formatados
      {
        $project: {
          campaignId: '$_id',
          campaignName: 1, // Usar o nome já tratado na fase anterior
          studentName: 1,
          totalQuestions: 1,
          averageScore: {
            $cond: [
              { $gt: ['$totalQuestions', 0] },
              { $divide: ['$totalScore', '$totalQuestions'] },
              0
            ]
          },
          questions: 1,
          _id: 0
        }
      },
      // Segundo agrupamento: Consolidar tudo sob o Aluno
      {
        $group: {
          _id: null, // Agrupar tudo num único documento
          name: { $first: '$studentName' },
          totalQuestionsGlobal: { $sum: '$totalQuestions' },
          tracks: { $push: '$$ROOT' } // Empurrar o documento da campanha inteiro para o array tracks
        }
      },
      {
        $project: {
          name: { $ifNull: ['$name', 'Unknown'] },
          tracks: 1,
          globalStats: {
            totalQuestions: '$totalQuestionsGlobal',
            totalTracks: { $size: '$tracks' },
            averageScore: { $avg: '$tracks.averageScore' }
          }
        }
      }
    ]);

    if (!result || result.length === 0) {
      throw new NotFoundException('Student not found or no activity');
    }

    return {
      phoneNumber,
      ...result[0]
    };
  }
}
