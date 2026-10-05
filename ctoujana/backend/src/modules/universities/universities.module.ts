import { Module } from '@nestjs/common'
import { UniversitiesController } from './universities.controller'
import { UniversitiesService } from './universities.service'
import { UploaderService } from './uploader.service'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [UniversitiesController],
  providers: [UniversitiesService, UploaderService],
})
export class UniversitiesModule {}