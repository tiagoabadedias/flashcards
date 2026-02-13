import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FishAudioService, BufferedFile } from './fish-audio.service';
import { Response } from 'express';

@Controller('fish-audio')
export class FishAudioController {
  constructor(private readonly fishAudioService: FishAudioService) {}

  @Post('clone')
  @UseInterceptors(FileInterceptor('voice'))
  async createVoiceClone(
    @UploadedFile() file: BufferedFile,
    @Body('title') title: string,
  ) {
    if (!file) {
      throw new BadRequestException('Voice file is required');
    }
    if (!title) {
      throw new BadRequestException('Title is required');
    }

    return this.fishAudioService.createVoiceClone(file, title);
  }

  @Post('tts')
  async generateSpeech(
    @Body('text') text: string,
    @Body('modelId') modelId: string,
    @Res() res: Response,
  ) {
    if (!text) {
      throw new BadRequestException('Text is required');
    }
    if (!modelId) {
      throw new BadRequestException('Model ID is required');
    }

    const audioBuffer = await this.fishAudioService.generateSpeech(text, modelId);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    res.send(Buffer.from(audioBuffer));
  }
}
