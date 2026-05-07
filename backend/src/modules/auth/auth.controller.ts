import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    businessName?: string;
  }) {
    return this.authService.register(body);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Query('email') email: string,
  ) {
    return this.authService.verifyEmail(token, email);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req) {
    return this.authService.getCurrentUser(req.user._id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { userId: string }) {
    return this.authService.logout(body.userId);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setPassword(@Req() req, @Body() body: { password: string }) {
    return this.authService.setPasswordForGoogleUser(req.user._id, body.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport redirige automatiquement vers Google
  }
 
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      console.log('📥 Google callback - req.user:', req.user);
 
      if (!req.user) {
        console.error('❌ No user in request after Google auth');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/register?error=google_no_user`);
      }
 
      // ✅ Récupérer le rôle et businessName depuis req.user (défini par GoogleStrategy)
      const tokens = await this.authService.loginOrCreateWithGoogle({
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        picture: req.user.picture,
        role: req.user.role || 'client',
        businessName: req.user.businessName,
      });

      // ✅ Nettoyer les cookies
      res.clearCookie('oauth_role');
      res.clearCookie('oauth_businessName');
 
      console.log('✅ Google auth tokens generated for:', req.user.email);
 
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl =
        `${frontendUrl}/register/callback` +
        `?accessToken=${tokens.accessToken}` +
        `&refreshToken=${tokens.refreshToken}`;
 
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Google callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/register?error=google_auth_failed`);
    }
  }
}