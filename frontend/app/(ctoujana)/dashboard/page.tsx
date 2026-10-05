'use client'
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { LuUniversity, LuGraduationCap, LuUser, LuContact, LuScroll, LuBriefcase, LuMessageSquareText } from "react-icons/lu"
import UniversitiesTab from "@/components/(ctoujana)/dashboard/UniversityDashboard"
import ContactDashboard from "@/components/(yabounna)/ContactDashboard"
import UsersTab from "@/components/(ctoujana)/dashboard/UsersDashboard"
import { useAuth } from "@/app/(zguellou)/providers/AuthProvider"
import ProgramsDashboard from "@/components/(ctoujana)/dashboard/ProgramsDashboard"
import DiplomasDashboard from "@/components/(ctoujana)/dashboard/DiplomasDashboard"
import JobsDashboard from "@/components/(ctoujana)/dashboard/JobsDashboard"

type sidebar_keys = 'universities' | 'programs' | 'users' | 'contact' | 'diplomas' | 'jobs'

const sidebar_tabs = [
    {
        key: 'universities',
        icon: LuUniversity,
    },
    {
        key: 'programs',
        icon: LuGraduationCap,
    },
    {
        key: 'diplomas',
        icon: LuScroll
    },
    {
        key: 'jobs',
        icon: LuBriefcase,
    },
    {
        key: 'users',
        icon: LuUser,
    },
    {
        key: 'contact',
        icon: LuMessageSquareText,
    }
]

const valid_tabs: sidebar_keys[] = ['universities', 'programs', 'users', 'contact', 'diplomas', 'jobs']

const Page = () => {
    const t = useTranslations('dashboard')
    const { user, accessToken, isInitialized, refreshToken } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const tabFromUrl = searchParams.get('tab') as sidebar_keys | null
    const initialTab = valid_tabs.includes(tabFromUrl as sidebar_keys) ? (tabFromUrl as sidebar_keys) : 'universities'
    const [selectedTab, setSelectedTab] = useState<sidebar_keys>(initialTab)
    const [mountedTabs, setMountedTabs] = useState<sidebar_keys[]>([initialTab])

    useEffect(() => {
        if (!isInitialized) 
            return
        if (!user) 
        {
            router.replace('/login')
            return
        }
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')
        {
            router.replace('/profile')
            return
        }
    }, [isInitialized, user, accessToken, refreshToken, router])

    useEffect(() => {
        const current = searchParams.get('tab')
        if (current !== selectedTab) 
        {
            const params = new URLSearchParams(searchParams.toString())
            params.set('tab', selectedTab)
            router.replace(`${pathname}?${params.toString()}`)
        }
        setMountedTabs((prev) => {
            if (!prev.includes(selectedTab))
                return [...prev, selectedTab]
            return prev
        })
    }, [selectedTab, pathname, router, searchParams])

    if (!isInitialized || !user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN'))
        return null

	return (
		<div className="squared-bg flex-1 flex">
			<div className="hidden w-[15%] min-w-55 sticky top-0 border-r-2 border-(--color-text) bg-(--color-surface) md:flex flex-col">
				<nav className="flex-1 p-3 flex flex-col gap-2 rtl:border-l-2">
					{sidebar_tabs.map(({key, icon: Icon}) => {
						const isActive = selectedTab === key
						return (
							<button key={key} onClick={() => setSelectedTab(key as sidebar_keys)}
								className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-2 font-semibold uppercase text-sm tracking-wide transition-all duration-150 ${isActive ? 'border-(--color-text) bg-(--color-accent-soft) shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] -translate-y-0.5' : 'border-transparent hover:border-(--color-text) hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)]'}`}
							>
								<Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
								<span>{t(`navbar.${key}`)}</span>
							</button>
						)
					})}
				</nav>
			</div>
			<div className="w-full md:w-[85%]">
				<div className="p-6 pb-24 md:pb-6">
					{mountedTabs.includes('universities') && (
                        <div className={selectedTab === 'universities' ? 'block' : 'hidden'}>
                            <UniversitiesTab />
                        </div>
                    )}
                    {mountedTabs.includes('contact') && (
                        <div className={selectedTab === 'contact' ? 'block' : 'hidden'}>
                            <ContactDashboard />
                        </div>
                    )}
					{mountedTabs.includes('users') && (
                        <div className={selectedTab === 'users' ? 'block' : 'hidden'}>
						    <UsersTab />
                        </div>
					)}
                    {mountedTabs.includes('programs') && (
                        <div className={selectedTab === 'programs' ? 'block' : 'hidden'}>
                            <ProgramsDashboard />
                        </div>
                    )}
                    {mountedTabs.includes('diplomas') && (
                        <div className={selectedTab === 'diplomas' ? 'block' : 'hidden'}>
                            <DiplomasDashboard />
                        </div>
                    )}
                    {mountedTabs.includes('jobs') && (
                        <div className={selectedTab === 'jobs' ? 'block' : 'hidden'}>
                            <JobsDashboard />
                        </div>
                    )}
				</div>
			</div>
            <nav className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-(--color-text) bg-(--color-surface) flex md:hidden">
                {sidebar_tabs.map(({key, icon: Icon}) => {
                    const isActive = selectedTab === key
                    return (
                        <button key={key} onClick={() => setSelectedTab(key as sidebar_keys)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 cursor-pointer transition-all duration-75 ease-in-out ${isActive ? 'border-(--color-text) bg-(--color-accent-soft) border-r-2 border-l-2' : 'border-transparent'}`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </button>
                    )
                })}
            </nav>
		</div>
	)
}

export default Page
