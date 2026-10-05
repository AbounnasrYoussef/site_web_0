import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateProgramDto } from './dto/create-program.dto'
import { UpdateProgramDto } from './dto/update-program.dto'
import { ApproveProgramDto } from './dto/approve-program.dto'

@Injectable()
export class ProgramsService {

    constructor(private prisma: PrismaService) {}

    private messages = {
        en: {
            languageNotSupported: 'The selected language is not supported',
            notAuthorizedAdmin: "You are not authorized to access this",
            getProgramsGeneralError: "An error occured while trying to fetch all programs",
            deleteProgramGeneralError: "An error occured while trying to delete this program",
            deleteProgramNotFound: "This program does not exist",
            deleteProgramSuccess: "This program has been deleted succesfully",
            updateProgramGeneralError: "An error occured while trying to update this program",
            updateProgramNotFound: "This program does not exist",
            updateProgramSuccess: "This program has been updated succesfully",
            getDiplomasGeneralError: "An error occured while trying to fetch all diplomas",
            getUniversitiesGeneralError: "An error occured while trying to fetch all universities",
            getCategoriesGeneralError: "A error occured while trying to fetch all categories",
            diplomaRequirementDuplicate: "Cannot update this program because you entered same required diploma twice",
            programAlreadyApprovedForReject: "Cannot reject this program because its already approved",
            programAlreadyApproved: "This program is already approved",
            approveProgramGeneralError: "An error occured while trying to approve this program",
            approveProgramNotFound: "This program does not exist",
            approveProgramSuccess: "This program has been approved succesfully",
            rejectProgramGeneralError: "An error occured while trying to reject this program",
            rejectProgramNotFound: "This program does not exist",
            rejectProgramSuccess: "This program has been rejected succesfully",
            createProgramGeneralError: "An error occured while trying to create this program",
            createProgramSuccess: "This program has been created succesfully",
            jobTitleDuplicate: "Cannot update this program because you entered the same job title twice",
        },
        fr: {
            languageNotSupported: "La langue sélectionnée n'est pas prise en charge",
            notAuthorizedAdmin: "Vous n'êtes pas autorisé",
            getProgramsGeneralError: "Une erreur est survenue lors de la tentative de récupération de tous les programmes",
            deleteProgramGeneralError: "Une erreur est survenue lors de la suppression de ce programme",
            deleteProgramNotFound: "Ce programme n'existe pas",
            deleteProgramSuccess: "Ce programme a été supprimé avec succès",
            updateProgramGeneralError: "Une erreur est survenue lors de la mise à jour de ce programme",
            updateProgramNotFound: "Ce programme n'existe pas",
            updateProgramSuccess: "Ce programme a été mis à jour avec succès",
            getDiplomasGeneralError: "Une erreur est survenue lors de la tentative de récupération de tous les diplômes.",
            getUniversitiesGeneralError: "Une erreur s'est produite lors de la récupération de toutes les universités",
            getCategoriesGeneralError: "Une erreur s'est produite lors de la récupération de toutes les catégories",
            diplomaRequirementDuplicate: "Impossible de mettre à jour ce programme car vous avez saisi deux fois le même diplôme requis",
            programAlreadyApprovedForReject: "Impossible de rejeter ce programme car il est déjà approuvé",
            approveProgramGeneralError: "Une erreur est survenue lors de l'approbation de ce programme",
            approveProgramNotFound: "Ce programme n'existe pas",
            approveProgramSuccess: "Ce programme a été approuvé avec succès",
            rejectProgramGeneralError: "Une erreur est survenue lors du rejet de ce programme",
            rejectProgramNotFound: "Ce programme n'existe pas",
            rejectProgramSuccess: "Ce programme a été rejeté avec succès",
            programAlreadyApproved: "Ce programme est déjà approuvé",
            createProgramGeneralError: "Une erreur est survenue lors de la création de ce programme",
            createProgramSuccess: "Ce programme a été créé avec succès",
            jobTitleDuplicate: "Impossible de mettre à jour ce programme car vous avez saisi le même métier deux fois",
        },
        ar: {
            languageNotSupported: 'اللغة المحددة غير مدعومة',
            notAuthorizedAdmin: "غير مصرح لك",
            getProgramsGeneralError: "حدث خطأ أثناء محاولة جلب جميع البرامج",
            deleteProgramGeneralError: "حدث خطأ أثناء محاولة حذف هذا البرنامج",
            deleteProgramNotFound: "هذا البرنامج غير موجود",
            deleteProgramSuccess: "تم حذف هذا البرنامج بنجاح",
            updateProgramGeneralError: "حدث خطأ أثناء محاولة تحديث هذا البرنامج",
            updateProgramNotFound: "هذا البرنامج غير موجود",
            updateProgramSuccess: "تم تحديث هذا البرنامج بنجاح",
            getDiplomasGeneralError: "حدث خطأ أثناء محاولة جلب جميع الدبلومات.",
            getUniversitiesGeneralError: "حدث خطأ أثناء محاولة جلب جميع الجامعات",
            getCategoriesGeneralError: "حدث خطأ أثناء محاولة جلب جميع الفئات",
            diplomaRequirementDuplicate: "لا يمكن تحديث هذا البرنامج لأنك أدخلت نفس الدبلوم المطلوب مرتين",
            programAlreadyApprovedForReject: "لا يمكن رفض هذا البرنامج لأنه تمت الموافقة عليه بالفعل",
            approveProgramGeneralError: "حدث خطأ أثناء محاولة الموافقة على هذا البرنامج",
            approveProgramNotFound: "هذا البرنامج غير موجود",
            approveProgramSuccess: "تمت الموافقة على هذا البرنامج بنجاح",
            rejectProgramGeneralError: "حدث خطأ أثناء محاولة رفض هذا البرنامج",
            rejectProgramNotFound: "هذا البرنامج غير موجود",
            rejectProgramSuccess: "تم رفض هذا البرنامج بنجاح",
            programAlreadyApproved: "تمت الموافقة على هذا البرنامج بالفعل",
            createProgramGeneralError: "حدث خطأ أثناء محاولة إنشاء هذا البرنامج",
            createProgramSuccess: "تم إنشاء هذا البرنامج بنجاح",
            jobTitleDuplicate: "لا يمكن تحديث هذا البرنامج لأنك أدخلت نفس المسمى الوظيفي مرتين"
        }
    }

