// backend/src/modules/users/users.controller.ts
import { Controller, Get, Patch, Param, Query, Body, UseGuards, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('stats')
  async getStats() {
    try {
      console.log('Getting user stats');
      const stats = await this.usersService.getStats();
      return stats;
    } catch (error) {
      console.error('Error in getStats endpoint:', error);
      throw new InternalServerErrorException('Failed to get user statistics');
    }
  }

  @Get()
  async findAll(@Query('role') role?: string) {
    try {
      console.log('GET /users - Role query param:', role);
      
      // Validate role if provided
      if (role && !['client', 'provider', 'admin'].includes(role)) {
        throw new BadRequestException('Invalid role. Must be: client, provider, or admin');
      }
      
      const users = await this.usersService.findAll(role);
      
      console.log(`Returning ${users.length} users`);
      return users;
    } catch (error) {
      console.error('Error in findAll endpoint:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to fetch users. Please check server logs.');
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      console.log('GET /users/:id - ID:', id);
      
      if (!id || id.length !== 24) {
        throw new BadRequestException('Invalid user ID format');
      }
      
      const user = await this.usersService.findById(id);
      return user;
    } catch (error) {
      console.error('Error in findById endpoint:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    try {
      console.log('PATCH /users/:id/role - ID:', id, 'New role:', role);
      
      if (!role || !['client', 'provider', 'admin'].includes(role)) {
        throw new BadRequestException('Invalid role. Must be: client, provider, or admin');
      }
      
      const user = await this.usersService.updateRole(id, role);
      return user;
    } catch (error) {
      console.error('Error in updateRole endpoint:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  @Patch(':id/ban')
  async banUser(@Param('id') id: string) {
    try {
      console.log('PATCH /users/:id/ban - ID:', id);
      const user = await this.usersService.banUser(id);
      return user;
    } catch (error) {
      console.error('Error in banUser endpoint:', error);
      throw new InternalServerErrorException('Failed to ban user');
    }
  }

  @Patch(':id/unban')
  async unbanUser(@Param('id') id: string) {
    try {
      console.log('PATCH /users/:id/unban - ID:', id);
      const user = await this.usersService.unbanUser(id);
      return user;
    } catch (error) {
      console.error('Error in unbanUser endpoint:', error);
      throw new InternalServerErrorException('Failed to unban user');
    }
  }
}