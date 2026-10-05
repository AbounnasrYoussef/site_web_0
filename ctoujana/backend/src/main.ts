import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const env = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  app.enableCors({
    origin: env.get<string>('FRONTEND_URL'),  
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true, 
  })

  await app.listen(3000)
}
bootstrap()