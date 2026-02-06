import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsDateString, IsMongoId, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCampaignDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsBoolean({ message: 'isActive deve ser um boolean' })
  @IsOptional()
  isActive?: boolean = true;

  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Data de fim deve ser uma data válida' })
  @IsOptional()
  endDate?: string;

  @IsArray({ message: 'Groups deve ser um array' })
  @IsOptional()
  @Transform(({ value }) => value || [])
  groups?: string[] = [];
}