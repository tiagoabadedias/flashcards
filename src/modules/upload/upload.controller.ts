import { Body, Controller, Post } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadExternalFileDto } from './dto/upload-external.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('external-file')
  async uploadExternalFile(@Body() dto: UploadExternalFileDto) {
    return this.uploadService.uploadFromUrl(dto.url, dto.filename);
  }
}
