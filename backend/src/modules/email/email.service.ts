// backend/src/modules/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    // ✅ Lit depuis smtp.* qui correspond aux variables SMTP_* du .env
    const smtpHost = this.configService.get<string>('smtp.host');
    const smtpPort = this.configService.get<number>('smtp.port');
    const smtpUser = this.configService.get<string>('smtp.user');
    const smtpPass = this.configService.get<string>('smtp.pass');

    console.log('📧 Email Configuration:', {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser ? smtpUser.substring(0, 5) + '***' : '❌ MISSING',
      hasPass: !!smtpPass,
    });

    this.transporter = nodemailer.createTransport({
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // ✅ Test connexion au démarrage
    this.transporter.verify((error: Error | null) => {
      if (error) {
        console.error('❌ SMTP connexion échouée:', error.message);
      } else {
        console.log('✅ SMTP connexion OK');
      }
    });
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string,
    lastName: string,
    role: string,
  ) {
    const frontendUrl = this.configService.get<string>('smtp.frontendUrl');
    const fromEmail = this.configService.get<string>('smtp.from');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const fullName = `${firstName} ${lastName}`;
    const isProvider = role === 'provider';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmation d'inscription - Reservia</title>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #fa5252, #e63939); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #fa5252; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏨 Reservia</h1>
            <p>Confirmez votre inscription</p>
          </div>
          <div class="content">
            <h2>Bonjour ${fullName},</h2>
            <p>Merci de vous être inscrit sur <strong>Reservia</strong> !</p>
            ${isProvider ? `
              <p><strong>En tant que prestataire</strong>, vous pourrez créer et gérer vos services.</p>
            ` : `
              <p><strong>En tant que client</strong>, vous pourrez rechercher et réserver des services.</p>
            `}
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ Confirmer mon email</a>
            </div>
            <p style="font-size: 12px; color: #6b7280;">Ce lien expire dans 24 heures.</p>
          </div>
          <div class="footer">
            <p>© 2025 Reservia - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"Reservia" <${fromEmail}>`,
        to: email,
        subject: 'Confirmez votre inscription - Reservia',
        html,
      });
      console.log('✅ Email de vérification envoyé!', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw error;
    }
  }

  async sendVerificationSuccessEmail(
    email: string,
    firstName: string,
    role: string,
  ) {
    const frontendUrl = this.configService.get<string>('smtp.frontendUrl');
    const fromEmail = this.configService.get<string>('smtp.from');
    const loginUrl = `${frontendUrl}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Email confirmé - Reservia</title>
        <style>
          .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Email confirmé !</h1>
          </div>
          <div class="content">
            <h2>Félicitations ${firstName} !</h2>
            <p>Votre email a été confirmé avec succès.</p>
            <p>${role === 'provider'
              ? 'Votre compte prestataire est maintenant actif. Vous pouvez commencer à publier vos services.'
              : 'Votre compte client est maintenant actif. Vous pouvez commencer à réserver des services.'
            }</p>
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">🔐 Se connecter</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Reservia - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Reservia" <${fromEmail}>`,
        to: email,
        subject: '✅ Email confirmé - Reservia',
        html,
      });
      console.log('✅ Email de succès envoyé');
    } catch (error) {
      console.error('❌ Erreur envoi email succès:', error);
    }
  }
}