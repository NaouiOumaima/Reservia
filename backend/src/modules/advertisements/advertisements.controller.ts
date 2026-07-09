import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdvertisementsService } from './advertisements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ForbiddenException } from '@nestjs/common';

@Controller('advertisements')
@UseGuards(JwtAuthGuard)
export class AdvertisementsController {
  constructor(private advertisementsService: AdvertisementsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Request() req,
    @Body() data: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (req.user.role !== 'provider') {
      throw new ForbiddenException(
        'Seuls les fournisseurs peuvent créer des annonces',
      );
    }

    const providerName =
      req.user.providerProfile?.businessName ||
      (req.user.firstName && req.user.lastName
        ? `${req.user.firstName} ${req.user.lastName}`
        : req.user.email || 'Fournisseur');

    let imageBase64 = data.imageBase64;

    if (file) {
      const mime = file.mimetype;
      const b64 = file.buffer.toString('base64');
      imageBase64 = `data:${mime};base64,${b64}`;
    }

    const advertisement = await this.advertisementsService.create(
      req.user._id,
      {
        title: data.title,
        description: data.description,
        imageBase64,
        discountCode: data.discountCode,
        discountPercentage: data.discountPercentage
          ? Number(data.discountPercentage)
          : undefined,
        validUntil: data.validUntil,
        providerName,
      },
    );

    return advertisement;
  }

  @Get('provider')
  async getProviderAds(@Request() req) {
    return this.advertisementsService.findByProvider(req.user._id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Request() req) {
    return this.advertisementsService.findById(id, req.user._id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    if (req.user.role !== 'provider') {
      throw new ForbiddenException('Accès refusé');
    }
    return this.advertisementsService.delete(id, req.user._id);
  }
}
