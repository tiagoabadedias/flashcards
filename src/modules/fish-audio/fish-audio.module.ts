import { Module } from '@nestjs/common';
import { FishAudioService } from './fish-audio.service';
import { FishAudioController } from './fish-audio.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FishAudioController],
  providers: [FishAudioService],
  exports: [FishAudioService],
})
export class FishAudioModule {}
