import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FishAudioService, BufferedFile } from './fish-audio.service';
import { Response } from 'express';

@Controller('fish-audio')
export class FishAudioController {
  constructor(private readonly fishAudioService: FishAudioService) {}

  @Post('clone')
  @UseInterceptors(AnyFilesInterceptor())
  async createVoiceClone(
    @UploadedFiles() files: BufferedFile[],
    @Body('title') title: string,
    @Body('texts') texts?: string[] | string,
    @Body('text') text?: string,
  ) {
    if (!title) {
      throw new BadRequestException('Title is required');
    }

    const voiceFiles = this.pickVoiceFiles(files);

    if (!voiceFiles.length) {
      throw new BadRequestException('At least one voice file is required');
    }

    const parsedTexts = this.parseTextsField(texts, text);

    if (!parsedTexts.length) {
      throw new BadRequestException('At least one transcript text is required');
    }

    if (parsedTexts.length !== voiceFiles.length) {
      throw new BadRequestException(
        'The number of transcript texts must match the number of voice files',
      );
    }

    return this.fishAudioService.createVoiceClone(voiceFiles, title, parsedTexts);
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

  private parseTextsField(
    texts: string[] | string | undefined,
    text: string | undefined,
  ): string[] {
    if (Array.isArray(texts)) {
      return texts.map((t) => String(t ?? '').trim()).filter(Boolean);
    }

    if (typeof texts === 'string') {
      const raw = texts.trim();
      if (!raw) return [];
      if (raw.startsWith('[')) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((t) => String(t ?? '').trim()).filter(Boolean);
          }
        } catch {
          return [];
        }
      }
      return [raw];
    }

    if (typeof text === 'string' && text.trim()) {
      return [text.trim()];
    }

    return [];
  }

  private pickVoiceFiles(files: BufferedFile[] | undefined): BufferedFile[] {
    const incoming = Array.isArray(files) ? files : [];
    if (!incoming.length) return [];

    const acceptedFieldNames = new Set(['voices', 'voice', 'voices[]']);
    const explicitlyNamed = incoming.filter((f) => acceptedFieldNames.has(f.fieldname));

    if (explicitlyNamed.length) {
      return explicitlyNamed;
    }

    return incoming;
  }
}
