// backend/src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { avatarUploadConfig } from './upload.config';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ============================================
  // PROFIL UTILISATEUR (tous rôles)
  // ============================================

  @Get('me')
  async getMyProfile(@Request() req) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }
      
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch profile');
    }
  }

  @Put('me')
  async updateMyProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }
      
      // ✅ Vérifier que l'email n'est pas envoyé
      if ((updateData as any).email) {
        throw new BadRequestException('Vous ne pouvez pas modifier votre adresse email');
      }
      
      const updatedUser = await this.usersService.updateProfile(userId, updateData);
      if (!updatedUser) {
        throw new BadRequestException('User not found');
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }
      
      if (!file) {
        throw new BadRequestException('Aucun fichier uploadé');
      }
      
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      const updatedUser = await this.usersService.updateAvatar(userId, avatarUrl);
      
      return {
        avatarUrl: avatarUrl,
        message: 'Avatar mis à jour avec succès',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Upload avatar error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to upload avatar');
    }
  }

  @Patch('me/change-password')
  async changeMyPassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }
      
      const { currentPassword, newPassword, confirmPassword } = changePasswordDto;
      
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Les mots de passe ne correspondent pas');
      }
      
      if (newPassword.length < 6) {
        throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      
      if (user.password) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
          throw new BadRequestException('Mot de passe actuel incorrect');
        }
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.updatePassword(userId, hashedPassword);
      
      return { message: 'Mot de passe modifié avec succès' };
    } catch (error) {
      console.error('Change password error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  // ============================================
  // ADMIN - GESTION DES UTILISATEURS
  // ============================================

  @Get('stats')
  async getStats() {
    try {
      return await this.usersService.getStats();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user statistics');
    }
  }

  @Get()
  async findAll(@Query('role') role?: string) {
    if (role && !['client', 'provider', 'admin'].includes(role)) {
      throw new BadRequestException('Invalid role. Must be: client, provider, or admin');
    }
    try {
      return await this.usersService.findAll(role);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    if (!id || id.length !== 24) {
      throw new BadRequestException('Invalid user ID format');
    }
    try {
      const user = await this.usersService.findById(id);
      if (!user) throw new BadRequestException('User not found');
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    if (!role || !['client', 'provider', 'admin'].includes(role)) {
      throw new BadRequestException('Invalid role. Must be: client, provider, or admin');
    }
    try {
      return await this.usersService.updateRole(id, role);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  @Patch(':id/ban')
  async banUser(@Param('id') id: string) {
    try {
      return await this.usersService.banUser(id);
    } catch {
      throw new InternalServerErrorException('Failed to ban user');
    }
  }

  @Patch(':id/unban')
  async unbanUser(@Param('id') id: string) {
    try {
      return await this.usersService.unbanUser(id);
    } catch {
      throw new InternalServerErrorException('Failed to unban user');
    }
  }
}