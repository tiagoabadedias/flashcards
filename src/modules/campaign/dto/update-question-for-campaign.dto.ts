import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionForCampaignDto } from './create-question-for-campaign.dto';

export class UpdateQuestionForCampaignDto extends PartialType(CreateQuestionForCampaignDto) {}