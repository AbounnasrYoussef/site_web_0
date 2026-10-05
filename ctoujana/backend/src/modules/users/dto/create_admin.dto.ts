import { IsString, MinLength, IsEmail, IsStrongPassword } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateAdminDto {

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    first_name?: string

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    last_name?: string

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    @IsEmail()
    email?: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }, {
        message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'
    })
    password?: string;
}