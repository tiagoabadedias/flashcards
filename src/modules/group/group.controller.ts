import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddParticipantDto } from './dto/add-participant.dto';

@Controller('groups')
@UseGuards(AuthGuard('jwt'))
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Req() req) {
    return this.groupService.create(createGroupDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req) {
    return this.groupService.findAll(req.user.userId);
  }

  @Get('stats')
  getStats(@Req() req) {
    return this.groupService.getStats(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.groupService.findById(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto, @Req() req) {
    return this.groupService.update(id, updateGroupDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req) {
    return this.groupService.delete(id, req.user.userId);
  }

  @Post(':id/participants')
  addParticipant(@Param('id') id: string, @Body() addParticipantDto: AddParticipantDto, @Req() req) {
    return this.groupService.addParticipant(id, addParticipantDto, req.user.userId);
  }

  @Delete(':id/participants/:phoneNumber')
  removeParticipant(@Param('id') id: string, @Param('phoneNumber') phoneNumber: string, @Req() req) {
    return this.groupService.removeParticipant(id, phoneNumber, req.user.userId);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string, @Req() req) {
    return this.groupService.activate(id, req.user.userId);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Req() req) {
    return this.groupService.deactivate(id, req.user.userId);
  }
}