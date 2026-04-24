// src/modules/users/users.controller.ts

import { Controller, Get, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get('stats')
  async getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/ban')
  async banUser(@Param('id') id: string) {
    return this.usersService.banUser(id);
  }

  @Patch(':id/unban')
  async unbanUser(@Param('id') id: string) {
    return this.usersService.unbanUser(id);
  }
}