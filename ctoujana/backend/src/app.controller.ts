import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('/resolve-link')
  resolveGoogleMapsLink(@Req() req: Request, @Res() res: Response, @Query('lang') lang: string, @Query('url') url: string) {
    return this.appService.resolveGoogleMapsLink(req, res, lang, url)
  }

  @Get('cities')
  getAllCities(@Req() req: Request, @Res() res: Response) {
    return this.appService.getAllCities(req, res)
  }
}
