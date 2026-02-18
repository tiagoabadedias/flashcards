import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean,
  IsIn,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'AnswerInOptions', async: false })
class AnswerInOptionsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const obj = args.object as any;
    if (obj?.responseMode !== 'buttons') return true;

    const answer = typeof value === 'string' ? value.trim() : '';
    const options = Array.isArray(obj?.options) ? obj.options : [];
    return options.includes(answer);
  }

  defaultMessage() {
    return 'Resposta deve ser uma das opções';
  }
}

export class CreateQuestionForCampaignDto {
  @IsString({ message: 'Pergunta deve ser uma string' })
  @IsNotEmpty({ message: 'Pergunta é obrigatória' })
  @Transform(({ value }) => value?.trim())
  question: string;

  @IsString({ message: 'Resposta deve ser uma string' })
  @IsNotEmpty({ message: 'Resposta é obrigatória' })
  @Transform(({ value }) => value?.trim())
  @ValidateIf((obj) => obj?.responseMode === 'buttons')
  @Validate(AnswerInOptionsConstraint)
  answer: string;

  @IsIn(['audio', 'buttons'], { message: 'Modo de resposta inválido' })
  @IsOptional()
  responseMode?: 'audio' | 'buttons' = 'audio';

  @ValidateIf((obj) => obj?.responseMode === 'buttons')
  @IsArray({ message: 'Opções deve ser um array' })
  @ArrayMinSize(2, { message: 'Opções deve ter pelo menos 2 itens' })
  @ArrayMaxSize(10, { message: 'Opções deve ter no máximo 10 itens' })
  @IsString({ each: true, message: 'Cada opção deve ser uma string' })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((v) => String(v ?? '').trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw) return [];
      if (raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((v) => String(v ?? '').trim()).filter(Boolean);
          }
        } catch {
          return [];
        }
      }
      return [raw];
    }
    return [];
  })
  options?: string[];

  @IsString({ message: 'Explicação deve ser uma string' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  explanation?: string;

  @IsBoolean({ message: 'isActive deve ser um boolean' })
  @IsOptional()
  isActive?: boolean = true;
}
