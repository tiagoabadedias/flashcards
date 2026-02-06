import { IsOptional, IsDateString, IsString, IsArray, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnalyticsFiltersDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groups?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsString()
  period?: string; // '7d', '15d', '30d'
}