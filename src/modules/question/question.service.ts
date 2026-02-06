import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { QueryQuestionDto } from './dto/query-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async findAll(queryDto: QueryQuestionDto, userId: string): Promise<{
    data: Question[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      pages: number;
      currentPage: number;
    };
  }> {
    const {
      question,
      category,
      type,
      difficulty,
      tags,
      isActive,
      campaignId,
      studentName,
      studentPhone,
      hasResponse,
      isEvaluated,
      limit = '10',
      offset = '0',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryDto;

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;

    // Construção do filtro
    const filters: any = { userId }; // Filtro base por usuário

    // Filtros existentes
    if (question) {
      filters.question = { $regex: question, $options: 'i' };
    }

    if (category) {
      filters.category = { $regex: category, $options: 'i' };
    }

    if (type) {
      filters.type = type;
    }

    if (difficulty) {
      filters.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      filters.tags = { $in: tags };
    }

    if (isActive !== undefined) {
      filters.isActive = isActive;
    }

    if (campaignId) {
      filters.campaign = campaignId;
    }

    // NOVOS filtros
    if (studentName) {
      filters.name = { $regex: studentName, $options: 'i' };
    }

    if (studentPhone) {
      filters.phoneNumber = { $regex: studentPhone, $options: 'i' };
    }

    if (hasResponse !== undefined) {
      if (hasResponse) {
        filters.retornoAluno = { $exists: true, $nin: [null, ''] };
      } else {
        filters.$or = [
          { retornoAluno: { $exists: false } },
          { retornoAluno: null },
          { retornoAluno: '' }
        ];
      }
    }

    if (isEvaluated !== undefined) {
      if (isEvaluated) {
        filters.nota = { $exists: true, $nin: [null, ''] };
      } else {
        filters.$or = [
          { nota: { $exists: false } },
          { nota: null },
          { nota: '' }
        ];
      }
    }

    // Busca com agregação para incluir dados da campanha
    const [data, total] = await Promise.all([
      this.questionModel
        .find(filters)
        .populate('campaign', 'name description isActive')
        .sort({ [sortBy]: sortOrderNum })
        .skip(offsetNum)
        .limit(limitNum)
        .exec(),
      this.questionModel.countDocuments(filters).exec(),
    ]);

    const pages = Math.ceil(total / limitNum);
    const currentPage = Math.floor(offsetNum / limitNum) + 1;

    return {
      data,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        pages,
        currentPage,
      },
    };
  }

  async create(createQuestionDto: any, userId: string): Promise<Question> {
    const createdQuestion = new this.questionModel({ ...createQuestionDto, userId });
    return await createdQuestion.save();
  }

  async findByCampaign(campaignId: string, userId: string): Promise<Question[]> {
    return await this.questionModel
      .find({ campaign: campaignId, userId })
      .populate('campaign', 'name description isActive')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findGroupedByCampaign(userId: string): Promise<any[]> {
    return await this.questionModel.aggregate([
      { $match: { userId } }, // Filtra por usuário
      {
        $addFields: {
          campaignObjId: { $toObjectId: '$campaign' }
        }
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignObjId',
          foreignField: '_id',
          as: 'campaignInfo'
        }
      },
      {
        $unwind: {
          path: '$campaignInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            campaign: '$campaign',
            phoneNumber: '$phoneNumber'
          },
          campaignName: { $first: '$campaignInfo.name' },
          campaignIsActive: { $first: '$campaignInfo.isActive' },
          phoneNumber: { $first: '$phoneNumber' },
          averageScore: { 
            $avg: { 
              $toDouble: { 
                $ifNull: ['$nota', '0'] 
              } 
            } 
          },
          questionsCount: { $sum: 1 },
          questions: { 
            $push: {
              _id: '$_id',
              question: '$question',
              answer: '$answer',
              retornoAluno: '$retornoAluno',
              nota: '$nota',
              resposta: '$resposta',
              options: '$options',
              type: '$type',
              difficulty: '$difficulty',
              tags: '$tags',
              isActive: '$isActive',
              category: '$category',
              explanation: '$explanation',
              return: '$return',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt'
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.campaign',
          campaignName: { $first: '$campaignName' },
          campaignIsActive: { $first: '$campaignIsActive' },
          totalQuestions: { $sum: '$questionsCount' },
          students: {
            $push: {
              phoneNumber: '$phoneNumber',
              averageScore: '$averageScore',
              questionsCount: '$questionsCount',
              questions: '$questions'
            }
          }
        }
      },
      {
        $sort: { campaignName: 1 }
      }
    ]).exec();
  }

  async findOne(id: string, userId: string): Promise<Question> {
    const question = await this.questionModel.findOne({ _id: id, userId }).exec();
    
    if (!question) {
      throw new NotFoundException(`Questão com ID ${id} não encontrada`);
    }
    
    return question;
  }

  async findByCategory(category: string, userId: string): Promise<Question[]> {
    return await this.questionModel
      .find({ 
        category: { $regex: category, $options: 'i' },
        isActive: true,
        userId
      })
      .exec();
  }

  async findByTags(tags: string[], userId: string): Promise<Question[]> {
    return await this.questionModel
      .find({
        tags: { $in: tags },
        isActive: true,
        userId
      })
      .exec();
  }

  async findByDifficulty(difficulty: string, userId: string): Promise<Question[]> {
    return await this.questionModel
      .find({
        difficulty,
        isActive: true,
        userId
      })
      .exec();
  }

  async findRandom(limit: number = 10, userId: string): Promise<Question[]> {
    return await this.questionModel.aggregate([
      { $match: { isActive: true, userId } },
      { $sample: { size: limit } },
    ]);
  }

  async getStats(userId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    byDifficulty: Record<string, number>;
  }> {
    const [
      total,
      active,
      inactive,
      typeStats,
      difficultyStats,
    ] = await Promise.all([
      this.questionModel.countDocuments({ userId }),
      this.questionModel.countDocuments({ isActive: true, userId }),
      this.questionModel.countDocuments({ isActive: false, userId }),
      this.questionModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      this.questionModel.aggregate([
        { $match: { userId } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
    ]);

    const byType = typeStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const byDifficulty = difficultyStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      byType,
      byDifficulty,
    };
  }

  async getCategories(userId: string): Promise<string[]> {
    const categories = await this.questionModel.find({ userId }).distinct('category');
    return categories.filter(Boolean); // Remove null/undefined values
  }

  async getTags(userId: string): Promise<string[]> {
    const tags = await this.questionModel.find({ userId }).distinct('tags');
    return tags.filter(Boolean); // Remove null/undefined values
  }

  // NOVO: Buscar estatísticas de estudantes
  async getStudentStats(userId: string) {
    const stats = await this.questionModel.aggregate([
      {
        $match: {
          phoneNumber: { $exists: true, $nin: [null, ''] },
          name: { $exists: true, $nin: [null, ''] },
          userId // Filtra por usuário
        }
      },
      {
        $group: {
          _id: {
            phoneNumber: '$phoneNumber',
            name: '$name',
            profilePicture: '$profilePicture'
          },
          totalQuestions: { $sum: 1 },
          answeredQuestions: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$retornoAluno', null] },
                  { $ne: ['$retornoAluno', ''] }
                ]},
                1,
                0
              ]
            }
          },
          evaluatedQuestions: {
            $sum: {
              $cond: [
                { $and: [
                  { $ne: ['$nota', null] },
                  { $ne: ['$nota', ''] }
                ]},
                1,
                0
              ]
            }
          },
          avgScore: {
            $avg: {
              $cond: [
                { $and: [
                  { $ne: ['$nota', null] },
                  { $ne: ['$nota', ''] },
                  { $regexMatch: { input: '$nota', regex: /^\d+(\.\d+)?$/ } }
                ]},
                { $toDouble: '$nota' },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          phoneNumber: '$_id.phoneNumber',
          name: '$_id.name',
          profilePicture: '$_id.profilePicture',
          totalQuestions: 1,
          answeredQuestions: 1,
          evaluatedQuestions: 1,
          avgScore: { $round: ['$avgScore', 2] },
          responseRate: {
            $round: [
              { $multiply: [
                { $divide: ['$answeredQuestions', '$totalQuestions'] },
                100
              ]},
              1
            ]
          }
        }
      },
      {
        $sort: { totalQuestions: -1 }
      }
    ]);

    return stats;
  }

  // NOVO: Buscar lista de estudantes para autocomplete
  async getStudentsList(userId: string) {
    const students = await this.questionModel.aggregate([
      {
        $match: {
          phoneNumber: { $exists: true, $nin: [null, ''] },
          name: { $exists: true, $nin: [null, ''] },
          userId // Filtra por usuário
        }
      },
      {
        $group: {
          _id: {
            phoneNumber: '$phoneNumber',
            name: '$name',
            profilePicture: '$profilePicture'
          }
        }
      },
      {
        $project: {
          _id: 0,
          phoneNumber: '$_id.phoneNumber',
          name: '$_id.name',
          profilePicture: '$_id.profilePicture'
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    return students;
  }
}