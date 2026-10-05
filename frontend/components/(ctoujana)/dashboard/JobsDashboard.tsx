'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'
import { LuBriefcase, LuDollarSign, LuEye, LuPlus, LuRefreshCw, LuTrash, LuX } from 'react-icons/lu'
import { Languages, mapLanguage } from './UniversityDashboard'
import { tableActionButtonStyle } from './UniversityDashboard'
import { JobsSkeleton } from './JobsDashboardSkeleton'
import { actionButtonStyle } from './UniversityDashboard'
import Input from '@/components/input'
import { useAuthFetch } from '@/app/(zguellou)/hooks/useAuthFetch'

export interface Jobs
{
	id: string,
	salary: number,
	title: {
		ar: string,
		fr: string,
		en: string
	}
}

type LocaleErrors = Record<Languages, string | null>
const emptyLocaleErrors: LocaleErrors = { en: null, fr: null, ar: null }

const formatJobPrice = (n: string) => {
	let result = ''
	for (let i = 0, len = n.length; i < n.length; i++, len--) 
	{
		if (i > 0 && len % 3 === 0) 
		{
			result += ','
		}
		result += n[i]
	}
	return result
}

const calculateAverageSalary = (jobs: Jobs[]) => {
	let total = 0
	if (!jobs.length)
		return total
	jobs.forEach(job => {
		total += job.salary
	})
	return formatJobPrice((total / jobs.length).toFixed(0))
}

