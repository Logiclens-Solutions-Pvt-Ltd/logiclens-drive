import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";

(BigInt.prototype as any).toJSON = function (){
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true}));
  app.enableCors({origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Must include OPTIONS
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'ngrok-skip-browser-warning' // MUST explicitly allow this header
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
  
}
bootstrap();
