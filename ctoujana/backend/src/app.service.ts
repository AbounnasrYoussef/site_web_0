import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class AppService {

	constructor(private prisma: PrismaService) {}

	private messages = {
		en: {
			languageNotSupported: 'The selected language is not supported',
			missingUrl: 'Missing URL',
			coordinatesNotFound: 'Coordinates not found in this link',
			unableToResolve: 'Unable to resolve the link',
			fetchCitiesFailed: 'Failed to fetch cities'
		},
		fr: {
			languageNotSupported: "La langue sélectionnée n'est pas prise en charge",
			missingUrl: 'URL manquante',
			coordinatesNotFound: 'Coordonnées introuvables dans ce lien',
			unableToResolve: 'Impossible de résoudre le lien',
			fetchCitiesFailed: 'Échec de la récupération des villes'
		},
		ar: {
			languageNotSupported: 'اللغة المحددة غير مدعومة',
			missingUrl: 'الرابط مفقود',
			coordinatesNotFound: 'لم يتم العثور على إحداثيات في هذا الرابط',
			unableToResolve: 'تعذر حل الرابط',
			fetchCitiesFailed: 'فشل في جلب المدن'
		}
	}

	private getMessage(language: string, key: string) {
		return this.messages[language][key]
	}

  	async resolveGoogleMapsLink(req: Request, res: Response, lang: string, url: string) {
		if (!lang)
			lang = 'en'
		if (!['en', 'ar', 'fr'].includes(lang))
			return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
		try 
		{
			if (!url)
				return res.status(400).json({success: false, message: this.getMessage(lang, 'missingUrl')})  
			const response = await fetch(url as string, { redirect: 'follow' })
			const finalUrl = response.url
			const matching = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
			if (matching)
				return res.status(200).json({success: true, latitude: matching[1], longitude: matching[2]})
			return res.status(400).json({success: false, message: this.getMessage(lang, 'coordinatesNotFound')})
		}
		catch 
		{
			return res.status(500).json({success: false, message: this.getMessage(lang, 'unableToResolve')})
		}
	}

	async getAllCities(req: Request, res: Response) 
	{
		try 
		{
			const cities = await this.prisma.cities.findMany({
				include: { 
					city_translations: true 
				},
			})
			const result = cities.map((city) => {
				const name = {}
				city.city_translations.forEach(translation => {
					name[translation.locale.toLowerCase() as 'en' | 'fr' | 'ar'] = translation.name
				})
				return {name}
			})
			return res.status(200).json({success: true, cities: result})
		} 
		catch (error) 
		{
			return res.status(500).json({success: false, message: "Failed to fetch cities"})
		}
	}
}