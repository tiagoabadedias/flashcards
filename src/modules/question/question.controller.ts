import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuestionService } from './question.service';
import { QueryQuestionDto } from './dto/query-question.dto';
import { TestQueryDto } from './dto/test-query.dto';

@Controller('questions')
@UseGuards(AuthGuard('jwt'))
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('stats')
  getStats(@Req() req) {
    return this.questionService.getStats(req.user.userId);
  }

  @Get('categories')
  getCategories(@Req() req) {
    return this.questionService.getCategories(req.user.userId);
  }

  @Get('tags')
  getTags(@Req() req) {
    return this.questionService.getTags(req.user.userId);
  }

  @Get('student-stats')
  getStudentStats(@Req() req) {
    return this.questionService.getStudentStats(req.user.userId);
  }

  @Get('students')
  getStudentsList(@Req() req) {
    return this.questionService.getStudentsList(req.user.userId);
  }

  @Get('grouped-by-campaign')
  findGroupedByCampaign(@Req() req) {
    return this.questionService.findGroupedByCampaign(req.user.userId);
  }

  @Get('random')
  findRandom(@Query('limit') limit: string | undefined, @Req() req) {
    const limitNumber = limit ? parseInt(limit) : 10;
    return this.questionService.findRandom(limitNumber, req.user.userId);
  }

  @Get('campaign/:campaignId')
  findByCampaign(@Param('campaignId') campaignId: string, @Req() req) {
    return this.questionService.findByCampaign(campaignId, req.user.userId);
  }

  @Get('test')
  testFind(@Query('campaignId') campaignId: string | undefined, @Query('limit') limit: string | undefined) {
    console.log('Test - campaignId:', campaignId, 'limit:', limit);
    return { message: 'Test successful', campaignId, limit };
  }

  @Get()
  findAll(@Query() queryDto: QueryQuestionDto, @Req() req) {
    console.log('Query DTO received:', queryDto);
    return this.questionService.findAll(queryDto, req.user.userId);
  }

  @Post()
  create(@Body() createQuestionDto: any, @Req() req) {
    return this.questionService.create(createQuestionDto, req.user.userId);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string, @Req() req) {
    return this.questionService.findByCategory(category, req.user.userId);
  }

  @Get('difficulty/:difficulty')
  findByDifficulty(@Param('difficulty') difficulty: string, @Req() req) {
    return this.questionService.findByDifficulty(difficulty, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.questionService.findOne(id, req.user.userId);
  }
}