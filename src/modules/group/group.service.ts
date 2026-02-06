import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddParticipantDto } from './dto/add-participant.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    const createdGroup = new this.groupModel({ ...createGroupDto, userId });
    return await createdGroup.save();
  }

  async findAll(userId: string): Promise<Group[]> {
    return await this.groupModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findOne({ _id: id, userId }).exec();
    if (!group) {
      throw new NotFoundException(`Grupo com ID "${id}" não encontrado`);
    }
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto, userId: string): Promise<Group> {
    const updatedGroup = await this.groupModel
      .findOneAndUpdate({ _id: id, userId }, { ...updateGroupDto, updatedAt: new Date() }, { new: true })
      .exec();
    
    if (!updatedGroup) {
      throw new NotFoundException(`Grupo com ID "${id}" não encontrado`);
    }
    
    return updatedGroup;
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.groupModel.findOneAndDelete({ _id: id, userId }).exec();
    if (!result) {
      throw new NotFoundException(`Grupo com ID "${id}" não encontrado`);
    }
  }

  async addParticipant(id: string, addParticipantDto: AddParticipantDto, userId: string): Promise<Group> {
    const group = await this.groupModel.findOne({ _id: id, userId }).exec();
    if (!group) {
      throw new NotFoundException(`Grupo com ID "${id}" não encontrado`);
    }
    
    // Verificar se o participante já existe
    if (group.participants.includes(addParticipantDto.phoneNumber)) {
      throw new Error('Participante já existe neste grupo');
    }
    
    group.participants.push(addParticipantDto.phoneNumber);
    group.updatedAt = new Date();
    
    return await group.save();
  }

  async removeParticipant(id: string, phoneNumber: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findOne({ _id: id, userId }).exec();
    if (!group) {
      throw new NotFoundException(`Grupo com ID "${id}" não encontrado`);
    }
    
    const participantIndex = group.participants.indexOf(phoneNumber);
    if (participantIndex === -1) {
      throw new NotFoundException('Participante não encontrado neste grupo');
    }
    
    group.participants.splice(participantIndex, 1);
    group.updatedAt = new Date();
    
    return await group.save();
  }

  async activate(id: string, userId: string): Promise<Group> {
    return await this.update(id, { isActive: true }, userId);
  }

  async deactivate(id: string, userId: string): Promise<Group> {
    return await this.update(id, { isActive: false }, userId);
  }

  async getStats(userId: string): Promise<any> {
    const total = await this.groupModel.countDocuments({ userId });
    const active = await this.groupModel.countDocuments({ isActive: true, userId });
    const inactive = total - active;
    
    const totalParticipants = await this.groupModel.aggregate([
      { $match: { userId } }, // Filtra por usuário antes de desmembrar
      { $unwind: '$participants' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    return {
      total,
      active,
      inactive,
      totalParticipants: totalParticipants[0]?.count || 0
    };
  }
}