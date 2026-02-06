import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UploadExternalFileDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  @IsString()
  filename: string;
}
