import { Controller, Get, Post, Patch, UseGuards, Req, Res, Query, Body, Delete, Param } from '@nestjs/common'
import type { Request, Response } from 'express'
import { UsersService } from './users.service'
import { AuthGuard } from 'src/guards/auth.guard'
import { CreateAdminDto } from './dto/create_admin.dto'
import { UpdateRoleDto } from './dto/update_role.dto'

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}

    @Get()
    @UseGuards(AuthGuard)
    getAllUsers(@Query('lang') lang: string, @Req() req: Request, @Res() res: Response) {
        return this.usersService.getAllUsers(lang, req, res)
    }

    @Post()
    @UseGuards(AuthGuard)
    createNewAdmin(@Query('lang') lang: string, @Body() body: CreateAdminDto, @Req() req: Request, @Res() res: Response) {
        return this.usersService.createNewAdmin(lang, body, req, res)
    }

    @Delete('/:id')
    @UseGuards(AuthGuard)
    deleteUser(@Query('lang') lang: string, @Param('id') id: string, @Req() req: Request, @Res() res: Response) {
        return this.usersService.deleteUser(lang, id, req, res)
    }

    @Patch('/update-role/:id')
    @UseGuards(AuthGuard)
    updateUserRole(@Query('lang') lang: string, @Param('id') id: string, @Body() body: UpdateRoleDto, @Req() req: Request, @Res() res: Response) {
        return this.usersService.updateUserRole(lang, id, body, req, res)
    }
}
