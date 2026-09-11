'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import LanguageIcon from '@/public/icons/navbar/LanguageIcon'
import BellIcon from '@/public/icons/navbar/BellIcon'

const LANGUAGES = [
	{ code: 'en', label: 'EN' },
	{ code: 'fr', label: 'FR' },
	{ code: 'ar', label: 'AR' },
]

const DashboardNavbar = () => {
	const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false)
	const [notificationsMenuOpen, setNotificationsMenuOpen] = useState<boolean>(false)
	const menuRef = useRef<HTMLDivElement | null>(null)
	const locale = useLocale()

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) 
			{
				setLanguageMenuOpen(false)
				setNotificationsMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleLanguageChange = (code: string) => {
		document.cookie = `locale=${code}; path=/; max-age=31536000`
		setLanguageMenuOpen(false)
		window.location.href = window.location.pathname
	}

	return (
		<div ref={menuRef} className="relative z-999">
		<header className={`border-2 border-x-0 border-t-0 border-(--color-text) bg-(--color-surface) shadow-[4px_4px_0_0_var(--color-text)]`}>
			<div className="mx-auto flex container items-center justify-between gap-4 px-5 py-3 sm:px-8">
				<Link href="/" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
					KHARITA
				</Link>
				<div className="flex items-center gap-3">
					<button
						type="button"
						aria-label="Notifications"
						onClick={() => setNotificationsMenuOpen((open) => !open)}
						className={`
							grid h-10 w-10 cursor-pointer place-items-center
							border-2 hover:bg-white
							${
							notificationsMenuOpen
								? 'border-(--color-text) rounded-none'
								: 'border-transparent hover:border-(--color-text)'
							}
						`}>
						<BellIcon aria-hidden="true" width={23} height={23} />
					</button>
					<div className={`relative ${languageMenuOpen ? 'shadow-[2px_2px_0_0_var(--color-text)]' : ''}`}>
						<button
							type="button"
							aria-label="Change language"
							onClick={() => setLanguageMenuOpen((open) => !open)}
							className={`
							grid h-10 w-10 cursor-pointer place-items-center
							border-2 hover:bg-white
							${
								languageMenuOpen
								? 'border-(--color-text) border-b-transparent rounded-none'
								: 'border-transparent hover:border-(--color-text)'
							}
							`}>
							<LanguageIcon aria-hidden="true" width={23} height={23} />
						</button>
						{languageMenuOpen && (
							<div className="absolute top-[calc(100%-2px)] right-0 min-w-full w-auto overflow-hidden border-2 border-(--color-text) bg-(--color-surface) shadow-[2px_2px_0_0_var(--color-text)]">
							{LANGUAGES.map((language, index) => (
								<button
								key={language.code}
								onClick={() => handleLanguageChange(language.code)}
								className={`
									cursor-pointer block w-full p-2 text-center text-sm transition-colors
									hover:bg-(--color-accent-soft)
									${locale === language.code ? 'font-extrabold' : 'font-medium'}
									${index !== LANGUAGES.length - 1 ? 'border-b-2 border-(--color-text)' : ''}
								`}
								>
								{language.label}
								</button>
							))}
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
		</div>
	)
}

export default DashboardNavbar