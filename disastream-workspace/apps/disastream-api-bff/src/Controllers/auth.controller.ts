import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Response,
  Get,
  Body,
  HttpException,
  Query,
} from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { Public } from '../Common/Decorators/public.decorator';
import { LocalAuthGuard } from '../Guards/local-auth.guard';
import { CreateUserDto } from '../DTO/createUser.dto';
import { GoogleLoginGuard } from '../Guards/google-login.guard';
import { GoogleSigninGuard } from '../Guards/google-signin.guard';
import { GoogleGuard } from '../Guards/google.guard';
import { ChangePasswordDto } from '../DTO/changePasswordDto';
import { GoogleRegisterDto } from '../DTO/googleRegister.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req) {
    if (req?.user != null) {
      return this.authService.logout(req?.user?.id);
    } else {
      return false;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('expiration')
  async tokenExpiration() {
    return this.authService.checkTokenExpiration();
  }

  @Post('resend-confirmation-email')
  @Public()
  async resendConfirmationEmail(@Query('mail') mail: string) {
    try {
      await this.authService.resendConfirmationEmail(mail);
      return {
        message: `Un nouveau lien de confirmation a été envoyé à l'adresse ${mail}.`,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Query('mail') mail: string) {
    try {
      await this.authService.sendPasswordReinitialisation(mail);
      return true;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('change-password')
  @Public()
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    try {
      await this.authService.changePassword(changePasswordDto);
      return true;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('resend-confirmation-association-email')
  @Public()
  async resendConfirmationAssociationEmail(
    @Query('mail') mail: string,
    @Query('ma') mailAlertId: number,
  ) {
    try {
      await this.authService.resendConfirmationAssociationEmail(
        mail,
        mailAlertId,
      );
      return {
        message: `Un nouveau lien de confirmation de l'association a été envoyé à l'adresse ${mail}.`,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('signin')
  @Public()
  async signIn(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.authService.register(createUserDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('google/login')
  @UseGuards(GoogleGuard)
  @Public()
  async googleAuth() { }

  @Get('google/signin')
  @Public()
  @UseGuards(GoogleSigninGuard)
  async googleSignin() { }

  @Get('confirm-email')
  @Public()
  async confirmEmail(@Query('token') token: string) {
    try {
      await this.authService.confirmEmail(token);
      return { message: 'Email confirmé avec succès' };
    } catch (error) {
      throw new HttpException(
        'Lien de confirmation invalide ou expiré : ' + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('confirm-association')
  @Public()
  async confirmAssociation(@Query('token') token: string) {
    try {
      await this.authService.confirmAssociation(token);
      return { message: 'Association confirmée avec succès' };
    } catch (error) {
      throw new HttpException(
        "Lien de confirmation d'association invalide ou expiré : " + error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('google/login/callback')
  @Public()
  @UseGuards(GoogleLoginGuard)
  async googleAuthRedirect(@Request() req, @Response() res) {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}/login?error=${encodeURI('Aucun compte trouvé à cette adresse')}`,
      );
    } else if (user?.provider != 'GOOGLE') {
      return res.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}/login?error=${encodeURI('Un compte Disastream existe à cette adresse, veuillez-vous connecter via le formulaire classique')}`,
      );
    } else if (!user?.isEmailVerified) {
      const error = `Veuillez confirmer votre mail en cliquant sur le lien reçu à l'adresse ${user?.mail}`;
      return res.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}/login?error=${encodeURI(error)}`,
      );
    }

    const token = await this.authService.googleLogin(req.user);
    if (token) {
      return res.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}?access_token=${token.access_token}`,
      );
    } else {
      const error = `Token invalide`;
      return res.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}?error=${error}`,
      );
    }
  }

  @Get('google/signin/callback')
  @Public()
  @UseGuards(GoogleSigninGuard)
  async googleSignInRedirect(@Request() req, @Response() res) {
    try {
      // Create a temporary JWT to hold the user data
      const interimToken = await this.authService.signInterimGoogleProfile(
        req.user,
      );

      return res.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}/google-register?token=${interimToken}`,
      );
    } catch (e) {
      return res.redirect(
        `${process.env.DISASTREAM_FRONT_BASE_URI}/login?error=${encodeURI(e.message)}`,
      );
    }
  }

  @Post('google-register/complete')
  @Public()
  async completeGoogleRegistration(
    @Body()
    googleRegisterDto: GoogleRegisterDto,
  ) {
    try {
      return await this.authService.completeGoogleRegistration(
        googleRegisterDto,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
