'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'
import { LuGraduationCap } from "react-icons/lu"
import { FaBookOpen } from "react-icons/fa"
import AllPrograms from './AllPrograms'
import { ProgramsSkeleton } from './ProgramsSkeleton'
import PendingPrograms from './PendingPrograms'
import { useAuthFetch } from '@/app/(zguellou)/hooks/useAuthFetch'
import { Jobs } from './JobsDashboard'

type LocalizedText = {en: string; fr: string; ar: string}
export type DiplomaRecognitionStatus = 'RECOGNIZED' | 'EVALUATION_REQUIRED' | 'NOT_RECOGNIZED'
type UniversityType = 'PUBLIC' | 'SEMI_PUBLIC' | 'PRIVATE'
type ViewMode = 'ALL' | 'PENDING'
export type DiplomasCategories = 'BAC' | 'BAC+2' | 'BAC+3' | 'BAC+5' | 'BAC+8'

export interface Diploma 
{
    id: string
    rank: number
    name: LocalizedText
}

export interface ProgramRequirement 
{
    id: string
    minGrade: string | null
    maxYearsSinceGraduation: number | null
    requirementGroup: number
    requiredDiploma: Diploma | null
}

export interface Program 
{
    id: string
    name: LocalizedText
    yearsOfStudy: number
    monthlySubscription: number
    maxAge: number | null
    hasConcours: boolean
    diplomaRecognitionAbroadStatus: DiplomaRecognitionStatus | null
    diplomaRecognitionMoroccoStatus: DiplomaRecognitionStatus | null
    category: {id: string; slug: string, name: LocalizedText} | null
    outputDiploma: Diploma | null
    university: {
        id: string
        type: UniversityType
        abbreviation: string | null
        internatAvailable: boolean
        bourseAvailable: boolean
        name: LocalizedText
        description: LocalizedText
    }
    requirements: ProgramRequirement[]
    jobTitles: Jobs[]
}

export interface UniversityForProgram
{
    id: string
    name: LocalizedText
}

export interface Category
{
    id: string
    slug: string
    name: LocalizedText
}

const ProgramsDashboard = () => {
    const t = useTranslations('dashboard.programsDashboardTab')
    const locale = useLocale()
    const [approvedPrograms, setApprovedPrograms] = useState<Program[]>([])
    const [pendingPrograms, setPendingPrograms] = useState<Program[]>([])
    const [diplomas, setDiplomas] = useState<Diploma[]>([])
    const [universities, setUniversities] = useState<UniversityForProgram[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [viewMode, setViewMode] = useState<ViewMode>('ALL')
    const authFetch = useAuthFetch()
    const [jobs, setJobs] = useState<Jobs[]>([])

    useEffect(() => {
        const fetchPrograms = async () => {
            try
            {
                setIsLoading(true)
                const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
                const [approvedProgramsResponse, pendingProgramsResponse, diplomasResponse, universitiesResponse, categoriesResponse, jobsResponse] = await Promise.all([
                    authFetch(`${url}/programs/approved`),
                    authFetch(`${url}/programs/non-approved`),
                    authFetch(`${url}/diplomas`),
                    authFetch(`${url}/programs/universities-names`),
                    authFetch(`${url}/programs/categories-names`),
                    authFetch(`${url}/jobs`)
                ])
                if (!approvedProgramsResponse.ok || !pendingProgramsResponse.ok || !diplomasResponse.ok || !universitiesResponse.ok || !categoriesResponse.ok || !jobsResponse.ok)
                    throw new Error()
                const approvedProgramsData = await approvedProgramsResponse.json()
                const pendingProgramsData = await pendingProgramsResponse.json()
                const diplomasData = await diplomasResponse.json()
                const universitiesData = await universitiesResponse.json()
                const categoriesData = await categoriesResponse.json()
                const jobsData = await jobsResponse.json()
                setApprovedPrograms(approvedProgramsData.programs)
                setPendingPrograms(pendingProgramsData.programs)
                setDiplomas(diplomasData.diplomas)
                setUniversities(universitiesData.universities)
                setCategories(categoriesData.categories)
                setJobs(jobsData.jobs)
            }
            catch (error)
            {
                toast.error(t('fetchProgramsError'))
            }
            finally
            {
                setIsLoading(false)
            }
        }
        fetchPrograms()
    }, [locale])

    if (isLoading)
        return <ProgramsSkeleton />

    return (
        <div className='flex flex-col gap-6'>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <LuGraduationCap className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalPrograms')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{approvedPrograms.length}</p>
                    </div>
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <FaBookOpen className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('pendingPrograms')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{pendingPrograms.length}</p>
                    </div>
                </div>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
                <button onClick={() => setViewMode('ALL')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${viewMode === 'ALL' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('totalPrograms')}
                </button>
                <button onClick={() => setViewMode('PENDING')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${viewMode === 'PENDING' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('pendingPrograms')}
                </button>
            </div>
            {viewMode === 'ALL' ? (
                <AllPrograms 
                    allPrograms={approvedPrograms}
                    setAllPrograms={setApprovedPrograms}
                    diplomas={diplomas}
                    universities={universities}
                    categories={categories}
                    jobs={jobs}
                />
            ) : (
                <PendingPrograms 
                    pendingPrograms={pendingPrograms}
                    setPendingPrograms={setPendingPrograms}
                    allPrograms={approvedPrograms}
                    setAllPrograms={setApprovedPrograms}
                    diplomas={diplomas}
                    universities={universities}
                    categories={categories}
                    jobs={jobs}
                />
            )}
        </div>
    )
}

export default ProgramsDashboard