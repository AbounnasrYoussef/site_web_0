import { Type } from 'class-transformer'
import { IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

class DiplomaNameDto {
    @IsString()
    @IsNotEmpty()
    en?: string

    @IsString()
    @IsNotEmpty()
    fr?: string

    @IsString()
    @IsNotEmpty()
    ar?: string
}

export class CreateDiplomaDto {

    @IsIn([12, 14, 15, 17, 20])
    rank?: number

    @ValidateNested()
    @Type(() => DiplomaNameDto)
    name?: DiplomaNameDto
}