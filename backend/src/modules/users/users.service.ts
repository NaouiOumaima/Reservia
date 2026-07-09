// backend/src/modules/users/users.service.ts

import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<any | null> {
    try {
      const user = await this.userModel.findById(id).lean().exec();
      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in findById:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async updateProfile(
    userId: string,
    updateData: UpdateProfileDto,
  ): Promise<any | null> {
    try {
      // ✅ Supprimer l'email si présent (protection supplémentaire)
      const {
        email: _email,
        role: _role,
        password: _password,
        ...safeData
      } = updateData as any;

      const user = await this.userModel
        .findByIdAndUpdate(userId, safeData, { new: true, runValidators: true })
        .lean()
        .exec();

      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  // ✅ MODIFIÉ : Accepter l'image en Base64
  async updateAvatar(userId: string, imageBase64: string): Promise<any | null> {
    try {
      // Validation: vérifier que c'est bien une image Base64
      if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
        throw new BadRequestException("Format d'image invalide");
      }

      // Vérifier la taille (max 5MB en Base64 ≈ 3.7MB d'image réelle)
      const sizeInBytes = Buffer.byteLength(imageBase64, 'utf8');
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (sizeInBytes > maxSize) {
        throw new BadRequestException("L'image ne doit pas dépasser 5MB");
      }

      const user = await this.userModel
        .findByIdAndUpdate(userId, { profileImage: imageBase64 }, { new: true })
        .lean()
        .exec();

      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in updateAvatar:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update avatar');
    }
  }

  // ✅ NOUVEAU : Mettre à jour l'image Google
  async updateGooglePicture(
    userId: string,
    pictureUrl: string,
  ): Promise<any | null> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, { picture: pictureUrl }, { new: true })
        .lean()
        .exec();

      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in updateGooglePicture:', error);
      throw new InternalServerErrorException('Failed to update Google picture');
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await this.userModel
        .findByIdAndUpdate(userId, { password: hashedPassword })
        .exec();
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      console.error('Error in findByIdWithPassword:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findAll(
    role?: string,
    excludeSuperAdmin: boolean = true,
  ): Promise<any[]> {
    try {
      const query: any = role ? { role } : {};

      if (excludeSuperAdmin) {
        query.email = { $ne: 'admin@test.com' };
      }

      const users = await this.userModel.find(query).lean().exec();
      return users.map((user) => this.sanitizeUser(user));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async updateRole(userId: string, role: string): Promise<any | null> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, { role }, { new: true })
        .lean()
        .exec();

      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in updateRole:', error);
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  async banUser(userId: string): Promise<any | null> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, { isBanned: true }, { new: true })
        .lean()
        .exec();

      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in banUser:', error);
      throw new InternalServerErrorException('Failed to ban user');
    }
  }

  async unbanUser(userId: string): Promise<any | null> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, { isBanned: false }, { new: true })
        .lean()
        .exec();

      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in unbanUser:', error);
      throw new InternalServerErrorException('Failed to unban user');
    }
  }

  async getStats(): Promise<{
    total: number;
    clients: number;
    providers: number;
    admins: number;
  }> {
    try {
      const [total, clients, providers, admins] = await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ role: 'client' }),
        this.userModel.countDocuments({ role: 'provider' }),
        this.userModel.countDocuments({
          role: 'admin',
          email: { $ne: 'admin@test.com' },
        }),
      ]);
      return { total, clients, providers, admins };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw new InternalServerErrorException('Failed to get user stats');
    }
  }

  private sanitizeUser(user: any): any {
    const {
      password: _password,
      refreshToken: _refreshToken,
      emailVerificationToken: _evt,
      resetPasswordToken: _rpt,
      ...safeUser
    } = user;
    return safeUser;
  }
}
