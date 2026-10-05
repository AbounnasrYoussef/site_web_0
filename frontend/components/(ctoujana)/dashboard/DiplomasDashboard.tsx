'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'
import { Diploma } from './ProgramsDashboard'
import { LuScroll, LuPlus } from 'react-icons/lu'
import { Languages, mapLanguage } from './UniversityDashboard'
import { LuEye, LuTrash, LuX, LuRefreshCw } from 'react-icons/lu'
import { tableActionButtonStyle } from './UniversityDashboard'
import { DiplomasSkeleton } from './DiplomasDashboardSkeleton'
import { actionButtonStyle } from './UniversityDashboard'
import Input from '@/components/input'
import Dropdown from "@/components/dropdown"
import { useAuthFetch } from '@/app/(zguellou)/hooks/useAuthFetch'

type DiplomasFilter = 'BAC' | 'BAC+2' | 'BAC+3' | 'BAC+5' | 'BAC+8'
type LocaleErrors = Record<Languages, string | null>

const emptyLocaleErrors: LocaleErrors = { en: null, fr: null, ar: null }

const rankMapping = (rank: number): DiplomasFilter => {
    if (rank === 12)
        return 'BAC'
    else if (rank === 14)
        return 'BAC+2'
    else if (rank === 15)
        return 'BAC+3'
    else if (rank === 17)
        return 'BAC+5'
    return 'BAC+8'
}

const filterMapping = (filter: DiplomasFilter) => {
    if (filter === 'BAC')
        return 12
    else if (filter === 'BAC+2')
        return 14
    else if (filter === 'BAC+3')
        return 15
    else if (filter === 'BAC+5')
        return 17
    return 20
}

