// src/modules/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(role?: string): Promise<User[]> {
    const query = role ? { role } : {};
    return this.userModel.find(query).select('-password').exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async updateRole(userId: string, role: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true },
    ).select('-password').exec();
  }

  async banUser(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isBanned: true },
      { new: true },
    ).select('-password').exec();
  }

  async unbanUser(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { isBanned: false },
      { new: true },
    ).select('-password').exec();
  }

  async getStats(): Promise<{ total: number; clients: number; providers: number; admins: number }> {
    const [total, clients, providers, admins] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: 'client' }),
      this.userModel.countDocuments({ role: 'provider' }),
      this.userModel.countDocuments({ role: 'admin' }),
    ]);
    return { total, clients, providers, admins };
  }
}