    private getMessage(language: string, key: string) {
        return this.messages[language][key]
    }

    private programInclude = {
        program_translations: {
            select: {
                locale: true,
                name: true
            }
        },
        categories: {
            select: {
                id: true,
                name: true,
                category_translations: {
                    select: {
                        locale: true,
                        name: true
                    }
                }
            }
        },
        diplomas: {
            select: {
                id: true,
                code: true,
                rank: true,
                diploma_translations: {
                    select: {
                        locale: true,
                        name: true
                    }
                }
            }
        },
        universities: {
            select: {
                id: true,
                type: true,
                abreviation: true,
                internat_available: true,
                bourse_available: true,
                university_translations: {
                    select: {
                        locale: true,
                        name: true,
                        description: true,
                    }
                }
            }
        },
        program_requirements: {
            select: {
                id: true,
                min_grade: true,
                max_years_since_graduation: true,
                requirement_group: true,
                diplomas: {
                    select: {
                        id: true,
                        code: true,
                        rank: true,
                        diploma_translations: {
                            select: {
                                locale: true,
                                name: true
                            }
                        }
                    }
                }
            }
        },
        program_job_titles: {
            select: {
                job_titles: {
                    select: {
                        id: true,
                        salary: true,
                        job_titles_translations: {
                            select: {
                                locale: true,
                                title: true
                            }
                        }
                    }
                }
            }
        }
    }

