import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import * as fs from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { ConfigService } from '@nestjs/config'


@Injectable()
export class UploaderService {

    constructor(private env: ConfigService) {}

    private messages = {
        en: {
            languageNotSupported: 'The selected language is not supported',
            imageUploaderFailedError: 'An error occured while trying to upload this file',
            imageNotFoundError: 'No file is being uploaded',
            imageUploadedSuccesfully: 'The file has been uploaded succesfully',
            imageMimeTypeError: 'The uploaded file is not a valid image',
            imageExtensionError: 'The uploaded file is not a valid image',
            imageSizeBigError: 'The size of the uploaded file is way too big, max 10MB',
            imageInvalidPathError1: "Invalid path: Only alphanumeric characters and forward slashes are allowed",
            imageInvalidPathError2: "Invalid path: Consecutive slashes are not allowed.",
            deleteImageFailedError: "An error occured while trying to delete the image",
            imageUrlNotProvided: "No image url is being provided",
            linkNotValid: "The image url is not valid",
            imageNotFound: "Image does not exist",
            imageDeletedSuccesfully: "Image has been deleted succesfully"
        },
        fr: {
            languageNotSupported: "La langue sélectionnée n'est pas prise en charge",
            imageUploaderFailedError: "Une erreur s'est produite lors de la tentative de téléversement de ce fichier",
            imageNotFoundError: "Aucun fichier n'est en cours de téléversement",
            imageUploadedSuccesfully: 'Le fichier a été téléversé avec succès',
            imageMimeTypeError: "Le fichier téléversé n'est pas une image valide",
            imageExtensionError: "Le fichier téléversé n'est pas une image valide",
            imageSizeBigError: 'La taille du fichier téléversé est beaucoup trop grande, max 10 Mo',
            imageInvalidPathError1: "Chemin invalide : Seuls les caractères alphanumériques et les barres obliques sont autorisés.",
            imageInvalidPathError2: "Chemin invalide : Les barres obliques consécutives ne sont pas autorisées.",
            deleteImageFailedError: "Une erreur est survenue lors de la suppression de l'image",
            imageUrlNotProvided: "Aucune URL d'image n'est fournie",
            linkNotValid: "L'URL de l'image n'est pas valide",
            imageNotFound: "L'image n'existe pas",
            imageDeletedSuccesfully: "L'image a été supprimée avec succès"
        },
        ar: {
            languageNotSupported: 'اللغة المحددة غير مدعومة',
            imageUploaderFailedError: 'حدث خطأ أثناء محاولة رفع هذا الملف',
            imageNotFoundError: 'لا يوجد ملف قيد الرفع',
            imageUploadedSuccesfully: 'تم رفع الملف بنجاح',
            imageMimeTypeError: 'الملف المرفوع ليس صورة صالحة',
            imageExtensionError: 'الملف المرفوع ليس صورة صالحة',
            imageSizeBigError: 'حجم الملف المرفوع كبير جدا، الحد الأقصى 10 ميجابايت',
            imageInvalidPathError1: "مسار غير صالح: يُسمح فقط بالأحرف الأبجدية الرقمية والشرطات المائلة.",
            imageInvalidPathError2: "مسار غير صالح: غير مسموح بالشرطات المائلة المتتالية.",
            deleteImageFailedError: "حدث خطأ أثناء محاولة حذف الصورة",
            imageUrlNotProvided: "لم يتم توفير عنوان URL للصورة",
            linkNotValid: "رابط الصورة غير صالح",
            imageNotFound: "الصورة غير موجودة",
            imageDeletedSuccesfully: "تم حذف الصورة بنجاح"
        }
    }

    private getMessage(language: string, key: string) {
        return this.messages[language][key]
    }

    private validateMagicBytes(buffer: Buffer, mimetype: string) {
        if (!buffer || buffer.length < 4)
            return false
        if (mimetype === 'image/jpeg')
            return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
        if (mimetype === 'image/png')
            return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
        if (mimetype === 'image/webp')
            return buffer.length >= 12 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
        return false
    }

    private parseValidUrl(url: string, lang: string) {
        const isValid = /^[a-zA-Z0-9\/]+$/.test(url)
        if (!isValid)
            return {success: false, message: this.getMessage(lang, 'imageInvalidPathError1')}
        if (url.includes('//'))
            return {success: false, message: this.getMessage(lang, 'imageInvalidPathError2')}
        return {success: true, url: url}
    }

    private checkExtension(filename: string) {
        if (!filename)
            return false
        const extension = extname(filename)
        if (!extension || !['.png', '.jpeg', '.jpg', '.webp'].includes(extension))
            return false
        return true
    }

    async uploadImage(file: Express.Multer.File, lang: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        try
        {
            if (!file)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'imageNotFoundError')})
            if (!this.checkExtension(file.originalname))
                return res.status(400).json({success: false, message: this.getMessage(lang, 'imageExtensionError')})
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
                return res.status(400).json({success: false, message: this.getMessage(lang, 'imageMimeTypeError')})
            if (!this.validateMagicBytes(file.buffer, file.mimetype))
                return res.status(400).json({success: false, message: this.getMessage(lang, 'imageMimeTypeError')})
            if (file.size > 1024 * 1024 * 10)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'imageSizeBigError')})
            const default_dir = './public/images/'
            let { upload_dir } = req.body
            if (!upload_dir?.trim())
                upload_dir = default_dir
            else if (!this.parseValidUrl(upload_dir, lang).success)
                return res.status(400).json({success: false, message: this.parseValidUrl(upload_dir, lang).message})
            else
                upload_dir = default_dir + upload_dir.trim()
            const random_name = randomUUID()
            const filename = `${random_name}.webp`
            if (!fs.existsSync(upload_dir))
                fs.mkdirSync(upload_dir, {recursive: true})
            const image_buffer = await sharp(file.buffer).webp({quality: 90, effort: 6}).toBuffer()
            fs.writeFileSync(join(upload_dir, filename), image_buffer)
            const relativeDirectory = upload_dir === default_dir ? '' : upload_dir.replace(default_dir, '')
            const uploader_url = this.env.get<string>('PUBLIC_UPLOADER_API_URL')!
            return res.status(201).json({success: true, message: this.getMessage(lang, 'imageUploadedSuccesfully'), filename: filename, path: `${uploader_url}/api/public/images/${relativeDirectory ? relativeDirectory.replace(/^\//, '') + '/' : ''}${filename}`})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'imageUploaderFailedError')})
        }
    }

    async deleteImage(req: Request, res: Response, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        try
        {
            const { image_url } = req.body
            if (!image_url)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'imageUrlNotProvided')})
            const prefix = `${this.env.get<string>('PUBLIC_UPLOADER_API_URL')!}/api/public/images/`
            if (!image_url.startsWith(prefix))
                return res.status(400).json({success: false, message: this.getMessage(lang, 'linkNotValid')})
            const path = image_url.slice(prefix.length)
            const isValid = /^[a-zA-Z0-9\/\.\-]+$/.test(path)
            if (!isValid)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'linkNotValid')})
            if (path.includes('..') || path.includes('//'))
                return res.status(400).json({success: false, message: this.getMessage(lang, 'linkNotValid')})
            const to_delete = join(__dirname, '..', '..', '..', 'public', 'images', `${path}`)
            if (!fs.existsSync(to_delete))
                return res.status(404).json({success: false, message: this.getMessage(lang, 'imageNotFound')})
            fs.rmSync(to_delete)
            return res.status(200).json({success: true, message: this.getMessage(lang, 'imageDeletedSuccesfully')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'deleteImageFailedError')})
        }
    }
}
