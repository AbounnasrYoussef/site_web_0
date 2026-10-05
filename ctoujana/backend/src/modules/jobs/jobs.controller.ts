import { Controller, Get, UseGuards, Query, Req, Res, Delete, Param, Patch, Body, Post } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { AuthGuard } from 'src/guards/auth.guard'
import type { Request, Response } from 'express'
import { UpdateJobDto } from './dto/update-job.dto'
import { AddJobDto } from './dto/add-job.dto'

@Controller('jobs')
export class JobsController {

    constructor(private jobsService: JobsService) {}

    @Get('/')
    // @UseGuards(AuthGuard)
    getAllJobs(@Req() req: Request, @Res() res: Response, @Query('lang') lang: string) {
        return this.jobsService.getAllJobs(req, res, lang)
    }

    @Post('/')
    @UseGuards(AuthGuard)
    createJob(@Req() req: Request, @Res() res: Response, @Body() body: AddJobDto, @Query('lang') lang: string) {
        return this.jobsService.createJob(req, res, body, lang)
    }

    @Delete('/:id')
    @UseGuards(AuthGuard)
    deleteJob(@Req() req: Request, @Res() res: Response, @Query('lang') lang: string, @Param('id') id: string) {
        return this.jobsService.deleteJob(req, res, lang, id)
    }

    @Patch('/:id')
    @UseGuards(AuthGuard)
    updateJob(@Req() req: Request, @Res() res: Response, @Body() body: UpdateJobDto, @Query('lang') lang: string, @Param('id') id: string) {
        return this.jobsService.updateJob(req, res, body, lang, id)
    }

}
