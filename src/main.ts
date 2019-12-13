import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: process.env.ALLOWED_ORIGIN },
  });
  await app.listen(process.env.PORT);
}
