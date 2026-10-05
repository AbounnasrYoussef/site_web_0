import { Controller, UseGuards, Get, Patch, Post, Delete, Query, Req, Res, Param, Body } from '@nestjs/common'
import { DiplomasService } from './diplomas.service'
import { AuthGuard } from 'src/guards/auth.guard'
import type { Request, Response } from 'express'
import { UpdateDiplomaDto } from './dto/update-diploma.dto'
import { CreateDiplomaDto } from './dto/create-diploma.dto'

@Controller('diplomas')
export class DiplomasController {

    constructor(private diplomasService: DiplomasService) {}

    @Get('/')
    @UseGuards(AuthGuard)
    getAllDiplomas(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.diplomasService.getAllDiplomas(req, res, lang)
    }

    @Post('/')
    @UseGuards(AuthGuard)
    createDiploma(@Query('lang') lang: string, @Body() body: CreateDiplomaDto, @Req() req: Request, @Res() res: Response) {
        return this.diplomasService.createDiploma(req, res, lang, body)
    }

    @Delete('/:id')
    @UseGuards(AuthGuard)
    deleteDiploma(@Query('lang') lang: string, @Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.diplomasService.deleteDiploma(req, res, lang, id)
    }

    @Patch('/:id')
    @UseGuards(AuthGuard)
    updateDiploma(@Query('lang') lang: string, @Param('id') id: string, @Body() body: UpdateDiplomaDto, @Req() req: Request, @Res() res: Response) {
        return this.diplomasService.updateDiploma(req, res, lang, id, body)
    }
}
