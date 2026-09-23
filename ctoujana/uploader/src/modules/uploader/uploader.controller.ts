import { Controller, Post, Req, Res, UseInterceptors, UploadedFile, Query, UseGuards, Delete } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Request, Response } from 'express'
import { memoryStorage } from 'multer'
import { UploaderService } from './uploader.service'
import { AuthGuard } from 'src/guards/auth.guard'

@Controller('uploader')
export class UploaderController {

    constructor(private uploaderService: UploaderService) {}

    // call it from frontend like this

    // const formData = new FormData()
    // formData.append('image', actual_image)
    // formData.append('upload_dir', 'subfolder')


    // khsni nzid rate-limiting ajmi f had 2 endpoints darori to prevent abuse

    @Post('/')
    // @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: {fileSize: 10 * 1024 * 1024}
        })
    )
    uploadImage(@UploadedFile() file: Express.Multer.File, @Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.uploaderService.uploadImage(file, lang, req, res)    
    }

    @Delete('/')
    // @UseGuards(AuthGuard)
    deleteImage(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.uploaderService.deleteImage(req, res, lang)
    }
    
}