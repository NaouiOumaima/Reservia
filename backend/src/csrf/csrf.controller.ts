import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { randomBytes } from 'crypto';

@Controller('csrf')
export class CsrfController {
  @Get('token')
  getToken(@Res() res: Response) {
    // ℹ️ Le middleware ncsrf a été retiré de main.ts (voir bootstrap()) ;
    // ce token n'est donc plus validé côté serveur, seulement délivré au frontend.
    const token = randomBytes(32).toString('hex');

    // Définir un cookie pour le frontend
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    });

    // Retourner le token en JSON
    res.status(HttpStatus.OK).json({
      success: true,
      token: token,
      message: 'CSRF token récupéré avec succès',
    });
  }
}
