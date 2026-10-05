'use client'

import { useLocale, useTranslations } from "next-intl"
import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react"
import { Program } from "./ProgramsDashboard"
import { tableActionButtonStyle } from "./UniversityDashboard"
import { LuEye, LuTrash } from "react-icons/lu"
import { toast } from "sonner"
import { Diploma } from "./ProgramsDashboard"
import { UniversityForProgram } from "./ProgramsDashboard"
import { Category } from "./ProgramsDashboard"
import ViewProgram from "./ViewProgram"
import { categoryIconMap } from "@/app/(zguellou)/constants"
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"
import { Jobs } from "./JobsDashboard"

interface Props
{
    pendingPrograms: Program[],
    setPendingPrograms: Dispatch<SetStateAction<Program[]>>
    allPrograms: Program[],
    setAllPrograms: Dispatch<SetStateAction<Program[]>>
    diplomas: Diploma[]
    universities: UniversityForProgram[]
    categories: Category[]
    jobs: Jobs[]
}

type Languages = 'en' | 'fr' | 'ar'

export default function PendingPrograms({ pendingPrograms, setPendingPrograms, diplomas, universities, categories, allPrograms, setAllPrograms, jobs } : Props) {
    const locale = useLocale()
    const t = useTranslations('dashboard.programsDashboardTab')
    const [viewProgramOpen, setViewProgramOpen] = useState<boolean>(false)
    const [selectedProgramToView, setSelectedProgramToView] = useState<Program | null>(null)
    const [isApproving, setIsApproving] = useState<boolean>(false)
    const [isRejecting, setIsRejecting] = useState<boolean>(false)
    const authFetch = useAuthFetch()

    const handleApproveProgram = async (program: Program) => {
        try
        {
            setIsApproving(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/programs/${program.id}/approve?lang=${locale}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }, // ..khsni nzid token hnaya
                body: JSON.stringify(program)
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setPendingPrograms(prev => prev.filter(p => p.id !== program.id))
            setAllPrograms(prev => [...prev, program])
            setViewProgramOpen(false)
            setSelectedProgramToView(null)
        }
        catch (error)
        {
            toast.error(t('programApproveGeneralError'))
        }
        finally
        {
            setIsApproving(false)
        }
    }

    const handleRejectProgram = async (program: Program) => {
        try
        {
            setIsRejecting(true)
            const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/programs/${program.id}/reject?lang=${locale}`) // .. khsni nzid token hnaya
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setPendingPrograms(prev => prev.filter(p => p.id !== program.id))
            setViewProgramOpen(false)
            setSelectedProgramToView(null)
        }
        catch (error)
        {
            toast.error(t('programRejectGeneralError'))
        }
        finally
        {
            setIsRejecting(false)
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
                        {pendingPrograms.length > 0 ? (
                            <>
                                {pendingPrograms.map((program) => {
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
            <ViewProgram
                isOpen={viewProgramOpen}
                mode="PENDING"
                program={selectedProgramToView}
                onClose={() => {
                    if (!isApproving && !isRejecting)
                    {
                        setViewProgramOpen(false)
                        setSelectedProgramToView(null)
                    }
                }}
                onApprove={handleApproveProgram}
                onReject={handleRejectProgram}
                isApproving={isApproving}
                isRejecting={isRejecting}
                diplomas={diplomas}
                universities={universities}
                categories={categories}
                jobs={jobs}
            />
        </div>
    )
}