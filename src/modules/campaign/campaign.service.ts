import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';
import { CreateQuestionForCampaignDto } from './dto/create-question-for-campaign.dto';
import { UpdateQuestionForCampaignDto } from './dto/update-question-for-campaign.dto';
import { 
  CampaignAnalyticsResponseDto, 
  CampaignOverviewDto,
  QuestionAnalysisDto,
  StudentSegmentDto,
  StudentPerformerDto,
  GroupComparisonDto,
  ActivityAnalysisDto,
  AlertDto,
  TrendDataDto,
  CategoryAnalysisDto
} from './dto/analytics-response.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto, userId: string) {
    console.log('Creating campaign with DTO:', JSON.stringify(createCampaignDto, null, 2));
    
    // 1. Separar questões do resto do DTO
    const { questions, ...campaignData } = createCampaignDto;
    
    // 2. Criar e salvar a campanha inicialmente sem as questões
    const campaign = new this.campaignModel({
      ...campaignData,
      userId,
      questions: [] // Garante que inicia vazio
    });

    let savedCampaign = await campaign.save();

    // 3. Se houver perguntas, processar e salvar novamente
    if (questions && Array.isArray(questions) && questions.length > 0) {
      console.log(`Adding ${questions.length} questions to new campaign ${savedCampaign._id}`);
      
      console.log('Questions:', JSON.stringify(questions, null, 2));


      // for (const question of questions) {
      //   const questionDto = new CreateQuestionForCampaignDto();
      //     questionDto.question = question.question;
      //     questionDto.answer = question.answer;
      //     questionDto.explanation = question.explanation;
      //     questionDto.isActive = question.isActive ?? true;

      //     await this.createCampaignQuestion(savedCampaign._id.toString(), questionDto, userId);
      // }
   

      const questionsToAdd = questions.map(q => ({
        question: q.question,
        answer: q.answer,
        responseMode: q.responseMode ?? 'audio',
        options: this.normalizeOptions(q.options),
        explanation: q.explanation,
        isActive: q.isActive ?? true,
        _id: new Types.ObjectId(),
        createdAt: new Date()
      })); 
      questionsToAdd.forEach((q) => this.validateCampaignQuestion(q));

      savedCampaign.questions = questionsToAdd;
      console.log('Questions after update:', JSON.stringify(savedCampaign.questions, null, 2));
      return savedCampaign.save();
    }

    return savedCampaign;
  }

  async findAll(userId: string) {
    return this.campaignModel
      .find({ userId })
      .populate('groups', 'name participants isActive')
      .exec();
  }

  async findActive(userId: string) {
    return this.campaignModel
      .find({ isActive: true, userId })
      .populate('groups', 'name participants isActive')
      .exec();
  }

  async findByName(name: string, userId: string) {
    return this.campaignModel
      .find({ 
        name: { $regex: name, $options: 'i' },
        userId
      })
      .populate('groups', 'name participants isActive')
      .exec();
  }

  async findOne(id: string, userId: string) {
    const campaign = await this.campaignModel
      .findOne({ _id: id, userId })
      .populate('groups', 'name participants isActive')
      .exec();

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    return campaign;
  }

  async findOnePublic(id: string) {
    // Busca sem filtrar por userId, pois é público
    // Retorna apenas dados seguros
    const campaign = await this.campaignModel
      .findOne({ _id: id })
      .select('name description isActive startDate endDate hasStarted')
      .exec();

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto, userId: string) {
    const updatedCampaign = await this.campaignModel
      .findOneAndUpdate({ _id: id, userId }, updateCampaignDto, { new: true })
      .populate('groups', 'name participants isActive')
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    return updatedCampaign;
  }

  async activate(id: string, userId: string) {
    const campaign = await this.campaignModel.findOneAndUpdate(
      { _id: id, userId },
      { isActive: true },
      { new: true }
    ).exec();

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    return campaign;
  }

  async deactivate(id: string, userId: string) {
    const campaign = await this.campaignModel.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    ).exec();

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    return campaign;
  }

  async markAsStarted(id: string, userId: string) {
    const campaign = await this.campaignModel.findOneAndUpdate(
      { _id: id, userId },
      { hasStarted: true },
      { new: true }
    ).exec();

    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    return campaign;
  }

  async remove(id: string, userId: string) {
    const deletedCampaign = await this.campaignModel.findOneAndDelete({ _id: id, userId }).exec();

    if (!deletedCampaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }

    return deletedCampaign;
  }

  async getDashboardStats(userId: string) {
    // Buscar todas as campanhas do usuário
    const campaigns = await this.campaignModel.find({ userId }).populate('groups').exec();
    const activeCampaigns = campaigns.filter(c => c.isActive);

    // Buscar todas as questões (interações) deste usuário (via campanhas)
    const questionModel = this.campaignModel.db.model('Question');
    // Como Question tem userId agora, podemos filtrar direto
    const allQuestions = await questionModel.find({ userId }).exec();
    
    // Calcular métricas
    const totalCampaigns = campaigns.length;
    const totalActiveCampaigns = activeCampaigns.length;
    
    // Total de alunos (participantes únicos em grupos de campanhas ativas)
    let totalStudents = 0;
    const uniqueStudents = new Set<string>();
    
    // Coletar todos os IDs de grupos das campanhas ativas
    const allGroupIds: any[] = [];
    activeCampaigns.forEach(campaign => {
      if (campaign.groups && Array.isArray(campaign.groups)) {
        campaign.groups.forEach((group: any) => {
          // Se for objeto populado, pega o _id, se for string/ObjectId, usa direto
          const groupId = group._id || group;
          if (groupId) allGroupIds.push(groupId);
        });
      }
    });

    if (allGroupIds.length > 0) {
      // Buscar os grupos reais no banco para garantir acesso aos participantes
      const groupModel = this.campaignModel.db.model('Group');
      // Garantir que os grupos também pertencem ao usuário (embora se estão na campanha dele, deveriam ser)
      const groups = await groupModel.find({ _id: { $in: allGroupIds }, userId }).exec();
      
      groups.forEach(group => {
        if (group.participants && Array.isArray(group.participants)) {
          group.participants.forEach((p: string) => uniqueStudents.add(p));
        }
      });
    }

    totalStudents = uniqueStudents.size;

    // Métricas de interação
    const totalSent = allQuestions.length;
    const answeredQuestions = allQuestions.filter(q => q.answeredAt != null);
    const totalInteractions = answeredQuestions.length;
    
    // Taxa de resposta global
    const responseRate = totalSent > 0 
      ? Math.round((totalInteractions / totalSent) * 100) 
      : 0;

    // Nota média global
    const validScores = answeredQuestions
      .map(q => parseFloat(q.nota))
      .filter(s => !isNaN(s));
      
    const averageScore = validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : 0;

    return {
      totalCampaigns,
      activeCampaigns: totalActiveCampaigns,
      totalStudents,
      totalInteractions,
      responseRate,
      averageScore
    };
  }

  async getDashboardChartData(campaignId: string | undefined, userId: string) {
    // Buscar todas as campanhas ou apenas a selecionada, filtrando pelo usuário
    const query: any = { userId };
    if (campaignId) {
      query._id = campaignId;
    }
    const campaigns = await this.campaignModel.find(query).exec();
    
    // Buscar todas as questões do usuário
    const questionModel = this.campaignModel.db.model('Question');
    const allQuestions = await questionModel.find({ userId }).exec();

    const chartData = campaigns.map(campaign => {
      // Questões desta campanha (considerando referências de string e ObjectId)
      const campaignQuestions = allQuestions.filter(q => 
        q.campaign == campaign._id.toString() || 
        (q.campaign && q.campaign._id && q.campaign._id.toString() == campaign._id.toString())
      );

      const sent = campaignQuestions.length;
      const answered = campaignQuestions.filter(q => q.answeredAt != null);
      const answeredCount = answered.length;
      
      // Notas acima de 6 (considerando que nota pode ser string "8.5")
      const goodPerformanceCount = answered.filter(q => {
        const score = parseFloat(q.nota);
        return !isNaN(score) && score > 6;
      }).length;

      return {
        campaignId: campaign._id,
        campaignName: campaign.name,
        sent: sent,
        answered: answeredCount,
        goodPerformance: goodPerformanceCount
      };
    });

    // Se não tiver filtro, ordena por volume de envio e pega top 5 para não poluir o gráfico
    if (!campaignId) {
      return chartData.sort((a, b) => b.sent - a.sent).slice(0, 5);
    }

    return chartData;
  }

  async addGroups(campaignId: string, groupIds: string[], userId: string) {
    // Validar se o campaignId é válido
    if (!Types.ObjectId.isValid(campaignId)) {
      throw new BadRequestException('ID de campanha inválido');
    }

    // Validar se todos os groupIds são válidos
    const invalidGroupIds = groupIds.filter(id => !Types.ObjectId.isValid(id));
    if (invalidGroupIds.length > 0) {
      throw new BadRequestException(`IDs de grupo inválidos: ${invalidGroupIds.join(', ')}`);
    }

    // Garantir que os grupos pertencem ao usuário (opcional, mas recomendado)
    // Para simplificar, vamos assumir que o usuário só tem IDs de grupos dele,
    // mas em produção deveríamos validar se Group.count({ _id: { $in: groupIds }, userId }) === groupIds.length

    const updatedCampaign = await this.campaignModel
      .findOneAndUpdate(
        { _id: campaignId, userId },
        { $addToSet: { groups: { $each: groupIds } } },
        { new: true }
      )
      .populate('groups', 'name participants isActive')
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }

    return updatedCampaign;
  }

  async removeGroups(campaignId: string, groupIds: string[], userId: string) {
    // Validar se o campaignId é válido
    if (!Types.ObjectId.isValid(campaignId)) {
      throw new BadRequestException('ID de campanha inválido');
    }

    // Validar se todos os groupIds são válidos
    const invalidGroupIds = groupIds.filter(id => !Types.ObjectId.isValid(id));
    if (invalidGroupIds.length > 0) {
      throw new BadRequestException(`IDs de grupo inválidos: ${invalidGroupIds.join(', ')}`);
    }

    const updatedCampaign = await this.campaignModel
      .findOneAndUpdate(
        { _id: campaignId, userId },
        { $pullAll: { groups: groupIds } },
        { new: true }
      )
      .populate('groups', 'name participants isActive')
      .exec();

    if (!updatedCampaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }

    return updatedCampaign;
  }
  
  async getCampaignAnalytics(campaignId: string, filters: AnalyticsFiltersDto = {}, userId: string): Promise<CampaignAnalyticsResponseDto> {
    const campaign = await this.findOne(campaignId, userId);
    
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }

    // Buscar TODAS as instâncias de questões (enviadas para os estudantes)
    const questionModel = this.campaignModel.db.model('Question');
    
    const questionQuery: any = {
      $or: [
        { campaign: campaignId },              // Se campaign é string
        { 'campaign._id': campaignId },        // Se campaign é objeto populado
        { campaign: Types.ObjectId.createFromHexString(campaignId) } // Se campaign é ObjectId
      ],
      userId // Filtrar por usuário
    };

    // Aplicar filtros de data se fornecidos
    if (filters.startDate || filters.endDate) {
      questionQuery.createdAt = {};
      if (filters.startDate) {
        questionQuery.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        questionQuery.createdAt.$lte = new Date(filters.endDate);
      }
    } else if (filters.period) {
      // Aplicar período predefinido - incluindo registros futuros próximos
      const now = new Date();
      let daysBack = 30;
      let daysForward = 1; // Incluir 1 dia no futuro para casos de fuso horário
      
      if (filters.period === '7d') {
        daysBack = 7;
        daysForward = 1;
      } else if (filters.period === '15d') {
        daysBack = 15;
        daysForward = 1;
      }
      
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + daysForward * 24 * 60 * 60 * 1000);
      questionQuery.createdAt = { 
        $gte: startDate,
        $lte: endDate
      };
    }

    // Todas as instâncias enviadas (respondidas ou não)
    const allQuestionInstances = await questionModel.find(questionQuery).exec();
    
    // Filtrar apenas as que foram efetivamente respondidas
    const answeredQuestions = allQuestionInstances.filter(q => q.answeredAt != null);
    
    // Dados básicos da campanha (collection campaigns)
    const campaignQuestions = campaign.questions || [];
    const totalCampaignQuestions = campaignQuestions.length; // Templates de questões
    const activeCampaignQuestions = campaignQuestions.filter(q => q.isActive).length;
    const groupsCount = campaign.groups?.length || 0;
    
    // Buscar dados detalhados dos grupos
    let totalGroupParticipants = 0;
    let groupsDetails = [];
    if (campaign.groups && campaign.groups.length > 0) {
      const groupModel = this.campaignModel.db.model('Group');
      const groups = await groupModel.find({ _id: { $in: campaign.groups } }).exec();
      totalGroupParticipants = groups.reduce((sum, group) => sum + (group.participants?.length || 0), 0);
      groupsDetails = groups.map(g => ({
        id: g._id,
        name: g.name,
        participants: g.participants?.length || 0
      }));
    }
    
    // Métricas Principais
    const totalSentQuestions = allQuestionInstances.length; // Total enviado
    const totalAnsweredQuestions = answeredQuestions.length; // Total respondido
    
    // Alunos Únicos (baseado nas questões enviadas - quem recebeu algo)
    const uniqueStudentsReceived = [...new Set(allQuestionInstances.map(q => q.phoneNumber))];
    // Alunos Únicos Ativos (quem respondeu algo)
    const uniqueStudentsAnswered = [...new Set(answeredQuestions.map(q => q.phoneNumber))];
    
    const totalStudents = uniqueStudentsAnswered.length; // Consideramos participantes quem respondeu
    
    // Calcular notas médias (converter string para número e depois para porcentagem)
    const validScores = answeredQuestions
      .map(q => parseFloat(q.nota))
      .filter(score => !isNaN(score));
    const averageScore = validScores.length > 0 
      ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 10 // Converter nota 0-10 para porcentagem 0-100
      : 0;

    // Taxa de Resposta (Engajamento Real): Respondidas / Enviadas
    // Se não enviou nada, é 0.
    const completionRate = totalSentQuestions > 0 ? (totalAnsweredQuestions / totalSentQuestions) * 100 : 0;
    
    // Taxa de Participação (Adesão): Alunos que responderam / Total de participantes nos grupos
    const participationRate = totalGroupParticipants > 0 ? (totalStudents / totalGroupParticipants) * 100 : 0;

    // Calcular tempo médio de resposta (apenas das respondidas)
    const responseTimes = answeredQuestions
      .filter(q => q.answeredAt && q.createdAt)
      .map(q => {
        const created = new Date(q.createdAt).getTime();
        const answered = new Date(q.answeredAt).getTime();
        return (answered - created) / 1000 / 60; // em minutos
      });
    
    const avgResponseTimeMinutes = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    const avgResponseTime = avgResponseTimeMinutes > 60 
      ? `${Math.round(avgResponseTimeMinutes / 60)}h ${Math.round(avgResponseTimeMinutes % 60)}m`
      : `${Math.round(avgResponseTimeMinutes)}min`;

    // Análise detalhada das questões da campanha vs respostas dos estudantes
    const campaignQuestionsAnalysis = campaignQuestions.map(cq => {
      const responses = answeredQuestions.filter(aq => aq.question === cq.question);
      const scores = responses.map(r => parseFloat(r.nota)).filter(s => !isNaN(s));
      const avgScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
      
      // Quantas vezes essa pergunta foi enviada?
      const sentCount = allQuestionInstances.filter(aq => aq.question === cq.question).length;
      
      return {
        questionId: cq._id.toString(),
        text: cq.question,
        category: 'Campanha',
        difficulty: 'medium',
        successRate: avgScore * 10, // Converter para porcentagem
        totalAttempts: responses.length,
        sentCount: sentCount,
        responseRate: sentCount > 0 ? (responses.length / sentCount) * 100 : 0,
        avgTime: '2min', // Poderia refinar isso também se necessário
        responses: responses.length,
        avgScore: avgScore,
        originalQuestion: cq
      };
    });

    // Questões mais difíceis e mais fáceis baseadas nas respostas
    const topDifficult = campaignQuestionsAnalysis
      .filter(q => q.successRate < 50 && q.responses > 0)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 5);
      
    const topEasy = campaignQuestionsAnalysis
      .filter(q => q.successRate >= 80 && q.responses > 0)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    // Análise de estudantes por performance
    const studentStats = uniqueStudentsReceived.map(phoneNumber => {
      // Perguntas enviadas para este aluno
      const sentToStudent = allQuestionInstances.filter(q => q.phoneNumber === phoneNumber);
      // Perguntas respondidas por este aluno
      const answeredByStudent = answeredQuestions.filter(q => q.phoneNumber === phoneNumber);
      
      const studentScores = answeredByStudent
        .map(q => parseFloat(q.nota))
        .filter(score => !isNaN(score));
      
      const avgScore = studentScores.length > 0
        ? studentScores.reduce((sum, score) => sum + score, 0) / studentScores.length
        : 0;
      
      const lastActivity = answeredByStudent.length > 0
        ? Math.max(...answeredByStudent.map(q => new Date(q.answeredAt || q.createdAt).getTime()))
        : (sentToStudent.length > 0 ? Math.max(...sentToStudent.map(q => new Date(q.createdAt).getTime())) : 0);

      return {
        phoneNumber,
        name: sentToStudent[0]?.name || 'Nome não informado',
        avgScore,
        questionsAnswered: answeredByStudent.length,
        questionsSent: sentToStudent.length,
        responseRate: sentToStudent.length > 0 ? (answeredByStudent.length / sentToStudent.length) * 100 : 0,
        lastActivity: new Date(lastActivity)
      };
    });

    // Segmentar estudantes por performance (baseado em notas 0-10)
    const studentSegments = {
      excellent: studentStats.filter(s => s.avgScore >= 9),  // Nota 9-10
      good: studentStats.filter(s => s.avgScore >= 7 && s.avgScore < 9), // Nota 7-8.9
      developing: studentStats.filter(s => s.avgScore >= 5 && s.avgScore < 7), // Nota 5-6.9
      needsHelp: studentStats.filter(s => s.avgScore < 5) // Nota < 5
    };

    return {
      overview: {
        totalStudents,
        activeStudents: totalStudents,
        totalQuestions: totalCampaignQuestions,
        answeredQuestions: totalAnsweredQuestions,
        averageScore: Math.round(averageScore * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        averageResponseTime: avgResponseTime,
        totalGroups: groupsCount,
        participationRate: Math.round(participationRate * 100) / 100,
        totalGroupParticipants
      },
      campaignDetails: {
        name: campaign.name,
        description: campaign.description,
        isActive: campaign.isActive,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        questionsInCampaign: totalCampaignQuestions,
        activeQuestionsInCampaign: activeCampaignQuestions
      },
      trends: {
        participationTrend: [],
        performanceTrend: [],
      },
      questionAnalysis: {
        topDifficult,
        topEasy,
        byCategory: [
          {
            category: 'Questões da Campanha',
            totalQuestions: totalCampaignQuestions,
            avgScore: campaignQuestionsAnalysis.reduce((sum, q) => sum + q.avgScore, 0) / Math.max(campaignQuestionsAnalysis.length, 1) * 10,
            avgTime: '2min',
            completionRate: totalCampaignQuestions > 0 ? (totalAnsweredQuestions / totalCampaignQuestions) * 100 : 0
          }
        ],
        byType: [
          {
            type: 'Questões Respondidas',
            avgScore: averageScore,
            count: totalAnsweredQuestions
          },
          {
            type: 'Questões Disponíveis',
            avgScore: 0,
            count: totalCampaignQuestions
          }
        ],
        campaignQuestions: campaignQuestionsAnalysis
      },
      studentAnalysis: {
        studentSegments: {
          excellent: { 
            count: studentSegments.excellent.length, 
            percentage: Math.round((studentSegments.excellent.length / Math.max(totalStudents, 1)) * 100), 
            criteria: 'Nota 9.0-10.0' 
          },
          good: { 
            count: studentSegments.good.length, 
            percentage: Math.round((studentSegments.good.length / Math.max(totalStudents, 1)) * 100), 
            criteria: 'Nota 7.0-8.9' 
          },
          developing: { 
            count: studentSegments.developing.length, 
            percentage: Math.round((studentSegments.developing.length / Math.max(totalStudents, 1)) * 100), 
            criteria: 'Nota 5.0-6.9' 
          },
          needsHelp: { 
            count: studentSegments.needsHelp.length, 
            percentage: Math.round((studentSegments.needsHelp.length / Math.max(totalStudents, 1)) * 100), 
            criteria: 'Nota < 5.0' 
          },
        },
        topPerformers: studentStats
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 5)
          .map(s => ({
            studentId: s.phoneNumber,
            name: s.name,
            phoneNumber: s.phoneNumber,
            score: Math.round(s.avgScore * 10 * 100) / 100,
            questionsAnswered: s.questionsAnswered,
            lastActivity: s.lastActivity
          })),
        inactive: studentStats
          .filter(s => {
            const daysSinceLastActivity = (new Date().getTime() - s.lastActivity.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceLastActivity > 7;
          })
          .map(s => ({
            studentId: s.phoneNumber,
            name: s.name,
            phoneNumber: s.phoneNumber,
            score: Math.round(s.avgScore * 10 * 100) / 100,
            questionsAnswered: s.questionsAnswered,
            lastActivity: s.lastActivity
          })),
        allStudents: studentStats.map(s => ({
          phoneNumber: s.phoneNumber,
          name: s.name,
          avgScore: s.avgScore,
          questionsAnswered: s.questionsAnswered,
          lastActivity: s.lastActivity
        }))
      },
      temporalAnalysis: {
        hourlyActivity: [],
        weeklyActivity: [],
        responseTimeAnalysis: {
          byCategory: [],
          byDifficulty: [],
        },
      },
      groupComparison: groupsDetails.map(group => {
        // Calcular estatísticas específicas para cada grupo
        // Nota: Precisamos filtrar as questões pelos participantes deste grupo
        // Como não temos os telefones dos participantes aqui facilmente sem mais queries, 
        // vamos assumir que o filtro deve ser implementado posteriormente.
        
        const groupSentQuestions = allQuestionInstances.filter(q => {
          // TODO: Implementar filtro real por telefone dos participantes do grupo
          return true; 
        });
        
        const groupAnsweredQuestions = answeredQuestions.filter(q => {
           // TODO: Implementar filtro real
           return true;
        });
        
        const groupScores = groupAnsweredQuestions
          .map(q => parseFloat(q.nota))
          .filter(score => !isNaN(score));
        
        const avgScore = groupScores.length > 0 
          ? groupScores.reduce((sum, score) => sum + score, 0) / groupScores.length * 10
          : 0;
          
        return {
          groupId: group.id,
          groupName: group.name,
          totalParticipants: group.participants,
          totalResponses: groupAnsweredQuestions.length,
          averageScore: Math.round(avgScore * 100) / 100,
          completionRate: groupSentQuestions.length > 0 ? 
            Math.round((groupAnsweredQuestions.length / groupSentQuestions.length) * 100) : 0, // Taxa de Resposta
          averageResponseTime: avgResponseTime,
          students: groupAnsweredQuestions.length, // Alunos ativos (aproximado)
          activeRate: group.participants > 0 ? 
            Math.round((groupAnsweredQuestions.length / group.participants) * 100) : 0,
          rank: 0
        };
      }),
      groupAnalysis: groupsDetails.map(group => {
        const groupSentQuestions = allQuestionInstances.filter(q => {
          return true; 
        });
        
        const groupAnsweredQuestions = answeredQuestions.filter(q => {
           return true;
        });
        
        const groupScores = groupAnsweredQuestions
          .map(q => parseFloat(q.nota))
          .filter(score => !isNaN(score));
        
        const avgScore = groupScores.length > 0 
          ? groupScores.reduce((sum, score) => sum + score, 0) / groupScores.length * 10
          : 0;
          
        return {
          groupId: group.id,
          groupName: group.name,
          totalParticipants: group.participants,
          totalResponses: groupAnsweredQuestions.length,
          averageScore: Math.round(avgScore * 100) / 100,
          completionRate: groupSentQuestions.length > 0 ? 
            Math.round((groupAnsweredQuestions.length / groupSentQuestions.length) * 100) : 0,
          averageResponseTime: avgResponseTime
        };
      }),
      alerts: [
        // Alerta de performance baixa
        ...(averageScore < 50 ? [{
          id: 'low-performance',
          type: 'warning' as const,
          title: 'Performance Abaixo da Média',
          description: `A nota média geral (${Math.round(averageScore)}%) está abaixo do esperado. Considere revisar o conteúdo.`,
          action: 'Revisar conteúdo da campanha',
          priority: 'high' as const,
          timestamp: new Date()
        }] : []),
        
        // Alerta de muitos estudantes com dificuldade
        ...(studentSegments.needsHelp.length > 0 ? [{
          id: 'students-need-help',
          type: 'error' as const,
          title: 'Estudantes com Dificuldade',
          description: `${studentSegments.needsHelp.length} estudante(s) com notas baixas precisam de atenção especial.`,
          action: 'Revisar estudantes com dificuldade',
          priority: 'high' as const,
          timestamp: new Date()
        }] : []),
        
        // Alerta de baixa participação
        ...(totalStudents === 0 ? [{
          id: 'no-participation',
          type: 'warning' as const,
          title: 'Sem Participação',
          description: 'Esta campanha ainda não possui estudantes participando.',
          action: 'Verificar divulgação da campanha',
          priority: 'medium' as const,
          timestamp: new Date()
        }] : []),
        
        // Alerta de baixa taxa de participação (Adesão)
        ...(participationRate < 50 && totalGroupParticipants > 0 ? [{
          id: 'low-participation-rate',
          type: 'info' as const,
          title: 'Adesão Baixa',
          description: `Apenas ${Math.round(participationRate)}% dos alunos dos grupos interagiram.`,
          action: 'Incentivar mais participação',
          priority: 'medium' as const,
          timestamp: new Date()
        }] : []),

        // Alerta de baixa taxa de resposta (Engajamento)
        ...(completionRate < 50 && totalSentQuestions > 0 ? [{
          id: 'low-response-rate',
          type: 'info' as const,
          title: 'Baixa Taxa de Resposta',
          description: `Apenas ${Math.round(completionRate)}% das questões enviadas foram respondidas.`,
          action: 'Verificar se as questões estão chegando',
          priority: 'high' as const,
          timestamp: new Date()
        }] : [])
      ]
    };
  }

  async getAnalyticsByGroup(filters: AnalyticsFiltersDto = {}, userId: string) {
    const campaigns = await this.campaignModel
      .find({ userId })
      .exec();

    const normalizePhoneNumber = (value: unknown): string => {
      const digitsOnly = String(value ?? '').replace(/\D/g, '');
      if (!digitsOnly) return '';
      if (digitsOnly.startsWith('55') && digitsOnly.length > 11) return digitsOnly.slice(2);
      return digitsOnly;
    };

    const campaignToGroupIds = new Map<string, string[]>();
    const groupInfo = new Map<
      string,
      { id: string; name: string; isActive: boolean; participants: string[]; participantsSetNormalized: Set<string> }
    >();
    const groupCampaigns = new Map<
      string,
      { id: string; name: string; isActive: boolean; startDate?: any; endDate?: any }[]
    >();

    const allGroupIds = new Set<string>();

    for (const campaign of campaigns) {
      const campaignId = campaign._id.toString();
      const groups = Array.isArray(campaign.groups) ? (campaign.groups as any[]).filter(Boolean) : [];

      const groupIds: string[] = [];
      for (const group of groups) {
        const groupId = group?._id?.toString?.() ?? group?.toString?.();
        if (!groupId) continue;

        groupIds.push(groupId);
        allGroupIds.add(groupId);

        const existingCampaigns = groupCampaigns.get(groupId) ?? [];
        if (!existingCampaigns.some((c) => c.id === campaignId)) {
          existingCampaigns.push({
            id: campaignId,
            name: campaign.name,
            isActive: Boolean(campaign.isActive),
            startDate: campaign.startDate,
            endDate: campaign.endDate,
          });
          groupCampaigns.set(groupId, existingCampaigns);
        }
      }

      campaignToGroupIds.set(campaignId, groupIds);
    }

    if (allGroupIds.size > 0) {
      const groupModel = this.campaignModel.db.model('Group');
      const groups = await groupModel
        .find({ _id: { $in: Array.from(allGroupIds) }, userId })
        .select('_id name isActive participants')
        .exec();

      for (const group of groups as any[]) {
        const groupId = group._id.toString();
        const participants: string[] = Array.isArray(group.participants)
          ? group.participants.map((p: unknown) => String(p))
          : [];
        const participantsSetNormalized: Set<string> = new Set(
          participants
            .map((p) => normalizePhoneNumber(p))
            .filter((p): p is string => Boolean(p)),
        );

        groupInfo.set(groupId, {
          id: groupId,
          name: group.name ?? 'Sem nome',
          isActive: group.isActive ?? true,
          participants,
          participantsSetNormalized,
        });
      }
    }

    const campaignIds = Array.from(campaignToGroupIds.keys());
    if (campaignIds.length === 0) return [];

    const campaignObjectIds = campaignIds.map((id) => Types.ObjectId.createFromHexString(id));
    const questionQuery: any = {
      $or: [
        { campaign: { $in: campaignIds } },
        { 'campaign._id': { $in: campaignIds } },
        { campaign: { $in: campaignObjectIds } },
      ],
      userId,
    };

    if (filters.startDate || filters.endDate) {
      questionQuery.createdAt = {};
      if (filters.startDate) {
        questionQuery.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        questionQuery.createdAt.$lte = new Date(filters.endDate);
      }
    } else if (filters.period) {
      const now = new Date();
      let daysBack = 30;
      let daysForward = 1;

      if (filters.period === '7d') {
        daysBack = 7;
        daysForward = 1;
      } else if (filters.period === '15d') {
        daysBack = 15;
        daysForward = 1;
      }

      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + daysForward * 24 * 60 * 60 * 1000);
      questionQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const questionModel = this.campaignModel.db.model('Question');
    const allQuestionInstances = await questionModel.find(questionQuery).exec();

    type Accumulator = {
      sent: number;
      answered: number;
      studentsReceived: Set<string>;
      studentsAnswered: Set<string>;
      scoreSum: number;
      scoreCount: number;
      responseTimeSumMinutes: number;
      responseTimeCount: number;
    };

    const createAccumulator = (): Accumulator => ({
      sent: 0,
      answered: 0,
      studentsReceived: new Set<string>(),
      studentsAnswered: new Set<string>(),
      scoreSum: 0,
      scoreCount: 0,
      responseTimeSumMinutes: 0,
      responseTimeCount: 0,
    });

    const groupTotals = new Map<string, Accumulator>();
    const groupCampaignTotals = new Map<string, Map<string, Accumulator>>();

    const getOrCreateGroupTotal = (groupId: string) => {
      const existing = groupTotals.get(groupId);
      if (existing) return existing;
      const created = createAccumulator();
      groupTotals.set(groupId, created);
      return created;
    };

    const getOrCreateGroupCampaignTotal = (groupId: string, campaignId: string) => {
      const byCampaign = groupCampaignTotals.get(groupId) ?? new Map<string, Accumulator>();
      const existing = byCampaign.get(campaignId);
      if (existing) return existing;
      const created = createAccumulator();
      byCampaign.set(campaignId, created);
      groupCampaignTotals.set(groupId, byCampaign);
      return created;
    };

    for (const q of allQuestionInstances as any[]) {
      const campaignId =
        (typeof q.campaign === 'object' && q.campaign?._id ? q.campaign._id.toString() : q.campaign?.toString?.()) ??
        null;
      if (!campaignId) continue;

      const groupIds = campaignToGroupIds.get(campaignId);
      if (!groupIds || groupIds.length === 0) continue;

      const phoneNumber = q.phoneNumber;
      const phoneNumberNormalized = normalizePhoneNumber(phoneNumber);
      if (!phoneNumberNormalized) continue;

      for (const groupId of groupIds) {
        const group = groupInfo.get(groupId);
        if (!group) continue;
        if (!group.participantsSetNormalized.has(phoneNumberNormalized)) continue;

        const total = getOrCreateGroupTotal(groupId);
        const perCampaign = getOrCreateGroupCampaignTotal(groupId, campaignId);

        total.sent += 1;
        perCampaign.sent += 1;
        total.studentsReceived.add(phoneNumberNormalized);
        perCampaign.studentsReceived.add(phoneNumberNormalized);

        if (q.answeredAt != null) {
          total.answered += 1;
          perCampaign.answered += 1;
          total.studentsAnswered.add(phoneNumberNormalized);
          perCampaign.studentsAnswered.add(phoneNumberNormalized);

          const score = parseFloat(q.nota);
          if (!Number.isNaN(score)) {
            total.scoreSum += score;
            total.scoreCount += 1;
            perCampaign.scoreSum += score;
            perCampaign.scoreCount += 1;
          }

          if (q.createdAt && q.answeredAt) {
            const created = new Date(q.createdAt).getTime();
            const answered = new Date(q.answeredAt).getTime();
            const diffMinutes = (answered - created) / 1000 / 60;
            if (!Number.isNaN(diffMinutes) && Number.isFinite(diffMinutes)) {
              total.responseTimeSumMinutes += diffMinutes;
              total.responseTimeCount += 1;
              perCampaign.responseTimeSumMinutes += diffMinutes;
              perCampaign.responseTimeCount += 1;
            }
          }
        }
      }
    }

    const round2 = (value: number) => Math.round(value * 100) / 100;
    const formatAverageResponseTime = (avgResponseTimeMinutes: number) =>
      avgResponseTimeMinutes > 60
        ? `${Math.round(avgResponseTimeMinutes / 60)}h ${Math.round(avgResponseTimeMinutes % 60)}m`
        : `${Math.round(avgResponseTimeMinutes)}min`;

    const toOverview = (acc: Accumulator, totalGroupParticipants: number) => {
      const completionRate = acc.sent > 0 ? (acc.answered / acc.sent) * 100 : 0;
      const participationRate =
        totalGroupParticipants > 0 ? (acc.studentsAnswered.size / totalGroupParticipants) * 100 : 0;
      const averageScore = acc.scoreCount > 0 ? (acc.scoreSum / acc.scoreCount) * 10 : 0;
      const avgResponseTimeMinutes = acc.responseTimeCount > 0 ? acc.responseTimeSumMinutes / acc.responseTimeCount : 0;

      return {
        totalStudents: acc.studentsAnswered.size,
        totalStudentsReceived: acc.studentsReceived.size,
        sentQuestions: acc.sent,
        answeredQuestions: acc.answered,
        completionRate: round2(completionRate),
        averageScore: round2(averageScore),
        averageResponseTime: formatAverageResponseTime(avgResponseTimeMinutes),
        participationRate: round2(participationRate),
        totalGroupParticipants,
      };
    };

    return Array.from(groupInfo.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((group) => {
        const totalGroupParticipants = group.participants.length;
        const totalAcc = groupTotals.get(group.id) ?? createAccumulator();

        const campaignsForGroup = (groupCampaigns.get(group.id) ?? [])
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((campaign) => {
            const acc =
              groupCampaignTotals.get(group.id)?.get(campaign.id) ??
              createAccumulator();

            return {
              ...campaign,
              overview: toOverview(acc, totalGroupParticipants),
            };
          });

        return {
          group: {
            id: group.id,
            name: group.name,
            isActive: group.isActive,
            totalParticipants: totalGroupParticipants,
          },
          overview: toOverview(totalAcc, totalGroupParticipants),
          campaigns: campaignsForGroup,
        };
      });
  }

  // Método temporário simplificado para debug
  async testQuestionQuery(campaignId: string, userId: string) {
    try {
      const campaign = await this.campaignModel.findOne({ _id: campaignId, userId }).exec();
      
      if (!campaign) {
        return { error: 'Campanha não encontrada' };
      }
      
      return {
        campaignId,
        questionsCount: campaign.questions?.length || 0,
        questions: campaign.questions || []
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async getStudentCampaignDetails(campaignId: string, phoneNumber: string, userId: string) {
    const campaign = await this.findOne(campaignId, userId);
    
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }

    const questionModel = this.campaignModel.db.model('Question');
    
    // Buscar todas as questões dessa campanha para este aluno
    const questionQuery: any = {
      $or: [
        { campaign: campaignId },
        { 'campaign._id': campaignId },
        { campaign: Types.ObjectId.createFromHexString(campaignId) }
      ],
      phoneNumber: phoneNumber,
      userId // Filtrar por usuário
    };

    const interactions = await questionModel.find(questionQuery)
      .sort({ createdAt: -1 }) // Mais recentes primeiro
      .exec();

    // Calcular estatísticas básicas
    const answered = interactions.filter(i => i.answeredAt != null);
    const scores = answered.map(i => parseFloat(i.nota)).filter(s => !isNaN(s));
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      student: {
        phoneNumber,
        name: interactions[0]?.name || 'Nome não informado',
        totalSent: interactions.length,
        totalAnswered: answered.length,
        averageScore: avgScore
      },
      history: interactions.map(interaction => ({
        id: interaction._id,
        question: interaction.question,
        correctAnswer: interaction.answer, // Gabarito (antes 'answer')
        studentAnswer: interaction['retornoAluno'] || interaction.studentResponse || interaction['response'], // Tenta pegar de retornoAluno, studentResponse ou response
        score: interaction.nota,
        sentAt: interaction.createdAt,
        answeredAt: interaction.answeredAt,
        status: interaction.answeredAt ? 'answered' : 'pending',
        feedback: interaction.feedback,
        urlAudioAluno: interaction.urlAudioAluno // Incluindo a URL do áudio
      }))
    };
  }

  // =============== MÉTODOS PARA GERENCIAR QUESTÕES ===============

  async getCampaignQuestions(campaignId: string, filters: any = {}, userId: string) {
    // Verificar se a campanha existe e buscar questões
    const campaign = await this.campaignModel.findOne({ _id: campaignId, userId }).exec();
    
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }

    let questions = campaign.questions || [];

    // Aplicar filtros se fornecidos
    if (filters?.isActive !== undefined) {
      questions = questions.filter(q => q.isActive === (filters.isActive === 'true'));
    }

    // Ordenar por data de criação (mais recentes primeiro)
    questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return questions;
  }

  async createCampaignQuestion(campaignId: string, createQuestionDto: CreateQuestionForCampaignDto, userId: string) {
    // Verificar se a campanha existe
    const campaign = await this.campaignModel.findOne({ _id: campaignId, userId }).exec();
    
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }
    
    // Criar nova questão
    const newQuestion = {
      _id: new Types.ObjectId(),
      question: createQuestionDto.question,
      answer: createQuestionDto.answer,
      responseMode: createQuestionDto.responseMode ?? 'audio',
      options: this.normalizeOptions(createQuestionDto.options),
      explanation: createQuestionDto.explanation,
      isActive: createQuestionDto.isActive ?? true,
      createdAt: new Date()
    };
    this.validateCampaignQuestion(newQuestion);
    
    // Adicionar questão ao array da campanha
    campaign.questions.push(newQuestion);
    console.log('newQuestion atualizada:', newQuestion);
    
    // Salvar campanha com nova questão
    await campaign.save();
    
    return newQuestion;
  }

  async updateCampaignQuestion(campaignId: string, questionId: string, updateQuestionDto: UpdateQuestionForCampaignDto, userId: string) {
    // Verificar se a campanha existe
    const campaign = await this.campaignModel.findOne({ _id: campaignId, userId }).exec();
    
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }
    
    // Encontrar questão no array
    const questionIndex = campaign.questions.findIndex(q => q._id.toString() === questionId);
    
    if (questionIndex === -1) {
      throw new NotFoundException(`Questão com ID ${questionId} não encontrada nesta campanha`);
    }
    
    // Atualizar questão
    const question = campaign.questions[questionIndex];
    Object.assign(question, updateQuestionDto);
    if ((updateQuestionDto as any).options !== undefined) {
      (question as any).options = this.normalizeOptions((updateQuestionDto as any).options);
    }
    if (!(question as any).responseMode) {
      (question as any).responseMode = 'audio';
    }
    if (!(question as any).options) {
      (question as any).options = [];
    }
    this.validateCampaignQuestion(question as any);
    
    // Salvar campanha
    await campaign.save();
    
    return question;
  }

  async deleteCampaignQuestion(campaignId: string, questionId: string, userId: string) {
    // Verificar se a campanha existe
    const campaign = await this.campaignModel.findOne({ _id: campaignId, userId }).exec();
    
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${campaignId} não encontrada`);
    }
    
    // Encontrar questão no array
    const questionIndex = campaign.questions.findIndex(q => q._id.toString() === questionId);
    
    if (questionIndex === -1) {
      throw new NotFoundException(`Questão com ID ${questionId} não encontrada nesta campanha`);
    }
    
    // Remover questão do array
    campaign.questions.splice(questionIndex, 1);
    
    // Salvar campanha
    await campaign.save();
    
    return { message: 'Questão deletada com sucesso' };
  }

  private normalizeOptions(options: unknown): string[] {
    if (Array.isArray(options)) {
      return options.map((v) => String(v ?? '').trim()).filter(Boolean);
    }
    if (typeof options === 'string') {
      const raw = options.trim();
      if (!raw) return [];
      if (raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((v) => String(v ?? '').trim()).filter(Boolean);
          }
        } catch {
          return [];
        }
      }
      return [raw];
    }
    return [];
  }

  private validateCampaignQuestion(question: {
    responseMode?: 'audio' | 'buttons' | string;
    options?: string[];
    answer?: string;
  }) {
    const mode = question.responseMode ?? 'audio';
    if (mode !== 'audio' && mode !== 'buttons') {
      throw new BadRequestException('Modo de resposta inválido');
    }

    if (mode === 'buttons') {
      const options = Array.isArray(question.options) ? question.options : [];
      if (options.length < 2) {
        throw new BadRequestException('Opções deve ter pelo menos 2 itens');
      }
      if (options.length > 10) {
        throw new BadRequestException('Opções deve ter no máximo 10 itens');
      }
      const answer = typeof question.answer === 'string' ? question.answer.trim() : '';
      if (!answer) {
        throw new BadRequestException('Resposta é obrigatória');
      }
      if (!options.includes(answer)) {
        throw new BadRequestException('Resposta deve ser uma das opções');
      }
    }
  }
}
