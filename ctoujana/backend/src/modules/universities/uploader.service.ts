import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Multer } from 'multer'

@Injectable()
export class UploaderService {

    constructor(private env: ConfigService) {}

    private getUploaderServiceUrl() {
        return this.env.get<string>('PRIVATE_UPLOADER_API_URL')!
    }

    async uploadImage(file: Express.Multer.File, uploadDir: string, locale: string) {
        if (!file)
            return {error: true}
        try
        {
            const formData = new FormData()
            const blob = new Blob([file.buffer as BlobPart], {type: file.mimetype}) // hna kandiro Blob(file.buffer) hitach multipart/form-data makat3rfch kifach tparsi raw bytes, dakchi lach kanrdoh Blop so kaytparsa as multipart/form-data li kayexpecti service dyali.
            formData.append('image', blob, file.originalname)
            formData.append('upload_dir', uploadDir)
            const uploader_key = this.env.get<string>('PRIVATE_UPLOADER_KEY')
            const response = await fetch(`${this.getUploaderServiceUrl()}/uploader?lang=${locale}`, {
                method: 'POST',
                headers: {
                    "x-uploader-key": `${uploader_key}`
                },
                body: formData
            })
            const data = await response.json()
            if (!data.success)
                return {error: true, status_code: response.status}
            return {path: data.path}
        }
        catch (error)
        {
            return {error: true}
        }
    }

    async deleteImage(imageUrl: string, locale: string) {
        if (!imageUrl)
            return
        try
        {
            const uploader_key = this.env.get<string>('PRIVATE_UPLOADER_KEY')
            await fetch(`${this.getUploaderServiceUrl()}/uploader?lang=${locale}`, {
                method: 'DELETE',
                  headers: {
                    "x-uploader-key": `${uploader_key}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({image_url: imageUrl})
            })
        }
        catch (error)
        {
            
        }
    }
}