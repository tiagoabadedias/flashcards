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
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCampaignDto: CreateCampaignDto, @Req() req) {
    return this.campaignService.create(createCampaignDto, req.user.userId);
  }

  @Get('dashboard/stats')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getDashboardStats(@Req() req) {
    return this.campaignService.getDashboardStats(req.user.userId);
  }

  @Get('dashboard/chart-data')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getDashboardChartData(@Query('campaignId') campaignId: string | undefined, @Req() req) {
    return this.campaignService.getDashboardChartData(campaignId, req.user.userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query('name') name: string | undefined, @Query('active') active: string | undefined, @Req() req) {
    if (name) {
      return await this.campaignService.findByName(name, req.user.userId);
    }
    
    if (active === 'true') {
      return await this.campaignService.findActive(req.user.userId);
    }
    
    return await this.campaignService.findAll(req.user.userId);
  }

  @Get('analytics/by-group')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getAnalyticsByGroup(@Query() filters: AnalyticsFiltersDto, @Req() req) {
    return this.campaignService.getAnalyticsByGroup(filters, req.user.userId);
  }

  // Rota PÚBLICA para QR Code - deve vir antes de :id para evitar conflito se fosse o caso, 
  // mas como tem /public no final, o nest resolve bem.
  // Na verdade, :id captura tudo, então :id/public seria capturado por :id se não tomar cuidado?
  // O NestJS resolve rotas mais específicas primeiro se forem estáticas, mas aqui temos parametro.
  // @Get(':id') pega tudo. @Get(':id/public') é ambíguo se definido depois?
  // Não, rotas com parametros são "gulosas". 
  // Melhor definir :id/public ANTES de :id se possível, ou usar uma rota diferente como public/:id
  // Vamos usar 'public/:id' para garantir segurança e clareza.
  
  @Get('public/:id')
  findPublic(@Param('id') id: string) {
    return this.campaignService.findOnePublic(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string, @Req() req) {
    return this.campaignService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto, @Req() req) {
    return this.campaignService.update(id, updateCampaignDto, req.user.userId);
  }

  @Post(':id/groups')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  addGroups(@Param('id') id: string, @Body() body: { groupIds: string[] }, @Req() req) {
    return this.campaignService.addGroups(id, body.groupIds, req.user.userId);
  }

  @Delete(':id/groups')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  removeGroups(@Param('id') id: string, @Body() body: { groupIds: string[] }, @Req() req) {
    return this.campaignService.removeGroups(id, body.groupIds, req.user.userId);
  }

  @Patch(':id/activate')
  @UseGuards(AuthGuard('jwt'))
  activate(@Param('id') id: string, @Req() req) {
    return this.campaignService.activate(id, req.user.userId);
  }

  @Patch(':id/deactivate')
  @UseGuards(AuthGuard('jwt'))
  deactivate(@Param('id') id: string, @Req() req) {
    return this.campaignService.deactivate(id, req.user.userId);
  }

  @Patch(':id/start')
  @UseGuards(AuthGuard('jwt'))
  markAsStarted(@Param('id') id: string, @Req() req) {
    return this.campaignService.markAsStarted(id, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req) {
    return this.campaignService.remove(id, req.user.userId);
  }

  // =============== ENDPOINTS ANALÍTICOS ===============
  
  @Get(':id/analytics')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getCampaignAnalytics(
    @Param('id') id: string,
    @Query() filters: AnalyticsFiltersDto,
    @Req() req
  ) {
    return this.campaignService.getCampaignAnalytics(id, filters, req.user.userId);
  }

  @Get(':id/students/:phoneNumber/details')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async testQuery(@Param('id') id: string, @Req() req) {
    return this.campaignService.testQuestionQuery(id, req.user.userId);
  }

  // =============== ENDPOINTS DE QUESTÕES ===============

  @Get(':id/questions')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getCampaignQuestions(@Param('id') id: string, @Req() req, @Query() filters?: any) {
    return this.campaignService.getCampaignQuestions(id, filters, req.user.userId);
  }

  @Post(':id/questions')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  createCampaignQuestion(
    @Param('id') id: string,
    @Body() createQuestionDto: CreateQuestionForCampaignDto,
    @Req() req
  ) {
    return this.campaignService.createCampaignQuestion(id, createQuestionDto, req.user.userId);
  }

  @Patch(':id/questions/:questionId')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCampaignQuestion(
    @Param('id') campaignId: string,
    @Param('questionId') questionId: string,
    @Req() req
  ) {
    return this.campaignService.deleteCampaignQuestion(campaignId, questionId, req.user.userId);
  }
}
