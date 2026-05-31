// backend/src/modules/favorites/favorites.service.ts
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Retourne la liste des services favoris populée.
   */
  async getFavorites(userId: string): Promise<any[]> {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate({
          path: 'favoriteServices',
          match: { isActive: true },
          select: 'name category basePrice avgRating reviewCount images location duration providerId',
        })
        .lean()
        .exec();

      if (!user) throw new NotFoundException('Utilisateur non trouvé');

      return ((user.favoriteServices as any[]) || []).filter(Boolean);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error in getFavorites:', error);
      throw new InternalServerErrorException('Impossible de récupérer les favoris');
    }
  }

  /**
   * Ajoute un service aux favoris (idempotent via $addToSet).
   */
  async addFavorite(userId: string, serviceId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(serviceId)) {
        throw new BadRequestException('ID de service invalide');
      }

      await this.userModel
        .findByIdAndUpdate(
          userId,
          { $addToSet: { favoriteServices: new Types.ObjectId(serviceId) } },
          { new: true },
        )
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error in addFavorite:', error);
      throw new InternalServerErrorException('Impossible d\'ajouter le favori');
    }
  }

  /**
   * Retire un service des favoris.
   */
  async removeFavorite(userId: string, serviceId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(serviceId)) {
        throw new BadRequestException('ID de service invalide');
      }

      await this.userModel
        .findByIdAndUpdate(
          userId,
          { $pull: { favoriteServices: new Types.ObjectId(serviceId) } },
          { new: true },
        )
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error in removeFavorite:', error);
      throw new InternalServerErrorException('Impossible de supprimer le favori');
    }
  }

  /**
   * Vérifie si un service est dans les favoris de l'utilisateur.
   */
  async isFavorite(userId: string, serviceId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(serviceId)) return false;

      const user = await this.userModel
        .findOne({
          _id: userId,
          favoriteServices: new Types.ObjectId(serviceId),
        })
        .lean()
        .exec();

      return !!user;
    } catch (error) {
      console.error('Error in isFavorite:', error);
      return false;
    }
  }
}