const JobsDashboard = () => {
	const t = useTranslations('dashboard.jobsDashboardTab')
	const locale = useLocale()
	const [jobs, setJobs] = useState<Jobs[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [viewJobModalOpen, setViewJobModalOpen] = useState<boolean>(false)
	const [selectedJobToView, setSelectedJobToView] = useState<Jobs | null>(null)
	const [isUpdating, setIsUpdating] = useState<boolean>(false)
	const [deleteJobModalOpen, setDeleteJobModalOpen] = useState<boolean>(false)
	const [selectedJobToDelete, setSelectedJobToDelete] = useState<Jobs | null>(null)
	const [isRemoving, setIsRemoving] = useState<boolean>(false)
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const [addJobModalOpen, setAddJobModalOpen] = useState<boolean>(false)
	const [localJob, setLocalJob] = useState<Jobs | null>(null)
	const [previewLanguage, setPreviewLanguage] = useState<Languages>(locale as Languages)
	const [selectedLanguage] = useState<Languages>(locale as Languages)
	const [nameErrors, setNameErrors] = useState<LocaleErrors>(emptyLocaleErrors)
	const [salaryError, setSalaryError] = useState<string | null>(null)
	const emptyNewJob = { title: { en: '', fr: '', ar: '' } as Record<Languages, string>, salary: 0 }
	const [newJob, setNewJob] = useState(emptyNewJob)
	const [addPreviewLanguage, setAddPreviewLanguage] = useState<Languages>(locale as Languages)
	const [addNameErrors, setAddNameErrors] = useState<LocaleErrors>(emptyLocaleErrors)
	const [addSalaryError, setAddSalaryError] = useState<string | null>(null)
	const authFetch = useAuthFetch()

	const isUnchanged = JSON.stringify(localJob) === JSON.stringify(selectedJobToView)

	useEffect(() => {
		const fetchJobs = async () => {
			try
			{
				setIsLoading(true)
				const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/jobs?lang=${locale}`) // khsni nsift token hna
				const data = await res.json()
				if (!data.success)
				{
					toast.error(data.message)
					return
				}
				setJobs(data.jobs)
			}
			catch (error)
			{
				toast.error(t('fetchJobsError'))
			}
			finally
			{
				setIsLoading(false)
			}
		}
		fetchJobs()
	}, [locale])

	const handleDeleteJob = async (job: Jobs) => {
		try
		{
			setIsRemoving(true)
			const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/jobs/${job.id}?lang=${locale}`, {
				method: 'DELETE'
			})
			const data = await res.json()
			if (!data.success)
			{
				toast.error(data.message)
				return
			}
			setJobs(prev => prev.filter(j => j.id !== job.id))
			setSelectedJobToDelete(null)
            setDeleteJobModalOpen(false)
		}
		catch (error)
		{
			toast.error(t('deleteJobGeneralError'))
		}
		finally
		{
			setIsRemoving(false)
		}
	}

	const validateForm = () => {
		if (!localJob)
			return null
		const languages: Languages[] = ['en', 'fr', 'ar']
		let hasError = false
		const newNameErrors: LocaleErrors = { en: null, fr: null, ar: null }
		languages.forEach(lang => {
			if (!localJob.title[lang].trim())
			{
				hasError = true
				newNameErrors[lang] = t('jobNameError')
			}
		})
		setNameErrors(newNameErrors)
		let newSalaryError: string | null = null
		if (!localJob.salary || localJob.salary <= 0)
		{
			hasError = true
			newSalaryError = t('jobSalaryError')
		}
		setSalaryError(newSalaryError)
		if (hasError)
			return null
		return localJob
	}

	const handleUpdateJob = async (updatedJob: Jobs) => {
		try
		{
			setIsUpdating(true)
			const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/jobs/${updatedJob.id}?lang=${locale}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedJob)
			})
			const data = await res.json()
			if (!data.success)
			{
				toast.error(data.message)
				return
			}
			setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
			setSelectedJobToView(null)
			setLocalJob(null)
			setViewJobModalOpen(false)
		}
		catch (error)
		{
			toast.error(t('updateJobGeneralError'))
		}
		finally
		{
			setIsUpdating(false)
		}
	}

	const handleUpdateClick = () => {
		const finalJob = validateForm()
		if (finalJob)
			handleUpdateJob(finalJob)
	}

	const closeAddModal = () => {
		if (isAdding)
			return
		setAddJobModalOpen(false)
		setNewJob(emptyNewJob)
		setAddNameErrors(emptyLocaleErrors)
		setAddSalaryError(null)
		setAddPreviewLanguage(locale as Languages)
	}

	const validateAddForm = () => {
		const languages: Languages[] = ['en', 'fr', 'ar']
		let hasError = false
		const newErrors: LocaleErrors = { en: null, fr: null, ar: null }
		languages.forEach(lang => {
			if (!newJob.title[lang].trim())
			{
				hasError = true
				newErrors[lang] = t('jobNameError')
			}
		})
		setAddNameErrors(newErrors)
		let newSalaryErr: string | null = null
		if (!newJob.salary || newJob.salary <= 0)
		{
			hasError = true
			newSalaryErr = t('jobSalaryError')
		}
		setAddSalaryError(newSalaryErr)
		if (hasError)
			return null
		return newJob
	}
	
	const handleAddJob = async (jobToAdd: typeof newJob) => {
		try
		{
			setIsAdding(true)
			const res = await authFetch(`${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/jobs?lang=${locale}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(jobToAdd)
			})
			const data = await res.json()
			if (!data.success)
			{
				toast.error(data.message)
				return
			}
			setJobs(prev => [...prev, data.job])
			closeAddModal()
		}
		catch (error)
		{
			toast.error(t('addJobGeneralError'))
		}
		finally
		{
			setIsAdding(false)
		}
	}
	
	const handleAddClick = () => {
		const finalJob = validateAddForm()
		if (finalJob)
			handleAddJob(finalJob)
	}

	if (isLoading)
		return <JobsSkeleton />

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<LuBriefcase className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
						<p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalJobs')}</p>
						<p className="relative text-xl md:text-4xl font-bold mt-2">{jobs.length}</p>
					</div>
					<div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<LuDollarSign className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
						<p className="relative text-xs md:text-sm font-semibold uppercase tracking-wide">{t('averageSalary')}</p>
						<p className="relative text-xl md:text-4xl font-bold mt-2">{calculateAverageSalary(jobs) + ' ' + t('unit')}</p>
					</div>
				</div>
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
                                    {t('tableHeaderSalary')}
                                </th>
								<th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)] text-center">
                                    {t('tableHeaderActions')}
                                </th>
							</tr>
						</thead>
						<tbody className="bg-(--color-surface)">
							{jobs.length > 0 ? (
								<>
									{jobs.map((job, index) => (
										<tr key={index} className="border-b-2 border-(--color-grey) last:border-0 transition-colors">
											<td className="p-4">
												<div>
													<p className="font-bold text-sm">{job.title[locale as Languages]}</p>
												</div>
											</td>
											<td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-sm">{formatJobPrice(job.salary.toFixed(0))} {t('unit')}</p>
                                                </div>
                                            </td>
											<td className="p-4">
												<div className="flex items-center justify-center gap-2">
													<button onClick={() => {
														setSelectedJobToView(job)
														setLocalJob(JSON.parse(JSON.stringify(job)))
														setPreviewLanguage(locale as Languages)
														setNameErrors(emptyLocaleErrors)
														setViewJobModalOpen(true)
														setSalaryError(null)
													}}
													className={`${tableActionButtonStyle} bg-[#ccee00] text-black`}>
														{t('jobView')}
														<LuEye size={16} className="stroke-[3px] md:stroke-2" />
													</button>
													<button onClick={() => {setDeleteJobModalOpen(true); setSelectedJobToDelete(job)}} className={`${tableActionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
														{t('jobDelete')}
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
												{t('noJobsAvailable')}
											</p>
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
			<button onClick={() => setAddJobModalOpen(true)} className="fixed bottom-18 md:bottom-8 ltr:right-8 rtl:left-8 border-2 border-(--color-text) p-3 cursor-pointer bg-(--color-accent-soft) hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] z-50">
				<LuPlus size={24}/>
			</button>
			{selectedJobToDelete && deleteJobModalOpen && (
				<div 
				onClick={() => {
                    if (!isRemoving)
                    {
                        setDeleteJobModalOpen(false)
                        setSelectedJobToDelete(null)
                    }
                }}
				className='fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4'>
					<div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) p-4 md:p-6 w-full max-w-sm md:max-w-md relative">
						<h1 className="text-base md:text-lg font-bold">{t('removeTitle')}</h1>
						<p className="text-xs md:text-sm mt-2">{t('removeConfirmDescription', {name: selectedJobToDelete.title[locale as Languages]})}</p>
						<div className="flex gap-3 mt-4 md:mt-6">
							<button disabled={isRemoving} onClick={() => handleDeleteJob(selectedJobToDelete)}
								className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse text-xs md:text-sm py-1.5 md:py-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
								{isRemoving ? t('removing') : t('remove')}
								<LuTrash size={16} className="stroke-[3px] md:stroke-2"/>
							</button>
						</div>
					</div>
				</div>
			)}
			{localJob && viewJobModalOpen && (
				<div onClick={() => { if (!isUpdating) { setViewJobModalOpen(false); setSelectedJobToView(null); setLocalJob(null) } }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
					<div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative flex flex-col h-[90vh] shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
						<div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
							<h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text) truncate ltr:pr-4 rtl:pl-4">
                                {localJob.title[previewLanguage]}
                            </h1>
							<button onClick={() => { setViewJobModalOpen(false); setSelectedJobToView(null); setLocalJob(null) }} disabled={isUpdating} className="shrink-0 text-(--color-text) hover:bg-gray-100 p-1 border-2 border-transparent hover:border-(--color-text) transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
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
								value={localJob.title[previewLanguage]}
								error={nameErrors[previewLanguage]}
								onChange={(e) => {
									setLocalJob(prev => prev ? {...prev, title: {...prev.title, [previewLanguage]: e.target.value}} : prev)
									setNameErrors(prev => ({...prev, [previewLanguage]: null}))
								}}
							/>
							<Input
								label={t('tableHeaderSalary')}
								type="text"
								value={localJob.salary === 0 ? '' : String(localJob.salary)}
								error={salaryError}
								onChange={(e) => {
									const value = e.target.value
									if (value !== '' && !/^\d+$/.test(value))
										return
									setLocalJob(prev => prev ? {...prev, salary: value === '' ? 0 : Number(value)} : prev)
									setSalaryError(null)
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
			{addJobModalOpen && (
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
								value={newJob.title[addPreviewLanguage]}
								error={addNameErrors[addPreviewLanguage]}
								onChange={(e) => {
									setNewJob(prev => ({...prev, title: {...prev.title, [addPreviewLanguage]: e.target.value}}))
									setAddNameErrors(prev => ({...prev, [addPreviewLanguage]: null}))
								}}
							/>
							<Input
								label={t('tableHeaderSalary')}
								type="text"
								value={newJob.salary === 0 ? '' : String(newJob.salary)}
								error={addSalaryError}
								onChange={(e) => {
									const value = e.target.value
									if (value !== '' && !/^\d+$/.test(value))
										return
									setNewJob(prev => ({...prev, salary: value === '' ? 0 : Number(value)}))
									setAddSalaryError(null)
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

export default JobsDashboard