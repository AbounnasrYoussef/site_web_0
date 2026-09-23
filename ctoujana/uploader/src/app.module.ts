import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploaderModule } from './modules/uploader/uploader.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UploaderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
