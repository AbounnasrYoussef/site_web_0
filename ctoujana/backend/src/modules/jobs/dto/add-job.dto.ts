import { Type } from 'class-transformer'
import { IsNotEmpty, IsInt, IsString, ValidateNested, IsPositive } from 'class-validator'

class JobNameDto {
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

export class AddJobDto {

    @IsInt()
    @IsPositive()
    salary?: number

    @ValidateNested()
    @Type(() => JobNameDto)
    title?: JobNameDto

}