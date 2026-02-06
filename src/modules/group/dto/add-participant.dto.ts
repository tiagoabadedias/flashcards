import { IsString } from 'class-validator';

export class AddParticipantDto {
  @IsString()
  phoneNumber: string;
}