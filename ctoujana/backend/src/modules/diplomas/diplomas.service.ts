import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import { PrismaService } from 'src/prisma/prisma.service'
import { UpdateDiplomaDto } from './dto/update-diploma.dto'
import { CreateDiplomaDto } from './dto/create-diploma.dto'

@Injectable()
export class DiplomasService {

    constructor(private prisma: PrismaService) {}

    private messages = {
        en: {
            languageNotSupported: 'The selected language is not supported',
            notAuthorizedAdmin: "You are not authorized to access this",
            getDiplomasGeneralError: "An error occured while trying to fetch all diplomas",
            deleteDiplomaGeneralError: "An error occured while trying to delete this diploma",
            diplomaNotFound: "This diploma does not exist",
            deleteDiplomaSuccesfully: "This diploma has been deleted successfully",
            updateDiplomaGeneralError: "An error occured while trying to update this diploma",
            updateDiplomaSuccessfully: "This diploma has been updated successfully"
        },
        fr: {
            languageNotSupported: "La langue sélectionnée n'est pas prise en charge",
            notAuthorizedAdmin: "Vous n'êtes pas autorisé",
            getDiplomasGeneralError: "Une erreur est survenue lors de la tentative de récupération de tous les diplômes.",
            deleteDiplomaGeneralError: "Une erreur s'est produite lors de la suppression de ce diplôme",
            diplomaNotFound: "Ce diplôme n'existe pas",
            deleteDiplomaSuccesfully: "Ce diplôme a été supprimé avec succès",
            updateDiplomaGeneralError: "Une erreur s'est produite lors de la modification de ce diplôme",
            updateDiplomaSuccessfully: "Ce diplôme a été mis à jour avec succès"
        },
        ar: {
            languageNotSupported: 'اللغة المحددة غير مدعومة',
            notAuthorizedAdmin: "غير مصرح لك",
            getDiplomasGeneralError: "حدث خطأ أثناء محاولة جلب جميع الدبلومات.",
            deleteDiplomaGeneralError: "حدث خطأ أثناء محاولة حذف هذه الشهادة",
            diplomaNotFound: "هذه الشهادة غير موجودة",
            deleteDiplomaSuccesfully: "تم حذف هذه الشهادة بنجاح",
            updateDiplomaGeneralError: "حدث خطأ أثناء محاولة تعديل هذه الشهادة",
            updateDiplomaSuccessfully: "تم تحديث هذه الشهادة بنجاح"
        }
    }

    private getMessage(language: string, key: string) {
        return this.messages[language][key]
    }

    private mapCategory = (rank: number) => {
        if (rank === 12)
            return "BAC"
        else if (rank === 14)
            return "BAC+2"
        else if (rank === 15)
            return "BAC+3"
        else if (rank === 17)
            return "BAC+5"
        return "DOCTORAT"
    }

    // had function saraha drtha gha bach ntfada error dyal code darori khso ykon
    private generateCode = (rank: number) => {
        return `${this.mapCategory(rank).replace('+', '_')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    }

    async getAllDiplomas(req: Request, res: Response, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try 
        {
            const diplomas = await this.prisma.diplomas.findMany({
                select: {
                    id: true,
                    rank: true,
                    diploma_translations: {
                        select: {
                            locale: true,
                            name: true
                        }
                    }
                },
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'desc' }
                ],
            })
            const data = diplomas.map(diploma => {
                const nameObject: { [key: string]: string } = {}
                diploma.diploma_translations.forEach(translation => {
                    nameObject[translation.locale.toLowerCase()] = translation.name
                })
                return {
                    id: diploma.id,
                    rank: diploma.rank,
                    name: {
                        ar: nameObject.ar,
                        fr: nameObject.fr,
                        en: nameObject.en
                    }
                }
            })
            return res.status(200).json({success: true, diplomas: data})
        } 
        catch (error) 
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'getDiplomasGeneralError')})
        }
    }

    async createDiploma(req: Request, res: Response, lang: string, body: CreateDiplomaDto) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const { rank, name } = body
            const diploma = await this.prisma.diplomas.create({
                data: {
                    rank: rank,
                    code: this.generateCode(rank as number),
                    diploma_group: this.mapCategory(rank as number),
                    diploma_translations: {
                        create: [
                            { locale: 'EN', name: name?.en as string },
                            { locale: 'FR', name: name?.fr as string },
                            { locale: 'AR', name: name?.ar as string }
                        ]
                    }
                },
                select: {
                    id: true,
                    rank: true,
                    diploma_translations: {
                        select: { locale: true, name: true }
                    }
                }
            })
            const nameObject: { [key: string]: string } = {}
            diploma.diploma_translations.forEach(translation => {
                nameObject[translation.locale.toLowerCase()] = translation.name
            })
            return res.status(201).json({success: true, message: this.getMessage(lang, 'createDiplomaSuccessfully'),
                diploma: {
                    id: diploma.id,
                    rank: diploma.rank,
                    name: { ar: nameObject.ar, fr: nameObject.fr, en: nameObject.en }
                }
            })
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'createDiplomaGeneralError')})
        }
    }

    async deleteDiploma(req: Request, res: Response, lang: string, id: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const diploma = await this.prisma.diplomas.findUnique({
                where: {
                    id
                }
            })
            if (!diploma)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'diplomaNotFound')})
            await this.prisma.diplomas.delete({
                where: {
                    id
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'deleteDiplomaSuccesfully')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'deleteDiplomaGeneralError')})
        }
    }

    async updateDiploma(req: Request, res: Response, lang: string, id: string, body: UpdateDiplomaDto) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const {rank, name} = body
            const diploma = await this.prisma.diplomas.findUnique({
                where: {
                    id
                }
            })
            if (!diploma)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'diplomaNotFound')})
            await this.prisma.$transaction([
                this.prisma.diplomas.update({
                    where: { 
                        id 
                    },
                    data: { 
                        rank,
                        diploma_group: this.mapCategory(rank as number)
                    }
                }),
                this.prisma.diploma_translations.upsert({
                    where: { 
                        diploma_id_locale: { 
                            diploma_id: id, locale: 'EN' 
                        } 
                    },
                    update: { name: name?.en },
                    create: { diploma_id: id, locale: 'EN', name: name?.en as string }
                }),
                this.prisma.diploma_translations.upsert({
                    where: { 
                        diploma_id_locale: { 
                            diploma_id: id, locale: 'FR' 
                        } 
                    },
                    update: { name: name?.fr },
                    create: { diploma_id: id, locale: 'FR', name: name?.fr as string }
                }),
                this.prisma.diploma_translations.upsert({
                    where: { 
                        diploma_id_locale: { 
                            diploma_id: id, locale: 'AR' 
                        } 
                    },
                    update: { name: name?.ar },
                    create: { diploma_id: id, locale: 'AR', name: name?.ar as string }
                })
            ])
            return res.status(200).json({success: true, message: this.getMessage(lang, 'updateDiplomaSuccessfully')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'updateDiplomaGeneralError')})
        }
    }

}