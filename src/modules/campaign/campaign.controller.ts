import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';
import { CreateQuestionForCampaignDto } from './dto/create-question-for-campaign.dto';
import { UpdateQuestionForCampaignDto } from './dto/update-question-for-campaign.dto';

@Controller('campaigns')
@UseGuards(AuthGuard('jwt'))
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCampaignDto: CreateCampaignDto, @Req() req) {
    return this.campaignService.create(createCampaignDto, req.user.userId);
  }

  @Get('dashboard/stats')
  @HttpCode(HttpStatus.OK)
  getDashboardStats(@Req() req) {
    return this.campaignService.getDashboardStats(req.user.userId);
  }

  @Get('dashboard/chart-data')
  @HttpCode(HttpStatus.OK)
  getDashboardChartData(@Query('campaignId') campaignId: string | undefined, @Req() req) {
    return this.campaignService.getDashboardChartData(campaignId, req.user.userId);
  }

  @Get()
  async findAll(@Query('name') name: string | undefined, @Query('active') active: string | undefined, @Req() req) {
    if (name) {
      return await this.campaignService.findByName(name, req.user.userId);
    }
    
    if (active === 'true') {
      return await this.campaignService.findActive(req.user.userId);
    }
    
    return await this.campaignService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.campaignService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto, @Req() req) {
    return this.campaignService.update(id, updateCampaignDto, req.user.userId);
  }

  @Post(':id/groups')
  @HttpCode(HttpStatus.OK)
  addGroups(@Param('id') id: string, @Body() body: { groupIds: string[] }, @Req() req) {
    return this.campaignService.addGroups(id, body.groupIds, req.user.userId);
  }

  @Delete(':id/groups')
  @HttpCode(HttpStatus.OK)
  removeGroups(@Param('id') id: string, @Body() body: { groupIds: string[] }, @Req() req) {
    return this.campaignService.removeGroups(id, body.groupIds, req.user.userId);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string, @Req() req) {
    return this.campaignService.activate(id, req.user.userId);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Req() req) {
    return this.campaignService.deactivate(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req) {
    return this.campaignService.remove(id, req.user.userId);
  }

  // =============== ENDPOINTS ANALÍTICOS ===============
  
  @Get(':id/analytics')
  @HttpCode(HttpStatus.OK)
  getCampaignAnalytics(
    @Param('id') id: string,
    @Query() filters: AnalyticsFiltersDto,
    @Req() req
  ) {
    return this.campaignService.getCampaignAnalytics(id, filters, req.user.userId);
  }

  @Get(':id/students/:phoneNumber/details')
  @HttpCode(HttpStatus.OK)
  getStudentDetails(
    @Param('id') id: string,
    @Param('phoneNumber') phoneNumber: string,
    @Req() req
  ) {
    return this.campaignService.getStudentCampaignDetails(id, phoneNumber, req.user.userId);
  }

  // Endpoint temporário para debug
  @Get(':id/test-query')
  @HttpCode(HttpStatus.OK)
  async testQuery(@Param('id') id: string, @Req() req) {
    return this.campaignService.testQuestionQuery(id, req.user.userId);
  }

  // =============== ENDPOINTS DE QUESTÕES ===============

  @Get(':id/questions')
  @HttpCode(HttpStatus.OK)
  getCampaignQuestions(@Param('id') id: string, @Req() req, @Query() filters?: any) {
    return this.campaignService.getCampaignQuestions(id, filters, req.user.userId);
  }

  @Post(':id/questions')
  @HttpCode(HttpStatus.CREATED)
  createCampaignQuestion(
    @Param('id') id: string,
    @Body() createQuestionDto: CreateQuestionForCampaignDto,
    @Req() req
  ) {
    return this.campaignService.createCampaignQuestion(id, createQuestionDto, req.user.userId);
  }

  @Patch(':id/questions/:questionId')
  @HttpCode(HttpStatus.OK)
  updateCampaignQuestion(
    @Param('id') campaignId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionForCampaignDto,
    @Req() req
  ) {
    return this.campaignService.updateCampaignQuestion(campaignId, questionId, updateQuestionDto, req.user.userId);
  }

  @Delete(':id/questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCampaignQuestion(
    @Param('id') campaignId: string,
    @Param('questionId') questionId: string,
    @Req() req
  ) {
    return this.campaignService.deleteCampaignQuestion(campaignId, questionId, req.user.userId);
  }
}