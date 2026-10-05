import { IsOptional, IsEnum, IsBoolean, IsString, IsObject, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { university_type } from '@prisma/client'

export class LocalizedTextDto {
    @IsOptional() 
    @IsString() 
    en?: string

    @IsOptional() 
    @IsString() 
    fr?: string

    @IsOptional() 
    @IsString() 
    ar?: string
}

export class UpdateUniversityDto {
    @IsOptional() 
    @IsEnum(university_type) 
    type?: university_type

    @IsOptional() 
    @IsBoolean() 
    internatAvailable?: boolean

    @IsOptional() 
    @IsBoolean() 
    bourseAvailable?: boolean

    @IsOptional() 
    @IsString() 
    abbreviation?: string

    @IsOptional() 
    @IsObject() 
    @ValidateNested() 
    @Type(() => LocalizedTextDto)
    name?: LocalizedTextDto

    @IsOptional() 
    @IsObject() 
    @ValidateNested() 
    @Type(() => LocalizedTextDto)
    description?: LocalizedTextDto
}