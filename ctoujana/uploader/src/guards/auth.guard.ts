import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private env: ConfigService) {}

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request>()
        const uploader_key = this.env.get<string>('PRIVATE_UPLOADER_KEY')!
        const header = req.headers['x-uploader-key']
        if (!header || header !== uploader_key)
            throw new UnauthorizedException('Not authorized')
        return true
    }
}
