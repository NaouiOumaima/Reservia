import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Comme JwtAuthGuard, mais ne rejette jamais la requête : si le token est
 * absent ou invalide, req.user reste simplement `null` au lieu de lever une
 * UnauthorizedException. Permet à une route de servir à la fois les
 * visiteurs anonymes et les utilisateurs connectés.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
