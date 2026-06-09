import { Controller, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('csrf')
export class CsrfController {
  @Get('token')
  getToken(@Req() req: Request, @Res() res: Response) {
    // Récupérer le token CSRF (ajouté par le middleware ncsrf)
    const token = (req as any).csrfToken();
    
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