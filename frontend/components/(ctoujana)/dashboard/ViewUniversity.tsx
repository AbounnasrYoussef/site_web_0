'use client'

import { useLocale, useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { LuChevronLeft, LuChevronRight, LuCheck, LuX, LuTrash, LuRefreshCw, LuPlus, LuUpload } from "react-icons/lu"
import Input from "../../input"
import { University, Languages, mapLanguage, isValidUrl, actionButtonStyle, isValidImage } from "./UniversityDashboard"
import Dropdown from "@/components/dropdown"
import { isValidGoogleMapsLink } from "./UniversityDashboard"
import { City } from "./UniversityDashboard"
import { toast } from 'sonner'
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"

interface Props 
{
    isOpen: boolean
    mode: 'PENDING' | 'ALL'
    university: University | null
    onClose: () => void
    onApprove?: (updatedUniversity: University) => void
    onReject?: (university: University) => void
    onUpdate?: (updatedUniversity: University, originalUniversity: University, imageFiles: (File | null)[]) => void
    isUpdating?: boolean
    isApproving?: boolean
    isRejecting?: boolean
    cities: City[]
}

type LocationErrors = { city: string | null; website: string | null }
type LocaleErrors = Record<Languages, string | null>

const emptyLocation = { city: { en: '', fr: '', ar: '' }, website: '', image_url: '', latitude: '', longitude: '' }
const emptyLocaleErrors: LocaleErrors = { en: null, fr: null, ar: null }

export default function ViewUniversity({ isOpen, mode, university, onClose, onApprove, onReject, onUpdate, cities, isUpdating, isApproving, isRejecting }: Props) {
    const t = useTranslations('dashboard')
    const locale = useLocale()
    const [localUni, setLocalUni] = useState<University | null>(null)
    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [selectedLanguage, setSelectedLanguage] = useState<Languages>(locale as Languages)
    const [previewLanguage, setPreviewLanguage] = useState<Languages>(selectedLanguage)
    const [nameErrors, setNameErrors] = useState<LocaleErrors>(emptyLocaleErrors)
    const [descriptionErrors, setDescriptionErrors] = useState<LocaleErrors>(emptyLocaleErrors)
    const [abbreviationError, setAbbreviationError] = useState<string | null>(null)
    const [locationErrors, setLocationErrors] = useState<LocationErrors[]>([])
	const [mapLinks, setMapLinks] = useState<string[]>([])
    const [mapLinkErrors, setMapLinkErrors] = useState<(string | null)[]>([])
    const [locationImageFiles, setLocationImageFiles] = useState<(File | null)[]>([])
    const [locationImagePreviews, setLocationImagePreviews] = useState<string[]>([])
    const authFetch = useAuthFetch()

    // hadi m7tota bach <img> t9d trendri tswira li msavia f ram, hitach mzl ma3ndi .path dyalha li kyji mn backend
    useEffect(() => {
        const urls = locationImageFiles.map(file => file ? URL.createObjectURL(file) : '')
        setLocationImagePreviews(urls)
        return () => {
            urls.forEach(u => { 
                if (u) 
                    URL.revokeObjectURL(u) 
            })
        }
    }, [locationImageFiles])

    useEffect(() => {
        if (isOpen && university) 
        {
            setLocalUni(JSON.parse(JSON.stringify(university)))
            setPreviewLanguage(locale as Languages)
            setActiveIndex(0)
            setNameErrors(emptyLocaleErrors)
            setDescriptionErrors(emptyLocaleErrors)
            setAbbreviationError(null)
            setLocationErrors(university.locations.map(() => ({ city: null, website: null })))
            setMapLinks(university.locations.map(() => ''))
            setMapLinkErrors(university.locations.map(() => null))
            setLocationImageFiles(university.locations.map(() => null))
        } 
        else if (!isOpen) 
        {
            setLocalUni(null)
        }
    }, [isOpen, university, locale])

    if (!isOpen || !localUni)
        return null

    const activeLocation = localUni.locations[activeIndex]
    const isUnchanged = JSON.stringify(localUni) === JSON.stringify(university) && locationImageFiles.every(f => !f)

    const campusImage = (locationImagePreviews[activeIndex] || activeLocation.image_url) ? (
        <>
            <img src={locationImagePreviews[activeIndex] || activeLocation.image_url} className="w-full h-full object-cover" />
            <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                <LuUpload size={20} className="text-white" />
                <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    className="hidden" 
                    onChange={(e) => {
                        const file = (e.target.files && e.target.files.length > 0) ? e.target.files[0] : null
                        if (file)
                            handleImageSelect(file, activeIndex)
                    }} 
                />
            </label>
        </>
    ) : (
        <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
            <LuUpload size={20} className="opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all text-(--color-text)" />
            <input 
                type="file" 
                accept="image/jpeg,image/png" 
                className="hidden" 
                onChange={(e) => {
                    const file = (e.target.files && e.target.files.length > 0) ? e.target.files[0] : null
                    if (file)
                        handleImageSelect(file, activeIndex)
                }} 
            />
        </label>
    )

    const updateLocation = (index: number, patch: Partial<typeof activeLocation>) => {
        setLocalUni(prev => {
            if (!prev)
                return prev
            const updatedLocations = prev.locations.map((loc, i) => i === index ? { ...loc, ...patch } : loc)
            return { ...prev, locations: updatedLocations }
        })
    }

    const clearLocationError = (index: number, field: keyof LocationErrors) => {
        setLocationErrors(prev => prev.map((err, i) => i === index ? { ...err, [field]: null } : err))
    }

    const goToPrevBranch = () => setActiveIndex(i => Math.max(0, i - 1))
    const goToNextBranch = () => setActiveIndex(i => Math.min(localUni.locations.length - 1, i + 1))

    const handleAddLocation = () => {
        const newIndex = localUni.locations.length
        setLocalUni(prev => prev ? { ...prev, locations: [...prev.locations, { ...emptyLocation }] } : prev)
        setLocationErrors(prev => [...prev, { city: null, website: null }])
        setActiveIndex(newIndex)
        setMapLinks(prev => [...prev, ''])
        setMapLinkErrors(prev => [...prev, null])
        setLocationImageFiles(prev => [...prev, null])
    }

    const handleRemoveLocation = (index: number) => {
        if (localUni.locations.length <= 1)
            return
        const targetIndex = Math.max(0, Math.min(index, localUni.locations.length - 2))
        setLocalUni(prev => prev ? { ...prev, locations: prev.locations.filter((_, i) => i !== index) } : prev)
        setLocationErrors(prev => prev.filter((_, i) => i !== index))
        setActiveIndex(targetIndex)
        setMapLinks(prev => prev.filter((_, i) => i !== index))
        setMapLinkErrors(prev => prev.filter((_, i) => i !== index))
        setLocationImageFiles(prev => prev.filter((_, i) => i !== index))
    }

    const validateForm = async () => {
        const languages: Languages[] = ['en', 'fr', 'ar']
        let hasError = false
        const newNameErrors: LocaleErrors = { en: null, fr: null, ar: null }
        const newDescriptionErrors: LocaleErrors = { en: null, fr: null, ar: null }
        languages.forEach(lang => {
            if (!localUni.name[lang].trim()) 
            {
                hasError = true
                newNameErrors[lang] = t('universities.universityNameError')
            }
            if (!localUni.description[lang].trim())     
            {
                hasError = true
                newDescriptionErrors[lang] = t('universities.universityDescriptionError')
            }
        })
        setNameErrors(newNameErrors)
        setDescriptionErrors(newDescriptionErrors)
        if (!localUni.abbreviation.trim()) 
        {
            hasError = true
            setAbbreviationError(t('universities.universityAbbreviationError'))
        } 
        else 
        {
            setAbbreviationError(null)
        }
        const newMapLinkErrors: (string | null)[] = []
        const newLocationErrors: LocationErrors[] = []
        const resolvedLocations = [...localUni.locations]
        for (let i = 0; i < resolvedLocations.length; i++) 
        {
            const location = resolvedLocations[i]
            const err: LocationErrors = { city: null, website: null }    
            if (!location.city[locale as Languages]?.trim()) 
            {
                hasError = true
                err.city = t('universities.universityCityError')
            }
            if (!location.website.trim()) 
            {
                hasError = true
                err.website = t('universities.universityWebsiteError')
            } 
            else if (!isValidUrl(location.website.trim())) 
            {
                hasError = true
                err.website = t('universities.universityWebsiteErrorRegex')
            }
            if (!location.latitude || !location.longitude) 
            {
                if (!mapLinks[i]?.trim()) 
                {
                    hasError = true
                    newMapLinkErrors[i] = t('universities.branches.googleMapsRequired')
                } 
                else 
                {
                    const result = await resolveGoogleMapsLink(mapLinks[i].trim())
                    if ('error' in result) 
                    {
                        hasError = true
                        newMapLinkErrors[i] = result.error
                    } 
                    else 
                    {
                        resolvedLocations[i].latitude = result.latitude
                        resolvedLocations[i].longitude = result.longitude
                        newMapLinkErrors[i] = null
                    }
                }
            } 
            else 
            {
                newMapLinkErrors[i] = null
            }
            newLocationErrors.push(err)
        }
        setLocationErrors(newLocationErrors)
        setMapLinkErrors(newMapLinkErrors)
        if (hasError) 
            return null
        const finalUni = { ...localUni, locations: resolvedLocations }
        setLocalUni(finalUni)
        return finalUni
    }

    const handleApproveClick = async () => {
        const finalUni = await validateForm()
        if (finalUni && onApprove) 
        {
            onApprove(finalUni)
        }
    }

    const handleUpdateClick = async () => {
        const finalUni = await validateForm()
        if (finalUni &&  university && onUpdate) 
        {
            onUpdate(finalUni, university, locationImageFiles)
        }
    }

    const handleRejectClick = () => {
        if (onReject && localUni) 
        {
            onReject(localUni)
        }
    }

    const resolveGoogleMapsLink = async (url: string) => {
        try
        {
            if (!isValidGoogleMapsLink(url))
                return { error: t('universities.universityGoogleMapLinkErrorRegex') }
            const response = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/resolve-link?url=${encodeURIComponent(url)}&lang=${locale}`)
            const data = await response.json()
            if (data.success)
                return { latitude: data.latitude, longitude: data.longitude }
            return { error: data.message }
        }
        catch (error)
        {
            return { error: t('universities.branches.googleMapsUnableToResolve') }
        }
    }

    const handleImageSelect = async (file: File, index: number) => {
        const error = await isValidImage(t, file)
        if (error) 
        {
            toast.error(error)
            return
        }
        setLocationImageFiles(prev => prev.map((f, i) => i === index ? file : f))
    }

    return (
        <div onClick={() => { if (!isUpdating && !isApproving && !isRejecting) onClose()}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative max-h-[90vh] flex flex-col shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
                    <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text) truncate ltr:pr-4 rtl:pl-4">
                        {localUni.name[previewLanguage] || t('universities.viewUniTitle')}
                    </h1>
                    <button onClick={onClose} disabled={isUpdating || isApproving || isRejecting} className="shrink-0 text-(--color-text) hover:bg-gray-100 p-1 border-2 border-transparent hover:border-(--color-text) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <LuX size={24} className="stroke-[3px]" />
                    </button>
                </div>
                <div className="flex items-center justify-around gap-3 p-4 border-b-2 border-(--color-text) bg-white">
                    {mapLanguage(selectedLanguage).map((lang, index) => (
                        <div key={index} className="flex items-center justify-around gap-3 w-full">
                            {(['en', 'fr', 'ar'] as Languages[]).map((l) => (
                                <div key={l} onClick={() => setPreviewLanguage(l)}
                                    className={`px-4 py-2 border-2 border-(--color-text) font-semibold cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${previewLanguage === l ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                    {lang[l]}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="overflow-y-auto p-4 md:p-6 flex flex-col gap-5 custom-scrollbar ltr:text-left rtl:text-right">
                    <div className="border-2 border-(--color-text) p-3 md:p-4 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-center md:justify-between gap-3 p-3 border-2 border-(--color-text) bg-[#CCEF00]">
                            <div className="flex md:hidden flex-col items-center gap-2 w-full">
                                <div className="flex items-center justify-center gap-3">
                                    <button type="button" onClick={goToPrevBranch} disabled={activeIndex === 0}
                                        className="shrink-0 border-2 border-(--color-text) p-1 bg-white cursor-pointer hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                                        <LuChevronLeft size={16} className="rtl:rotate-180"/>
                                    </button>
                                    <div className="relative w-50 h-30 shrink-0 border-2 border-(--color-text) bg-white overflow-hidden group">
                                        {campusImage}
                                    </div>
                                    <button type="button" onClick={goToNextBranch} disabled={activeIndex === localUni.locations.length - 1}
                                        className="shrink-0 border-2 border-(--color-text) p-1 bg-white cursor-pointer hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                                        <LuChevronRight size={16} className="rtl:rotate-180"/>
                                    </button>
                                </div>
                                <p className="text-sm font-bold uppercase tracking-wide truncate text-center">
                                    {t('universities.branches.branch')} {activeIndex + 1} / {localUni.locations.length}
                                    {activeLocation.city[locale as Languages] ? ` - ${activeLocation.city[locale as Languages]}` : ` - ${t('universities.branches.selectCity')}`}
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 min-w-0">
                                <div className="w-50 h-30 shrink-0 border-2 border-(--color-text) bg-white overflow-hidden relative group">
                                    {campusImage}
                                </div>
                                <button type="button" onClick={goToPrevBranch} disabled={activeIndex === 0}
                                    className="shrink-0 border-2 border-(--color-text) p-1 bg-white cursor-pointer hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                                    <LuChevronLeft size={16} className="rtl:rotate-180"/>
                                </button>
                                <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-(--color-text) text-white text-xs font-bold">
                                    {activeIndex + 1}
                                </span>
                                <button type="button" onClick={goToNextBranch} disabled={activeIndex === localUni.locations.length - 1}
                                    className="shrink-0 border-2 border-(--color-text) p-1 bg-white cursor-pointer hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                                    <LuChevronRight size={16} className="rtl:rotate-180"/>
                                </button>
                                <p className="text-sm font-bold uppercase tracking-wide truncate">
                                    {t('universities.branches.branch')} {activeIndex + 1} / {localUni.locations.length}
                                    {activeLocation.city[locale as Languages] ? ` - ${activeLocation.city[locale as Languages]}` : ` - ${t('universities.branches.selectCity')}`}
                                </p>
                            </div>
                            <button type="button" onClick={() => handleRemoveLocation(activeIndex)} disabled={localUni.locations.length <= 1}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-2 border-(--color-text) bg-red-600 text-white text-xs font-bold uppercase tracking-wide cursor-pointer hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
                                <LuTrash size={14} />
                                {t('universities.branches.remove')}
                            </button>
                        </div>
                        <button type="button" onClick={handleAddLocation}
                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-(--color-text) font-bold text-sm uppercase tracking-wide hover:bg-gray-50 hover:border-solid transition-all text-(--color-text) cursor-pointer">
                            <LuPlus size={18} className="stroke-[3px]" />
                            {t('universities.branches.addAnother')}
                        </button>
                        <Dropdown
                            label={t('universities.labels.city')}
                            placeholder={t('universities.labels.city')}
                            options={cities.map(c => c.name[locale as Languages])}
                            value={activeLocation.city[locale as Languages] || ''}
                            error={locationErrors[activeIndex]?.city}
                            onChange={(val) => {
                                const selectedCityObj = cities.find(c => c.name[locale as Languages] === val)
                                if (selectedCityObj)
                                    updateLocation(activeIndex, { city: selectedCityObj.name as any })
                                clearLocationError(activeIndex, 'city')
                            }}
                        />
                        <Input
                            label={t('universities.labels.website')}
                            type="url"
                            value={activeLocation.website}
                            error={locationErrors[activeIndex]?.website}
                            onChange={(e) => {
                                updateLocation(activeIndex, { website: e.target.value })
                                clearLocationError(activeIndex, 'website')
                            }}
                        />
                        <Input
                            label={t('universities.labels.googleMaps')}
                            type="url"
                            placeholder="https://maps.app.goo.gl/..."
                            value={mapLinks[activeIndex]}
                            error={mapLinkErrors[activeIndex]}
                            onChange={(e) => {
                                const value = e.target.value
                                setMapLinks(prev => prev.map((v, i) => i === activeIndex ? value : v))
                                setMapLinkErrors(prev => prev.map((err, i) => i === activeIndex ? null : err))
                                updateLocation(activeIndex, { latitude: '', longitude: '' })
                            }}
                            onBlur={async () => {
                                const value = mapLinks[activeIndex]
                                if (!value?.trim())
                                    return
                                const result = await resolveGoogleMapsLink(value.trim())
                                if ('error' in result)
                                {
                                    setMapLinkErrors(prev => prev.map((err, i) => i === activeIndex ? result.error : err))
                                    return
                                }
                                updateLocation(activeIndex, { latitude: result.latitude, longitude: result.longitude })
                            }}
                        />
                    </div>
                    <Input inputDir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} label={t('universities.name')} type="text"
                        value={localUni.name[previewLanguage] ?? ""}
                        error={nameErrors[previewLanguage]}
                        onChange={(e) => {
                            setLocalUni(prev => prev ? { ...prev, name: { ...prev.name, [previewLanguage]: e.target.value } } : prev)
                            setNameErrors(prev => ({ ...prev, [previewLanguage]: null }))
                        }} />
                    <Input inputDir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} label={t('universities.abbreviation')} type="text" value={localUni.abbreviation}
                        error={abbreviationError}
                        onChange={(e) => {
                            setLocalUni(prev => prev ? { ...prev, abbreviation: e.target.value.toUpperCase() } : prev)
                            setAbbreviationError(null)
                        }} />
                    <Input inputDir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} label={t('universities.description')} multiline
                        value={localUni.description[previewLanguage] ?? ""}
                        error={descriptionErrors[previewLanguage]}
                        onChange={(e) => {
                            setLocalUni(prev => prev ? { ...prev, description: { ...prev.description, [previewLanguage]: e.target.value } } : prev)
                            setDescriptionErrors(prev => ({ ...prev, [previewLanguage]: null }))
                        }} />
                    <div className="flex items-center gap-3">
                        {(['PUBLIC', 'SEMI_PUBLIC', 'PRIVATE'] as const).map((type) => (
                            <button key={type} onClick={() => setLocalUni(prev => prev ? { ...prev, type } : prev)}
                                className={`flex-1 px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs md:text-sm cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${localUni.type === type ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                {t(`universities.type${type === 'PUBLIC' ? 'Public' : type === 'SEMI_PUBLIC' ? 'SemiPublic' : 'Private'}`)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-6">
                        <div onClick={() => setLocalUni(prev => prev ? { ...prev, bourseAvailable: !prev.bourseAvailable } : prev)}
                            className="flex items-center gap-3 cursor-pointer select-none">
                            <div className={`w-5 h-5 border-2 border-(--color-text) flex items-center justify-center ${localUni.bourseAvailable ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                {localUni.bourseAvailable ? <LuCheck size={14} className="stroke-[3px]" /> : null}
                            </div>
                            <p className="text-sm font-semibold uppercase">{t('universities.bourseAvailable')}</p>
                        </div>
                        <div onClick={() => setLocalUni(prev => prev ? { ...prev, internatAvailable: !prev.internatAvailable } : prev)}
                            className="flex items-center gap-3 cursor-pointer select-none">
                            <div className={`w-5 h-5 border-2 border-(--color-text) flex items-center justify-center ${localUni.internatAvailable ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                {localUni.internatAvailable ? <LuCheck size={14} className="stroke-[3px]" /> : null}
                            </div>
                            <p className="text-sm font-semibold uppercase">{t('universities.internatAvailable')}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-6 border-t-2 border-(--color-text) bg-white flex justify-end gap-4 z-10">
                    {mode === 'PENDING' ? (
                        <>
                            <button disabled={isApproving || isRejecting} onClick={handleRejectClick}
                                className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <p className="md:block">{isRejecting ? t('universities.rejecting') : t('universities.reject')}</p>
                                <LuX size={16} className="stroke-[3px] md:stroke-2" />
                            </button>
                            <button disabled={isApproving || isRejecting} onClick={handleApproveClick}
                                className={`${actionButtonStyle} rtl:flex-row-reverse bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <p className="md:block">{isApproving ? t('universities.approving') : t('universities.approve')}</p>
                                <LuCheck size={16} className="stroke-[3px] md:stroke-2" />
                            </button>
                        </>
                    ) : (
                        <button disabled={isUnchanged || isUpdating} onClick={handleUpdateClick}
                            className={`${actionButtonStyle} rtl:flex-row-reverse bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}>
                            <p className="md:block">{isUpdating ? t('universities.updating') : t('universities.update')}</p>
                            <LuRefreshCw size={16} className="stroke-[3px] md:stroke-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}