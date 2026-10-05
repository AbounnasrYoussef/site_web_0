import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UploaderService } from '../universities/uploader.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UploaderService]
})
export class UsersModule {}
