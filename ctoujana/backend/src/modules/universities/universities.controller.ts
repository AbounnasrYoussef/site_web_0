import { Controller, Get, Req, Res, Query, Param, Delete, Post, Patch, Body, Put, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Request, Response } from 'express'
import { UpdateUniversityDto } from './dto/update_uni.dto'
import { CreateUniversityDto } from './dto/create_uni.dto'
import { UpdateUniversityLocationDto } from './dto/update_uni_loc.dto'
import { UniversitiesService } from './universities.service'
import { CreateUniversityLocationDto } from './dto/create_uni_loc.dto'
import { AuthGuard } from 'src/guards/auth.guard'
import { ApproveUniversityDto } from './dto/approve_uni.dto'

@Controller('universities')
export class UniversitiesController {

    constructor(private universitiesService: UniversitiesService) {}

    @Post('/')
    @UseGuards(AuthGuard)
    createUniversity(@Query('lang') lang: string, @Body() body: CreateUniversityDto, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.createUniversity(lang, body, req, res)
    }

    @Post('/:uniId/add-location')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    createLocationForUniversity(@Param('uniId') uniId: string, @Query('lang') lang: string, @Body() body: CreateUniversityLocationDto, @UploadedFile() image: Express.Multer.File, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.createLocationForUniversity(uniId, lang, body, image, req, res)
    }

    @Get('/approved')
    // @UseGuards(AuthGuard)
    getApprovedUniversities(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.getApprovedUniversities(lang, req, res)
    }

    @Get('/non-approved')
    @UseGuards(AuthGuard)
    getNonApprovedUniversities(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.getNonApprovedUniversities(lang, req, res)
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    deleteUniversityById(@Param('id') id: string, @Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.deleteUniversityById(id, lang, req, res)
    }

    @Patch('/:id')
    @UseGuards(AuthGuard)
    updateUniversityById(@Param('id') id: string, @Query('lang') lang: string, @Body() body: UpdateUniversityDto, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.updateUniversityById(id, lang, body, req, res)    
    }

    @Patch('/:uniId/locations/:locationId')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    updateUniversityLocation(@Param('uniId') uniId: string, @Param('locationId') locationId: string, @Query('lang') lang: string, @Body() body: UpdateUniversityLocationDto, @UploadedFile() image: Express.Multer.File, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.updateUniversityLocation(uniId, locationId, lang, body, image, req, res)    
    }

    @Delete('/:uniId/locations/:locationId')
    @UseGuards(AuthGuard)
    deleteUniversityLocation(@Param('uniId') uniId: string, @Param('locationId') locationId: string, @Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.deleteUniversityLocation(uniId, locationId, lang, req, res)
    }

    @Patch('/approve/:id')
    @UseGuards(AuthGuard)
    approveUniversityById(@Param('id') id: string, @Query('lang') lang: string, @Body() body: ApproveUniversityDto, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.approveUniversityById(id, lang, body, req, res)    
    }

    @Get('/reject/:id')
    @UseGuards(AuthGuard)
    rejectUniversityById(@Param('id') id: string, @Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.universitiesService.rejectUniversityById(id, lang, req, res)    
    }
}