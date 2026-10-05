'use client'

import { useLocale, useTranslations } from "next-intl"
import { useState, useEffect, useRef } from "react"
import { LuX, LuCheck, LuRefreshCw, LuPlus, LuTrash2 } from "react-icons/lu"
import Input from "../../input"
import Dropdown from "@/components/dropdown"
import { Program } from "./ProgramsDashboard"
import { Languages, mapLanguage, actionButtonStyle } from "./UniversityDashboard"
import { Diploma } from "./ProgramsDashboard"
import { DiplomasCategories } from "./ProgramsDashboard"
import { UniversityForProgram } from "./ProgramsDashboard"
import { DiplomaRecognitionStatus } from "./ProgramsDashboard"
import { Category } from "./ProgramsDashboard"
import { ProgramRequirement } from "./ProgramsDashboard"
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"
import { Jobs } from "./JobsDashboard"

interface Props
{
    isOpen: boolean
    mode: 'PENDING' | 'ALL'
    program: Program | null
    onClose: () => void
    onApprove?: (updatedProgram: Program) => void
    onReject?: (program: Program) => void
    onUpdate?: (updatedProgram: Program) => void
    isUpdating?: boolean
    isApproving?: boolean
    isRejecting?: boolean
    diplomas: Diploma[]
    universities: UniversityForProgram[]
    categories: Category[]
    jobs: Jobs[]
}

type LocaleErrors = Record<Languages, string | null>
type RequirementErrors = {requiredDiploma: string | null, minGrade: string | null}

const rankCategory: Record<number, DiplomasCategories> = {
    12: "BAC",
    14: "BAC+2",
    15: "BAC+3",
    17: "BAC+5",
    20: "BAC+8",
}

const DiplomaStatus: DiplomaRecognitionStatus[] = ['RECOGNIZED', 'NOT_RECOGNIZED', 'EVALUATION_REQUIRED']

export const getCategory = (rank: number): DiplomasCategories => rankCategory[rank]

export const getDiplomaCategories = (locale: Languages) => {
    const diploma_categories: DiplomasCategories[] = ["BAC", "BAC+2", "BAC+3", "BAC+5", "BAC+8"];
    const translations = {
        en: {
            "BAC": "Baccalaureate (BAC)",
            "BAC+2": "Bac +2 (DEUG/DEUST/DUT/BTS)",
            "BAC+3": "Bac +3 (Licence)",
            "BAC+5": "Bac +5 (Master/Engineering)",
            "BAC+8": "Doctorate (PhD)"
        },
        fr: {
            "BAC": "Baccalauréat (BAC)",
            "BAC+2": "Bac +2 (DEUG/DEUST/DUT/BTS)",
            "BAC+3": "Bac +3 (Licence)",
            "BAC+5": "Bac +5 (Master/Ingénieur)",
            "BAC+8": "Doctorat (PhD)"
        },
        ar: {
            "BAC": "البكالوريا (BAC)",
            "BAC+2": "بكالوريا +2 (DEUG/DEUST/DUT/BTS)",
            "BAC+3": "بكالوريا +3 (إجازة)",
            "BAC+5": "بكالوريا +5 (ماستر/مهندس)",
            "BAC+8": "دكتوراه (PhD)"
        }
    }
    return diploma_categories.map(category => ({value: category, label: translations[locale][category]}))
}

