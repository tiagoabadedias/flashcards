import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean 
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateQuestionForCampaignDto {
  @IsString({ message: 'Pergunta deve ser uma string' })
  @IsNotEmpty({ message: 'Pergunta é obrigatória' })
  @Transform(({ value }) => value?.trim())
  question: string;

  @IsString({ message: 'Resposta deve ser uma string' })
  @IsNotEmpty({ message: 'Resposta é obrigatória' })
  @Transform(({ value }) => value?.trim())
  answer: string;

  @IsString({ message: 'Explicação deve ser uma string' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  explanation?: string;

  @IsBoolean({ message: 'isActive deve ser um boolean' })
  @IsOptional()
  isActive?: boolean = true;
}