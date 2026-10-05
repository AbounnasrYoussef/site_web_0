'use client'

import { LuTrash, LuPencil, LuPlus, LuX, LuShieldCheck, LuUserCog, LuUser } from 'react-icons/lu'
import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect } from 'react'
import Input from '../../input'
import { UsersSkeleton } from './UsersDashboardSkeleton'
import { toast } from 'sonner'
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider'
import { useAuthFetch } from '@/app/(zguellou)/hooks/useAuthFetch'

type Role = 'USER' | 'ADMIN' | 'SUPERADMIN'

interface User 
{
    id: string
    first_name: string
    last_name: string
    email: string
    role: Role
    joined_at: string
    profile_pic: string | null
}

const actionButtonStyle = "flex items-center justify-center gap-2 px-3 py-1.5 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-all focus:outline-none hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)]"
const ROLES: Role[] = ['USER', 'ADMIN', 'SUPERADMIN']

const UsersTab = () => {
    const t = useTranslations('dashboard.userDashboardTab')
    const t2 = useTranslations('dashboard')
    const { user } = useAuth()
    const locale = useLocale()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
    const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null)
    const [openEditModal, setOpenEditModal] = useState<boolean>(false)
    const [editModalUser, setEditModalUser] = useState<User | null>(null)
    const [addNewAdminModal, setAddNewAdminModal] = useState<boolean>(false)
    const [firstnameError, setFirstnameError] = useState<string | null>(null)
    const [lastnameError, setLastnameError] = useState<string | null>(null)
    const [emailError, setEmailError] = useState<string | null>(null)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [firstname, setFirstname] = useState<string>('')
    const [lastname, setLastname] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [isAdding, setIsAdding] = useState<boolean>(false)
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false)
    const authFetch = useAuthFetch()

    useEffect(() => {
        const fetchUsers = async () => {
            try 
            {
                setIsLoading(true)
                if (user?.role === 'SUPERADMIN')
                    setIsSuperAdmin(true)
                const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
                const response = await authFetch(`${url}/users?lang=${locale}`)   // khsni npassi hna token mnb3d
                if (!response.ok)
                    throw new Error()
                const data = await response.json()
                if (data.success && Array.isArray(data.users)) 
                {
                    setUsers(data.users)
                }
            } 
            catch (error) 
            {
                toast.error(t('userFetchError'))
            } 
            finally 
            {
                setIsLoading(false)
            }
        }
        fetchUsers()
    }, [locale])

    const filteredUsers = roleFilter === 'ALL' ? users : users.filter(user => user.role === roleFilter)

    const handleDeleteUser = async (user: User) => {
        try
        {
            setIsDeleting(true)
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const res = await authFetch(`${url}/users/${user.id}?lang=${locale}`, {
                method: 'DELETE'     // khsni npassi hna token mnb3d
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setUsers(prev => prev.filter(u => u.id !== user.id))
            setOpenDeleteModal(false)
            setDeleteModalUser(null)
        }
        catch (error)
        {
            toast.error(t('deleteUserFetchError'))
        }
        finally
        {
            setIsDeleting(false)
        }
    }

    const handleChangeUserRole = async (id: string, role: Role) => {
        try
        {
            setIsUpdating(true)
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const res = await authFetch(`${url}/users/update-role/${id}?lang=${locale}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'}, // khsni npassi hna token mnb3d
                body: JSON.stringify({newRole: role})
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setUsers(prev => prev.map(u => u.id === id ? {...u, role: role} : u))
            setOpenEditModal(false)
            setEditModalUser(null)
        }
        catch (error)
        {
            toast.error(t('updateUserRoleFetchError'))
        }
        finally
        {
            setIsUpdating(false)
        }
    }

    const handleCloseAddAdmin = () => {
        setAddNewAdminModal(false)
        setFirstnameError(null)
        setLastnameError(null)
        setEmailError(null)
        setPasswordError(null)
        setFirstname('')
        setLastname('')
        setEmail('')
        setPassword('')
    }

    const handleAddNewAdmin = async () => {
        try
        {
            let hasError = false
            if (!firstname.trim())
            {
                setFirstnameError(t('fistnameError'))
                hasError = true
            }
            if (!lastname.trim())
            {
                setLastnameError(t('lastnameError'))
                hasError = true
            }
            if (!email.trim())
            {
                setEmailError(t('emailError'))
                hasError = true
            }
            else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))
            {
                setEmailError(t('emailErrorRegex'))
                hasError = true
            }
            if (!password.trim())
            {
                setPasswordError(t('passwordError'))
                hasError = true
            }
            if (hasError)
                return
            setIsAdding(true)
            const url = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
            const res = await authFetch(`${url}/users?lang=${locale}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},   // khsni npassi hna token mnb3d
                body: JSON.stringify({
                    first_name: firstname,
                    last_name: lastname,
                    email,
                    password
                })
            })
            const data = await res.json()
            if (!data.success)
            {
                toast.error(data.message)
                return
            }
            setUsers(prev => [...prev, {
                id: data.id,
                first_name: firstname,
                last_name: lastname,
                email: email,
                role: 'ADMIN',
                joined_at: new Date().toISOString(),
                profile_pic: null
            }])
            handleCloseAddAdmin()
        }
        catch (error)
        {
            toast.error(t('addAdminFetchError'))
        }
        finally
        {
            setIsAdding(false)
        }
    }

    if (isLoading)
        return <UsersSkeleton />

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                    <LuUser className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalUsers')}</p>
                    <div className="mt-2 h-9 flex items-center">
                        <p className="text-xl md:text-4xl font-bold">{users.filter(u => u.role === 'USER').length}</p>
                    </div>
                </div>
                <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                    <LuUserCog className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalAdmins')}</p>
                    <div className="mt-2 h-9 flex items-center">
                        <p className="text-xl md:text-4xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
                    </div>
                </div>
                <div className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
                    <LuShieldCheck className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-(--color-text)/10" size={64} />
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-wide">{t('totalSuperadmins')}</p>
                    <div className="mt-2 h-9 flex items-center">
                        <p className="text-xl md:text-4xl font-bold">{users.filter(u => u.role === 'SUPERADMIN').length}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setRoleFilter('ALL')}
                    className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${roleFilter === 'ALL' ? 'bg-[#ccee00]' : 'bg-white'}`}>
                    {t('allRoles')}
                </button>
                {ROLES.map((role) => (
                    <button key={role} onClick={() => setRoleFilter(role)}
                        className={`px-4 py-2 border-2 border-(--color-text) font-semibold uppercase text-xs cursor-pointer transition-colors hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] ${roleFilter === role ? 'bg-[#ccee00]' : 'bg-white'}`}>
                        {t(role)}
                    </button>
                ))}
            </div>
            <div className="border-2 border-(--color-text) overflow-hidden bg-(--color-surface)">
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[60vh]">
                    <table className="w-full text-left border-collapse min-w-200 rtl:text-right">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-(--color-grey)">
                                <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                    {t('userInfo')}
                                </th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                    {t('role')}
                                </th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                    {t('joinedDate')}
                                </th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wide text-(--color-text) text-center bg-(--color-grey) shadow-[inset_0_-2px_0_0_var(--color-text)]">
                                    {t('actionsButton')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-(--color-surface)">
                            {filteredUsers.length > 0 ? (
                                <>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b-2 border-(--color-grey) last:border-0 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 border-2 border-(--color-text) bg-[#CDEF00] flex items-center justify-center font-bold text-sm overflow-hidden">
                                                        {user.profile_pic ? (
                                                            <img src={user.profile_pic} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <>
                                                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                                            </>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{user.first_name + ' ' + user.last_name}</p>
                                                        <p className="text-xs text-gray-500 font-semibold">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-semibold border-2 border-(--color-text) px-2 py-1 bg-(--color-surface)">
                                                    {t(`${user.role}`)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-gray-700">
                                                {user.joined_at ? user.joined_at.split('T')[0] : ''}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {isSuperAdmin ? (
                                                        <>
                                                            <button onClick={() => {setOpenEditModal(true); setEditModalUser(user)}} className={`${actionButtonStyle} bg-[#ccee00] text-black`}>
                                                                {t('editRole')}
                                                                <LuPencil size={16} className="stroke-[3px]" />
                                                            </button>
                                                            <button onClick={() => {setOpenDeleteModal(true); setDeleteModalUser(user)}} className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
                                                                {t('remove')}
                                                                <LuTrash size={16} className="stroke-[3px] md:stroke-2" />
                                                            </button>
                                                        </>
                                                        ) 
                                                        : user.role === 'USER' ? (
                                                            <button onClick={() => {setOpenDeleteModal(true); setDeleteModalUser(user)}} className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse`}>
                                                                {t('remove')}
                                                                <LuTrash size={16} className="stroke-[3px] md:stroke-2" />
                                                            </button>
                                                            ) : (
                                                                <span className='font-semibold text-sm'>{t('noActionsAvailable')}</span>
                                                            )
                                                    }
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
                                                {t('NoUsersAvailable')}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isSuperAdmin && (
                <button onClick={() => setAddNewAdminModal(true)} className="fixed bottom-18 md:bottom-8 ltr:right-8 rtl:left-8 border-2 border-(--color-text) p-3 cursor-pointer bg-(--color-accent-soft) hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] z-50">
                    <LuPlus size={24} />
                </button>
            )}
            {openDeleteModal && deleteModalUser && (
                <div onClick={() => {setOpenDeleteModal(false); setDeleteModalUser(null)}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) p-4 md:p-6 w-full max-w-sm md:max-w-md relative">
                        <h1 className="text-base md:text-lg font-bold">{t('removeUser')}</h1>
                        <p className="text-xs md:text-sm mt-2">{t2('universities.removeConfirmDescription', {name: deleteModalUser.first_name + ' ' + deleteModalUser.last_name})}</p>
                        <div className="flex gap-3 mt-4 md:mt-6">
                            <button disabled={isDeleting} onClick={() => handleDeleteUser(deleteModalUser)}
                                className={`${actionButtonStyle} bg-red-900 text-white rtl:flex-row-reverse text-xs md:text-sm py-1.5 md:py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isDeleting ? t2('universities.removing') : t2('universities.remove')}
                                <LuTrash size={16} className="stroke-[3px] md:stroke-2"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {openEditModal && editModalUser && (
                <div onClick={() => {setOpenEditModal(false); setEditModalUser(null)}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) p-4 md:p-6 w-full max-w-md md:max-w-lg relative">
                        <h1 className="text-base md:text-lg font-bold">{t('editRoleTitle')}</h1>
                        <p className="text-xs md:text-sm mt-2">{t('editRolePara', {name: editModalUser.first_name + ' ' + editModalUser.last_name})}</p>
                        <div className='mt-5 flex items-center justify-around'>
                            {ROLES.map((role, index) => (
                                <div onClick={() => setEditModalUser(prev => prev ? {...prev, role: role} : prev)} key={index} className={`${actionButtonStyle} border-2 py-1 px-2 ${editModalUser.role === role ? 'bg-[#ccee00]' : ''}`}>
                                    {t(role)}
                                </div>
                            ))}
                        </div>
                        <div className='flex mt-5'>
                           <button disabled={editModalUser.role === users.find(u => u.id === editModalUser.id)?.role} onClick={() => handleChangeUserRole(editModalUser.id, editModalUser.role)} className={`items-center w-full ${actionButtonStyle} bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isUpdating ? t('applyingRole') : t('applyRole')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {addNewAdminModal && (
                <div onClick={handleCloseAddAdmin} className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000 p-4">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white border-2 border-(--color-text) w-full max-w-xl md:max-w-3xl relative max-h-[90vh] flex flex-col shadow-[8px_8px_0_0_rgba(0,0,0,0.15)]">
                        <div className="flex items-center justify-between p-4 md:p-6 border-b-2 border-(--color-text) bg-white z-10">
                            <h1 className="text-base md:text-xl font-bold uppercase tracking-wide text-(--color-text)">
                                {t('addAdminTitle')}
                            </h1>
                            <button onClick={handleCloseAddAdmin} className="text-(--color-text) hover:bg-gray-100 p-1 border-2 border-transparent hover:border-(--color-text) transition-all cursor-pointer">
                                <LuX size={24} className="stroke-[3px]" />
                            </button>
                        </div>
                        <form className="overflow-y-auto p-4 md:p-6 flex flex-col gap-8 custom-scrollbar">
                            <div className="flex flex-col gap-5 p-5 bg-gray-50/50">
                                <Input value={firstname} onChange={(e) => {setFirstname(e.target.value); setFirstnameError(null)}} label={t('adminFirstname')} error={firstnameError} placeholder={t('adminFirstnamePlaceholder')} required/>
                                <Input value={lastname} onChange={(e) => {setLastname(e.target.value); setLastnameError(null)}} label={t('adminLastname')} error={lastnameError} placeholder={t('adminLastnamePlaceholder')} required/>
                                <Input value={email} onChange={(e) => {setEmail(e.target.value); setEmailError(null)}} label={t('adminEmail')} type='email' error={emailError} placeholder={t('adminEmailPlaceholder')} required/>
                                <Input value={password} onChange={(e) => {setPassword(e.target.value); setPasswordError(null)}} label={t('adminPassword')} type='password' error={passwordError} placeholder={t('adminPasswordPlaceholder')} required />
                                <button disabled={isAdding} type="button" onClick={handleAddNewAdmin} className={`items-center w-full font-semibold uppercase border-2 cursor-pointer transition-all focus:outline-none hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] p-2 bg-(--color-accent-soft) disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    {isAdding ? t('adminSubmitting') : t('adminSubmit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersTab