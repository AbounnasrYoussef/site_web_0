'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import PendingUniversities from "./PendingUniversities"
import AllUniversities from "./AllUniversities"
import { LuGraduationCap, LuClock, LuLandmark, LuBuilding2, LuLock } from "react-icons/lu"
import UniversitiesTabSkeleton from "./UniversityDashboardSkeleton"
import { toast } from "sonner"
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"

export const actionButtonStyle = "flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-sm cursor-pointer hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)]"
export const tableActionButtonStyle = "flex items-center justify-center gap-2 px-3 py-1.5 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-all focus:outline-none hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)]"

export type Languages = 'en' | 'fr' | 'ar'
export type UniversityType = "PUBLIC" | "SEMI_PUBLIC" | 'PRIVATE'
export type ViewMode = 'PENDING' | 'ALL'

export interface UniversityLocation 
{
    id?: string,
    city: Record<Languages, string>
    website: string
    longitude: string
    latitude: string
    image_url: string
}

export interface University 
{
    id: string
    name: Record<Languages, string>
    type: UniversityType
    abbreviation: string
    description: Record<Languages, string>
    bourseAvailable: boolean
    internatAvailable: boolean
    locations: UniversityLocation[]
}

export interface Campus 
{
    id: string
    city: string
    image: File | null
    imageName: string
    googleMapLink: string
    website: string
    cityError: string | null
    googleMapLinkError: string | null
    websiteError: string | null
    imageError: string | null
}

export interface City {
    name: Record<Languages, string>
}

export const mapLanguage = (language: Languages) => {
    switch (language) {
        case 'en': 
            return [{ 'en': "English", 'fr': "French", 'ar': "Arabic" }]
        case 'fr': 
            return [{ 'en': "Anglais", 'fr': "Français", 'ar': "Arabe" }]
        case 'ar': 
            return [{ 'en': "الإنجليزية", 'fr': "الفرنسية", 'ar': "العربية" }]
    }
}

export const isValidGoogleMapsLink = (url: string) => {
    const VALID_GOOGLE_MAPS_LINK = /^https?:\/\/(www\.)?(maps\.app\.goo\.gl|goo\.gl\/maps|google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)/i
    try 
    { 
        new URL(url) 
    } 
    catch 
    { 
        return false 
    }
    return VALID_GOOGLE_MAPS_LINK.test(url)
}

export const isValidUrl = (url: string) => {
    try 
    {
        return new URL(url).protocol === 'https:' 
    } 
    catch 
    { 
        return false 
    }
}

export const validateImageMagicBytes = async (file: File) => {
    const buffer = await file.slice(0, 4).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    if (file.type === 'image/jpeg') 
        return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    if (file.type === 'image/png') 
        return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    return false
}

export const isValidImage = async (t: any, file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) 
        return t('universities.imageMimeTypeError')
    if (file.size > (1024 * 1024 * 10)) 
        return t('universities.imageSizeError')
    if (!(await validateImageMagicBytes(file))) 
        return t('universities.imageCorruptError')
    return null
}

const calculateTotalByType = (universities: University[], type: UniversityType) => {
	return universities.filter(u => u.type === type).length
}

const UniversitiesTab = () => {
    const t = useTranslations('dashboard')
    const [viewMode, setViewMode] = useState<ViewMode>('ALL')
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [pendingUniversities, setPendingUniversities] = useState<University[]>([]) 
    const [allUniversities, setAllUniversities] = useState<University[]>([]) 
    const [cities, setCities] = useState<City[]>([])
    const authFetch = useAuthFetch()

    useEffect(() => {
        const fetchData = async () => {
            try 
            {
                setIsLoading(true)
                const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
                const [approvedResponse, pendingResponse, citiesResponse] = await Promise.all([
                    authFetch(`${url}/universities/approved`),
                    authFetch(`${url}/universities/non-approved`),
                    authFetch(`${url}/cities`)
                ])
                if (!approvedResponse.ok || !pendingResponse.ok || !citiesResponse.ok) 
                    throw new Error()
                const approvedData = await approvedResponse.json()
                const pendingData = await pendingResponse.json()
                const citiesData = await citiesResponse.json()
                setAllUniversities(approvedData.universities)
                setPendingUniversities(pendingData.universities)
                setCities(citiesData.cities)
            } 
            catch (error) 
            {
                toast.error(t('universities.fetchUniversitiesError'))
            } 
            finally 
            {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading)
        return <UniversitiesTabSkeleton />

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<LuGraduationCap className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
						<p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('universities.totalUniversities')}</p>
						<p className="relative text-xl md:text-4xl font-bold mt-2">{allUniversities.length}</p>
					</div>
					<div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<LuClock className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
						<p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('universities.pendingApproval')}</p>
						<p className="relative text-xl md:text-4xl font-bold mt-2">{pendingUniversities.length}</p>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<LuLandmark className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={56} />
						<p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('universities.publicUniversities')}</p>
						<p className="relative text-xl md:text-4xl font-bold mt-2">{calculateTotalByType(allUniversities, 'PUBLIC')}</p>
					</div>
					<div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<LuBuilding2 className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={56} />
						<p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('universities.semiPublicUniversities')}</p>
						<p className="relative text-xl md:text-4xl font-bold mt-2">{calculateTotalByType(allUniversities, 'SEMI_PUBLIC')}</p>
					</div>
					<div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<LuLock className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={56} />
						<p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('universities.privateUniversities')}</p>
						<p className="relative text-xl md:text-4xl font-bold mt-2">{calculateTotalByType(allUniversities, 'PRIVATE')}</p>
					</div>
				</div>
			</div>
            <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setViewMode('ALL')}
                    className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${viewMode === 'ALL' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('universities.allUniversities')}
                </button>
                <button onClick={() => setViewMode('PENDING')}
                    className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${viewMode === 'PENDING' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('universities.pendingUniversities')}
                </button>
            </div>
            {viewMode === 'ALL' ? (
                <AllUniversities
                    allUniversities={allUniversities}
                    setAllUniversities={setAllUniversities}
                    cities={cities}
                />
            ) : (
                <PendingUniversities
                    pendingUniversities={pendingUniversities}
                    setPendingUniversities={setPendingUniversities}
                    setAllUniversities={setAllUniversities}
                    cities={cities}
                />
            )}
        </div>
    )
}

export default UniversitiesTab