    private formatProgram(program: any) {
        const names: Record<string, string> = { en: "", fr: "", ar: "" }
        program.program_translations.forEach((trans: any) => {
            const l = trans.locale.toLowerCase()
            if (l === 'en' || l === 'fr' || l === 'ar')
                names[l] = trans.name || ""
        })
        const categoryNames: Record<string, string> = { en: "", fr: "", ar: "" }
        if (program.categories?.category_translations)
        {
            program.categories.category_translations.forEach((trans: any) => {
                const l = trans.locale.toLowerCase()
                if (l === 'en' || l === 'fr' || l === 'ar')
                    categoryNames[l] = trans.name || ""
            })
        }
        const diplomaNames: Record<string, string> = { en: "", fr: "", ar: "" }
        if (program.diplomas?.diploma_translations)
        {
            program.diplomas.diploma_translations.forEach((trans: any) => {
                const l = trans.locale.toLowerCase()
                if (l === 'en' || l === 'fr' || l === 'ar')
                    diplomaNames[l] = trans.name || ""
            })
        }
        const uniNames: Record<string, string> = { en: "", fr: "", ar: "" }
        const uniDescriptions: Record<string, string> = { en: "", fr: "", ar: "" }
        if (program.universities?.university_translations)
        {
            program.universities.university_translations.forEach((trans: any) => {
                const l = trans.locale.toLowerCase()
                if (l === 'en' || l === 'fr' || l === 'ar')
                {
                    uniNames[l] = trans.name || ""
                    uniDescriptions[l] = trans.description || ""
                }
            })
        }
        const requirements = program.program_requirements.map((req: any) => {
            const reqDiplomaNames: Record<string, string> = { en: "", fr: "", ar: "" }
            if (req.diplomas?.diploma_translations)
            {
                req.diplomas.diploma_translations.forEach((trans: any) => {
                    const l = trans.locale.toLowerCase()
                    if (l === 'en' || l === 'fr' || l === 'ar')
                        reqDiplomaNames[l] = trans.name || ""
                })
            }
            return {
                id: req.id,
                minGrade: req.min_grade,
                maxYearsSinceGraduation: req.max_years_since_graduation,
                requirementGroup: req.requirement_group,
                requiredDiploma: req.diplomas ? {
                    id: req.diplomas.id,
                    code: req.diplomas.code,
                    rank: req.diplomas.rank,
                    name: reqDiplomaNames
                } : null
            }
        })
        const jobTitles = program.program_job_titles.map((pjt: any) => {
            const titleNames: Record<string, string> = { en: "", fr: "", ar: "" }
            if (pjt.job_titles?.job_titles_translations)
            {
                pjt.job_titles.job_titles_translations.forEach((trans: any) => {
                    const l = trans.locale.toLowerCase()
                    if (l === 'en' || l === 'fr' || l === 'ar')
                        titleNames[l] = trans.title || ""
                })
            }
            return {
                id: pjt.job_titles.id,
                salary: pjt.job_titles.salary,
                title: titleNames
            }
        })
        return {
            id: program.id,
            name: names,
            yearsOfStudy: program.years_of_study,
            monthlySubscription: Number(program.monthly_subscription),
            maxAge: program.max_age,
            hasConcours: program.has_concours,
            diplomaRecognitionAbroadStatus: program.diploma_recognition_abroad_status,
            diplomaRecognitionMoroccoStatus: program.diploma_recognition_morocco_status,
            category: program.categories ? {
                id: program.categories.id,
                slug: program.categories.name,
                name: categoryNames
            } : null,
            outputDiploma: program.diplomas ? {
                id: program.diplomas.id,
                code: program.diplomas.code,
                rank: program.diplomas.rank,
                name: diplomaNames
            } : null,
            university: program.universities ? {
                id: program.universities.id,
                type: program.universities.type,
                abbreviation: program.universities.abreviation,
                internatAvailable: program.universities.internat_available,
                bourseAvailable: program.universities.bourse_available,
                name: uniNames,
                description: uniDescriptions
            } : null,
            requirements: requirements,
            jobTitles: jobTitles
        }
    }

