import { IsEnum, IsNotEmpty } from 'class-validator'
import { user_type } from '@prisma/client'

export class UpdateRoleDto {
    @IsNotEmpty()
    @IsEnum(user_type, {
        message: 'Invalid role. Please provide a valid user role.',
    })
    newRole?: user_type
}