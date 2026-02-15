import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FishAudioController } from './fish-audio.controller';
import { BufferedFile, FishAudioService } from './fish-audio.service';

function makeFile(originalname: string): BufferedFile {
  return {
    fieldname: 'voices',
    originalname,
    encoding: '7bit',
    mimetype: 'audio/wav',
    size: 1,
    buffer: Buffer.from([0x00]),
  };
}

describe('FishAudioController', () => {
  let controller: FishAudioController;
  let fishAudioService: FishAudioService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FishAudioController],
      providers: [
        {
          provide: FishAudioService,
          useValue: {
            createVoiceClone: jest.fn().mockResolvedValue({ id: 'mock' }),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(FishAudioController);
    fishAudioService = moduleRef.get(FishAudioService);
  });

  it('throws when title is missing', async () => {
    await expect(
      controller.createVoiceClone([makeFile('a.wav')], '' as any, ['a']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when no voice files are provided', async () => {
    await expect(controller.createVoiceClone([], 'Title', ['a'])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws when transcripts are missing', async () => {
    await expect(
      controller.createVoiceClone([makeFile('a.wav')], 'Title'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when transcript count does not match voice file count', async () => {
    await expect(
      controller.createVoiceClone(
        [makeFile('a.wav'), makeFile('b.wav')],
        'Title',
        ['only one'],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts voices + texts arrays', async () => {
    const result = await controller.createVoiceClone(
      [makeFile('a.wav'), makeFile('b.wav')],
      'Title',
      ['t1', 't2'],
    );

    expect(result).toEqual({ id: 'mock' });
    expect(fishAudioService.createVoiceClone).toHaveBeenCalledWith(
      expect.any(Array),
      'Title',
      ['t1', 't2'],
    );
  });

  it('accepts JSON string for texts', async () => {
    await controller.createVoiceClone(
      [makeFile('a.wav'), makeFile('b.wav')],
      'Title',
      '["t1","t2"]',
    );

    expect(fishAudioService.createVoiceClone).toHaveBeenCalledWith(
      expect.any(Array),
      'Title',
      ['t1', 't2'],
    );
  });

  it('keeps backward compatibility with voice + text fields', async () => {
    const file = makeFile('a.wav');
    file.fieldname = 'voice';
    await controller.createVoiceClone([file], 'Title', undefined, 't1');

    expect(fishAudioService.createVoiceClone).toHaveBeenCalledWith(
      expect.any(Array),
      'Title',
      ['t1'],
    );
  });

  it('accepts voices[] as fieldname', async () => {
    const a = makeFile('a.wav');
    const b = makeFile('b.wav');
    a.fieldname = 'voices[]';
    b.fieldname = 'voices[]';

    await controller.createVoiceClone([a, b], 'Title', ['t1', 't2']);

    expect(fishAudioService.createVoiceClone).toHaveBeenCalledWith(
      expect.any(Array),
      'Title',
      ['t1', 't2'],
    );
  });

  it('accepts unknown file fieldnames (no explicit voices/voice)', async () => {
    const a = makeFile('a.wav');
    const b = makeFile('b.wav');
    a.fieldname = 'files';
    b.fieldname = 'files';

    await controller.createVoiceClone([a, b], 'Title', ['t1', 't2']);

    expect(fishAudioService.createVoiceClone).toHaveBeenCalledWith(
      expect.any(Array),
      'Title',
      ['t1', 't2'],
    );
  });
});
