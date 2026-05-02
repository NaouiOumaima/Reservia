// backend/src/modules/users/admin.seed.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminSeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@test.com');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', '12345678');

      // Vérifier si l'admin existe déjà
      const existingAdmin = await this.userModel.findOne({ email: adminEmail }).exec();
      
      if (!existingAdmin) {
        console.log('🔧 Creating default admin user...');
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        // Créer l'admin
        const admin = new this.userModel({
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'System',
          role: 'admin',
          isBanned: false,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        await admin.save();
        console.log('✅ Default admin created successfully!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (error) {
      console.error('❌ Error creating default admin:', error);
    }
  }
}