const DiplomasDashboard = () => {
    const t = useTranslations('dashboard.diplomasDashboardTab')
    const locale = useLocale()
    const [diplomas, setDiplomas] = useState<Diploma[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [selectedFilter, setSelectedFilter] = useState<DiplomasFilter | 'ALL'>('ALL')
    const [deleteDiplomaModalOpen, setDeleteDiplomaModalOpen] = useState<boolean>(false)
    const [selectedDiplomaToDelete, setSelectedDiplomaToDelete] = useState<Diploma | null>(null)
    const [viewDiplomaModalOpen, setViewDiplomaModalOpen] = useState<boolean>(false)
    const [selectedDiplomaToView, setSelectedDiplomaToView] = useState<Diploma | null>(null)
    const [localDiploma, setLocalDiploma] = useState<Diploma | null>(null)
    const [selectedLanguage] = useState<Languages>(locale as Languages)
    const [previewLanguage, setPreviewLanguage] = useState<Languages>(locale as Languages)
    const [nameErrors, setNameErrors] = useState<LocaleErrors>(emptyLocaleErrors)
    const [isRemoving, setIsRemoving] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [addDiplomaModalOpen, setAddDiplomaModalOpen] = useState<boolean>(false)
    const emptyNewDiploma = { name: { en: '', fr: '', ar: '' } as Record<Languages, string>, rank: filterMapping('BAC') }
    const [newDiploma, setNewDiploma] = useState(emptyNewDiploma)
    const [addPreviewLanguage, setAddPreviewLanguage] = useState<Languages>(locale as Languages)
    const [addNameErrors, setAddNameErrors] = useState<LocaleErrors>(emptyLocaleErrors)
    const [isAdding, setIsAdding] = useState<boolean>(false)
    const authFetch = useAuthFetch()

    useEffect(() => {
        const fetchDiplomas = async () => {
            try
            {
                setIsLoading(true)
                const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/diplomas?lang=${locale}`) // ..khsni nsift hna token
                const data = await res.json()
                if (!data.success)
                {
                    toast.error(data.message)
                    return
                }
                setDiplomas(data.diplomas)
            }
            catch (error)
            {
                toast.error(t('fetchDiplomasError'))
            }
            finally
            {
                setIsLoading(false)
            }
        }
        fetchDiplomas()
    }, [locale])

    if (isLoading)
        return <DiplomasSkeleton />

    const filteredDiplomas = selectedFilter === 'ALL' ? diplomas : diplomas.filter(diploma => filterMapping(selectedFilter) === diploma.rank)
    const isUnchanged = JSON.stringify(localDiploma) === JSON.stringify(selectedDiplomaToView)

    const handleDeleteDiploma = async (diploma: Diploma) => {
        try
        {
            setIsRemoving(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/diplomas/${diploma.id}?lang=${locale}`, {
                method: 'DELETE' // ..khsni nsift hna token
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setDiplomas(prev => prev.filter(diplomas => diplomas.id !== diploma.id))
            setSelectedDiplomaToDelete(null)
            setDeleteDiplomaModalOpen(false)
        }
        catch (error)
        {
            toast.error(t('deleteDiplomaGeneralError'))
        }
        finally
        {
            setIsRemoving(false)
        }
    }

    const validateForm = () => {
        if (!localDiploma)
            return null
        const languages: Languages[] = ['en', 'fr', 'ar']
        let hasError = false
        const newNameErrors: LocaleErrors = { en: null, fr: null, ar: null }
        languages.forEach(lang => {
            if (!localDiploma.name[lang].trim())
            {
                hasError = true
                newNameErrors[lang] = t('diplomaNameError')
            }
        })
        setNameErrors(newNameErrors)
        if (hasError)
            return null
        return localDiploma
    }

    const handleUpdateDiploma = async (updatedDiploma: Diploma) => {
        try
        {
            setIsUpdating(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/diplomas/${updatedDiploma.id}?lang=${locale}`, {
                method: 'PATCH', // ..khsni nsift hna token
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDiploma)
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setDiplomas(prev => prev.map(diploma => diploma.id === updatedDiploma.id ? updatedDiploma : diploma))
            setSelectedDiplomaToView(null)
            setLocalDiploma(null)
            setViewDiplomaModalOpen(false)
        }
        catch (error)
        {
            toast.error(t('updateDiplomaGeneralError'))
        }
        finally
        {
            setIsUpdating(false)
        }
    }

    const handleUpdateClick = () => {
        const finalDiploma = validateForm()
        if (finalDiploma)
            handleUpdateDiploma(finalDiploma)
    }

    const validateAddForm = () => {
        const languages: Languages[] = ['en', 'fr', 'ar']
        let hasError = false
        const newErrors: LocaleErrors = { en: null, fr: null, ar: null }
        languages.forEach(lang => {
            if (!newDiploma.name[lang].trim())
            {
                hasError = true
                newErrors[lang] = t('diplomaNameError')
            }
        })
        setAddNameErrors(newErrors)
        if (hasError)
            return null
        return newDiploma
    }

    const closeAddModal = () => {
        if (isAdding)
            return
        setAddDiplomaModalOpen(false)
        setNewDiploma(emptyNewDiploma)
        setAddNameErrors(emptyLocaleErrors)
        setAddPreviewLanguage(locale as Languages)
    }

    const handleAddDiploma = async (diplomaToAdd: typeof newDiploma) => {
        try
        {
            setIsAdding(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/diplomas?lang=${locale}`, {
                method: 'POST', // ..khsni nsift hna token
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(diplomaToAdd)
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setDiplomas(prev => [...prev, data.diploma])
            closeAddModal()
        }
        catch (error)
        {
            toast.error(t('addDiplomaGeneralError'))
        }
        finally
        {
            setIsAdding(false)
        }
    }

    const handleAddClick = () => {
        const finalDiploma = validateAddForm()
        if (finalDiploma)
            handleAddDiploma(finalDiploma)
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4'>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <LuScroll className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalDiplomas')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{diplomas.length}</p>
                    </div>
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <LuScroll className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalBacDiplomas')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{diplomas.filter(d => d.rank === 12).length}</p>
                    </div>
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <LuScroll className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalBacPlus2Diplomas')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{diplomas.filter(d => d.rank === 14).length}</p>
                    </div>
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <LuScroll className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalBacPlus3Diplomas')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{diplomas.filter(d => d.rank === 15).length}</p>
                    </div>
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <LuScroll className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalBacPlus5Diplomas')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{diplomas.filter(d => d.rank === 17).length}</p>
                    </div>
                    <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                        <LuScroll className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                        <p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalBacPlus8Diplomas')}</p>
                        <p className="relative text-xl md:text-4xl font-bold mt-2">{diplomas.filter(d => d.rank === 20).length}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setSelectedFilter('ALL')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${selectedFilter === 'ALL' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('filterAll')}
                </button>
                <button onClick={() => setSelectedFilter('BAC')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${selectedFilter === 'BAC' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('filterBac')}
                </button>
                <button onClick={() => setSelectedFilter('BAC+2')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${selectedFilter === 'BAC+2' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('filterBacPlus2')}
                </button>
                <button onClick={() => setSelectedFilter('BAC+3')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${selectedFilter === 'BAC+3' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('filterBacPlus3')}
                </button>
                <button onClick={() => setSelectedFilter('BAC+5')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${selectedFilter === 'BAC+5' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('filterBacPlus5')}
                </button>
                <button onClick={() => setSelectedFilter('BAC+8')} className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${selectedFilter === 'BAC+8' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('filterBacPlus8')}
                </button>
            </div>
            <div className="border-2 border-(--color-text) overflow-hidden bg-(--color-surface)">
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[60vh]">
                    <table className="w-full text-left border-collapse min-w-200 rtl:text-right">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-(--color-grey)">
                                <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                    {t('tableHeaderName')}
                                </th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                    {t('tableHeaderCategory')}
                                </th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)] text-center">
                                    {t('tableHeaderActions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-(--color-surface)">
                            {filteredDiplomas.length > 0 ? (
                                <>
                                    {filteredDiplomas.map((diploma, index) => (
                                        <tr key={index} className="border-b-2 border-(--color-grey) last:border-0 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-sm">{diploma.name[locale as Languages]}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-sm">{t(`${rankMapping(diploma.rank)}`)}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => {
                                                        setSelectedDiplomaToView(diploma)
                                                        setLocalDiploma(JSON.parse(JSON.stringify(diploma)))
                                                        setPreviewLanguage(locale as Languages)
                                                        setNameErrors(emptyLocaleErrors)
                                                        setViewDiplomaModalOpen(true)
                                                    }} className={`${tableActionButtonStyle} bg-[#ccee00] text-black`}>
                                                        {t('diplomaView')}
                                                        <LuEye size={16} className="stroke-[3px] md:stroke-2" />
                                                    </button>
                                                    <button onClick={() => {setSelectedDiplomaToDelete(diploma); setDeleteDiplomaModalOpen(true)}} className={`${tableActionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
                                                        {t('diplomaDelete')}
                                                        <LuTrash size={16} className="stroke-[3px] md:stroke-2" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-(--color-text)">
                                        <div className="flex flex-col items-center justify-center gap-2 p-8">
                                            <p className="font-bold text-sm uppercase tracking-wide">
                                                {t('noDiplomasAvailable')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <button onClick={() => setAddDiplomaModalOpen(true)} className="fixed bottom-18 md:bottom-8 ltr:right-8 rtl:left-8 border-2 border-(--color-text) p-3 cursor-pointer bg-(--color-accent-soft) hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] z-50">
                <LuPlus size={24}/>
            </button>
            {selectedDiplomaToDelete && deleteDiplomaModalOpen && (
                <div
                    onClick={() => {
                    if (!isRemoving)
                    {
                        setDeleteDiplomaModalOpen(false)
                        setSelectedDiplomaToDelete(null)
                    }
                }}
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) p-4 md:p-6 w-full max-w-sm md:max-w-md relative">
                        <h1 className="text-base md:text-lg font-bold">{t('removeTitle')}</h1>
                        <p className="text-xs md:text-sm mt-2">{t('removeConfirmDescription', {name: selectedDiplomaToDelete.name[locale as Languages]})}</p>
                        <div className="flex gap-3 mt-4 md:mt-6">
                            <button disabled={isRemoving} onClick={() => handleDeleteDiploma(selectedDiplomaToDelete)}
                                className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse text-xs md:text-sm py-1.5 md:py-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isRemoving ? t('removing') : t('remove')}
                                <LuTrash size={16} className="stroke-[3px] md:stroke-2"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {localDiploma && viewDiplomaModalOpen && (
                <div onClick={() => { if (!isUpdating) { setViewDiplomaModalOpen(false); setSelectedDiplomaToView(null); setLocalDiploma(null) } }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative flex flex-col h-[90vh] shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
                            <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text) truncate ltr:pr-4 rtl:pl-4">
                                {localDiploma.name[previewLanguage]}
                            </h1>
                            <button onClick={() => { setViewDiplomaModalOpen(false); setSelectedDiplomaToView(null); setLocalDiploma(null) }} disabled={isUpdating} className="shrink-0 text-(--color-text) hover:bg-gray-100 p-1 border-2 border-transparent hover:border-(--color-text) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
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
                        <div className="overflow-y-auto p-4 md:p-6 flex-1 flex flex-col gap-5 custom-scrollbar ltr:text-left rtl:text-right">
                            <Input
                                inputDir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                                label={t('tableHeaderName')}
                                type="text"
                                value={localDiploma.name[previewLanguage]}
                                error={nameErrors[previewLanguage]}
                                onChange={(e) => {
                                    setLocalDiploma(prev => prev ? {...prev, name: {...prev.name, [previewLanguage]: e.target.value}} : prev)
                                    setNameErrors(prev => ({...prev, [previewLanguage]: null}))
                                }}
                            />
                            <Dropdown
                                label={t('tableHeaderCategory')}
                                placeholder={t('categoryPlaceholder')}
                                value={rankMapping(localDiploma.rank)}
                                options={(['BAC', 'BAC+2', 'BAC+3', 'BAC+5', 'BAC+8'] as DiplomasFilter[]).map(cat => ({
                                    label: t(`${cat}`),
                                    value: cat
                                }))}
                                onChange={(selectedCategory) => {
                                    setLocalDiploma(prev => prev ? {...prev, rank: filterMapping(selectedCategory as DiplomasFilter)} : prev)
                                }}
                            />
                        </div>
                        <div className="p-4 md:p-6 border-t-2 border-(--color-text) bg-white flex justify-end gap-4 z-10">
                            <button disabled={isUnchanged || isUpdating} onClick={handleUpdateClick}
                                className={`${actionButtonStyle} rtl:flex-row-reverse bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}>
                                <p className="md:block">{isUpdating ? t('updating') : t('update')}</p>
                                <LuRefreshCw size={16} className="stroke-[3px] md:stroke-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {addDiplomaModalOpen && (
                <div onClick={closeAddModal} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative flex flex-col h-[90vh] shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
                            <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text) truncate ltr:pr-4 rtl:pl-4">
                                {t('addTitle')}
                            </h1>
                            <button onClick={closeAddModal} disabled={isAdding} className="shrink-0 text-(--color-text) hover:bg-gray-100 p-1 border-2 border-transparent hover:border-(--color-text) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                <LuX size={24} className="stroke-[3px]" />
                            </button>
                        </div>
                        <div className="flex items-center justify-around gap-3 p-4 border-b-2 border-(--color-text) bg-white">
                            {mapLanguage(selectedLanguage).map((lang, index) => (
                                <div key={index} className="flex items-center justify-around gap-3 w-full">
                                    {(['en', 'fr', 'ar'] as Languages[]).map((l) => (
                                        <div key={l} onClick={() => setAddPreviewLanguage(l)}
                                            className={`px-4 py-2 border-2 border-(--color-text) font-semibold cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${addPreviewLanguage === l ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                            {lang[l]}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="overflow-y-auto p-4 md:p-6 flex-1 flex flex-col gap-5 custom-scrollbar ltr:text-left rtl:text-right">
                            <Input
                                inputDir={addPreviewLanguage === 'ar' ? 'rtl' : 'ltr'}
                                label={t('tableHeaderName')}
                                type="text"
                                value={newDiploma.name[addPreviewLanguage]}
                                error={addNameErrors[addPreviewLanguage]}
                                onChange={(e) => {
                                    setNewDiploma(prev => ({...prev, name: {...prev.name, [addPreviewLanguage]: e.target.value}}))
                                    setAddNameErrors(prev => ({...prev, [addPreviewLanguage]: null}))
                                }}
                            />
                            <Dropdown
                                label={t('tableHeaderCategory')}
                                placeholder={t('categoryPlaceholder')}
                                value={rankMapping(newDiploma.rank)}
                                options={(['BAC', 'BAC+2', 'BAC+3', 'BAC+5', 'BAC+8'] as DiplomasFilter[]).map(cat => ({
                                    label: t(`${cat}`),
                                    value: cat
                                }))}
                                onChange={(selectedCategory) => {
                                    setNewDiploma(prev => ({...prev, rank: filterMapping(selectedCategory as DiplomasFilter)}))
                                }}
                            />
                        </div>
                        <div className="p-4 md:p-6 border-t-2 border-(--color-text) bg-white flex justify-end gap-4 z-10">
                            <button disabled={isAdding} onClick={handleAddClick}
                                className={`${actionButtonStyle} rtl:flex-row-reverse bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}>
                                <p className="md:block">{isAdding ? t('adding') : t('add')}</p>
                                <LuPlus size={16} className="stroke-[3px] md:stroke-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DiplomasDashboard