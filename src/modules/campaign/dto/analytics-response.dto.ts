export interface CampaignOverviewDto {
  totalStudents: number;
  activeStudents: number;
  totalQuestions: number;
  answeredQuestions: number;
  averageScore: number;
  completionRate: number;
  averageResponseTime: string;
  totalGroups: number;
  participationRate?: number;
  totalGroupParticipants?: number;
}

export interface TrendDataDto {
  date: string;
  students: number;
  questions: number;
  performance?: number;
}

export interface QuestionAnalysisDto {
  questionId: string;
  text: string;
  category: string;
  difficulty: string;
  successRate: number;
  totalAttempts: number;
  avgTime: string;
}

export interface CategoryAnalysisDto {
  category: string;
  totalQuestions: number;
  avgScore: number;
  avgTime: string;
  completionRate: number;
}

export interface StudentSegmentDto {
  count: number;
  percentage: number;
  criteria: string;
  students?: string[];
}

export interface StudentPerformerDto {
  studentId: string;
  name: string;
  phoneNumber: string;
  score: number;
  questionsAnswered: number;
  lastActivity: Date;
}

export interface GroupComparisonDto {
  groupId: string;
  groupName: string;
  totalParticipants: number;
  totalResponses: number;
  averageScore: number;
  completionRate: number;
  averageResponseTime: string;
  students: number;
  activeRate: number;
  rank: number;
}

export interface GroupAnalysisDto {
  groupId: string;
  groupName: string;
  totalParticipants: number;
  totalResponses: number;
  averageScore: number;
  completionRate: number;
  averageResponseTime: string;
}

export interface ActivityAnalysisDto {
  hour: number;
  day?: string;
  activityCount: number;
  avgPerformance?: number;
  completion?: number;
}

export interface AlertDto {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface CampaignAnalyticsResponseDto {
  overview: CampaignOverviewDto;
  campaignDetails?: {
    name: string;
    description?: string;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    questionsInCampaign: number;
    activeQuestionsInCampaign: number;
  };
  trends: {
    participationTrend: TrendDataDto[];
    performanceTrend: TrendDataDto[];
  };
  questionAnalysis: {
    topDifficult: QuestionAnalysisDto[];
    topEasy: QuestionAnalysisDto[];
    byCategory: CategoryAnalysisDto[];
    byType: Array<{ type: string; avgScore: number; count: number; }>;
    campaignQuestions?: Array<{
      questionId: string;
      text: string;
      category: string;
      difficulty: string;
      successRate: number;
      totalAttempts: number;
      avgTime: string;
      responses: number;
      avgScore: number;
    }>;
  };
  studentAnalysis: {
    studentSegments: {
      excellent: StudentSegmentDto;
      good: StudentSegmentDto;
      developing: StudentSegmentDto;
      needsHelp: StudentSegmentDto;
    };
    topPerformers: StudentPerformerDto[];
    inactive: StudentPerformerDto[];
    allStudents?: Array<{
      phoneNumber: string;
      name: string;
      avgScore: number;
      questionsAnswered: number;
      lastActivity: Date;
    }>;
  };
  temporalAnalysis: {
    hourlyActivity: ActivityAnalysisDto[];
    weeklyActivity: ActivityAnalysisDto[];
    responseTimeAnalysis: {
      byCategory: Array<{ category: string; avgTime: number; }>;
      byDifficulty: Array<{ difficulty: string; avgTime: number; }>;
    };
  };
  groupComparison: GroupComparisonDto[];
  groupAnalysis?: GroupAnalysisDto[];
  alerts: AlertDto[];
}