import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsPositive, IsString, Max, Min, ValidateNested } from 'class-validator'

enum DiplomaRecognitionStatus {
    RECOGNIZED = 'RECOGNIZED',
    NOT_RECOGNIZED = 'NOT_RECOGNIZED',
    EVALUATION_REQUIRED = 'EVALUATION_REQUIRED'
}

class ProgramNameDto {
    @IsString()
    @IsNotEmpty()
    en!: string

    @IsString()
    @IsNotEmpty()
    fr!: string

    @IsString()
    @IsNotEmpty()
    ar!: string
}

class JobTitleDto {
    @IsString()
    @IsNotEmpty()
    id!: string

    @IsInt()
    @IsPositive()
    salary?: number

    @ValidateNested()
    @Type(() => ProgramNameDto)
    title?: ProgramNameDto
}

class UpdateProgramRequirementDto {
    @IsString()
    @IsNotEmpty()
    id!: string

    @IsObject()
    @IsNotEmptyObject()
    requiredDiploma!: { id: string }

    @Type(() => Number)
    @IsNumber()
    @Min(10)
    @Max(20)
    minGrade!: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxYearsSinceGraduation?: number | null

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    requirementGroup?: number
}

export class UpdateProgramDto {
    @IsString()
    @IsNotEmpty()
    id!: string
    
    @ValidateNested()
    @Type(() => ProgramNameDto)
    name!: ProgramNameDto

    @IsObject()
    @IsNotEmptyObject()
    university!: { id: string }

    @IsObject()
    @IsNotEmptyObject()
    category!: { id: string }

    @IsObject()
    @IsNotEmptyObject()
    outputDiploma!: { id: string }

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    yearsOfStudy!: number

    @IsNumber()
    monthlySubscription!: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    maxAge?: number | null

    @IsOptional()
    @IsEnum(DiplomaRecognitionStatus)
    diplomaRecognitionAbroadStatus?: DiplomaRecognitionStatus | null

    @IsOptional()
    @IsEnum(DiplomaRecognitionStatus)
    diplomaRecognitionMoroccoStatus?: DiplomaRecognitionStatus | null

    @IsBoolean()
    hasConcours!: boolean

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProgramRequirementDto)
    requirements!: UpdateProgramRequirementDto[]

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => JobTitleDto)
    jobTitles!: JobTitleDto[]
}