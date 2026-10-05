import { IsString, IsBoolean, IsEnum, MinLength, ValidateNested } from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { university_type } from '@prisma/client'

export class LocalizedTextDto {
    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    en?: string

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    fr?: string

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    ar?: string
}

export class CreateUniversityDto {
    @IsEnum(university_type)
    type?: university_type

    @IsBoolean()
    internatAvailable?: boolean

    @IsBoolean()
    bourseAvailable?: boolean

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    abbreviation?: string

    @ValidateNested()
    @Type(() => LocalizedTextDto)
    name?: LocalizedTextDto

    @ValidateNested()
    @Type(() => LocalizedTextDto)
    description?: LocalizedTextDto
}