    async createProgram(req: Request, res: Response, lang: string, body: CreateProgramDto) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const localeMap = { en: 'EN', fr: 'FR', ar: 'AR' } as const
            const newProgramId = await this.prisma.$transaction(async (trans) => {
                const program = await trans.programs.create({
                    data: {
                        university_id: body.universityId,
                        category_id: body.categoryId,
                        output_diploma_id: body.outputDiplomaId,
                        years_of_study: body.yearsOfStudy,
                        monthly_subscription: body.monthlySubscription,
                        max_age: body.maxAge ?? null,
                        has_concours: body.hasConcours,
                        is_approved: true,
                        diploma_recognition_abroad_status: body.diplomaRecognitionAbroadStatus ?? null,
                        diploma_recognition_morocco_status: body.diplomaRecognitionMoroccoStatus ?? null
                    }
                })
                for (const locale of ['en', 'fr', 'ar'] as const)
                {
                    await trans.program_translations.create({
                        data: { 
                            program_id: program.id, 
                            locale: localeMap[locale], 
                            name: body.name[locale] 
                        }
                    })
                }
                for (const requirement of body.requirements)
                {
                    await trans.program_requirements.create({
                        data: {
                            program_id: program.id,
                            required_diploma_id: requirement.requiredDiplomaId,
                            min_grade: requirement.minGrade,
                            max_years_since_graduation: requirement.maxYearsSinceGraduation ?? null,
                            requirement_group: requirement.requirementGroup ?? 1
                        }
                    })
                }
                await trans.program_job_titles.createMany({
                    data: body.jobTitles.map(jobTitle => ({
                        program_id: program.id,
                        job_title_id: jobTitle.id
                    }))
                })
                return program.id
            })
            const createdProgram = await this.prisma.programs.findUnique({
                where: { 
                    id: newProgramId 
                },
                include: this.programInclude
            })
            return res.status(201).json({success: true, program: this.formatProgram(createdProgram), message: this.getMessage(lang, 'createProgramSuccess')})
        }
        catch (error: any)
        {
            if (error.code === 'P2002' && error.meta?.modelName === 'program_requirements')
                return res.status(400).json({success: false, message: this.getMessage(lang, 'diplomaRequirementDuplicate')})
            if (error.code === 'P2002' && error.meta?.modelName === 'program_job_titles')
                return res.status(400).json({success: false, message: this.getMessage(lang, 'jobTitleDuplicate')})
            return res.status(500).json({success: false, message: this.getMessage(lang, 'createProgramGeneralError')})
        }
    }

    async getApprovedPrograms(req: Request, res: Response, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        // if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
        //     return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const programs = await this.prisma.programs.findMany({
                where: { 
                    is_approved: true 
                },
                include: this.programInclude,
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'desc' }
                ],
            })
            return res.status(200).json({success: true, programs: programs.map(p => this.formatProgram(p))})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'getProgramsGeneralError')})
        }
    }

    async getNonApprovedPrograms(req: Request, res: Response, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const programs = await this.prisma.programs.findMany({
                where: { 
                    is_approved: false 
                },
                include: this.programInclude,
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'desc' }
                ],
            })
            return res.status(200).json({success: true, programs: programs.map(p => this.formatProgram(p))})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'getProgramsGeneralError')})
        }
    }

    async getAllUniversities(req: Request, res: Response, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const unis = await this.prisma.universities.findMany({
                where: {
                    is_approved: true,
                },
                select: {
                    id: true,
                    university_translations: {
                        select: {
                            locale: true,
                            name: true
                        }
                    }
                }
            })
            const data = unis.map(uni => {
                const nameObject: { [key: string]: string } = {}
                uni.university_translations.forEach(translation => {
                    nameObject[translation.locale.toLowerCase()] = translation.name
                })
                return {
                    id: uni.id,
                    name: {
                        ar: nameObject.ar,
                        fr: nameObject.fr,
                        en: nameObject.en
                    }
                }
            })
            return res.status(200).json({success: true, universities: data})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'getUniversitiesGeneralError')})
        }
    }

    async getAllCategories(req: Request, res: Response, lang: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        // if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
        //     return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const categories = await this.prisma.categories.findMany({
                select: {
                    id: true,
                    name: true,
                    category_translations: {
                        select: {
                            locale: true,
                            name: true,
                        }
                    }
                }
            })
            const data = categories.map(cat => {
                const nameObject: { [key: string]: string } = {}
                cat.category_translations.forEach(translation => {
                    nameObject[translation.locale.toLowerCase()] = translation.name
                })
                return {
                    id: cat.id,
                    slug: cat.name,
                    name: {
                        ar: nameObject.ar,
                        fr: nameObject.fr,
                        en: nameObject.en
                    }
                }
            })
            return res.status(200).json({success: true, categories: data})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'getCategoriesGeneralError')})
        }
    }

    async approveProgram(req: Request, res: Response, lang: string, id: string, body: ApproveProgramDto) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const existingProgram = await this.prisma.programs.findUnique({
                where: { 
                    id 
                },
                select: {
                    id: true,
                    is_approved: true,
                    program_requirements: {
                        select: { 
                            id: true 
                        }
                    },
                    program_job_titles: {
                        select: { job_title_id: true }
                    }
                }
            })
            if (!existingProgram)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'approveProgramNotFound')})
            if (existingProgram.is_approved)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'programAlreadyApproved')})
            const existingRequirementIds = existingProgram.program_requirements.map(r => r.id)
            const submittedRequirementIds = body.requirements.map(r => r.id)
            const requirementIdsToDelete = existingRequirementIds.filter(reqId => !submittedRequirementIds.includes(reqId))
            const existingJobTitleIds = existingProgram.program_job_titles.map(pjt => pjt.job_title_id)
            const submittedJobTitleIds = body.jobTitles.map(jt => jt.id)
            const jobTitleIdsToDelete = existingJobTitleIds.filter(jtId => !submittedJobTitleIds.includes(jtId))
            const jobTitleIdsToAdd = submittedJobTitleIds.filter(jtId => !existingJobTitleIds.includes(jtId))
            await this.prisma.$transaction(async (trans) => {
                await trans.programs.update({
                    where: { id },
                    data: {
                        is_approved: true,
                        university_id: body.university.id,
                        category_id: body.category.id,
                        output_diploma_id: body.outputDiploma.id,
                        years_of_study: body.yearsOfStudy,
                        monthly_subscription: body.monthlySubscription,
                        max_age: body.maxAge ?? null,
                        has_concours: body.hasConcours,
                        diploma_recognition_abroad_status: body.diplomaRecognitionAbroadStatus ?? null,
                        diploma_recognition_morocco_status: body.diplomaRecognitionMoroccoStatus ?? null
                    }
                })
                const localeMap = { en: 'EN', fr: 'FR', ar: 'AR' } as const
                for (const locale of ['en', 'fr', 'ar'] as const)
                {
                    await trans.program_translations.upsert({
                        where: { 
                            program_id_locale: { 
                                program_id: id, 
                                locale: localeMap[locale] 
                            } 
                        },
                        update: { name: body.name[locale] },
                        create: { 
                            program_id: id, 
                            locale: localeMap[locale], 
                            name: body.name[locale] 
                        }
                    })
                }
                if (requirementIdsToDelete.length > 0)
                {
                    await trans.program_requirements.deleteMany({
                        where: { 
                            id: { 
                                in: requirementIdsToDelete 
                            } 
                        }
                    })
                }
                for (const requirement of body.requirements)
                {
                    const requirementData = {
                        required_diploma_id: requirement.requiredDiploma.id,
                        min_grade: requirement.minGrade,
                        max_years_since_graduation: requirement.maxYearsSinceGraduation ?? null,
                        requirement_group: requirement.requirementGroup ?? 1
                    }
                    if (existingRequirementIds.includes(requirement.id))
                    {
                        await trans.program_requirements.update({
                            where: { id: requirement.id },
                            data: requirementData
                        })
                    }
                    else
                    {
                        await trans.program_requirements.create({
                            data: { 
                                id: requirement.id, 
                                program_id: id, 
                                ...requirementData 
                            }
                        })
                    }
                }
                if (jobTitleIdsToDelete.length > 0)
                {
                    await trans.program_job_titles.deleteMany({
                        where: {
                            program_id: id,
                            job_title_id: { in: jobTitleIdsToDelete }
                        }
                    })
                }
                if (jobTitleIdsToAdd.length > 0)
                {
                    await trans.program_job_titles.createMany({
                        data: jobTitleIdsToAdd.map(jobTitleId => ({
                            program_id: id,
                            job_title_id: jobTitleId
                        }))
                    })
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'approveProgramSuccess')})
        }
        catch (error: any)
        {
            if (error.code === 'P2002' && error.meta.modelName === 'program_requirements')
                return res.status(400).json({success: false, message: this.getMessage(lang, 'diplomaRequirementDuplicate')})
            if (error.code === 'P2002' && error.meta.modelName === 'program_job_titles')
                return res.status(400).json({success: false, message: this.getMessage(lang, 'jobTitleDuplicate')})
            return res.status(500).json({success: false, message: this.getMessage(lang, 'approveProgramGeneralError')})
        }
    }

    async rejectProgram(req: Request, res: Response, lang: string, id: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const program = await this.prisma.programs.findUnique({
                where: {
                    id
                }
            })
            if (!program)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'rejectProgramNotFound')})
            if (program.is_approved)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'programAlreadyApprovedForReject')})
            await this.prisma.programs.delete({
                where: {id}
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'rejectProgramSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'rejectProgramGeneralError')})
        }
    }

    async updateProgram(req: Request, res: Response, lang: string, id: string, body: UpdateProgramDto) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const existingProgram = await this.prisma.programs.findUnique({
                where: { id },
                select: {
                    id: true,
                    program_requirements: {
                        select: { id: true }
                    },
                    program_job_titles: {
                        select: { job_title_id: true }
                    }
                }
            })
            if (!existingProgram)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'updateProgramNotFound')})
            const existingRequirementIds = existingProgram.program_requirements.map(r => r.id)
            const submittedRequirementIds = body.requirements.map(r => r.id)
            const requirementIdsToDelete = existingRequirementIds.filter(reqId => !submittedRequirementIds.includes(reqId))
            const existingJobTitleIds = existingProgram.program_job_titles.map(pjt => pjt.job_title_id)
            const submittedJobTitleIds = body.jobTitles.map(jt => jt.id)
            const jobTitleIdsToDelete = existingJobTitleIds.filter(jtId => !submittedJobTitleIds.includes(jtId))
            const jobTitleIdsToAdd = submittedJobTitleIds.filter(jtId => !existingJobTitleIds.includes(jtId))
            await this.prisma.$transaction(async (trans) => {
                await trans.programs.update({
                    where: { id },
                    data: {
                        university_id: body.university.id,
                        category_id: body.category.id,
                        output_diploma_id: body.outputDiploma?.id ?? null,
                        years_of_study: body.yearsOfStudy,
                        monthly_subscription: body.monthlySubscription,
                        max_age: body.maxAge ?? null,
                        has_concours: body.hasConcours,
                        diploma_recognition_abroad_status: body.diplomaRecognitionAbroadStatus ?? null,
                        diploma_recognition_morocco_status: body.diplomaRecognitionMoroccoStatus ?? null
                    }
                })
                const localeMap = { en: 'EN', fr: 'FR', ar: 'AR' } as const
                for (const locale of ['en', 'fr', 'ar'] as const)
                {
                    await trans.program_translations.upsert({
                        where: { 
                            program_id_locale: { 
                                program_id: id, 
                                locale: localeMap[locale] 
                            } 
                        },
                        update: { name: body.name[locale] },
                        create: { 
                            program_id: id, 
                            locale: localeMap[locale], 
                            name: body.name[locale] 
                        }
                    })
                }
                if (requirementIdsToDelete.length > 0)
                {
                    await trans.program_requirements.deleteMany({
                        where: { 
                            id: { 
                                in: requirementIdsToDelete 
                            } 
                        }
                    })
                }
                for (const requirement of body.requirements)
                {
                    const requirementData = {
                        required_diploma_id: requirement.requiredDiploma?.id ?? null,
                        min_grade: requirement.minGrade ?? null,
                        max_years_since_graduation: requirement.maxYearsSinceGraduation ?? null,
                        requirement_group: requirement.requirementGroup ?? 1
                    }
                    if (existingRequirementIds.includes(requirement.id))
                    {
                        await trans.program_requirements.update({
                            where: { id: requirement.id },
                            data: requirementData
                        })
                    }
                    else
                    {
                        await trans.program_requirements.create({
                            data: { 
                                id: requirement.id, 
                                program_id: id, 
                                ...requirementData 
                            }
                        })
                    }
                }
                if (jobTitleIdsToDelete.length > 0)
                {
                    await trans.program_job_titles.deleteMany({
                        where: {
                            program_id: id,
                            job_title_id: { in: jobTitleIdsToDelete }
                        }
                    })
                }
                if (jobTitleIdsToAdd.length > 0)
                {
                    await trans.program_job_titles.createMany({
                        data: jobTitleIdsToAdd.map(jobTitleId => ({
                            program_id: id,
                            job_title_id: jobTitleId
                        }))
                    })
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'updateProgramSuccess')})
        }
        catch (error: any)
        {
            if (error.code === 'P2002' && error.meta.modelName === 'program_requirements')
                return res.status(400).json({success: false, message: this.getMessage(lang, 'diplomaRequirementDuplicate')})
            if (error.code === 'P2002' && error.meta.modelName === 'program_job_titles')
                return res.status(400).json({success: false, message: this.getMessage(lang, 'jobTitleDuplicate')})
            return res.status(500).json({success: false, message: this.getMessage(lang, 'updateProgramGeneralError')})
        }
    }

    async deleteProgram(req: Request, res: Response, lang: string, id: string) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const programs = await this.prisma.programs.findUnique({
                where: {
                    id
                }
            })
            if (!programs)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'deleteProgramNotFound')})
            await this.prisma.programs.delete({
                where: {
                    id
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'deleteProgramSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'deleteProgramGeneralError')})
        }
    }

}