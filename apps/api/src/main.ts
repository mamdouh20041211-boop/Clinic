import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const configuredOrigins = process.env.FRONTEND_URL
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = configuredOrigins?.length
    ? configuredOrigins
    : process.env.NODE_ENV === 'production'
      ? []
      : ['http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
