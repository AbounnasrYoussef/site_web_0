'use client'

import { useLocale, useTranslations } from "next-intl"
import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react"
import { LuPlus, LuCheck, LuX, LuTrash, LuEye } from "react-icons/lu"
import Input from "../../input"
import Dropdown from "@/components/dropdown"
import { University, Campus, Languages, UniversityType, mapLanguage, isValidUrl, isValidGoogleMapsLink, isValidImage, actionButtonStyle, tableActionButtonStyle } from "./UniversityDashboard"
import ViewUniversity from "./ViewUniversity"
import { City } from "./UniversityDashboard"
import { toast } from 'sonner'
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"

interface Props 
{
    allUniversities: University[]
    setAllUniversities: Dispatch<SetStateAction<University[]>>
    cities: City[]
}

export default function AllUniversities({ allUniversities, setAllUniversities, cities }: Props) {
    const t = useTranslations('dashboard')
    const locale = useLocale()
    const emptyLocaleFields = { en: "", fr: "", ar: "" }
    const emptyLocaleErrors = { en: null, fr: null, ar: null }
    const [selectedLanguage, setSelectedLanguage] = useState<Languages>(locale as Languages)
    const [sidebarOpen, setSideBarOpen] = useState<boolean>(false)
    const [selectedUniToView, setSelectedUniToView] = useState<University | null>(null)
    const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false)
    const [removeModalUniversity, setRemoveModalUniversity] = useState<University | null>(null)
    const [addUniModalOpen, setAddUniModalOpen] = useState<boolean>(false)
    const [addModalBranches, setAddModalBranches] = useState<Campus[]>([{id: "1", city: "", image: null, imageName: "", googleMapLink: "", website: "", cityError: null, googleMapLinkError: null, websiteError: null, imageError: null}])
    const [universityType, setUniversityType] = useState<string>('')
    const [universityName, setUniversityName] = useState<Record<Languages, string>>(emptyLocaleFields)
    const [universityAbbreviation, setUniversityAbbreviation] = useState<string>('')
    const [universityDescription, setUniversityDescription] = useState<Record<Languages, string>>(emptyLocaleFields)
    const [universityInternat, setUniversityInternat] = useState<boolean>(false)
    const [universityBourse, setUniversityBourse] = useState<boolean>(false)
    const [universityNameError, setUniversityNameError] = useState<Record<Languages, string | null>>(emptyLocaleErrors)
    const [universityAbbreviationError, setUniversityAbbreviationError] = useState<string | null>(null)
    const [universityTypeError, setUniversityTypeError] = useState<string | null>(null)
    const [universityDescriptionError, setUniversityDescriptionError] = useState<Record<Languages, string | null>>(emptyLocaleErrors)
    const [addModalLanguage, setAddModalLanguage] = useState<Languages>(locale as Languages)
    const formScrollRef = useRef<HTMLFormElement | null>(null)
    const [isSubmittingUniversity, setIsSubmittingUniversity] = useState<boolean>(false)
    const [isRemoving, setIsRemoving] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const authFetch = useAuthFetch()

    useEffect(() => {
        if (formScrollRef.current) 
        {
            formScrollRef.current.scrollTo({
                top: formScrollRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [addModalBranches.length])

    const handleRemoveUniversity = async (university: University) => {
        try
        {
            setIsRemoving(true)
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const res = await authFetch(`${url}/universities/${university.id}`, {
                method: 'DELETE' // khsni nsift hna token mnb3d
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setAllUniversities(prev => prev.filter(u => u.id !== university.id))
            setRemoveModalOpen(false)
            setRemoveModalUniversity(null)
        }
        catch (error)
        {
            toast.error(t('universities.removeUniFetchError'))
        }
        finally
        {
            setIsRemoving(false)
        }
    }

    const handleUpdateUniversity = async (university: University, originalUniversity: University, imageFiles: (File | null)[] = []) => {
        try
        {
            setIsUpdating(true)
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const uniResponse = await authFetch(`${url}/universities/${university.id}?lang=${locale}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'}, // khsni nsift hna token mnb3d
                body: JSON.stringify({
                    type: university.type,
                    abbreviation: university.abbreviation,
                    bourseAvailable: university.bourseAvailable,
                    internatAvailable: university.internatAvailable,
                    name: university.name,
                    description: university.description,
                })
            })
            const uniData = await uniResponse.json()
            if (!uniData.success)
            {
                toast.error(uniData.message)
                return
            }
            const currentLocationIds = new Set(university.locations.map(l => l.id).filter(Boolean))
            const removedLocations = originalUniversity.locations.filter(l => l.id && !currentLocationIds.has(l.id))
            for (const location of removedLocations)
            {
                const deleteResponse = await authFetch(`${url}/universities/${university.id}/locations/${location.id}?lang=${locale}`, {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'}, // khsni nsift hna token mnb3d
                })
                const deleteData = await deleteResponse.json()
                if (!deleteData.success)
                {
                    toast.error(deleteData.message)
                    return
                }
            }
            for (let i = 0; i < university.locations.length; i++)
            {
                const location = university.locations[i]
                const imageFile = imageFiles[i] ?? null
                if (location.id)
                {
                    let locationResponse
                    if (imageFile)
                    {
                        const formData = new FormData()
                        formData.append('website', location.website)
                        formData.append('longitude', location.longitude)
                        formData.append('latitude', location.latitude)
                        formData.append('city', location.city[locale as Languages])
                        formData.append('image', imageFile)
                        locationResponse = await authFetch(`${url}/universities/${university.id}/locations/${location.id}?lang=${locale}`, {
                            method: 'PATCH', // khsni nsift hna token mnb3d
                            body: formData
                        })
                    }
                    else
                    {
                        locationResponse = await authFetch(`${url}/universities/${university.id}/locations/${location.id}?lang=${locale}`, {
                            method: 'PATCH',
                            headers: {'Content-Type': 'application/json'}, // khsni nsift hna token mnb3d
                            body: JSON.stringify({
                                website: location.website,
                                longitude: location.longitude,
                                latitude: location.latitude,
                                city: location.city[locale as Languages],
                            })
                        })
                    }
                    const locationData = await locationResponse.json()
                    if (!locationData.success)
                    {
                        toast.error(locationData.message)
                        return
                    }
                }
                else
                {
                    const formData = new FormData()
                    formData.append('city', location.city[locale as Languages])
                    formData.append('website', location.website)
                    formData.append('longitude', location.longitude)
                    formData.append('latitude', location.latitude)
                    if (imageFile)
                        formData.append('image', imageFile)
                    const locationResponse = await authFetch(`${url}/universities/${university.id}/add-location?lang=${locale}`, {
                        method: 'POST', // khsni nsift hna token mnb3d
                        body: formData
                    })
                    const locationData = await locationResponse.json()
                    if (!locationData.success)
                    {
                        toast.error(locationData.message)
                        return
                    }
                    else
                    {
                        location.id = locationData.location.id
                        location.image_url = locationData.location.image_url
                    }
                }
            }
            setAllUniversities(prev => prev.map(u => u.id === university.id ? university : u))
            setSideBarOpen(false)
            setSelectedUniToView(null)
        }
        catch (error)
        {
            toast.error(t('universities.updateUniFetchError'))
        }
        finally
        {
            setIsUpdating(false)
        }
    }

    const handleCloseAddUniModal = () => {
        setAddUniModalOpen(false)
        setAddModalBranches([{id: "1", city: "", image: null, imageName: "", googleMapLink: "", website: "", cityError: null, googleMapLinkError: null, websiteError: null, imageError: null}])
        setUniversityType('')
        setUniversityName(emptyLocaleFields)
        setUniversityAbbreviation('')
        setUniversityDescription(emptyLocaleFields)
        setUniversityInternat(false)
        setUniversityBourse(false)
        setUniversityNameError(emptyLocaleErrors)
        setUniversityAbbreviationError(null)
        setUniversityTypeError(null)
        setUniversityDescriptionError(emptyLocaleErrors)
        setAddModalLanguage(locale as Languages)
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

    const handleAddNewUniversity = async () => {
        const languages: Languages[] = ['en', 'fr', 'ar']
        let hasError = false
        const nameErrors: Record<Languages, string | null> = { en: null, fr: null, ar: null }
        const descErrors: Record<Languages, string | null> = { en: null, fr: null, ar: null }
        languages.forEach(lang => {
            if (!universityName[lang].trim()) 
            {
                hasError = true
                nameErrors[lang] = t('universities.universityNameError')
            }
            if (!universityDescription[lang].trim()) 
            {
                hasError = true
                descErrors[lang] = t('universities.universityDescriptionError')
            }
        })
        setUniversityNameError(nameErrors)
        setUniversityDescriptionError(descErrors)
        if (!universityAbbreviation.trim()) 
        {
            hasError = true
            setUniversityAbbreviationError(t('universities.universityAbbreviationError'))
        }
        if (!universityType.trim()) 
        {
            hasError = true
            setUniversityTypeError(t('universities.universityTypeError'))
        }
        setAddModalBranches(prev => prev.map(branch => {
            const updated: Campus = {...branch, cityError: null, googleMapLinkError: null, websiteError: null, imageError: null}
            if (!branch.city.trim()) 
            {
                hasError = true
                updated.cityError = t('universities.universityCityError')
            }
            if (!branch.googleMapLink.trim()) 
            {
                hasError = true
                updated.googleMapLinkError = t('universities.universityGoogleMapLinkError')
            } 
            else if (!isValidGoogleMapsLink(branch.googleMapLink.trim())) 
            {
                hasError = true
                updated.googleMapLinkError = t('universities.universityGoogleMapLinkErrorRegex')
            }
            if (!branch.website.trim()) 
            {
                hasError = true
                updated.websiteError = t('universities.universityWebsiteError')
            } 
            else if (!isValidUrl(branch.website.trim())) 
            {
                hasError = true
                updated.websiteError = t('universities.universityWebsiteErrorRegex')
            }
            if (!branch.imageName.trim()) 
            {
                hasError = true
                updated.imageError = t('universities.universityImageError')
            }
            return updated
        }))
        if (hasError) 
            return
        setIsSubmittingUniversity(true)
        try
        {
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const uniResponse = await authFetch(`${url}/universities?lang=${locale}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}, // khsni nsift hna token mnb3d
                body: JSON.stringify({
                    type: universityType,
                    abbreviation: universityAbbreviation,
                    bourseAvailable: universityBourse,
                    internatAvailable: universityInternat,
                    name: universityName,
                    description: universityDescription,
                })
            })
            const uniData = await uniResponse.json()
            if (!uniData.success)
            {
                toast.error(uniData.message)
                return
            }
            const createdUniversity = uniData.university
            const resolvedLocations: University['locations'] = []
            for (const branch of addModalBranches)
            {
                const coords = await resolveGoogleMapsLink(branch.googleMapLink.trim())
                if ('error' in coords)
                {
                    setAddModalBranches(prev => prev.map(b => b.id === branch.id ? {...b, googleMapLinkError: coords.error} : b))
                    toast.error(coords.error)
                    await authFetch(`${url}/universities/${uniData.university.id}?lang=${locale}`, {
                        method: 'DELETE'
                    })
                    return
                }
                const cityObj = cities.find(c => c.name[locale as Languages] === branch.city)?.name || { en: branch.city, fr: branch.city, ar: branch.city }
                const formData = new FormData()
                formData.append('city', branch.city)
                formData.append('website', branch.website)
                formData.append('longitude', coords.longitude)
                formData.append('latitude', coords.latitude)
                if (branch.image)
                    formData.append('image', branch.image)
                const locationResponse = await authFetch(`${url}/universities/${createdUniversity.id}/add-location?lang=${locale}`, {
                    method: 'POST', // khsni nsift hna token mnb3d
                    body: formData
                })
                const locationData = await locationResponse.json()
                if (!locationData.success)
                {
                    toast.error(locationData.message)
                    return
                }
                resolvedLocations.push({
                    id: locationData.location.id,
                    city: cityObj as Record<Languages, string>,
                    website: branch.website,
                    longitude: coords.longitude,
                    latitude: coords.latitude,
                    image_url: locationData.location.image_url
                })
            }
            const newUniversity: University = {
                id: createdUniversity.id,
                name: universityName,
                type: universityType as UniversityType,
                abbreviation: universityAbbreviation,
                description: universityDescription,
                bourseAvailable: universityBourse,
                internatAvailable: universityInternat,
                locations: resolvedLocations
            }
            setAllUniversities(prev => [...prev, newUniversity])
            handleCloseAddUniModal()
        }
        catch (error)
        {
            toast.error(t('universities.addUniFetchError'))
        }
        finally
        {
            setIsSubmittingUniversity(false)
        }
    }

    const handleAddBranch = () => {
		setAddModalBranches(prev => [...prev, {id: Date.now().toString(), city: "", image: null, imageName: "", googleMapLink: "", website: "", cityError: null, googleMapLinkError: null, websiteError: null, imageError: null}])
	}

    const handleRemoveBranch = async (id: string) => {
        if (addModalBranches.length > 1)
            setAddModalBranches(prev => prev.filter(branch => branch.id !== id))
    }

    const handleUpdateBranchCity = (id: string, city: string) => {
		setAddModalBranches(prev => prev.map(branch => 
			branch.id === id ? {...branch, city: city, cityError: null} : branch
		))
	}

    const handleUpdateBranchWebsite = (id: string, website: string) => {
		setAddModalBranches(prev => prev.map(branch => branch.id === id ? {...branch, website: website, websiteError: null} : branch))
	}

    const handleUpdateBranchGoogleMapLink = (id: string, googleMapLink: string) => {
		setAddModalBranches(prev => prev.map(branch => branch.id === id ? {...branch, googleMapLink: googleMapLink, googleMapLinkError: null} : branch))
	}

	const handleUpdateBranchImage = async (id: string, file: File | null) => {
		if (!file)
		{
			setAddModalBranches(prev => prev.map(branch => 
				branch.id === id ? {...branch, image: null, imageName: "", imageError: null} : branch
			))
			return
		}
		const error = await isValidImage(t, file)
		setAddModalBranches(prev => prev.map(branch => 
			branch.id === id ? {...branch, image: error ? null : file, imageName: error ? "" : file.name, imageError: error} : branch
		))
	}

    return (
        <div className="border-2 border-(--color-text) overflow-hidden bg-(--color-surface)">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[60vh]">
                <table className="w-full text-left border-collapse min-w-200 rtl:text-right">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-(--color-grey)">
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                {t('universities.table.university')}
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                {t('universities.table.type')}
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                {t('universities.table.locations')}
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) text-center bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                {t('universities.table.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-(--color-surface)">
                        {allUniversities.length > 0 ? (
                            <>
                                {allUniversities.map((uni) => (
                                    <tr key={uni.id} className="border-b-2 border-(--color-grey) last:border-0 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="min-w-10 h-10 px-2 border-2 border-(--color-text) bg-[#CDEF00] flex items-center justify-center font-bold text-xs shrink-0 leading-none text-center">
                                                    {uni.abbreviation}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{uni.name[locale as Languages]}</p>
                                                    <p className="text-xs text-gray-500 font-semibold line-clamp-1 max-w-xs">{uni.description[locale as Languages]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-semibold border-2 border-(--color-text) px-2 py-1 bg-(--color-surface)">
                                                {t(`universities.type${uni.type === 'PUBLIC' ? 'Public' : uni.type === 'SEMI_PUBLIC' ? 'SemiPublic' : 'Private'}`)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-gray-700">
                                            {uni.locations.length > 0 && (
                                                <>
                                                    {uni.locations.slice(0, 2).map(l => l.city[locale as Languages]).join(', ')}
                                                    {uni.locations.length > 2 && ` ${t('universities.moreLocations', {count: uni.locations.length - 2})}`}
                                                </>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => {
                                                        setSideBarOpen(true)
                                                        setSelectedUniToView(uni)
                                                    }}
                                                    className={`${tableActionButtonStyle} bg-[#ccee00] text-black`}>
                                                    {t('universities.view')}
                                                    <LuEye size={16} className="stroke-[3px] md:stroke-2" />
                                                </button>
                                                <button onClick={() => {setRemoveModalOpen(true); setRemoveModalUniversity(uni)}}
                                                    className={`${tableActionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
                                                    {t('universities.remove')}
                                                    <LuTrash size={16} className="stroke-[3px] md:stroke-2" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-(--color-text)">
                                    <div className="flex flex-col items-center justify-center gap-2 p-8">
                                        <p className="font-bold text-sm uppercase tracking-wide">
                                            {t('universities.noAllUniversities')}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button
                onClick={() => setAddUniModalOpen(true)}
                className="fixed bottom-18 md:bottom-8 ltr:right-8 rtl:left-8 border-2 border-(--color-text) p-3 cursor-pointer bg-(--color-accent-soft) hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] z-50">
                <LuPlus size={24} />
            </button>
            <ViewUniversity 
                isOpen={sidebarOpen}
                mode="ALL"
                university={selectedUniToView}
                onClose={() => {
                    if (!isUpdating)
                    {
                        setSideBarOpen(false)
                        setSelectedUniToView(null)
                    }
                }}
                onUpdate={handleUpdateUniversity}
                isUpdating={isUpdating}
                cities={cities}
            />
            {removeModalOpen && removeModalUniversity && (
                <div 
                onClick={() => {
                    if (!isRemoving)
                    {
                        setRemoveModalOpen(false); 
                        setRemoveModalUniversity(null)
                    }
                }} 
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) p-4 md:p-6 w-full max-w-sm md:max-w-md relative">
                        <h1 className="text-base md:text-lg font-bold">{t('universities.removeConfirmTitle')}</h1>
                        <p className="text-xs md:text-sm mt-2">{t('universities.removeConfirmDescription', {name: removeModalUniversity.name[locale as Languages]})}</p>
                        <div className="flex gap-3 mt-4 md:mt-6">
                            <button disabled={isRemoving} onClick={() => handleRemoveUniversity(removeModalUniversity)}
                                className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse text-xs md:text-sm py-1.5 md:py-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isRemoving ? t('universities.removing') : t('universities.remove')}
                                <LuTrash size={16} className="stroke-[3px] md:stroke-2"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {addUniModalOpen && (
                <div onClick={() => {if (!isSubmittingUniversity) handleCloseAddUniModal()}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative max-h-[90vh] flex flex-col shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
                            <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text)">
                                {t('universities.addNewUniTitle')}
                            </h1>
                            <button onClick={handleCloseAddUniModal} disabled={isSubmittingUniversity} className="text-(--color-text) hover:bg-gray-100 p-1 border-2 border-transparent hover:border-(--color-text) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                <LuX size={24} className="stroke-[3px]" />
                            </button>
                        </div>
                        <div className="flex items-center justify-around gap-3 p-4 border-b-2 border-(--color-text) bg-white">
                            {mapLanguage(selectedLanguage).map((lang, index) => (
                                <div key={index} className="flex items-center justify-around gap-3 w-full">
                                    <div onClick={() => setAddModalLanguage('en')}
                                        className={`px-4 py-2 border-2 border-(--color-text) font-semibold cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${addModalLanguage === 'en' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                        {lang.en}
                                    </div>
                                    <div onClick={() => setAddModalLanguage('fr')}
                                        className={`px-4 py-2 border-2 border-(--color-text) font-semibold cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${addModalLanguage === 'fr' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                        {lang.fr}
                                    </div>
                                    <div onClick={() => setAddModalLanguage('ar')}
                                        className={`px-4 py-2 border-2 border-(--color-text) font-semibold cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${addModalLanguage === 'ar' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                        {lang.ar}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form ref={formScrollRef} onSubmit={(e) => e.preventDefault()} className="overflow-y-auto p-4 md:p-6 flex flex-col gap-8 custom-scrollbar">
                            <div className="flex flex-col gap-5 p-5 border-2 border-(--color-text) bg-gray-50/50">
                                <h2 className="font-bold uppercase text-lg border-b-2 border-(--color-text) pb-2 mb-2">{t('universities.generalInfo')}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input error={universityNameError[addModalLanguage]} value={universityName[addModalLanguage]} onChange={(e) => {setUniversityName(prev => ({...prev, [addModalLanguage]: e.target.value})); setUniversityNameError(prev => ({...prev, [addModalLanguage]: null}))}} label={t('universities.name')} placeholder={t('universities.labels.namePlaceholder')}  />
                                    <Input error={universityAbbreviationError} value={universityAbbreviation} onChange={(e) => {setUniversityAbbreviation(e.target.value.toUpperCase()); setUniversityAbbreviationError(null)}} label={t('universities.abbreviation')} placeholder={t('universities.labels.abbreviationPlaceholder')}  />
                                    <Dropdown 
                                        label={t('universities.labels.type')}
                                        placeholder={t('universities.labels.typePlaceholder')}
                                        options={[
                                            {label: t('universities.typePublic'), value: 'PUBLIC'},
                                            {label: t('universities.typeSemiPublic'), value: 'SEMI_PUBLIC'},
                                            {label: t('universities.typePrivate'), value: 'PRIVATE'}
                                        ]}
                                        value={universityType}
                                        onChange={(newType) => {setUniversityType(newType); setUniversityTypeError(null)}}
                                        error={universityTypeError}
                                    />
                                </div>
                                <Input error={universityDescriptionError[addModalLanguage]} value={universityDescription[addModalLanguage]} onChange={(e) => {setUniversityDescription(prev => ({...prev, [addModalLanguage]: e.target.value})); setUniversityDescriptionError(prev => ({...prev, [addModalLanguage]: null}))}} label={t('universities.description')} multiline placeholder={t('universities.labels.descriptionPlaceholder')}  />
                                <div className="flex flex-col sm:flex-row gap-6 mt-2 pt-4 border-t-2 border-(--color-text)/20">
                                    <div onClick={() => setUniversityInternat(!universityInternat)} className="flex items-center gap-3 cursor-pointer select-none">
                                        <div className={`w-5 h-5 border-2 border-(--color-text) flex items-center justify-center transition-colors ${universityInternat ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                            {universityInternat && <LuCheck size={14} className="stroke-[3px] text-black"/>}
                                        </div>
                                        <p className="text-sm font-semibold uppercase">{t('universities.internatAvailable')}</p>
                                    </div>
                                    <div onClick={() => setUniversityBourse(!universityBourse)} className="flex items-center gap-3 cursor-pointer select-none">
                                        <div className={`w-5 h-5 border-2 border-(--color-text) flex items-center justify-center transition-colors ${universityBourse ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                            {universityBourse && <LuCheck size={14} className="stroke-[3px] text-black"/>}
                                        </div>
                                        <p className="text-sm font-semibold uppercase">{t('universities.bourseAvailable')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-bold uppercase text-lg">{t('universities.branches.title')}</h2>
                                </div>
                                {addModalBranches.map((branch, index) => (
                                    <div key={branch.id} className="border-2 border-(--color-text) p-5 relative bg-white group mt-3">
                                        <span className="absolute -top-3.5 -left-3.5 bg-[#ccee00] border-2 border-(--color-text) px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                            {t('universities.branches.branch')} {index + 1}
                                        </span>
                                        {addModalBranches.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveBranch(branch.id)} className="absolute -top-3.5 -right-3.5 bg-red-900 text-white border-2 border-(--color-text) p-1 transition-colors hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] z-10 cursor-pointer">
                                                <LuTrash size={16} />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                                            <Dropdown 
                                                options={cities.map(c => c.name[locale as Languages])} 
                                                value={branch.city} 
                                                onChange={(newCity) => handleUpdateBranchCity(branch.id, newCity)}
                                                placeholder={branch.city || t('universities.branches.selectCity')}
                                                maxVisible={5}
                                                label={t('universities.labels.city')}
                                                error={branch.cityError}
                                            />
                                            <Input onChange={(e) => handleUpdateBranchGoogleMapLink(branch.id, e.target.value)} error={branch.googleMapLinkError} label={t('universities.labels.googleMaps')} placeholder="https://maps.app.goo.gl/..."  />
                                            <Input onChange={(e) => handleUpdateBranchWebsite(branch.id, e.target.value)} error={branch.websiteError} label={t('universities.labels.website')} type="url" placeholder="https://"/> 
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold uppercase tracking-wide text-(--color-text)">
                                                    {t('universities.labels.campusImage')}
                                                </span>
                                                <div className={`flex items-center w-full border-2 p-1 bg-white text-sm font-semibold ${branch.imageError ? 'border-red-600 bg-red-50' : 'border-(--color-text)'}`}>
                                                    <label htmlFor={`branch-image-${branch.id}`} className="mr-4 py-1.5 px-3 border-2 border-(--color-text) bg-gray-100 text-(--color-text) font-bold uppercase text-xs cursor-pointer hover:bg-(--color-text) hover:text-white transition-all focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-text)]">
                                                        {t('universities.labels.chooseFile')}
                                                    </label>
                                                    <span className="text-gray-500 truncate cursor-default">
                                                        {branch.imageName ? branch.imageName : t('universities.labels.noFileChosen')}
                                                    </span>
                                                </div>
                                                <input 
                                                    id={`branch-image-${branch.id}`}
                                                    type="file"
                                                    accept="image/jpeg,image/png"
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        const file = (e.target.files && e.target.files.length > 0) ? e.target.files[0] : null
                                                        handleUpdateBranchImage(branch.id, file)
                                                    }}
                                                />
                                                {branch.imageError && (
                                                    <span className="text-xs text-red-700 font-semibold">
                                                        {branch.imageError}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddBranch} className="flex items-center justify-center gap-2 w-full py-3 mt-2 border-2 border-dashed border-(--color-text) font-bold text-sm uppercase tracking-wide hover:bg-gray-50 hover:border-solid transition-all text-(--color-text) cursor-pointer">
                                    <LuPlus size={18} className="stroke-[3px]"/>
                                    {t('universities.branches.addAnother')}
                                </button>
                            </div>
                        </form>
                        <div className="p-4 md:p-6 border-t-2 border-(--color-text) bg-white flex justify-end gap-4 z-10">
                            <button onClick={() => setAddUniModalOpen(false)} disabled={isSubmittingUniversity} className="px-6 py-2.5 border-2 border-(--color-text) bg-white font-bold text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-text)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                {t('universities.actions.cancel')}
                            </button>
                            <button onClick={handleAddNewUniversity} disabled={isSubmittingUniversity} className="px-6 py-2.5 border-2 border-(--color-text) bg-(--color-text) text-white font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity focus:outline-none focus:shadow-[2px_2px_0_0_var(--color-text)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmittingUniversity ? t('universities.actions.saving') : t('universities.actions.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}