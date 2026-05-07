import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole } from '../../database/schemas/user.schema';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@test.com');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', '12345678');

      const existingAdmin = await this.userModel.findOne({ email: adminEmail });
      
      if (!existingAdmin) {
        console.log('🔧 Creating default admin user...');
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
        });
        
        await admin.save();
        console.log('✅ Default admin created successfully!');
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

    try {
      await this.emailService.sendVerificationEmail(
        data.email,
        verificationToken,
        data.firstName,
        data.lastName,
        userRole
      );
    } catch (emailError) {
      console.error('Email sending failed but user created');
    }

    return {
      success: true,
      message: 'Inscription réussie ! Veuillez vérifier votre email.',
      requiresVerification: true,
      email: data.email,
    };
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

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte a été désactivé');
    }

    if (user.role === UserRole.CLIENT && !user.isEmailVerified) {
      throw new UnauthorizedException('Veuillez confirmer votre email');
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async loginOrCreateWithGoogle(data: {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  role?: string;
  businessName?: string;
}) {
  // Chercher l'utilisateur existant
  let user = await this.userModel.findOne({ email: data.email });
  const role = data.role === 'provider' ? UserRole.PROVIDER : UserRole.CLIENT;
 
  if (!user) {
    // Créer un nouvel utilisateur sans mot de passe (auth Google)
    user = new this.userModel({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: '', // Pas de mot de passe pour les comptes Google
      role: role,
      businessName: data.businessName || undefined,
      isActive: true,
      isEmailVerified: true, // Google garantit l'email vérifié
      googleId: data.email,  // Marqueur compte Google
      providerStatus: 'active',
    });
    await user.save();
    console.log(`✅ New ${role} user created via Google:`, user._id);
  } else {
    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();
  }
 
  const tokens = this.generateTokens(
    user._id.toString(),
    user.email,
    user.role,
  );
 
  await this.userModel.findByIdAndUpdate(user._id, {
    refreshToken: tokens.refreshToken,
  });
 
  return {
    user: this.sanitizeUser(user),
    ...tokens,
  };
}
  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return this.sanitizeUser(user);
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

  async setPasswordForGoogleUser(userId: string, password: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier que c'est un compte Google (pas de mot de passe)
    if (user.password && user.password.length > 0) {
      throw new BadRequestException('Ce compte a déjà un mot de passe');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password set for Google user:', user.email);

    return {
      success: true,
      message: 'Mot de passe défini avec succès !',
    };
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