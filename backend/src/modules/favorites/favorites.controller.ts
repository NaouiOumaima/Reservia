// backend/src/modules/favorites/favorites.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * GET /favorites
   * Retourne tous les services favoris de l'utilisateur connecté.
   */
  @Get()
  async getFavorites(@Request() req) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) throw new BadRequestException('User ID not found');

      return await this.favoritesService.getFavorites(userId);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch favorites');
    }
  }

  /**
   * GET /favorites/:serviceId/check
   * Vérifie si un service est dans les favoris (pour afficher le bouton ♥).
   */
  @Get(':serviceId/check')
  async checkFavorite(@Request() req, @Param('serviceId') serviceId: string) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) throw new BadRequestException('User ID not found');

      const isFav = await this.favoritesService.isFavorite(userId, serviceId);
      return { isFavorite: isFav };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to check favorite');
    }
  }

  /**
   * POST /favorites
   * Body: { serviceId: string }
   * Ajoute un service aux favoris.
   */
  @Post()
  async addFavorite(@Request() req, @Body('serviceId') serviceId: string) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) throw new BadRequestException('User ID not found');
      if (!serviceId) throw new BadRequestException('serviceId est requis');

      await this.favoritesService.addFavorite(userId, serviceId);
      return { message: 'Service ajouté aux favoris' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to add favorite');
    }
  }

  /**
   * DELETE /favorites/:serviceId
   * Retire un service des favoris.
   */
  @Delete(':serviceId')
  async removeFavorite(@Request() req, @Param('serviceId') serviceId: string) {
    try {
      const userId = req.user._id || req.user.id;
      if (!userId) throw new BadRequestException('User ID not found');
      if (!serviceId) throw new BadRequestException('serviceId est requis');

      await this.favoritesService.removeFavorite(userId, serviceId);
      return { message: 'Service retiré des favoris' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to remove favorite');
    }
  }
}
