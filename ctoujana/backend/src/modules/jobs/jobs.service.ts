import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import { PrismaService } from 'src/prisma/prisma.service'
import { UpdateJobDto } from './dto/update-job.dto'
import { AddJobDto } from './dto/add-job.dto'

@Injectable()
export class JobsService {

    constructor(private prisma: PrismaService) {}

    private messages = {
        en: {
            getAllJobsGeneralError: "An error occured while trying to fetch all the jobs",
            languageNotSupported: 'The selected language is not supported',
            notAuthorizedAdmin: "You are not authorized to access this",
            deleteJobGeneralError: "An error occured while trying to delete this job",
            jobNotFound: "This job does not exist",
            jobDeletedSuccess: 'This job has been deleted successfully',
            updateJobGeneralError: "An error occured while trying to update this job",
            updateJobSuccessfully: 'This job has been updated successfully',
            createJobGeneralError: "An error occured while trying to add this new job",
            createJobSuccessfully: "This job has been added successfully"
        },
        fr: {
            getAllJobsGeneralError: "Une erreur s'est produite lors de la tentative de récupération de tous les emplois",
            languageNotSupported: "La langue sélectionnée n'est pas prise en charge",
            notAuthorizedAdmin: "Vous n'êtes pas autorisé",
            deleteJobGeneralError: "Une erreur est survenue lors de la tentative de suppression de ce poste",
            jobNotFound: "Ce poste n'existe pas",
            jobDeletedSuccess: "Ce poste a été supprimé avec succès",
            updateJobGeneralError: "Une erreur est survenue lors de la tentative de mise à jour de ce poste",
            updateJobSuccessfully: "Ce poste a été mis à jour avec succès",
            createJobGeneralError: "Une erreur est survenue lors de la tentative d'ajout de ce nouveau poste",
            createJobSuccessfully: "Ce poste a été ajouté avec succès"
        },
        ar: {
            getAllJobsGeneralError: "حدث خطأ أثناء محاولة جلب جميع الوظائف",
            languageNotSupported: 'اللغة المحددة غير مدعومة',
            notAuthorizedAdmin: "غير مصرح لك",
            deleteJobGeneralError: "حدث خطأ أثناء محاولة حذف هذه الوظيفة",
            jobNotFound: "هذه الوظيفة غير موجودة",
            jobDeletedSuccess: "تم حذف هذه الوظيفة بنجاح",
            updateJobGeneralError: "حدث خطأ أثناء محاولة تحديث هذه الوظيفة",
            updateJobSuccessfully: "تم تحديث هذه الوظيفة بنجاح",
            createJobGeneralError: "حدث خطأ أثناء محاولة إضافة هذه الوظيفة الجديدة",
            createJobSuccessfully: "تمت إضافة هذه الوظيفة بنجاح"
        }
    }

    private getMessage(language: string, key: string) {
        return this.messages[language][key]
    }

    async getAllJobs(req: Request, res: Response, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        // if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
        //     return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const jobs = await this.prisma.job_titles.findMany({
                select: {
                    id: true,
                    salary: true,
                    job_titles_translations: {
                        select: {
                            locale: true,
                            title: true
                        }
                    }
                },
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'desc' }
                ],
            })
            const data = jobs.map(job => {
                const nameObject: { [key: string]: string } = {}
                job.job_titles_translations.forEach(translation => {
                    nameObject[translation.locale.toLowerCase()] = translation.title
                })
                return {
                    id: job.id,
                    salary: job.salary,
                    title: {
                        ar: nameObject.ar,
                        fr: nameObject.fr,
                        en: nameObject.en
                    }
                }
            })
            return res.status(200).json({success: true, jobs: data})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'getAllJobsGeneralError')})
        }
    }

    async createJob(req: Request, res: Response, body: AddJobDto, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const { title, salary } = body
            const job = await this.prisma.job_titles.create({
                data: {
                    salary: salary as number,
                    job_titles_translations: {
                        create: [
                            { locale: 'EN', title: title?.en as string },
                            { locale: 'FR', title: title?.fr as string },
                            { locale: 'AR', title: title?.ar as string },
                        ]
                    }
                },
                select: {
                    id: true,
                    salary: true,
                    job_titles_translations: {
                        select: {
                            locale: true, title: true
                        }
                    }
                }
            })
            const nameObject: { [key: string]: string } = {}
            job.job_titles_translations.forEach(translation => {
                nameObject[translation.locale.toLowerCase()] = translation.title
            })
            const addedJob = {
                id: job.id,
                salary: job.salary,
                title: {
                    ar: nameObject.ar,
                    fr: nameObject.fr,
                    en: nameObject.en,
                }
            }
            return res.status(201).json({success: true, message: this.getMessage(lang, 'createJobSuccessfully'), job: addedJob})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'createJobGeneralError')})
        }
    }

    async deleteJob(req: Request, res: Response, lang: string, id: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const job = await this.prisma.job_titles.findUnique({
                where: {
                    id
                }
            })
            if (!job)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'jobNotFound')})
            await this.prisma.job_titles.delete({
                where: {
                    id
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'jobDeletedSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'deleteJobGeneralError')})
        }
    }

    async updateJob(req: Request, res: Response, body: UpdateJobDto, lang: string, id: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const { title, salary } = body
            const job = await this.prisma.job_titles.findUnique({
                where: {
                    id
                }
            })
            if (!job)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'jobNotFound')})
            await this.prisma.$transaction([
                this.prisma.job_titles.update({
                    where: {
                        id
                    },
                    data: {
                        salary
                    }
                }),
                this.prisma.job_titles_translations.upsert({
                    where: { 
                        job_title_id_locale: { 
                            job_title_id: id, locale: 'EN' 
                        } 
                    },
                    update: { title: title?.en },
                    create: { job_title_id: id, locale: 'EN', title: title?.en as string }
                }),
                this.prisma.job_titles_translations.upsert({
                    where: { 
                        job_title_id_locale: { 
                            job_title_id: id, locale: 'FR' 
                        } 
                    },
                    update: { title: title?.fr },
                    create: { job_title_id: id, locale: 'FR', title: title?.fr as string }
                }),
                this.prisma.job_titles_translations.upsert({
                    where: { 
                        job_title_id_locale: { 
                            job_title_id: id, locale: 'AR' 
                        } 
                    },
                    update: { title: title?.ar },
                    create: { job_title_id: id, locale: 'AR', title: title?.ar as string }
                })
            ])
            return res.status(200).json({success: true, message: this.getMessage(lang, 'updateJobSuccessfully')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'updateJobGeneralError')})
        }
    }
}
