import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import { PrismaService } from 'src/prisma/prisma.service'
import { UpdateUniversityDto } from './dto/update_uni.dto'
import { CreateUniversityDto } from './dto/create_uni.dto'
import { UpdateUniversityLocationDto } from './dto/update_uni_loc.dto'
import { university_type } from '@prisma/client'
import { locale_type } from '@prisma/client'
import { CreateUniversityLocationDto } from './dto/create_uni_loc.dto'
import { ApproveUniversityDto } from './dto/approve_uni.dto'
import { UploaderService } from './uploader.service'

@Injectable()
export class UniversitiesService {

    constructor(private prisma: PrismaService, private uploaderService: UploaderService) {}

    private messages = {
        en: {
            universitiesError: 'An error occurred while trying to fetch all universities',
            nonApprovedError: 'An error occurred while trying to fetch non-approved universities',
            languageNotSupported: 'The selected language is not supported',
            universityByIdNotFoundError: 'An error occured while trying to fetch the university',
            universityByIdNotFound: 'The university you are looking for does not exist',
            deleteUniversityByIdError: 'An error occured while trying to delete the university',
            deleteUniversityByIdSuccess: 'The university has been deleted succesfully',
            invalidQueryValue: 'The query param value is invalid',
            approveUniversityError: 'An error occured while trying to approve this university',
            approveUniversityExistError: 'This university is already approved by an admin',
            approvedUniversitySuccess: 'The university has been approved succesfully',
            rejectUniversityError: 'An error occured while trying to reject this university',
            rejectUniversityExist: 'This university is already rejected by an admin',
            rejectUniversitySuccess: 'The university has been rejected succesfully',
            updateUniversityByIdError: 'An error occured while trying to update this university',
            updateUniversityByIdNoField: 'No fields to update',
            updateUniversityByIdSuccess: 'The fields are updated succesfully',
            createUniversityError: "An error occured while trying to create the university",
            locationNotFound: "This location does not exist",
            updateLocationSuccess: "The location information for this university updated succesfully",
            updateLocationError: "An error occured while trying to update the location for this university",
            createLocationError: "An error occured while trying to create location for this university",
            createUniversitySuccess: "The university has been added succesfully",
            createLocationSuccess: "A new location has been added for the university",
            cityNotFound: "This city does not exist",
            locationAlreadyExists: "This location for this university already exists",
            notAuthorizedAdmin: "You are not authorized to access this",
            universityAlreadyExists: 'A university with this abbreviation already exists',
            imageUploadError: 'An error occurred while trying to upload the image'
        },
        fr: {
            universitiesError: "Une erreur s'est produite lors de la récupération des universités",
            nonApprovedError: "Une erreur s'est produite lors de la récupération des universités non approuvées",
            languageNotSupported: "La langue sélectionnée n'est pas prise en charge",
            universityByIdNotFoundError: "Une erreur s'est produite lors de la récupération de l'université",
            universityByIdNotFound: "L'université que vous recherchez n'existe pas",
            deleteUniversityByIdError: "Une erreur s'est produite lors de la tentative de suppression de l'université",
            deleteUniversityByIdSuccess: "L'université a été supprimée avec succès",
            invalidQueryValue: 'La valeur du paramètre de requête est invalide',
            approveUniversityError: "Une erreur s'est produite lors de la tentative d'approbation de cette université",
            approveUniversityExistError: 'Cette université est déjà approuvée par un administrateur',
            approvedUniversitySuccess: "L'université a été approuvée avec succès",
            rejectUniversityError: "Une erreur s'est produite lors de la tentative de rejet de cette université",
            rejectUniversityExist: "Cette université a déjà été rejetée par un administrateur",
            rejectUniversitySuccess: "L'université a été rejetée avec succès",
            updateUniversityByIdError: "Une erreur s'est produite lors de la tentative de mise à jour de cette université",
            updateUniversityByIdNoField: 'Aucun champ à mettre à jour',
            updateUniversityByIdSuccess: 'Les champs ont été mis à jour avec succès',
            createUniversityError: "Une erreur s'est produite lors de la tentative de création de l'université",
            locationNotFound: "Cet emplacement n'existe pas",
            updateLocationSuccess: 'Les informations de localisation de cette université ont été mises à jour avec succès',
            updateLocationError: "Une erreur s'est produite lors de la tentative de mise à jour de l'emplacement de cette université",
            createLocationError: "Une erreur s'est produite lors de la tentative de création de l'emplacement pour cette université",
            createUniversitySuccess: "L'université a été ajoutée avec succès",
            createLocationSuccess: "Un nouvel emplacement a été ajouté pour l'université",
            cityNotFound: "Cette ville n'existe pas",
            locationAlreadyExists: 'Cet emplacement pour cette université existe déjà',
            notAuthorizedAdmin: "Vous n'êtes pas autorisé",
            universityAlreadyExists: 'Une université avec cette abréviation existe déjà',
            imageUploadError: "Une erreur s'est produite lors du téléchargement de l'image"
        },
        ar: {
            universitiesError: 'حدث خطأ أثناء محاولة جلب الجامعات',
            nonApprovedError: 'حدث خطأ أثناء محاولة جلب الجامعات غير المعتمدة',
            languageNotSupported: 'اللغة المحددة غير مدعومة',
            universityByIdNotFoundError: 'حدث خطأ أثناء محاولة جلب بيانات الجامعة',
            universityByIdNotFound: 'الجامعة التي تبحث عنها غير موجودة',
            deleteUniversityByIdError: 'حدث خطأ أثناء محاولة حذف الجامعة',
            deleteUniversityByIdSuccess: 'تم حذف الجامعة بنجاح',
            invalidQueryValue: 'قيمة معلمة الاستعلام غير صالحة',
            approveUniversityError: 'حدث خطأ أثناء محاولة الموافقة على هذه الجامعة',
            approveUniversityExistError: 'تمت الموافقة على هذه الجامعة بالفعل من قبل مسؤول',
            approvedUniversitySuccess: 'تمت الموافقة على الجامعة بنجاح',
            rejectUniversityError: 'حدث خطأ أثناء محاولة رفض هذه الجامعة',
            rejectUniversityExist: "تم رفض هذه الجامعة بالفعل من قِبل مسؤول",
            rejectUniversitySuccess: "تم رفض الجامعة بنجاح",
            updateUniversityByIdError: 'حدث خطأ أثناء محاولة تحديث هذه الجامعة',
            updateUniversityByIdNoField: 'لا توجد حقول لتحديثها',
            updateUniversityByIdSuccess: 'تم تحديث الحقول بنجاح',
            createUniversityError: 'حدث خطأ أثناء محاولة إنشاء الجامعة',
            locationNotFound: 'هذا الموقع غير موجود',
            updateLocationSuccess: 'تم تحديث معلومات الموقع لهذه الجامعة بنجاح',
            updateLocationError: 'حدث خطأ أثناء محاولة تحديث موقع هذه الجامعة',
            createLocationError: 'حدث خطأ أثناء محاولة إنشاء موقع لهذه الجامعة',
            createUniversitySuccess: 'تمت إضافة الجامعة بنجاح',
            createLocationSuccess: 'تمت إضافة موقع جديد للجامعة',
            cityNotFound: 'هذه المدينة غير موجودة',
            locationAlreadyExists: 'هذا الموقع لهذه الجامعة موجود بالفعل',
            notAuthorizedAdmin: "غير مصرح لك",
            universityAlreadyExists: 'توجد بالفعل جامعة بهذا الاختصار',
            imageUploadError: 'حدث خطأ أثناء محاولة تحميل الصورة'
        },
    }

