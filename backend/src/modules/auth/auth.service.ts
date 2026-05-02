// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole } from '../../database/schemas/user.schema';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  // 🔧 INITIALISATION - Créer l'admin par défaut au démarrage
  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  async createDefaultAdmin() {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@test.com');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', '12345678');

      // Vérifier si l'admin existe déjà
      const existingAdmin = await this.userModel.findOne({ email: adminEmail });
      
      if (!existingAdmin) {
        console.log('🔧 Creating default admin user in database...');
        
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        
        const admin = new this.userModel({
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'System',
          role: UserRole.ADMIN,
          isBanned: false,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        await admin.save();
        console.log('✅ Default admin created successfully in database!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
      } else {
        console.log('✅ Admin user already exists in database');
      }
    } catch (error) {
      console.error('❌ Error creating default admin:', error);
    }
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    businessName?: string;
  }) {
    try {
      console.log('📝 Register data:', { ...data, password: '***' });

      const existingUser = await this.userModel.findOne({ email: data.email });
      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24);

      const userRole = data.role === 'provider' ? UserRole.PROVIDER : UserRole.CLIENT;

      const userData: any = {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: userRole,
        phone: data.phone || '',
        isActive: true,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        providerStatus: userRole === UserRole.PROVIDER ? 'pending' : 'active',
      };

      if (userRole === UserRole.PROVIDER && data.businessName) {
        userData.providerProfile = {
          businessName: data.businessName,
          description: '',
          images: [],
          openingHours: {},
          settings: {
            slotDuration: 30,
            cancellationDeadline: 60,
            maxAdvanceBooking: 30,
            prepareTime: 15,
          },
          isVerified: false,
        };
      }

      const user = new this.userModel(userData);
      await user.save();
      console.log('✅ User created:', user._id);

      try {
        await this.emailService.sendVerificationEmail(
          data.email,
          verificationToken,
          data.firstName,
          data.lastName,
          userRole
        );
        console.log('✅ Email sent successfully');
      } catch (emailError) {
        console.error('❌ Email sending failed but user created:', getErrorMessage(emailError));
      }

      return {
        success: true,
        message: 'Inscription réussie ! Veuillez vérifier votre email.',
        requiresVerification: true,
        email: data.email,
      };
    } catch (error) {
      console.error('❌ Register error:', getErrorMessage(error));
      throw error;
    }
  }

  async verifyEmail(token: string, email: string) {
    const user = await this.userModel.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Lien de vérification invalide ou expiré');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    
    if (user.role === UserRole.PROVIDER) {
      user.providerStatus = 'active';
    }

    await user.save();

    try {
      await this.emailService.sendVerificationSuccessEmail(
        user.email,
        user.firstName,
        user.role
      );
    } catch (emailError) {
      console.error('❌ Success email failed:', getErrorMessage(emailError));
    }

    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return {
      success: true,
      message: 'Email confirmé avec succès !',
      role: user.role,
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email déjà vérifié');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.firstName,
        user.lastName,
        user.role
      );
    } catch (emailError) {
      console.error('❌ Resend email failed:', getErrorMessage(emailError));
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email');
    }

    return {
      success: true,
      message: 'Email de vérification renvoyé',
    };
  }

  async login(email: string, password: string) {
    // Chercher l'utilisateur dans la base de données
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte a été désactivé');
    }

    // Pour les clients, vérifier l'email
    if (user.role === UserRole.CLIENT && !user.isEmailVerified) {
      throw new UnauthorizedException('Veuillez confirmer votre email');
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    await this.userModel.findByIdAndUpdate(user._id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userModel.findById(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
      await this.userModel.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Déconnecté avec succès' };
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  private sanitizeUser(user: UserDocument) {
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpires;
    return userObject;
  }
}