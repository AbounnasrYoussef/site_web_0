import { IsOptional, IsString, IsUrl, IsLatitude, IsLongitude } from 'class-validator'

export class UpdateUniversityLocationDto {
    @IsOptional() 
    @IsUrl() 
    website?: string

    @IsOptional() 
    @IsLongitude() 
    longitude?: string

    @IsOptional() 
    @IsLatitude() 
    latitude?: string

    @IsOptional() 
    @IsString() 
    city?: string
}