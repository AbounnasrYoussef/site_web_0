'use client'

import { useLocale, useTranslations } from "next-intl"
import { useState, Dispatch, SetStateAction } from "react"
import { LuEye } from "react-icons/lu"
import { University, Languages, tableActionButtonStyle } from "./UniversityDashboard"
import ViewUniversity from "./ViewUniversity"
import { City } from "./UniversityDashboard"
import { toast } from 'sonner'
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"

interface Props 
{
    pendingUniversities: University[]
    setPendingUniversities: Dispatch<SetStateAction<University[]>>
    setAllUniversities: Dispatch<SetStateAction<University[]>>
    cities: City[]
}

export default function PendingUniversities({ pendingUniversities, setPendingUniversities, setAllUniversities, cities }: Props) {
    const t = useTranslations('dashboard')
    const locale = useLocale()
    const [sidebarOpen, setSideBarOpen] = useState<boolean>(false)
    const [selectedUniToView, setSelectedUniToView] = useState<University | null>(null)
    const [isApproving, setIsApproving] = useState<boolean>(false)
    const [isRejecting, setIsRejecting] = useState<boolean>(false)
    const authFetch = useAuthFetch()

    const handleApproveUniversity = async (university: University) => {
        try
        {
            setIsApproving(true)
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const res = await authFetch(`${url}/universities/approve/${university.id}?lang=${locale}`, { // i should send the token
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: university.type,
                    internatAvailable: university.internatAvailable,
                    bourseAvailable: university.bourseAvailable,
                    abbreviation: university.abbreviation,
                    name: university.name,
                    description: university.description,
                    locations: university.locations.map((loc: any) => ({
                        id: loc.id,
                        city: loc.city[locale as Languages],
                        website: loc.website,
                        image_url: loc.image_url,
                        latitude: loc.latitude,
                        longitude: loc.longitude
                    }))
                })
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setPendingUniversities(prev => prev.filter(u => u.id !== university.id))
            setAllUniversities(prev => [...prev, university])
            setSideBarOpen(false)
            setSelectedUniToView(null)
        }
        catch (error)
        {
            toast.error(t('universities.approveUniFetchError'))
        }
        finally
        {
            setIsApproving(false)
        }
    }

    const handleRejectUniversity = async (university: University) => {
        try
        {
            setIsRejecting(true)
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const res = await authFetch(`${url}/universities/reject/${university.id}?lang=${locale}`) // i should send the token
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setPendingUniversities(prev => prev.filter(u => u.id !== university.id))
            setSideBarOpen(false)
            setSelectedUniToView(null)
        }
        catch (error)
        {
            toast.error(t('universities.rejectUniFetchError'))
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
                        {pendingUniversities.length > 0 ? (
                            <>
                                {pendingUniversities.map((uni) => (
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
                                            {t('universities.noPendingUniversities')}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <ViewUniversity 
                isOpen={sidebarOpen}
                mode="PENDING"
                university={selectedUniToView}
                cities={cities}
                onClose={() => {
                    setSideBarOpen(false)
                    setSelectedUniToView(null)
                }}
                onApprove={handleApproveUniversity}
                onReject={handleRejectUniversity}
                isApproving={isApproving}
                isRejecting={isRejecting}
            />
        </div>
    )
}