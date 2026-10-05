import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateAdminDto } from './dto/create_admin.dto'
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config'
import { UpdateRoleDto } from './dto/update_role.dto'
import { UploaderService } from '../universities/uploader.service'

@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService, private env: ConfigService, private uploader: UploaderService) {}

    private messages = {
        en: {
            languageNotSupported: 'The selected language is not supported',
            notAuthorizedAdmin: "You are not authorized to access this",
            usersGeneralError: "An error occured while trying to fetch all users",
            createAdminGeneralError: "An error occured while trying to create a new admin",
            createAdminAlreadyExistsError: "This email is already in use, choose another one",
            successCreateAdmin: 'New admin has been created succesfully',
            deleteUserGeneralError: "An error occured while trying to delete this user",
            deleteUserDoesntExist: "This user does not exist",
            deleteUserSuccesfully: "This user has been deleted succesfully",
            updateUserRoleGeneralError: "An error occured while trying to update this user's role",
            updateUserRoleSuccess: 'This user role has been updated succesfully',
            changeRoleNotExist: "You can't make users registered with google account admins or superadmins"
        },
        fr: {
            languageNotSupported: "La langue sélectionnée n'est pas prise en charge",
            notAuthorizedAdmin: "Vous n'êtes pas autorisé",
            usersGeneralError: "Une erreur s'est produite lors de la récupération de tous les utilisateurs",
            createAdminGeneralError: "Une erreur s'est produite lors de la création d'un nouvel administrateur",
            createAdminAlreadyExistsError: "Cet e-mail est déjà utilisé, veuillez en choisir un autre",
            successCreateAdmin: "Le nouvel administrateur a été créé avec succès",
            deleteUserGeneralError: "Une erreur s'est produite lors de la suppression de cet utilisateur",
            deleteUserDoesntExist: "Cet utilisateur n'existe pas",
            deleteUserSuccesfully: "Cet utilisateur a été supprimé avec succès",
            updateUserRoleGeneralError: "Une erreur s'est produite lors de la mise à jour du rôle de cet utilisateur",
            updateUserRoleSuccess: "Le rôle de cet utilisateur a été mis à jour avec succès",
            changeRoleNotExist: "Vous ne pouvez pas nommer administrateurs ou super-administrateurs les utilisateurs inscrits avec un compte Google"
        },
        ar: {
            languageNotSupported: 'اللغة المحددة غير مدعومة',
            notAuthorizedAdmin: "غير مصرح لك",
            usersGeneralError: 'حدث خطأ أثناء محاولة جلب جميع المستخدمين',
            createAdminGeneralError: "حدث خطأ أثناء محاولة إنشاء مسؤول جديد",
            createAdminAlreadyExistsError: "البريد الإلكتروني مستخدم بالفعل، يرجى اختيار بريد آخر",
            successCreateAdmin: "تم إنشاء المسؤول الجديد بنجاح",
            deleteUserGeneralError: "حدث خطأ أثناء محاولة حذف هذا المستخدم",
            deleteUserDoesntExist: "هذا المستخدم غير موجود",
            deleteUserSuccesfully: "تم حذف هذا المستخدم بنجاح",
            updateUserRoleGeneralError: "حدث خطأ أثناء محاولة تحديث دور هذا المستخدم",
            updateUserRoleSuccess: "تم تحديث دور هذا المستخدم بنجاح",
            changeRoleNotExist: "لا يمكنك جعل المستخدمين المسجلين بحساب جوجل مسؤولين أو كبار مسؤولين"
        }
    }

    private getMessage(language: string, key: string) {
        return this.messages[language][key]
    }

    async getAllUsers(lang: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const role = req.user.role
            if (role === 'SUPERADMIN')
            {
                const users = await this.prisma.users.findMany({
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        role: true,
                        created_at: true,
                        profile_pic: true,
                    },
                    orderBy: [
                        { created_at: 'desc' },
                        { id: 'desc' }
                    ],
                })
                let formattedUsers = users.map(({ created_at, ...user }) => ({
                    ...user,
                    joined_at: created_at
                }))
                formattedUsers = formattedUsers.filter(u => u.id !== req.user.id)
                return res.status(200).json({success: true, users: formattedUsers})
            }
            else if (role === 'ADMIN')
            {
                const users = await this.prisma.users.findMany({
                    where: {
                        role: {
                            in: ['USER']
                        },
                    },
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        role: true,
                        created_at: true,
                        profile_pic: true,
                    },
                    orderBy: [
                        { created_at: 'desc' },
                        { id: 'desc' }
                    ],
                })
                let formattedUsers = users.map(({ created_at, ...user }) => ({
                    ...user,
                    joined_at: created_at
                }))
                formattedUsers = formattedUsers.filter(u => u.id !== req.user.id)
                return res.status(200).json({success: true, users: formattedUsers})
            }
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'usersGeneralError')})
        }
    }

    async createNewAdmin(lang: string, body: CreateAdminDto, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const { first_name, last_name, email, password } = body
            const user = await this.prisma.users.findUnique({
                where: {
                    email
                }
            })
            if (user)
                return res.status(400).json({success: false, message: this.getMessage(lang, 'createAdminAlreadyExistsError')})
            const saltRounds = parseInt(this.env.get<string>('BCRYPT_ROUNDS')!)
            const hashedPassword = await bcrypt.hash(password as string, saltRounds)
            const admin =  await this.prisma.users.create({
                data: {
                    first_name,
                    last_name,
                    email,
                    role: 'ADMIN',
                    password_hash: hashedPassword,
                    is_2fa_enabled: true,
                }
            })
            return res.status(201).json({success: true, message: this.getMessage(lang, 'successCreateAdmin'), id: admin.id})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'createAdminGeneralError')})
        }
    }

    async deleteUser(lang: string, id: string, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            if (req.user.id === id)
                throw new Error()
            const role = req.user.role
            if (role === 'SUPERADMIN')
            {
                const user = await this.prisma.users.findUnique({
                    where: {
                        id
                    }
                })
                if (!user)
                    return res.status(404).json({success: false, message: this.getMessage(lang, 'deleteUserDoesntExist')})
                if (user.profile_pic)
                    await this.uploader.deleteImage(user.profile_pic, lang)
                await this.prisma.users.delete({
                    where: {
                        id
                    }
                })
                return res.status(200).json({success: true, message: this.getMessage(lang, 'deleteUserSuccesfully')})
            }
            else if (role === 'ADMIN')
            {
                const user = await this.prisma.users.findFirst({
                    where: {
                        id,
                        role: 'USER'
                    }
                })
                if (!user)
                    return res.status(404).json({success: false, message: this.getMessage(lang, 'deleteUserDoesntExist')})
                if (user.profile_pic)
                    await this.uploader.deleteImage(user.profile_pic, lang)
                await this.prisma.users.delete({
                    where: {
                        id
                    }
                })
                return res.status(200).json({success: true, message: this.getMessage(lang, 'deleteUserSuccesfully')})
            }
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'deleteUserGeneralError')})
        }
    }

    async updateUserRole(lang: string, id: string, body: UpdateRoleDto, req: Request, res: Response) {
        if (!lang)
            lang = 'en'
        if (!['en', 'ar', 'fr'].includes(lang))
            return res.status(400).json({success: false, message: this.getMessage('en', 'languageNotSupported')})
        if (req.user.role !== 'SUPERADMIN')
            return res.status(401).json({success: false, message: this.getMessage(lang, 'notAuthorizedAdmin')})
        try
        {
            const { newRole } = body
            const user = await this.prisma.users.findUnique({
                where: {
                    id
                }
            })
            if (!user)
                return res.status(404).json({success: false, message: this.getMessage(lang, 'deleteUserDoesntExist')})
            if (user.auth_provider !== 'LOCAL')
                return res.status(400).json({success: false, message: this.getMessage(lang, 'changeRoleNotExist')})
            await this.prisma.refresh_tokens.updateMany({
                where: {
                    user_id: user.id,
                    revoked_at: null,
                },
                data: {
                    revoked_at: new Date(),
                },
            })
            await this.prisma.users.update({
                where: {
                    id
                },
                data: {
                    role: newRole,
                    is_2fa_enabled: true,
                }
            })
            return res.status(200).json({success: true, message: this.getMessage(lang, 'updateUserRoleSuccess')})
        }
        catch (error)
        {
            return res.status(500).json({success: false, message: this.getMessage(lang, 'updateUserRoleGeneralError')})
        }
    }
}
