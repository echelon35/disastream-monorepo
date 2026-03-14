import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './Services/logger.service';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
    bodyParser: true,
  });
  app.enableCors();
  app
    .getHttpAdapter()
    .getInstance()
    .use(express.json({ limit: '10mb' }));
  console.log('DisaStreamAPI running on port ' + process.env.DISASTREAM_PORT);
  await app.listen(process.env.DISASTREAM_PORT);
}
bootstrap();
