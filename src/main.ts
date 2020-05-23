import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { transformValidationErrors } from './lib/validation-error';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: process.env.ALLOWED_ORIGIN },
  });
  app.useGlobalPipes(new ValidationPipe({ exceptionFactory: transformValidationErrors, whitelist: true }));
  await app.listen(process.env.PORT);
};

bootstrap();
