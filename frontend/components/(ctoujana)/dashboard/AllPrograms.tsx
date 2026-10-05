'use client'

import { useLocale, useTranslations } from "next-intl"
import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react"
import { Program } from "./ProgramsDashboard"
import { tableActionButtonStyle } from "./UniversityDashboard"
import { LuEye, LuTrash } from "react-icons/lu"
import { toast } from "sonner"
import { categoryIconMap } from "@/app/(zguellou)/constants"
import { LuPlus } from "react-icons/lu"
import ViewProgram from "./ViewProgram"
import { Diploma } from "./ProgramsDashboard"
import { UniversityForProgram } from "./ProgramsDashboard"
import { Category } from "./ProgramsDashboard"
import Input from "../../input"
import Dropdown from "@/components/dropdown"
import { LuCheck, LuTrash2, LuX } from "react-icons/lu"
import { mapLanguage, actionButtonStyle } from "./UniversityDashboard"
import { DiplomasCategories, DiplomaRecognitionStatus, ProgramRequirement } from "./ProgramsDashboard"
import { getCategory, getDiplomaCategories } from "./ViewProgram"
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"
import { Jobs } from "./JobsDashboard"

interface Props
{
    allPrograms: Program[],
    setAllPrograms: Dispatch<SetStateAction<Program[]>>
    diplomas: Diploma[]
    universities: UniversityForProgram[]
    categories: Category[]
    jobs: Jobs[]
}

type Languages = 'en' | 'fr' | 'ar'
type NewRequirement = { id: string, requiredDiploma: Diploma | null, minGrade: string, maxYearsSinceGraduation: number | null }
type NewRequirementErrors = { requiredDiploma: string | null, minGrade: string | null }

