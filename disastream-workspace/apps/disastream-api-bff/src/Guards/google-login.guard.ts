import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleLoginGuard extends AuthGuard('google-login') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();
    // Si l'utilisateur est null ou undefined, redirection vers le front
    if (user == null) {
      response.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}/login?error=${encodeURI('Aucun compte trouvé à cette adresse')}`,
      );
      throw new Error('Aucun compte trouvé correspondant à cette adresse');
    }

    // Sinon, continuer le traitement normal
    return user;
  }
}
