import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData = require('form-data');

export interface BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class FishAudioService {
  private readonly apiUrl = 'https://api.fish.audio';
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FISH_AUDIO_API_TOKEN');
  }

  async createVoiceClone(file: BufferedFile, title: string) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('FISH_AUDIO_API_TOKEN is not configured');
    }

    try {
      const formData = new FormData();
      formData.append('voices', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('title', title);
      formData.append('visibility', 'private');
      formData.append('type', 'tts');
      formData.append('train_mode', 'fast');
      formData.append('enhance_audio_quality', 'true');

      const response = await axios.post(`${this.apiUrl}/model`, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...formData.getHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating voice clone:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        `Failed to create voice clone: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async generateSpeech(text: string, modelId: string) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('FISH_AUDIO_API_TOKEN is not configured');
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/tts`,
        {
          text,
          reference_id: modelId,
          format: 'mp3',
          model: 's1',
          latency: 'normal',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        },
      );

      return response.data;
    } catch (error) {
      console.error('Error generating speech:', error.response?.data || error.message);
      
      // Try to parse arraybuffer error to JSON if possible
      let errorMessage = error.message;
      if (error.response?.data && error.response.data instanceof Buffer) {
        try {
            const errorJson = JSON.parse(error.response.data.toString());
            errorMessage = errorJson.message || errorMessage;
        } catch (e) {
            // ignore
        }
      }

      throw new InternalServerErrorException(
        `Failed to generate speech: ${errorMessage}`
      );
    }
  }
}
