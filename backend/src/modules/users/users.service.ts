import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(role?: string, excludeSuperAdmin: boolean = true): Promise<any[]> {
    try {
      const query: any = role ? { role } : {};
      
      if (excludeSuperAdmin) {
        query.email = { $ne: 'admin@test.com' };
      }
      
      const users = await this.userModel.find(query).lean().exec();
      
      return users.map(user => this.sanitizeUser(user));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

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

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      console.error('Error in findByIdWithPassword:', error);
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

  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<any | null> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
        .lean()
        .exec();
      
      if (!user) return null;
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword }).exec();
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw new InternalServerErrorException('Failed to update password');
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

  async getStats(): Promise<{ total: number; clients: number; providers: number; admins: number }> {
    try {
      const [total, clients, providers, admins] = await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({ role: 'client' }),
        this.userModel.countDocuments({ role: 'provider' }),
        this.userModel.countDocuments({ role: 'admin', email: { $ne: 'admin@test.com' } }),
      ]);
      return { total, clients, providers, admins };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw new InternalServerErrorException('Failed to get user stats');
    }
  }

  private sanitizeUser(user: any): any {
    const { password, refreshToken, emailVerificationToken, ...safeUser } = user;
    return safeUser;
  }
}