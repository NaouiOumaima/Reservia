// backend/src/modules/users/users.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // backend/src/modules/users/users.service.ts
async findAll(role?: string, excludeSuperAdmin: boolean = true): Promise<any[]> {
  try {
    console.log('UsersService.findAll - Role filter:', role);
    const query: any = role ? { role } : {};
    
    // Exclure le super admin par défaut
    if (excludeSuperAdmin) {
      query.email = { $ne: 'admin@test.com' };
    }
    
    const users = await this.userModel.find(query).lean().exec();
    
    console.log(`Found ${users.length} users`);
    
    const sanitizedUsers = users.map(user => {
      const { password, refreshToken, emailVerificationToken, ...safeUser } = user;
      return safeUser;
    });
    
    return sanitizedUsers;
  } catch (error) {
    console.error('Error in findAll:', error);
    throw new InternalServerErrorException('Failed to fetch users');
  }
}

  async findById(id: string): Promise<any | null> {
    try {
      const user = await this.userModel.findById(id).lean().exec();
      if (!user) return null;
      
      const { password, refreshToken, emailVerificationToken, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      console.error('Error in findById:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async updateRole(userId: string, role: string): Promise<any | null> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(userId, { role }, { new: true })
        .lean()
        .exec();
      
      if (!user) return null;
      
      const { password, refreshToken, emailVerificationToken, ...safeUser } = user;
      return safeUser;
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
      
      const { password, refreshToken, emailVerificationToken, ...safeUser } = user;
      return safeUser;
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
      
      const { password, refreshToken, emailVerificationToken, ...safeUser } = user;
      return safeUser;
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
        this.userModel.countDocuments({ role: 'admin' }),
      ]);
      return { total, clients, providers, admins };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw new InternalServerErrorException('Failed to get user stats');
    }
  }
}