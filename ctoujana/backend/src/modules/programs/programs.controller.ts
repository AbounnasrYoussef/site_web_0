import { Controller, Get, Patch, Delete, Post, UseGuards, Query, Req, Res, Param, Body } from '@nestjs/common'
import { AuthGuard } from 'src/guards/auth.guard'
import type { Request, Response } from 'express'
import { ProgramsService } from './programs.service'
import { CreateProgramDto } from './dto/create-program.dto'
import { UpdateProgramDto } from './dto/update-program.dto'
import { ApproveProgramDto } from './dto/approve-program.dto'

@Controller('programs')
export class ProgramsController {

    constructor(private programsService: ProgramsService) {}

    @Post('/')
    @UseGuards(AuthGuard)
    createProgram(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response, @Body() body: CreateProgramDto) {
        return this.programsService.createProgram(req, res, lang, body)
    }

    @Get('/approved')
    // @UseGuards(AuthGuard)
    getAllPrograms(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.programsService.getApprovedPrograms(req, res, lang)
    }

    @Get('/non-approved')
    @UseGuards(AuthGuard)
    getNonApprovedPrograms(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.programsService.getNonApprovedPrograms(req, res, lang)
    }

    @Get('/universities-names')
    @UseGuards(AuthGuard)
    getAllUniversities(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.programsService.getAllUniversities(req, res, lang)
    }

    @Get('/categories-names')
    // @UseGuards(AuthGuard)
    getAllCategories(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.programsService.getAllCategories(req, res, lang)
    }

    @Patch('/:id/approve')
    @UseGuards(AuthGuard)
    approveProgram(@Query('lang') lang: string, @Param('id') id: string, @Body() body: ApproveProgramDto, @Req() req: Request, @Res() res: Response) {
        return this.programsService.approveProgram(req, res, lang, id, body)
    }

    @Get('/:id/reject')
    @UseGuards(AuthGuard)
    rejectProgram(@Query('lang') lang: string, @Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.programsService.rejectProgram(req, res, lang, id)
    }

    @Patch('/:id')
    @UseGuards(AuthGuard)
    updateProgram(@Query('lang') lang: string, @Param('id') id: string, @Body() body: UpdateProgramDto, @Req() req: Request, @Res() res: Response) {
        return this.programsService.updateProgram(req, res, lang, id, body)
    }

    @Delete('/:id')
    @UseGuards(AuthGuard)
    deleteProgram(@Query('lang') lang: string, @Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.programsService.deleteProgram(req, res, lang, id)
    }

}