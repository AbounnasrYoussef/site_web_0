import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { join } from 'path'
import { ConfigService } from '@nestjs/config'
import { uploaderLimiter } from './rate_limiter/rate_limiter'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    const env = app.get(ConfigService)

    app.useStaticAssets(join(__dirname, '..', 'public', 'images'), {
        prefix: '/api/public/images/',
    })

    app.enableCors({
        origin: env.get<string>('FRONTEND_URL'), 
        methods: ['GET', 'POST', 'DELETE'],
        credentials: true, 
    })

    app.use('/uploader', uploaderLimiter)

    await app.listen(3002)
}
bootstrap()