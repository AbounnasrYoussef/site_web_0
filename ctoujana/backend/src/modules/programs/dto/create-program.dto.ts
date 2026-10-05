// dto/create-program.dto.ts
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min, ValidateNested } from 'class-validator'

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

class CreateProgramRequirementDto {
    @IsString()
    @IsNotEmpty()
    requiredDiplomaId!: string

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

export class CreateProgramDto {
    @ValidateNested()
    @Type(() => ProgramNameDto)
    name!: ProgramNameDto

    @IsString()
    @IsNotEmpty()
    categoryId!: string

    @IsString()
    @IsNotEmpty()
    outputDiplomaId!: string

    @IsString()
    @IsNotEmpty()
    universityId!: string

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    yearsOfStudy!: number

    @Type(() => Number)
    @IsNumber()
    @Min(0)
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
    @Type(() => CreateProgramRequirementDto)
    requirements!: CreateProgramRequirementDto[]

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => JobTitleDto)
    jobTitles!: JobTitleDto[]
}