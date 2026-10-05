import { IsOptional, IsEnum, IsBoolean, IsString, IsObject, IsArray, ValidateNested, IsLatitude, IsLongitude } from 'class-validator'
import { Type } from 'class-transformer'
import { university_type } from '@prisma/client'

export class ApproveLocalizedTextDto {
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

export class ApproveLocationDto {
    @IsOptional()
    @IsString()
    id?: string

    @IsOptional()
    @IsString()
    city?: string

    @IsOptional()
    @IsString()
    website?: string

    @IsOptional()
    @IsString()
    image_url?: string

    @IsOptional()
    @IsLatitude()
    latitude?: string

    @IsOptional()
    @IsLongitude()
    longitude?: string
}

export class ApproveUniversityDto {
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
    @Type(() => ApproveLocalizedTextDto)
    name?: ApproveLocalizedTextDto

    @IsOptional() 
    @IsObject() 
    @ValidateNested() 
    @Type(() => ApproveLocalizedTextDto)
    description?: ApproveLocalizedTextDto

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ApproveLocationDto)
    locations?: ApproveLocationDto[]
}