    private getMessage(language: string, key: string) {
        return this.messages[language][key]
    }

    async createUniversity(lang: string, body: CreateUniversityDto, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            if (!req.body)
                return res.status(400).json({success: false, message: 'No body is provided'})
            const { type, internatAvailable, bourseAvailable, abbreviation, name, description } = body
            const existing = await this.prisma.universities.findFirst({
                where: { abreviation: abbreviation }
            })
            if (existing)
                return res.status(409).json({success: false, message: this.getMessage(lang, 'universityAlreadyExists')})
            const locales: Array<'en' | 'fr' | 'ar'> = ['en', 'fr', 'ar']
            const newUni = await this.prisma.universities.create({
                data: {
                    type: type as university_type,
                    internat_available: internatAvailable,
                    bourse_available: bourseAvailable,
                    abreviation: abbreviation,
                    is_approved: true,
                    university_translations: {
                        create: locales.map(locale => ({
                            locale: locale.toUpperCase() as locale_type,
                            name: name?.[locale] as string,
                            description: description?.[locale] as string
                        }))
                    }
                }
            })
            return res.status(201).json({success: true, message: this.getMessage(lang, 'createUniversitySuccess'), university: newUni})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'createUniversityError')})
        }
    }

    async createLocationForUniversity(uniId: string, lang: string, body: CreateUniversityLocationDto, image: Express.Multer.File, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try 
        {
            const { city, website, longitude, latitude } = body
            const uni = await this.prisma.universities.findUnique({
                where: { 
                    id: uniId 
                }
            })
            if (!uni)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'universityByIdNotFound')})
            const cityTranslation = await this.prisma.city_translations.findFirst({
                where: {
                    name: city, 
                    locale: lang.toUpperCase() as locale_type
                }
            })
            if (!cityTranslation)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'cityNotFound')})
            let image_url = ''
            if (image)
            {
                const uploadResult = await this.uploaderService.uploadImage(image, 'universities', lang)
                if ('error' in uploadResult)
                    return res.status(uploadResult.status_code === 401 ? 401 : 500).json({success: false, message: this.getMessage(lang, 'imageUploadError')})
                image_url = uploadResult.path
            }
            const newLocation = await this.prisma.university_locations.create({
                data: {
                    university_id: uni.id,
                    city_id: cityTranslation.city_id,
                    website,
                    longitude,
                    latitude,
                    image_url
                }
            })
            return res.status(201).json({success: true, message: this.getMessage(lang, 'createLocationSuccess'), location: newLocation})
        }
        catch (error: any) 
        {
            if (error.code === 'P2002')
                return res.status(409).json({success: false, message: this.getMessage(lang, 'locationAlreadyExists')})
            return res.status(500).json({success: false, message: this.getMessage(lang, 'createLocationError')})
        }
    }

    async getApprovedUniversities(lang: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        // if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
        //     return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            let data: any
            const unis = await this.prisma.universities.findMany({
                where: { 
                    is_approved: true 
                },
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'desc' }
                ],
                select: {
                    id: true,
                    type: true,
                    is_approved: true,
                    internat_available: true,
                    bourse_available: true,
                    abreviation: true,
                    university_locations: {
                        select: {
                            id: true,
                            website: true,
                            longitude: true,
                            latitude: true,
                            image_url: true,
                            cities: {
                                select: {
                                    city_translations: {
                                        select: {
                                            locale: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    university_translations: {
                        select: {
                            locale: true,
                            name: true,
                            description: true,
                        }
                    }
                }
            })
            data = unis.map(uni => {
                const locations: any = []
                uni.university_locations.forEach(loc => {
                    const cityNames: Record<string, string> = { en: "", fr: "", ar: "" }
                    if (loc.cities?.city_translations) 
                    {
                        loc.cities.city_translations.forEach(trans => {
                            const l = trans.locale.toLowerCase()
                            if (l === 'en' || l === 'fr' || l === 'ar')
                                cityNames[l] = trans.name || ""
                        })
                    }
                    const elements = {
                        id: loc.id,
                        city: cityNames,
                        website: loc.website || "",
                        longitude: loc.longitude || "",
                        latitude: loc.latitude || "",
                        image_url: loc.image_url || "",
                    }
                    locations.push(elements)
                })
                const names: Record<string, string> = { en: "", fr: "", ar: "" }
                const descriptions: Record<string, string> = { en: "", fr: "", ar: "" }
                uni.university_translations.forEach(trans => {
                    const l = trans.locale.toLowerCase()
                    if (l === 'en' || l === 'fr' || l === 'ar') 
                    {
                        names[l] = trans.name || ""
                        descriptions[l] = trans.description || ""
                    }
                })
                return {
                    id: uni.id,
                    type: uni.type,
                    abbreviation: uni.abreviation,
                    bourseAvailable: uni.bourse_available,
                    internatAvailable: uni.internat_available,
                    name: names,
                    description: descriptions,
                    locations: locations
                }
            })
            return res.status(200).json({success: true, universities: data})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'universitiesError')})
        }
    }

    async getNonApprovedUniversities(lang: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            let data: any
            const unis = await this.prisma.universities.findMany({
                where: {
                    is_approved: false
                },
                orderBy: [
                    { created_at: 'desc' },
                    { id: 'desc' }
                ],
                select: {
                    id: true,
                    type: true,
                    is_approved: true,
                    internat_available: true,
                    bourse_available: true,
                    abreviation: true,
                    university_locations: {
                        select: {
                            id: true,
                            website: true,
                            longitude: true,
                            latitude: true,
                            image_url: true,
                            cities: {
                                select: {
                                    city_translations: {
                                        select: {
                                            locale: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    university_translations: {
                        select: {
                            locale: true,
                            name: true,
                            description: true,
                        }
                    }
                }
            })
            data = unis.map(uni => {
                const locations: any = []
                uni.university_locations.forEach(loc => {
                    const cityNames: Record<string, string> = { en: "", fr: "", ar: "" }
                    if (loc.cities?.city_translations) {
                        loc.cities.city_translations.forEach(trans => {
                            const l = trans.locale.toLowerCase()
                            if (l === 'en' || l === 'fr' || l === 'ar') {
                                cityNames[l] = trans.name || ""
                            }
                        })
                    }
                    const elements = {
                        id: loc.id,
                        city: cityNames,
                        website: loc.website || "",
                        longitude: loc.longitude || "",
                        latitude: loc.latitude || "",
                        image_url: loc.image_url || "",
                    }
                    locations.push(elements)
                })
                const names: Record<string, string> = { en: "", fr: "", ar: "" }
                const descriptions: Record<string, string> = { en: "", fr: "", ar: "" }
                uni.university_translations.forEach(trans => {
                    const l = trans.locale.toLowerCase()
                    if (l === 'en' || l === 'fr' || l === 'ar') {
                        names[l] = trans.name || ""
                        descriptions[l] = trans.description || ""
                    }
                })
                return {
                    id: uni.id,
                    type: uni.type,
                    abbreviation: uni.abreviation,
                    bourseAvailable: uni.bourse_available,
                    internatAvailable: uni.internat_available,
                    name: names,
                    description: descriptions,
                    locations: locations
                }
            })
            return res.status(200).json({success: true, universities: data})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'nonApprovedError')})
        }
    }

    async deleteUniversityById(id: string, lang: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const uni = await this.prisma.universities.findUnique({
                where: {
                    id: id
                },
                include: {
                    university_locations: true
                }
            })
            if (!uni)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'universityByIdNotFound')})
            for (const location of uni.university_locations) 
            {
                if (location.image_url)
                    await this.uploaderService.deleteImage(location.image_url, lang)
            }
            await this.prisma.universities.delete({
                where: {
                    id: id
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'deleteUniversityByIdSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'deleteUniversityByIdError')})
        }
    }

    async updateUniversityById(id: string, lang: string, body: UpdateUniversityDto, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({ success: false, message: this.getMessage('en', 'languageNotSupported') })
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const { type, internatAvailable, bourseAvailable, abbreviation, name, description } = body
            const hasAnyField = Object.values(body).some(v => v !== undefined)
            if (!hasAnyField)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'updateUniversityByIdNoField')})
            const uni = await this.prisma.universities.findUnique({
                where: { 
                    id 
                } 
            })
            if (!uni)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'universityByIdNotFound')})
            const uniTableUpdate: any = {}
            if (type) 
                uniTableUpdate.type = type
            if (internatAvailable !== undefined) 
                uniTableUpdate.internat_available = internatAvailable
            if (bourseAvailable !== undefined) 
                uniTableUpdate.bourse_available = bourseAvailable
            if (abbreviation) 
                uniTableUpdate.abreviation = abbreviation
            if (Object.keys(uniTableUpdate).length > 0)
            {
                await this.prisma.universities.update({ 
                    where: { 
                        id 
                    }, 
                    data: uniTableUpdate 
                })
            }
            const languages: Array<'en' | 'fr' | 'ar'> = ['en', 'fr', 'ar']
            for (const language of languages)
            {
                const localeName = name?.[language]
                const localeDescription = description?.[language]
                if (localeName === undefined && localeDescription === undefined)
                    continue
                const translationData: any = {}
                if (localeName !== undefined) 
                    translationData.name = localeName
                if (localeDescription !== undefined) 
                    translationData.description = localeDescription
                await this.prisma.university_translations.upsert({
                    where: { 
                        university_id_locale: { 
                            university_id: id, locale: language.toUpperCase() as locale_type 
                        } 
                    },
                    update: translationData,
                    create: {
                        university_id: id,
                        locale: language.toUpperCase() as locale_type,
                        name: localeName as string,
                        description: localeDescription
                    }
                })
            }
            return res.status(200).json({success: true, message: this.getMessage(lang, 'updateUniversityByIdSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'updateUniversityByIdError')})
        }
    }

    async updateUniversityLocation(uniId: string, locationId: string, lang: string, body: UpdateUniversityLocationDto, image: Express.Multer.File, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const { website, longitude, latitude, city } = body
            if (!image && Object.keys(body).every(k => body[k] === undefined))
                return res.status(400).json({success: false, message: this.getMessage(lang, 'updateUniversityByIdNoField')})
            const uni = await this.prisma.universities.findUnique({
                where: { 
                    id: uniId 
                }
            })
            if (!uni)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'universityByIdNotFound')})
            const location = await this.prisma.university_locations.findUnique({
                where: { 
                    id: locationId 
                }
            })
            if (!location || location.university_id !== uniId)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'locationNotFound')})
            const locTableUpdate: any = {}
            if (website !== undefined) 
                locTableUpdate.website = website
            if (longitude !== undefined) 
                locTableUpdate.longitude = longitude
            if (latitude !== undefined) 
                locTableUpdate.latitude = latitude
            if (image)
            {
                const uploadResult = await this.uploaderService.uploadImage(image, 'universities', lang)
                if ('error' in uploadResult)
                    return res.status(uploadResult.status_code === 401 ? 401 : 500).json({success: false, message: this.getMessage(lang, 'imageUploadError')})
                locTableUpdate.image_url = uploadResult.path
            }
            if (city !== undefined) 
            {
                const cityTranslation = await this.prisma.city_translations.findFirst({
                    where: { 
                        name: city, 
                        locale: lang.toUpperCase() as locale_type 
                    }
                })
                if (!cityTranslation)
                    return res.status(404).json({success: false, message: this.getMessage(lang, 'cityNotFound')})
                locTableUpdate.city_id = cityTranslation.city_id
            }
            await this.prisma.university_locations.update({
                where: { 
                    id: locationId 
                },
                data: locTableUpdate
            })
            if (image && location.image_url)
                await this.uploaderService.deleteImage(location.image_url, lang)
            return res.status(200).json({success: true, message: this.getMessage(lang, 'updateLocationSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'updateLocationError')})
        }
    }

    async deleteUniversityLocation(uniId: string, locationId: string, lang: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
                return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const uni = await this.prisma.universities.findUnique({ 
                where: { 
                    id: uniId 
                } 
            })
            if (!uni)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'universityByIdNotFound')})
            const location = await this.prisma.university_locations.findUnique({ 
                where: { 
                    id: locationId 
                } 
            })
            if (!location || location.university_id !== uniId)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'locationNotFound')})
            await this.prisma.university_locations.delete({ 
                where: { 
                    id: locationId 
                } 
            })
            if (location.image_url)
                await this.uploaderService.deleteImage(location.image_url, lang)
            return res.status(200).json({success: true, message: this.getMessage(lang, 'updateLocationSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'updateLocationError')})
        }
    }

    async approveUniversityById(id: string, lang: string, body: ApproveUniversityDto, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({ success: false, message: this.getMessage('en', 'languageNotSupported') })
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const uni = await this.prisma.universities.findUnique({
                where: { id },
                include: { university_locations: true }
            })
            if (!uni)
                return res.status(404).json({ success: false, message: this.getMessage(lang, 'universityByIdNotFound') })
            if (uni.is_approved)
                return res.status(409).json({ success: false, message: this.getMessage(lang, 'approveUniversityExistError') })
            const { type, internatAvailable, bourseAvailable, abbreviation, name, description, locations } = body
            await this.prisma.$transaction(async (transaction) => {
                const uniTableUpdate: any = {is_approved: true}
                if (type)
                    uniTableUpdate.type = type
                if (internatAvailable !== undefined) 
                    uniTableUpdate.internat_available = internatAvailable
                if (bourseAvailable !== undefined) 
                    uniTableUpdate.bourse_available = bourseAvailable
                if (abbreviation) 
                    uniTableUpdate.abreviation = abbreviation
                await transaction.universities.update({ 
                    where: { id }, 
                    data: uniTableUpdate 
                })
                const languages: Array<'en' | 'fr' | 'ar'> = ['en', 'fr', 'ar']
                for (const locale of languages)
                {
                    const localeName = name?.[locale]
                    const localeDescription = description?.[locale]
                    if (localeName === undefined && localeDescription === undefined)
                        continue
                    const translationData: any = {}
                    if (localeName !== undefined) 
                        translationData.name = localeName
                    if (localeDescription !== undefined) 
                        translationData.description = localeDescription
                    await transaction.university_translations.upsert({
                        where: { 
                            university_id_locale: {
                                university_id: id, 
                                locale: locale.toUpperCase() as locale_type 
                            }
                        },
                        update: translationData,
                        create: {
                            university_id: id,
                            locale: locale.toUpperCase() as locale_type,
                            name: localeName as string,
                            description: localeDescription as string
                        }
                    })
                }
                if (locations)
                {
                    const locationsToKeep: string[] = []
                    for (const loc of locations)
                    {
                        let cityId: string | undefined
                        if (loc.city !== undefined)
                        {
                            const cityTranslation = await transaction.city_translations.findFirst({
                                where: { 
                                    name: loc.city, 
                                    locale: lang.toUpperCase() as locale_type 
                                }
                            })
                            if (!cityTranslation)
                                throw new Error('CITY_NOT_FOUND')
                            cityId = cityTranslation.city_id
                        }
                        if (loc.id)
                        {
                            const existing = uni.university_locations.find(l => l.id === loc.id)
                            if (!existing)
                                throw new Error('LOCATION_NOT_FOUND')
                            const locTableUpdate: any = {}
                            if (loc.website !== undefined) 
                                locTableUpdate.website = loc.website
                            if (loc.longitude !== undefined) 
                                locTableUpdate.longitude = loc.longitude
                            if (loc.latitude !== undefined) 
                                locTableUpdate.latitude = loc.latitude
                            if (loc.image_url !== undefined) 
                                locTableUpdate.image_url = loc.image_url
                            if (cityId !== undefined) 
                                locTableUpdate.city_id = cityId
                            await transaction.university_locations.update({ 
                                where: { 
                                    id: loc.id }, 
                                    data: locTableUpdate 
                                })
                            locationsToKeep.push(loc.id)
                        }
                        else
                        {
                            const created = await transaction.university_locations.create({
                                data: {
                                    university_id: id,
                                    city_id: cityId as string,
                                    website: loc.website,
                                    longitude: loc.longitude,
                                    latitude: loc.latitude,
                                    image_url: loc.image_url
                                }
                            })
                            locationsToKeep.push(created.id)
                        }
                    }
                    const toDelete = uni.university_locations.filter(l => !locationsToKeep.includes(l.id))
                    if (toDelete.length)
                    {
                        await transaction.university_locations.deleteMany({
                            where: { 
                                id: { 
                                    in: toDelete.map(l => l.id) 
                                } 
                            }
                        })
                    }
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'approvedUniversitySuccess')})
        }
        catch (error: any)
        {
            if (error.message === 'CITY_NOT_FOUND')
                return res.status(404).json({success: false, message: this.getMessage(lang, 'cityNotFound')})
            if (error.message === 'LOCATION_NOT_FOUND')
                return res.status(404).json({success: false, message: this.getMessage(lang, 'locationNotFound')})
            return res.status(500).json({success: false, message: this.getMessage(lang, 'approveUniversityError')})
        }
    }

    async rejectUniversityById(id: string, lang: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const uni = await this.prisma.universities.findUnique({
                where: {
                    id: id
                }
            })
            if (!uni)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'universityByIdNotFound')})
            await this.prisma.universities.delete({
                where: {
                    id: uni.id
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'rejectUniversitySuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'rejectUniversityError')})
        }
    }
}