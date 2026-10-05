import { IsString, IsBoolean, IsNumber, IsLatitude, IsLongitude, IsUrl, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateUniversityLocationDto {

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    city?: string

    @Transform(({ value }) => value?.trim?.())
    @IsString()
    @MinLength(1)
    @IsUrl({require_tld: false, require_protocol: true})
    website?: string

    @IsLongitude() 
    longitude?: string

    @IsLatitude() 
    latitude?: string
}