export default function AllPrograms({ allPrograms, setAllPrograms, diplomas, universities, categories, jobs } : Props) {
    const locale = useLocale()
    const t = useTranslations('dashboard.programsDashboardTab')
    const [viewProgramOpen, setViewProgramOpen] = useState<boolean>(false)
    const [selectedProgramToView, setSelectedProgramToView] = useState<Program | null>(null)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [removeProgramModalOpen, setRemoveProgramModalOpen] = useState<boolean>(false)
    const [programToRemove, setProgramToRemove] = useState<Program | null>(null)
    const [isRemoving, setIsRemoving] = useState<boolean>(false)
    const [addProgramModalOpen, setAddProgramModalOpen] = useState<boolean>(false)
    const emptyLocaleFields: Record<Languages, string> = { en: "", fr: "", ar: "" }
    const emptyLocaleErrors: Record<Languages, string | null> = { en: null, fr: null, ar: null }
    const [addModalLanguage, setAddModalLanguage] = useState<Languages>(locale as Languages)
    const [addModalSelectorLanguage] = useState<Languages>(locale as Languages)
    const requirementRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const [lastAddedRequirementId, setLastAddedRequirementId] = useState<string | null>(null)
    const [isSubmittingProgram, setIsSubmittingProgram] = useState<boolean>(false)
    const [newProgramName, setNewProgramName] = useState<Record<Languages, string>>(emptyLocaleFields)
    const [newProgramNameError, setNewProgramNameError] = useState<Record<Languages, string | null>>(emptyLocaleErrors)
    const [newProgramCategory, setNewProgramCategory] = useState<Category | null>(null)
    const [newProgramCategoryError, setNewProgramCategoryError] = useState<string | null>(null)
    const [newProgramDiplomaCategoryFilter, setNewProgramDiplomaCategoryFilter] = useState<DiplomasCategories | null>(null)
    const [newProgramOutputDiploma, setNewProgramOutputDiploma] = useState<Diploma | null>(null)
    const [newProgramOutputDiplomaError, setNewProgramOutputDiplomaError] = useState<string | null>(null)
    const [newProgramUniversity, setNewProgramUniversity] = useState<UniversityForProgram | null>(null)
    const [newProgramUniversityError, setNewProgramUniversityError] = useState<string | null>(null)
    const [newProgramYearsOfStudy, setNewProgramYearsOfStudy] = useState<string>('')
    const [newProgramYearsOfStudyError, setNewProgramYearsOfStudyError] = useState<string | null>(null)
    const [newProgramMonthlySubscription, setNewProgramMonthlySubscription] = useState<string>('')
    const [newProgramMonthlySubscriptionError, setNewProgramMonthlySubscriptionError] = useState<string | null>(null)
    const [newProgramMaxAge, setNewProgramMaxAge] = useState<string>('')
    const [newProgramDiplomaRecognitionAbroad, setNewProgramDiplomaRecognitionAbroad] = useState<DiplomaRecognitionStatus | ''>('')
    const [newProgramDiplomaRecognitionMorocco, setNewProgramDiplomaRecognitionMorocco] = useState<DiplomaRecognitionStatus | ''>('')
    const [newProgramHasConcours, setNewProgramHasConcours] = useState<boolean>(false)
    const emptyNewRequirementErrors: NewRequirementErrors = { requiredDiploma: null, minGrade: null }
    const [newProgramRequirements, setNewProgramRequirements] = useState<NewRequirement[]>([
        { id: crypto.randomUUID(), requiredDiploma: null, minGrade: '', maxYearsSinceGraduation: null }
    ])
    const [newRequirementFilters, setNewRequirementFilters] = useState<Record<string, DiplomasCategories | null>>({})
    const [newRequirementErrors, setNewRequirementErrors] = useState<Record<string, NewRequirementErrors>>({})
    const authFetch = useAuthFetch()
    const [newProgramJobTitles, setNewProgramJobTitles] = useState<Jobs[]>([])
    const [newProgramJobTitlesError, setNewProgramJobTitlesError] = useState<string | null>(null)

    const eligibleJobTitles = jobs.filter(job => !newProgramJobTitles.some(jt => jt.id === job.id))

    useEffect(() => {
        if (lastAddedRequirementId && requirementRefs.current[lastAddedRequirementId])
        {
            requirementRefs.current[lastAddedRequirementId]?.scrollIntoView({behavior: 'smooth', block: 'center'})
            setLastAddedRequirementId(null)
        }
    }, [lastAddedRequirementId])

    const handleUpdateProgram = async (program: Program) => {
        try
        {
            setIsUpdating(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/programs/${program.id}?lang=${locale}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }, // khsni nsift hna token ..
                body: JSON.stringify(program)
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setAllPrograms(prev => prev.map(p => p.id === program.id ? program : p))
            setViewProgramOpen(false)
            setSelectedProgramToView(null)
        }
        catch (error)
        {
            toast.error(t('programUpdateGeneralError'))
        }
        finally
        {
            setIsUpdating(false)
        }
    }

    const handleDeleteProgram = async (program: Program) => {
        try
        {
            setIsRemoving(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/programs/${program.id}?lang=${locale}`, {
                method: 'DELETE', // khsni nsift hna token ..
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setAllPrograms(prev => prev.filter(p => p.id != program.id))
            setRemoveProgramModalOpen(false)
            setProgramToRemove(null)
        }
        catch (error)
        {
            toast.error(t('removeProgramGeneralError'))
        }
        finally
        {
            setIsRemoving(false)
        }
    }

    const validateNewProgramForm = () => {
        const languages: Languages[] = ['en', 'fr', 'ar']
        let hasError = false
        const newNameErrors: Record<Languages, string | null> = { en: null, fr: null, ar: null }
        languages.forEach(lang => {
            if (!newProgramName[lang].trim())
            {
                hasError = true
                newNameErrors[lang] = t('programNameError')
            }
        })
        setNewProgramNameError(newNameErrors)
        if (!newProgramCategory)
        {
            hasError = true
            setNewProgramCategoryError(t('programCategoryError'))
        }
        else
            setNewProgramCategoryError(null)
        if (!newProgramOutputDiploma)
        {
            hasError = true
            setNewProgramOutputDiplomaError(t('programOutputDiplomaError'))
        }
        else
            setNewProgramOutputDiplomaError(null)
        if (!newProgramUniversity)
        {
            hasError = true
            setNewProgramUniversityError(t('programUniversityError'))
        }
        else
            setNewProgramUniversityError(null)
        if (!newProgramYearsOfStudy.trim())
        {
            hasError = true
            setNewProgramYearsOfStudyError(t('yearsOfStudyError'))
        }
        else if (Number(newProgramYearsOfStudy) < 1)
        {
            hasError = true
            setNewProgramYearsOfStudyError(t('yearsOfStudyMinError'))
        }
        else
            setNewProgramYearsOfStudyError(null)
        if (!newProgramMonthlySubscription.trim())
        {
            hasError = true
            setNewProgramMonthlySubscriptionError(t('monthlySubscriptionError'))
        }
        else
            setNewProgramMonthlySubscriptionError(null)
        if (newProgramJobTitles.length === 0)
        {
            hasError = true
            setNewProgramJobTitlesError(t('jobTitlesError'))
        }
        else
            setNewProgramJobTitlesError(null)
        const newReqErrors: Record<string, NewRequirementErrors> = {}
        newProgramRequirements.forEach(req => {
            const errs: NewRequirementErrors = { requiredDiploma: null, minGrade: null }
            if (!req.requiredDiploma)
            {
                hasError = true
                errs.requiredDiploma = t('requiredDiplomaError')
            }
            if (!req.minGrade || !req.minGrade.trim())
            {
                hasError = true
                errs.minGrade = t('minGradeError')
            }
            else if (Number(req.minGrade) < 10 || Number(req.minGrade) > 20)
            {
                hasError = true
                errs.minGrade = t('minGradeNotInRangeError')
            }
            newReqErrors[req.id] = errs
        })
        setNewRequirementErrors(newReqErrors)
        return !hasError
    }

    const handleCloseAddProgramModal = () => {
        setAddProgramModalOpen(false)
        setNewProgramName(emptyLocaleFields)
        setNewProgramNameError(emptyLocaleErrors)
        setNewProgramCategory(null)
        setNewProgramCategoryError(null)
        setNewProgramDiplomaCategoryFilter(null)
        setNewProgramOutputDiploma(null)
        setNewProgramOutputDiplomaError(null)
        setNewProgramUniversity(null)
        setNewProgramUniversityError(null)
        setNewProgramYearsOfStudy('')
        setNewProgramYearsOfStudyError(null)
        setNewProgramMonthlySubscription('')
        setNewProgramMonthlySubscriptionError(null)
        setNewProgramMaxAge('')
        setNewProgramDiplomaRecognitionAbroad('')
        setNewProgramDiplomaRecognitionMorocco('')
        setNewProgramHasConcours(false)
        const resetId = crypto.randomUUID()
        setNewProgramRequirements([{ id: resetId, requiredDiploma: null, minGrade: '', maxYearsSinceGraduation: null }])
        setNewRequirementFilters({ [resetId]: null })
        setNewRequirementErrors({ [resetId]: { ...emptyNewRequirementErrors } })
        requirementRefs.current = {}
        setNewProgramJobTitles([])
        setNewProgramJobTitlesError(null)
    }

    const handleAddNewProgramJobTitle = (jobId: string) => {
        const selected = jobs.find(job => job.id === jobId)
        if (selected)
        {
            setNewProgramJobTitles(prev => [...prev, selected])
            setNewProgramJobTitlesError(null)
        }
    }

    const handleRemoveNewProgramJobTitle = (id: string) => {
        setNewProgramJobTitles(prev => prev.filter(job => job.id !== id))
    }

    const handleAddNewProgram = async () => {
        if (!validateNewProgramForm())
            return
        try
        {
            setIsSubmittingProgram(true)
            const body = {
                name: newProgramName,
                categoryId: newProgramCategory!.id,
                outputDiplomaId: newProgramOutputDiploma!.id,
                universityId: newProgramUniversity!.id,
                yearsOfStudy: Number(newProgramYearsOfStudy),
                monthlySubscription: Number(newProgramMonthlySubscription),
                maxAge: newProgramMaxAge ? Number(newProgramMaxAge) : null,
                diplomaRecognitionAbroadStatus: newProgramDiplomaRecognitionAbroad || null,
                diplomaRecognitionMoroccoStatus: newProgramDiplomaRecognitionMorocco || null,
                hasConcours: newProgramHasConcours,
                requirements: newProgramRequirements.map(req => ({
                    requiredDiplomaId: req.requiredDiploma!.id,
                    minGrade: req.minGrade,
                    maxYearsSinceGraduation: req.maxYearsSinceGraduation,
                    requirementGroup: 1 // hadi tanswl wrdi chnahia
                })),
                jobTitles: newProgramJobTitles
            }
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/programs?lang=${locale}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // khsni nsift hna token ..
                body: JSON.stringify(body)
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setAllPrograms(prev => [data.program, ...prev])
            handleCloseAddProgramModal()
        }
        catch (error)
        {
            toast.error(t('programCreateGeneralError'))
        }
        finally
        {
            setIsSubmittingProgram(false)
        }
    }

    return (
        <div className="border-2 border-(--color-text) overflow-hidden bg-(--color-surface)">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[60vh]">
                <table className="w-full text-left border-collapse min-w-200 rtl:text-right">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-(--color-grey)">
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                {t('programName')}
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                {t('programCategory')}
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                {t('programUniversity')}
                            </th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)] text-center">
                                {t('programActions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-(--color-surface)">
                        {allPrograms.length > 0 ? (
                            <>
                                {allPrograms.map((program) => {
                                    const Icon = categoryIconMap[program.category?.slug as string]
                                    return (
                                        <tr key={program.id} className="border-b-2 border-(--color-grey) last:border-0 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="min-w-10 h-10 px-2 border-2 border-(--color-text) bg-[#CDEF00] flex items-center justify-center font-bold text-xs shrink-0 leading-none text-center">
                                                        <Icon className="stroke-[3px] md:stroke-2 w-5 h-5"/>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{program.name[locale as Languages]}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-sm">{program.category?.name[locale as Languages]}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-sm">{program.university.name[locale as Languages]}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => {setViewProgramOpen(true); setSelectedProgramToView(program)}} className={`${tableActionButtonStyle} bg-[#ccee00] text-black`}>
                                                        {t('programView')}
                                                        <LuEye size={16} className="stroke-[3px] md:stroke-2" />
                                                    </button>
                                                    <button onClick={() => {setRemoveProgramModalOpen(true); setProgramToRemove(program)}} className={`${tableActionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
                                                        {t('programDelete')}
                                                        <LuTrash size={16} className="stroke-[3px] md:stroke-2" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </>
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-(--color-text)">
                                    <div className="flex flex-col items-center justify-center gap-2 p-8">
                                        <p className="font-bold text-sm uppercase tracking-wide">
                                            {t('programNoProgram')}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button onClick={() => setAddProgramModalOpen(true)} className="fixed bottom-18 md:bottom-8 ltr:right-8 rtl:left-8 border-2 border-(--color-text) p-3 cursor-pointer bg-(--color-accent-soft) hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] z-50">
                <LuPlus size={24}/>
            </button>
            <ViewProgram
                isOpen={viewProgramOpen}
                mode="ALL"
                program={selectedProgramToView}
                onClose={() => {
                    if (!isUpdating)
                    {
                        setViewProgramOpen(false)
                        setSelectedProgramToView(null)
                    }
                }}
                onUpdate={handleUpdateProgram}
                isUpdating={isUpdating}
                diplomas={diplomas}
                universities={universities}
                categories={categories}
                jobs={jobs}
            />
            {removeProgramModalOpen && programToRemove && (
                <div
                    onClick={() => {
                    if (!isRemoving)
                    {
                        setRemoveProgramModalOpen(false)
                        setProgramToRemove(null)
                    }
                }} 
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) p-4 md:p-6 w-full max-w-sm md:max-w-md relative">
                        <h1 className="text-base md:text-lg font-bold">{t('removeConfirmTitle')}</h1>
                        <p className="text-xs md:text-sm mt-2">{t('removeConfirmDescription', {name: programToRemove.name[locale as Languages]})}</p>
                        <div className="flex gap-3 mt-4 md:mt-6">
                            <button disabled={isRemoving} onClick={() => handleDeleteProgram(programToRemove)}
                                className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse text-xs md:text-sm py-1.5 md:py-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isRemoving ? t('removing') : t('remove')}
                                <LuTrash size={16} className="stroke-[3px] md:stroke-2"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {addProgramModalOpen && (
                <div onClick={() => { if (!isSubmittingProgram) handleCloseAddProgramModal() }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative max-h-[90vh] flex flex-col shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
                            <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text)">
                                {t('addNewProgramTitle')}
                            </h1>
                            <button onClick={handleCloseAddProgramModal} disabled={isSubmittingProgram} className="text-(--color-text) hover:bg-gray-100 p-1 border-2 border-transparent hover:border-(--color-text) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                <LuX size={24} className="stroke-[3px]" />
                            </button>
                        </div>
                        <div className="flex items-center justify-around gap-3 p-4 border-b-2 border-(--color-text) bg-white">
                            {mapLanguage(addModalSelectorLanguage).map((lang, index) => (
                                <div key={index} className="flex items-center justify-around gap-3 w-full">
                                    {(['en', 'fr', 'ar'] as Languages[]).map((l) => (
                                        <div key={l} onClick={() => setAddModalLanguage(l)}
                                            className={`px-4 py-2 border-2 border-(--color-text) font-semibold cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${addModalLanguage === l ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                            {lang[l]}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="overflow-y-auto p-4 md:p-6 flex-1 flex flex-col gap-8 custom-scrollbar">
                            <div className="flex flex-col gap-5 p-5 border-2 border-(--color-text) bg-gray-50/50">
                                <h2 className="font-bold uppercase text-lg border-b-2 border-(--color-text) pb-2 mb-2">{t('generalInfo')}</h2>
                                <Input
                                    inputDir={addModalLanguage === 'ar' ? 'rtl' : 'ltr'}
                                    label={t('name')}
                                    type="text"
                                    value={newProgramName[addModalLanguage]}
                                    error={newProgramNameError[addModalLanguage]}
                                    onChange={(e) => {
                                        setNewProgramName(prev => ({ ...prev, [addModalLanguage]: e.target.value }))
                                        setNewProgramNameError(prev => ({ ...prev, [addModalLanguage]: null }))
                                    }}
                                />
                                <Dropdown
                                    label={t('programCategory')}
                                    options={categories.map(cat => ({ value: cat.id, label: cat.name[locale as Languages] }))}
                                    placeholder={t('programCategoryPlaceholder')}
                                    value={newProgramCategory?.id || ''}
                                    error={newProgramCategoryError}
                                    onChange={(selectedId: string) => {
                                        const selected = categories.find(cat => cat.id === selectedId)
                                        if (selected)
                                        {
                                            setNewProgramCategory(selected)
                                            setNewProgramCategoryError(null)
                                        }
                                    }}
                                />
                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 border-2 p-4">
                                    <Dropdown
                                        label={t('diplomaCategory')}
                                        options={getDiplomaCategories(locale as Languages)}
                                        placeholder={t('diplomaCategoryPlaceholder')}
                                        value={newProgramDiplomaCategoryFilter || ''}
                                        onChange={(selectedCategory: string) => {
                                            setNewProgramDiplomaCategoryFilter(selectedCategory as DiplomasCategories)
                                            setNewProgramOutputDiploma(null)
                                        }}
                                    />
                                    <Dropdown
                                        label={t('outputDiploma')}
                                        options={(newProgramDiplomaCategoryFilter ? diplomas.filter(dip => getCategory(dip.rank) === newProgramDiplomaCategoryFilter) : diplomas).map(dip => ({ value: dip.id, label: dip.name[locale as Languages] }))}
                                        placeholder={t('outputDiplomaPlaceholder')}
                                        value={newProgramOutputDiploma?.id || ''}
                                        error={newProgramOutputDiplomaError}
                                        onChange={(selectedId: string) => {
                                            const selected = diplomas.find(dip => dip.id === selectedId)
                                            if (selected)
                                            {
                                                setNewProgramOutputDiploma(selected)
                                                setNewProgramOutputDiplomaError(null)
                                            }
                                        }}
                                    />
                                </div>
                                <Dropdown
                                    label={t('university')}
                                    options={universities.map(uni => ({ value: uni.id, label: uni.name[locale as Languages] }))}
                                    placeholder={t('universityPlaceholder')}
                                    value={newProgramUniversity?.id || ''}
                                    error={newProgramUniversityError}
                                    onChange={(selectedId: string) => {
                                        const selected = universities.find(uni => uni.id === selectedId)
                                        if (selected)
                                        {
                                            setNewProgramUniversity(selected)
                                            setNewProgramUniversityError(null)
                                        }
                                    }}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <Input
                                        inputDir={'ltr'}
                                        label={t('yearsOfStudy')}
                                        type="text"
                                        value={newProgramYearsOfStudy}
                                        error={newProgramYearsOfStudyError}
                                        onChange={(e) => {
                                            if (e.target.value !== '' && Number.isNaN(Number(e.target.value)))
                                                return
                                            setNewProgramYearsOfStudy(e.target.value)
                                            setNewProgramYearsOfStudyError(null)
                                        }}
                                    />
                                    <Input
                                        inputDir={'ltr'}
                                        label={t('monthlySubscription')}
                                        type="text"
                                        value={newProgramMonthlySubscription}
                                        error={newProgramMonthlySubscriptionError}
                                        onChange={(e) => {
                                            if (e.target.value !== '' && Number.isNaN(Number(e.target.value)))
                                                return
                                            setNewProgramMonthlySubscription(e.target.value)
                                            setNewProgramMonthlySubscriptionError(null)
                                        }}
                                    />
                                    <Input
                                        inputDir={'ltr'}
                                        label={t('maxAge')}
                                        type="text"
                                        value={newProgramMaxAge}
                                        onChange={(e) => {
                                            if (e.target.value !== '' && Number.isNaN(Number(e.target.value)))
                                                return
                                            setNewProgramMaxAge(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Dropdown
                                        label={t('DiplomaRecognitionAbroad')}
                                        options={(['RECOGNIZED', 'NOT_RECOGNIZED', 'EVALUATION_REQUIRED'] as DiplomaRecognitionStatus[]).map(status => ({ value: status, label: t(`${status}`) }))}
                                        placeholder={t('diplomaRecognitionPlaceholder')}
                                        value={newProgramDiplomaRecognitionAbroad}
                                        onChange={(selectedStatus: string) => setNewProgramDiplomaRecognitionAbroad(selectedStatus as DiplomaRecognitionStatus)}
                                    />
                                    <Dropdown
                                        label={t('DiplomaRecognitionMorocco')}
                                        options={(['RECOGNIZED', 'NOT_RECOGNIZED', 'EVALUATION_REQUIRED'] as DiplomaRecognitionStatus[]).map(status => ({ value: status, label: t(`${status}`) }))}
                                        placeholder={t('diplomaRecognitionPlaceholder')}
                                        value={newProgramDiplomaRecognitionMorocco}
                                        onChange={(selectedStatus: string) => setNewProgramDiplomaRecognitionMorocco(selectedStatus as DiplomaRecognitionStatus)}
                                    />
                                </div>
                                <div onClick={() => setNewProgramHasConcours(!newProgramHasConcours)} className="flex items-center gap-3 cursor-pointer select-none pt-2 border-t-2 border-(--color-text)/20">
                                    <div className={`w-5 h-5 border-2 border-(--color-text) flex items-center justify-center transition-colors ${newProgramHasConcours ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                        {newProgramHasConcours && <LuCheck size={14} className="stroke-[3px]" />}
                                    </div>
                                    <p className="text-sm font-semibold uppercase">{t('hasConcours')}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 border-2 border-(--color-text) p-4">
                                <h2 className="font-bold uppercase text-lg">{t('jobTitles')}</h2>
                                <Dropdown
                                    label={t('jobTitle')}
                                    options={eligibleJobTitles.map(job => ({ value: job.id, label: job.title[locale as Languages] }))}
                                    placeholder={t('jobTitlePlaceholder')}
                                    value={''}
                                    error={newProgramJobTitlesError}
                                    onChange={(selectedId: string) => handleAddNewProgramJobTitle(selectedId)}
                                />
                                <div className="flex flex-wrap gap-3">
                                    {newProgramJobTitles.map(job => (
                                        <div key={job.id} className="flex items-center gap-2 border-2 border-(--color-text) px-3 py-2 bg-white">
                                            <p className="text-sm font-semibold">{job.title[locale as Languages]}</p>
                                            <button type="button" onClick={() => handleRemoveNewProgramJobTitle(job.id)}
                                                className="text-(--color-text) hover:text-red-900 cursor-pointer">
                                                <LuTrash2 size={14} className="stroke-[3px]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h2 className="font-bold uppercase text-lg">{t('requirements')}</h2>
                                {newProgramRequirements.map((req, index) => {
                                    const filter = newRequirementFilters[req.id] || null
                                    const eligibleDiplomas = filter ? diplomas.filter(dip => getCategory(dip.rank) === filter) : diplomas
                                    return (
                                        <div key={req.id} ref={(el) => {requirementRefs.current[req.id] = el}} className="border-2 border-(--color-text) p-5 relative bg-white mt-3">
                                            <span className="absolute -top-3.5 ltr:-left-3.5 rtl:-right-3.5 bg-[#ccee00] border-2 border-(--color-text) px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                                {`${t('requirement')} ${index + 1}`}
                                            </span>
                                            <button type="button" onClick={() => {
                                                setNewProgramRequirements(prev => prev.filter(r => r.id !== req.id))
                                                setNewRequirementFilters(prev => { const next = { ...prev }; delete next[req.id]; return next })
                                                setNewRequirementErrors(prev => { const next = { ...prev }; delete next[req.id]; return next })
                                                delete requirementRefs.current[req.id]
                                            }} className="absolute -top-3.5 ltr:-right-3.5 rtl:-left-3.5 bg-red-900 text-white border-2 border-(--color-text) p-1 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer">
                                                <LuTrash2 size={16} className="stroke-[2px]" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <Dropdown
                                                    label={t('diplomaCategory')}
                                                    options={getDiplomaCategories(locale as Languages)}
                                                    placeholder={t('diplomaCategoryPlaceholder')}
                                                    value={filter || ''}
                                                    onChange={(selectedCategory: string) => {
                                                        setNewRequirementFilters(prev => ({ ...prev, [req.id]: selectedCategory as DiplomasCategories }))
                                                        setNewProgramRequirements(prev => prev.map(r => r.id === req.id ? { ...r, requiredDiploma: null } : r))
                                                    }}
                                                />
                                                <Dropdown
                                                    label={t('requiredDiploma')}
                                                    options={eligibleDiplomas.map(dip => ({ value: dip.id, label: dip.name[locale as Languages] }))}
                                                    placeholder={t('requiredDiplomaPlaceholder')}
                                                    value={req.requiredDiploma?.id || ''}
                                                    error={newRequirementErrors[req.id]?.requiredDiploma}
                                                    onChange={(selectedId: string) => {
                                                        const selected = eligibleDiplomas.find(dip => dip.id === selectedId)
                                                        if (selected)
                                                        {
                                                            setNewProgramRequirements(prev => prev.map(r => r.id === req.id ? { ...r, requiredDiploma: selected } : r))
                                                            setNewRequirementErrors(prev => ({ ...prev, [req.id]: { ...(prev[req.id] || emptyNewRequirementErrors), requiredDiploma: null } }))
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <Input
                                                    inputDir={'ltr'}
                                                    label={t('minGrade')}
                                                    type="text"
                                                    value={req.minGrade}
                                                    error={newRequirementErrors[req.id]?.minGrade}
                                                    onChange={(e) => {
                                                        if (e.target.value !== '' && Number.isNaN(Number(e.target.value)))
                                                            return
                                                        setNewProgramRequirements(prev => prev.map(r => r.id === req.id ? { ...r, minGrade: e.target.value } : r))
                                                        setNewRequirementErrors(prev => ({ ...prev, [req.id]: { ...(prev[req.id] || emptyNewRequirementErrors), minGrade: null } }))
                                                    }}
                                                />
                                                <Input
                                                    inputDir={'ltr'}
                                                    label={t('maxYearsSinceGraduation')}
                                                    type="text"
                                                    value={req.maxYearsSinceGraduation ?? ''}
                                                    onChange={(e) => {
                                                        if (e.target.value !== '' && Number.isNaN(Number(e.target.value)))
                                                            return
                                                        setNewProgramRequirements(prev => prev.map(r => r.id === req.id ? { ...r, maxYearsSinceGraduation: e.target.value === '' ? null : Number(e.target.value) } : r))
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                <button type="button" onClick={() => {
                                    const newId = crypto.randomUUID()
                                    setNewProgramRequirements(prev => [...prev, { id: newId, requiredDiploma: null, minGrade: '', maxYearsSinceGraduation: null }])
                                    setNewRequirementFilters(prev => ({ ...prev, [newId]: null }))
                                    setNewRequirementErrors(prev => ({ ...prev, [newId]: { ...emptyNewRequirementErrors } }))
                                    setLastAddedRequirementId(newId)
                                }} className="flex items-center justify-center gap-2 py-2 border-2 border-(--color-text) border-dashed hover:border-solid text-base font-semibold hover:bg-gray-100 cursor-pointer">
                                    <LuPlus size={14} className="stroke-[3px]" />
                                    {t('addRequirement')}
                                </button>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t-2 border-(--color-text) bg-white flex justify-end gap-4 z-10">
                            <button onClick={handleCloseAddProgramModal} disabled={isSubmittingProgram}
                                className="px-6 py-2.5 border-2 border-(--color-text) bg-white font-bold text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                {t('cancel')}
                            </button>
                            <button disabled={isSubmittingProgram} onClick={handleAddNewProgram}
                                className="px-6 py-2.5 border-2 border-(--color-text) bg-(--color-text) text-white font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmittingProgram ? t('saving') : t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}