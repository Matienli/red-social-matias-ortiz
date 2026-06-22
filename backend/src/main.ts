import { setDefaultResultOrder, setServers } from 'node:dns';



setServers(['1.1.1.1', '8.8.8.8']);

setDefaultResultOrder('ipv4first');



import { NestFactory } from '@nestjs/core';

import { ValidationPipe } from '@nestjs/common';

import { NestExpressApplication } from '@nestjs/platform-express';

import helmet from 'helmet';

import { AppModule } from './app.module';



async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);



  app.setGlobalPrefix('api');

  app.use(

    helmet({

      crossOriginResourcePolicy: { policy: 'cross-origin' },

    }),

  );



  app.useGlobalPipes(

    new ValidationPipe({

      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,

    }),

  );



  app.enableCors({

    origin:

      process.env.NODE_ENV === 'production'

        ? (process.env.CORS_ORIGINS?.split(',') ?? [])

        : ['http://localhost:4200', 'http://localhost:3000'],

    credentials: true,

  });



  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`API Red Social: http://localhost:${port}/api`);

}



bootstrap();


