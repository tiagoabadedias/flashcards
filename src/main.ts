import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuração de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Temporariamente false para debug
      transform: true,
    }),
  );

  // Configuração de CORS
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3002'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Prefixo global da API
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicação rodando na porta ${port}`);
  console.log(`📊 Ambiente: ${configService.get<string>('NODE_ENV')}`);
}

bootstrap();