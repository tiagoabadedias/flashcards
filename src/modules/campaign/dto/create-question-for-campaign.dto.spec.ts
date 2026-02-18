import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateQuestionForCampaignDto } from './create-question-for-campaign.dto';

describe('CreateQuestionForCampaignDto', () => {
  it('accepts audio mode without options', async () => {
    const dto = plainToInstance(CreateQuestionForCampaignDto, {
      question: 'Pergunta',
      answer: 'Resposta',
      responseMode: 'audio',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects buttons mode without options', async () => {
    const dto = plainToInstance(CreateQuestionForCampaignDto, {
      question: 'Pergunta',
      answer: 'A',
      responseMode: 'buttons',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects buttons mode with less than 2 options', async () => {
    const dto = plainToInstance(CreateQuestionForCampaignDto, {
      question: 'Pergunta',
      answer: 'A',
      responseMode: 'buttons',
      options: ['A'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects buttons mode when answer is not in options', async () => {
    const dto = plainToInstance(CreateQuestionForCampaignDto, {
      question: 'Pergunta',
      answer: 'C',
      responseMode: 'buttons',
      options: ['A', 'B'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts buttons mode with valid options and answer', async () => {
    const dto = plainToInstance(CreateQuestionForCampaignDto, {
      question: 'Pergunta',
      answer: 'B',
      responseMode: 'buttons',
      options: ['A', 'B', 'C'],
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

