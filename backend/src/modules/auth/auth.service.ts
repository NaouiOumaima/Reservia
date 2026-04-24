import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../../database/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    businessName?: string;
  }) {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Créer l'utilisateur
    const userData: any = {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.CLIENT,
      phone: data.phone,
      isActive: true,
    };

    // Si c'est un fournisseur, ajouter les infos business
    if (data.role === UserRole.PROVIDER && data.businessName) {
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

    // Générer les tokens
    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    return {
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

    // Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Générer les tokens
    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

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
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  private sanitizeUser(user: UserDocument) {
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    return userObject;
  }
}