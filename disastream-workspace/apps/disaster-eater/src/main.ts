import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomLogger } from './Application/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });
  console.log(
    'DisasterEater running on port ' + process.env.DISASTER_EATER_PORT,
  );
  await app.listen(process.env.DISASTER_EATER_PORT);
}
bootstrap();
