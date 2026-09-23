import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private env: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>()
        const locale = req.query?.lang || 'en'
        const token = req.headers.authorization?.split(' ')[1]
        if (!token)
            throw new UnauthorizedException('No token provided')
        const auth_backend = this.env.get<string>('AUTH_API_URL')!
        console.log(auth_backend)
        try
        {
            const res = await fetch(`${auth_backend}/api/auth/validate?locale=${locale}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (!data.valid)
                throw new UnauthorizedException(data.error)
            req.user = data.user
            return true
        }
        catch (error: any)
        {
            throw new UnauthorizedException(error?.message || 'Invalid or expired token')
        }
    }
}