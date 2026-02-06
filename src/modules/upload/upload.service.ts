import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put } from '@vercel/blob';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  async uploadFromUrl(url: string, filename: string): Promise<{ url: string }> {
    try {
      // 1. Baixar o arquivo da URL externa
      // Usando fetch global (Node.js 18+)
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new BadRequestException(`Falha ao baixar arquivo da URL fornecida: ${response.statusText}`);
      }

      // 2. Obter o buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // O token deve estar configurado na variável de ambiente BLOB_READ_WRITE_TOKEN
      const token = this.configService.get<string>('BLOB_READ_WRITE_TOKEN');
      
      if (!token) {
        throw new Error('BLOB_READ_WRITE_TOKEN não configurado no servidor');
      }

      // 3. Enviar para o Vercel Blob
      const { url: blobUrl } = await put(filename, buffer, { 
        access: 'public',
        token: token
      });

      return { url: blobUrl };

    } catch (error) {
      console.error('Erro no upload:', error);
      throw new BadRequestException('Não foi possível processar o upload do arquivo externo: ' + (error as Error).message);
    }
  }
}