export default function ViewProgram({ isOpen, mode, program, onClose, onApprove, onReject, onUpdate, isUpdating, isApproving, isRejecting, diplomas, universities, categories, jobs } : Props) {
    const t = useTranslations('dashboard.programsDashboardTab')
    const locale = useLocale()
    const [localProgram, setLocalProgram] = useState<Program | null>(null)
    const [selectedLanguage, setSelectedLanguage] = useState<Languages>(locale as Languages)
    const [previewLanguage, setPreviewLanguage] = useState<Languages>(selectedLanguage)
    const [categoryFilter, setCategoryFilter] = useState<DiplomasCategories | null>(null)
    const [requirementFilters, setRequirementFilters] = useState<Record<string, DiplomasCategories | null>>({})
    const requirementRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const [lastAddedRequirementId, setLastAddedRequirementId] = useState<string | null>(null)
    const emptyLocaleErrors: LocaleErrors = { en: null, fr: null, ar: null }
    const [nameErrors, setNameErrors] = useState<LocaleErrors>(emptyLocaleErrors)
    const [outputDiplomaError, setOutputDiplomaError] = useState<string | null>(null)
    const [yearsOfStudyError, setYearsOfStudyError] = useState<string | null>(null)
    const [monthlySubscriptionError, setMonthlySubscriptionError] = useState<string | null>(null)
    const emptyRequirementErrors: RequirementErrors = { requiredDiploma: null, minGrade: null }
    const [requirementErrors, setRequirementErrors] = useState<Record<string, RequirementErrors>>({})
    const [jobTitlesError, setJobTitlesError] = useState<string | null>(null)
    const authFetch = useAuthFetch

    const eligibleOutputDiplomas = categoryFilter ? diplomas.filter(dip => getCategory(dip.rank) === categoryFilter) : diplomas

    useEffect(() => {
        if (lastAddedRequirementId && requirementRefs.current[lastAddedRequirementId])
        {
            requirementRefs.current[lastAddedRequirementId]?.scrollIntoView({behavior: 'smooth', block: 'center'})
            setLastAddedRequirementId(null)
        }
    }, [lastAddedRequirementId])

    useEffect(() => {
        if (isOpen && program)
        {
            setLocalProgram(JSON.parse(JSON.stringify(program)))
            setPreviewLanguage(locale as Languages)
            setCategoryFilter(program.outputDiploma ? (getCategory(program.outputDiploma.rank) || null) : null)
            setRequirementFilters(
                Object.fromEntries(
                    program.requirements.map(req => [
                        req.id,
                        req.requiredDiploma ? getCategory(req.requiredDiploma.rank) : null
                    ])
                )
            )
            setRequirementErrors(
                Object.fromEntries(program.requirements.map(req => [req.id, { ...emptyRequirementErrors }]))
            )
            setNameErrors(emptyLocaleErrors)
        }
        else if (!isOpen)
        {
            setLocalProgram(null)
            setCategoryFilter(null)
            setRequirementFilters({})
            setRequirementErrors({})
        }
    }, [isOpen, program, locale])

    if (!isOpen || !localProgram)
        return null

    const isUnchanged = JSON.stringify(localProgram) === JSON.stringify(program)
    const eligibleJobTitles = jobs.filter(job => !localProgram.jobTitles.some(jt => jt.id === job.id))

    const handleAddJobTitle = (jobId: string) => {
        const selected = jobs.find(job => job.id === jobId)
        if (selected)
        {
            setLocalProgram(prev => prev ? {
                ...prev,
                jobTitles: [...prev.jobTitles, selected]
            } : prev)
            setJobTitlesError(null)
        }
    }

    const handleRemoveJobTitle = (id: string) => {
        setLocalProgram(prev => prev ? {
            ...prev,
            jobTitles: prev.jobTitles.filter(job => job.id !== id)
        } : prev)
    }

    const handleAddRequirement = () => {
        const newId = crypto.randomUUID()
        setLocalProgram(prev => prev ? {
            ...prev,
            requirements: [...prev.requirements, {
                id: newId,
                minGrade: '',
                maxYearsSinceGraduation: null,
                requirementGroup: 1,
                requiredDiploma: null
            }]
        } : prev)
        setRequirementFilters(prev => ({ ...prev, [newId]: null }))
        setRequirementErrors(prev => ({ ...prev, [newId]: { ...emptyRequirementErrors } }))
        setLastAddedRequirementId(newId)
    }

    const handleRemoveRequirement = (id: string) => {
        setLocalProgram(prev => prev ? {
            ...prev,
            requirements: prev.requirements.filter(req => req.id !== id)
        } : prev)
        setRequirementFilters(prev => {
            const next = { ...prev }
            delete next[id]
            return next
        })
        setRequirementErrors(prev => {
            const next = { ...prev }
            delete next[id]
            return next
        })
        delete requirementRefs.current[id]
    }

    const handleRequirementChange = (id: string, patch: Partial<ProgramRequirement>) => {
        setLocalProgram(prev => prev ? {
            ...prev,
            requirements: prev.requirements.map(req => req.id === id ? { ...req, ...patch } : req)
        } : prev)
    }

    const validateForm = () => {
        const languages: Languages[] = ['en', 'fr', 'ar']
        let hasError = false
        const newNameErrors: LocaleErrors = { en: null, fr: null, ar: null }
        languages.forEach(lang => {
            if (!localProgram.name[lang].trim())
            {
                hasError = true
                newNameErrors[lang] = t('programNameError')
            }
        })
        setNameErrors(newNameErrors)
        if (!localProgram.outputDiploma)
        {
            hasError = true
            setOutputDiplomaError(t('programOutputDiplomaError'))
        }
        if (!localProgram.yearsOfStudy.toString().trim())
        {
            hasError = true
            setYearsOfStudyError(t('yearsOfStudyError'))
        }
        else if (Number(localProgram.yearsOfStudy) < 1)
        {
            hasError = true
            setYearsOfStudyError(t('yearsOfStudyMinError'))
        }
        if (!localProgram.monthlySubscription.toString().trim())
        {
            hasError = true
            setMonthlySubscriptionError(t('monthlySubscriptionError'))
        }
        if (localProgram.jobTitles.length === 0)
        {
            hasError = true
            setJobTitlesError(t('jobTitlesError'))
        }
        const newRequirementErrors: Record<string, RequirementErrors> = {}
        localProgram.requirements.forEach(req => {
            const errs: RequirementErrors = {requiredDiploma: null, minGrade: null}
            if (!req.requiredDiploma)
            {
                hasError = true
                errs.requiredDiploma = t('requiredDiplomaError')
            }
            if (!req.minGrade || !req.minGrade.toString().trim())
            {
                hasError = true
                errs.minGrade = t('minGradeError')
            }
            else if (Number(req.minGrade) < 10 || Number(req.minGrade) > 20)
            {
                hasError = true
                errs.minGrade = t('minGradeNotInRangeError')
            }
            newRequirementErrors[req.id] = errs
        })
        setRequirementErrors(newRequirementErrors)
        if (hasError)
            return null
        return localProgram
    }

    const handleApproveClick = () => {
        const finalProgram = validateForm()
        if (finalProgram && onApprove)
            onApprove(finalProgram)
    }

    const handleUpdateClick = () => {
        const finalProgram = validateForm()
        if (finalProgram && program && onUpdate)
            onUpdate(finalProgram)
    }

    const handleRejectClick = () => {
        if (onReject && localProgram)
            onReject(localProgram)
    }

    return (
        <div onClick={() => { if (!isUpdating && !isApproving && !isRejecting) onClose() }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative flex flex-col max-h-[90vh] shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
                    <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text) truncate ltr:pr-4 rtl:pl-4">
                        {localProgram.name[previewLanguage]}
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
                <div className="overflow-y-auto p-4 md:p-6 flex-1 flex flex-col gap-5 custom-scrollbar ltr:text-left rtl:text-right">
                    <Input
                        inputDir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                        label={t('name')}
                        type="text"
                        value={localProgram.name[previewLanguage]}
                        error={nameErrors[previewLanguage]}
                        onChange={(e) => {
                            setLocalProgram(prev => prev ? {...prev, name: {...prev.name, [previewLanguage]: e.target.value}} : prev)
                            setNameErrors(prev => ({...prev, [previewLanguage]: null}))
                        }}
                    />
                    <Dropdown 
                        label={t('programCategory')}
                        options={categories.map(cat => ({ value: cat.id, label: cat.name[locale as Languages] }))}
                        placeholder={t('programCategoryPlaceholder')}
                        value={localProgram.category?.id || ''}
                        onChange={(selectedId: string) => {
                            const selected = categories.find(cat => cat.id === selectedId)
                            if (selected)
                                setLocalProgram(prev => prev ? {...prev, category: selected} : prev)
                        }}
                    />
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 border-2 p-4">
                        <Dropdown 
                            label={t('diplomaCategory')}
                            options={getDiplomaCategories(locale as Languages)}
                            placeholder={t('diplomaCategoryPlaceholder')}
                            value={categoryFilter ? categoryFilter : ''}
                            onChange={(selectedCategory: string) => {
                                setCategoryFilter(selectedCategory as DiplomasCategories)
                                setLocalProgram(prev => prev ? {...prev, outputDiploma: null} : prev)
                            }}
                        />
                        <Dropdown
                            label={t('outputDiploma')}
                            options={eligibleOutputDiplomas.map(dip => ({ value: dip.id, label: dip.name[locale as Languages] }))}
                            placeholder={t('outputDiplomaPlaceholder')}
                            value={localProgram.outputDiploma?.id || ''}
                            error={outputDiplomaError}
                            onChange={(selectedId: string) => {
                                const selected = eligibleOutputDiplomas.find(dip => dip.id === selectedId)
                                if (selected)
                                {
                                    setLocalProgram(prev => prev ? {...prev, outputDiploma: selected} : prev)
                                    setOutputDiplomaError(null)
                                }
                            }}
                        />
                    </div>
                    <Dropdown 
                        label={t('university')}
                        options={universities.map(uni => ({ value: uni.id, label: uni.name[locale as Languages] }))}
                        placeholder={t('universityPlaceholder')}
                        value={localProgram.university?.id || ''}
                        onChange={(selectedId: string) => {
                            const selected = universities.find(uni => uni.id === selectedId)
                            if (selected)
                                setLocalProgram(prev => prev ? {...prev, university: {...prev.university, id: selected.id, name: selected.name}} : prev)
                        }}
                    />
                   <div className="flex items-center justify-center gap-4">
                        <Input 
                            inputDir={'ltr'}
                            label={t('yearsOfStudy')}
                            type="text"
                            value={localProgram.yearsOfStudy}
                            containerClassName={'flex-1'}
                            error={yearsOfStudyError}
                            onChange={(e) => {
                                if (Number.isNaN(Number(e.target.value)))
                                    return
                                setLocalProgram(prev => prev ? {...prev, yearsOfStudy: Number(e.target.value)} : prev)
                                setYearsOfStudyError(null)
                            }}
                        />
                        <Input 
                            inputDir={'ltr'}
                            label={t('monthlySubscription')}
                            type="text"
                            value={localProgram.monthlySubscription || '0'}
                            containerClassName={'flex-1'}
                            error={monthlySubscriptionError}
                            onChange={(e) => {
                                if (Number.isNaN(Number(e.target.value)))
                                    return
                                setLocalProgram(prev => prev ? {...prev, monthlySubscription: Number(e.target.value)} : prev)
                                setMonthlySubscriptionError(null)
                            }}
                        />
                        <Input 
                            inputDir={'ltr'}
                            label={t('maxAge')}
                            type="text"
                            value={localProgram.maxAge || "0"}
                            containerClassName={'flex-1'}
                            onChange={(e) => {
                                if (Number.isNaN(Number(e.target.value)))
                                    return
                                setLocalProgram(prev => prev ? {...prev, maxAge: Number(e.target.value)} : prev)
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <Dropdown 
                            label={t('DiplomaRecognitionAbroad')}
                            options={DiplomaStatus.map(status => ({ value: status, label: t(`${status}`) }))}
                            placeholder={t('diplomaRecognitionPlaceholder')}
                            value={localProgram.diplomaRecognitionAbroadStatus || ''}
                            onChange={(selectedStatus: string) => {
                                setLocalProgram(prev => prev ? {...prev, diplomaRecognitionAbroadStatus: selectedStatus as DiplomaRecognitionStatus} : prev)
                            }}
                        />
                        <Dropdown 
                            label={t('DiplomaRecognitionMorocco')}
                            options={DiplomaStatus.map(status => ({ value: status, label: t(`${status}`) }))}
                            placeholder={t('diplomaRecognitionPlaceholder')}
                            value={localProgram.diplomaRecognitionMoroccoStatus || ''}
                            onChange={(selectedStatus: string) => {
                                setLocalProgram(prev => prev ? {...prev, diplomaRecognitionMoroccoStatus: selectedStatus as DiplomaRecognitionStatus} : prev)
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div onClick={() => setLocalProgram(prev => prev ? {...prev, hasConcours: !prev.hasConcours} : prev)} className="flex items-center gap-3 cursor-pointer select-none">
                            <div className={`w-5 h-5 border-2 border-(--color-text) flex items-center justify-center ${localProgram.hasConcours ? 'bg-[#ccee00]' : 'bg-white'}`}>
                                {localProgram.hasConcours ? <LuCheck size={14} className="stroke-[3px]" /> : null}
                            </div>
                            <p className="text-sm font-semibold uppercase">{t('hasConcours')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-2 p-4">
                        <Dropdown
                            label={t('jobTitle')}
                            options={eligibleJobTitles.map(job => ({ value: job.id, label: job.title[locale as Languages] }))}
                            placeholder={t('jobTitlePlaceholder')}
                            value={''}
                            error={jobTitlesError}
                            onChange={(selectedId: string) => handleAddJobTitle(selectedId)}
                        />
                        <div className="flex flex-wrap gap-3">
                            {localProgram.jobTitles.map(job => (
                                <div key={job.id} className="flex items-center gap-2 border-2 border-(--color-text) px-3 py-2 bg-white">
                                    <p className="text-sm font-semibold">{job.title[locale as Languages]}</p>
                                    <button onClick={() => handleRemoveJobTitle(job.id)}
                                        className="text-(--color-text) hover:text-red-900 cursor-pointer">
                                        <LuTrash2 size={14} className="stroke-[3px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-2 p-4">
                        <div className="flex items-center justify-between">
                        </div>
                        {localProgram.requirements.map((req, index) => {
                            const filter = requirementFilters[req.id] || null
                            const eligibleDiplomas = filter ? diplomas.filter(dip => getCategory(dip.rank) === filter) : diplomas
                            return (
                                <div key={req.id} className="flex flex-col gap-3 border-2 p-6 relative" ref={(el) => {requirementRefs.current[req.id] = el}}>
                                    <span className="absolute -top-3 ltr:left-4 rtl:right-4 bg-[#ccee00] border-2 border-(--color-text) px-3 py-1  text-xs font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                        {`${t('requirement')} ${index + 1}`}
                                    </span>
                                    <button onClick={() => handleRemoveRequirement(req.id)}
                                        className="absolute top-2 ltr:right-2 rtl:left-2 text-white bg-red-900  p-1 cursor-pointer border-2 border-black hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.15)]">
                                        <LuTrash2 size={16} className="stroke-[2px]" />
                                    </button>
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                        <Dropdown
                                            label={t('diplomaCategory')}
                                            options={getDiplomaCategories(locale as Languages)}
                                            placeholder={t('diplomaCategoryPlaceholder')}
                                            value={filter || ''}
                                            onChange={(selectedCategory: string) => {
                                                setRequirementFilters(prev => ({ ...prev, [req.id]: selectedCategory as DiplomasCategories }))
                                                handleRequirementChange(req.id, { requiredDiploma: null })
                                            }}
                                        />
                                        <Dropdown
                                            label={t('requiredDiploma')}
                                            options={eligibleDiplomas.map(dip => ({ value: dip.id, label: dip.name[locale as Languages] }))}
                                            placeholder={t('requiredDiplomaPlaceholder')}
                                            value={req.requiredDiploma?.id || ''}
                                            error={requirementErrors[req.id]?.requiredDiploma}
                                            onChange={(selectedId: string) => {
                                                const selected = eligibleDiplomas.find(dip => dip.id === selectedId)
                                                if (selected)
                                                {
                                                    handleRequirementChange(req.id, { requiredDiploma: selected })
                                                    setRequirementErrors(prev => ({ ...prev, [req.id]: { ...prev[req.id], requiredDiploma: null } }))
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 md:flex flex-col md:flex-row items-center gap-4">
                                        <Input
                                            inputDir={'ltr'}
                                            label={t('minGrade')}
                                            type="text"
                                            value={req.minGrade || ''}
                                            containerClassName={'flex-1'}
                                            error={requirementErrors[req.id]?.minGrade}
                                            onChange={(e) => {
                                                if (e.target.value !== '' && Number.isNaN(Number(e.target.value)))
                                                    return
                                                handleRequirementChange(req.id, { minGrade: e.target.value })
                                                setRequirementErrors(prev => ({ ...prev, [req.id]: { ...prev[req.id], minGrade: null } }))
                                            }}
                                        />
                                        <Input
                                            inputDir={'ltr'}
                                            label={t('maxYearsSinceGraduation')}
                                            type="text"
                                            value={req.maxYearsSinceGraduation || '0'}
                                            containerClassName={'flex-1 mt-2 md:mt-0'}
                                            onChange={(e) => {
                                                if (e.target.value !== '' && Number.isNaN(Number(e.target.value)))
                                                    return
                                                handleRequirementChange(req.id, {
                                                    maxYearsSinceGraduation: e.target.value === '' ? null : Number(e.target.value)
                                                })
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                        <button onClick={handleAddRequirement}
                            className="flex items-center gap-2 py-2 border-2 border-(--color-text) border-dashed hover:border-solid text-base font-semibold hover:bg-gray-100 cursor-pointer justify-center">
                            <LuPlus size={14} className="stroke-[3px]" />
                            {t('addRequirement')}
                        </button>
                    </div>
                </div>
                <div className="p-4 md:p-6 border-t-2 border-(--color-text) bg-white flex justify-end gap-4 z-10">
                    {mode === 'PENDING' ? (
                        <>
                            <button disabled={isApproving || isRejecting} onClick={handleRejectClick}
                                className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <p className="md:block">{isRejecting ? t('rejecting') : t('reject')}</p>
                                <LuX size={16} className="stroke-[3px] md:stroke-2" />
                            </button>
                            <button disabled={isApproving || isRejecting} onClick={handleApproveClick}
                                className={`${actionButtonStyle} rtl:flex-row-reverse bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed`}>
                                <p className="md:block">{isApproving ? t('approving') : t('approve')}</p>
                                <LuCheck size={16} className="stroke-[3px] md:stroke-2" />
                            </button>
                        </>
                    ) : (
                        <button disabled={isUnchanged || isUpdating} onClick={handleUpdateClick}
                            className={`${actionButtonStyle} rtl:flex-row-reverse bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}>
                            <p className="md:block">{isUpdating ? t('updating') : t('update')}</p>
                            <LuRefreshCw size={16} className="stroke-[3px] md:stroke-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}