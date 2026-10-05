import { Module } from '@nestjs/common';
import { DiplomasController } from './diplomas.controller';
import { DiplomasService } from './diplomas.service';

@Module({
  controllers: [DiplomasController],
  providers: [DiplomasService]
})
export class DiplomasModule {}
