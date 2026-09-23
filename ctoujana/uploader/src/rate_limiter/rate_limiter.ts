import { RateLimiterMemory } from 'rate-limiter-flexible'
import type { Request, Response, NextFunction } from 'express'

const limiter = new RateLimiterMemory({
    points: 15,
    duration: 60,
    blockDuration: 5 * 60
})

export const uploaderLimiter = async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'POST') 
        return next()
    const ip = req.ip!
    try 
    {
        await limiter.consume(ip)
        next()
    } 
    catch (error) 
    {
        const lang = (req.query.lang as string) || 'en'
        const Errormessage: Record<string, string> = {
            en: "Too many upload requests, please try again in 5 minutes.",
            fr: "Trop de requêtes de téléchargement, veuillez réessayer dans 5 minutes.",
            ar: "عدد كبير جدًا من طلبات الرفع، يرجى المحاولة مرة أخرى بعد خمس دقائق."
        }
        const message = Errormessage[lang] || Errormessage['en']
        return res.status(429).json({success: false, message})
    }
}