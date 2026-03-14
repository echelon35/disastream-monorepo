import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../DTO/user.dto';
import { IGoogleLogin } from '../Domain/Interfaces/IGoogleLogin.interface';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from '../DTO/createUser.dto';
import { EmailerService } from './emailer.service';
import { MailAlertService } from './mailAlert.service';
import { ChangePasswordDto } from '../DTO/changePasswordDto';
import { CustomLogger } from './logger.service';
import { GoogleRegisterDto } from '../DTO/googleRegister.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private logger: CustomLogger,
    private mailService: EmailerService,
    private mailAlertService: MailAlertService,
  ) { }

  /**
   *
   * @param user
   * @returns
   */
  async login(user: UserDto): Promise<any> {
    this.logger.log(`${user.mail} vient de se connecter (DisaStream)`);
    return {
      access_token: this.jwtService.sign({ user: user }),
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    if (
      changePasswordDto?.password == null ||
      changePasswordDto?.token == null
    ) {
      throw new Error('Mot de passe ou token invalide');
    }
    const hashedPassword = await bcrypt.hash(changePasswordDto?.password, 10);

    const payload = jwt.verify(
      changePasswordDto?.token,
      process.env.DISASTREAM_SECRET,
    ) as jwt.JwtPayload;

    if (payload.userId == null) {
      throw new UnauthorizedException('Token incorrect');
    }

    await this.userService.updatePassword(payload.userId, hashedPassword);
  }

  /**
   * Test user mail / password to return user
   * @param mail user mail
   * @param pass user password
   * @returns user || null
   */
  async validateUser(mail: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(mail, false, false);

    if (user && user.provider !== 'LOCAL') {
      throw new UnauthorizedException(
        'Un compte gmail existe déjà à cette adresse. Veuillez-vous connecter avec le bouton de connexion Google',
      );
    }

    if (user && bcrypt.compareSync(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      user.last_connexion = new Date();
      await this.userService.saveUser(user);
      return result;
    }
    return null;
  }

  async register(createUserDto: CreateUserDto) {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await this.userService.findOne(createUserDto.mail);
    if (userExists) {
      throw new ConflictException(
        'Cet email est déjà utilisé. Veuillez-vous connecter.',
      );
    }

    // Générer un hash pour le mot de passe de l'utilisateur
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    //Générer un avatar aléatoire
    const randomNb = Math.floor(Math.random() * 5);
    const avatar = `https://disastream-bucket.s3.fr-par.scw.cloud/default_avatars/default_${randomNb}.png`;

    // Créer et sauvegarder l'utilisateur
    const user = await this.userService.createUser({
      ...createUserDto,
      avatar,
      isEmailVerified: false,
      password: hashedPassword,
    });

    //Associer le mail d'alerte par défaut
    await this.mailAlertService.CreateMailAlert(user.id, user.mail);

    // Créer le token de vérification
    const emailVerificationToken = jwt.sign(
      { id: user.id, mail: user.mail },
      process.env.DISASTREAM_SECRET,
      { expiresIn: '1h' },
    );

    // Envoi de l'email de confirmation
    const confirmationUrl = `${process.env.DISASTREAM_FRONT_BASE_URI}/confirm-email?token=${encodeURIComponent(emailVerificationToken)}`;
    await this.mailService.sendConfirmationMail(user.mail, confirmationUrl);

    this.logger.log(
      `Inscription d'un nouvel utilisateur Disastream ${user.mail}`,
    );

    return user;
  }

  /**
   * Log out connected user
   * @param id userId
   * @returns boolean isLogOut
   */
  async logout(id: number): Promise<boolean> {
    const user = await this.userService.findOneByPk(id);
    this.logger.log(`Déconnexion de l'utilisateur ${user.mail}`);
    return await this.userService.logout(user);
  }

  /**
   * @returns true if token not expires
   */
  async checkTokenExpiration(): Promise<boolean> {
    return true;
  }

  async sendPasswordReinitialisation(mail: string): Promise<void> {
    const user = await this.userService.findOne(mail, false, false);
    if (!user) {
      throw new Error('Aucun utilisateur trouvé');
    } else if (user?.provider !== 'LOCAL') {
      throw new Error(
        `L'adresse correspond à un compte Google, veuillez utiliser le bouton de connexion dédié pour vous connecter.`,
      );
    }

    // Générer un nouveau token et le stocker avec une nouvelle expiration
    const newToken = jwt.sign(
      { userId: user.id },
      process.env.DISASTREAM_SECRET,
      {
        expiresIn: '1h',
      },
    );

    this.logger.log(`${user.mail} a demandé à ré-initialiser son mot de passe`);

    // Envoyer le lien de réinitialisation par mail
    const confirmationUrl = `${process.env.DISASTREAM_FRONT_BASE_URI}/change-password?token=${encodeURIComponent(newToken)}`;
    await this.mailService.sendPasswordReinitialization(
      user.mail,
      confirmationUrl,
    );
  }

  async resendConfirmationEmail(mail: string): Promise<void> {
    const user = await this.userService.findOne(mail, false);
    if (!user) {
      throw new Error('Aucun utilisateur trouvé');
    }

    // Générer un nouveau token et le stocker avec une nouvelle expiration
    const newToken = jwt.sign(
      { id: user.id, mail: user.mail },
      process.env.DISASTREAM_SECRET,
      { expiresIn: '1h' },
    );

    this.logger.log(`${user.mail} a redemandé à confirmer son mail`);

    // Envoyer le nouveau lien de confirmation par email
    const confirmationUrl = `${process.env.DISASTREAM_FRONT_BASE_URI}/confirm-email?token=${encodeURIComponent(newToken)}`;
    await this.mailService.sendConfirmationMail(user.mail, confirmationUrl);
  }

  async resendConfirmationAssociationEmail(
    mail: string,
    mailAlertId: number,
  ): Promise<void> {
    const mailAlert = await this.mailAlertService.findById(mailAlertId);
    if (!mailAlert) {
      throw new Error('Aucun utilisateur trouvé');
    }

    const masterUser = await this.userService.findOneByPk(mailAlert.userId);

    // Générer un nouveau token et le stocker avec une nouvelle expiration
    const newToken = jwt.sign(
      { mail: mailAlert.mail, masterId: mailAlert.userId },
      process.env.DISASTREAM_SECRET,
      { expiresIn: '1h' },
    );

    this.logger.log(`${mailAlert.mail} a redemandé à se ré-associer`);

    const confirmationUrl = `${process.env.DISASTREAM_FRONT_BASE_URI}/confirm-association?token=${encodeURIComponent(newToken)}&ma=${mailAlertId}&master=${masterUser.username}`;
    await this.mailService.sendConfirmationMailToMailAlert(
      mailAlert.mail,
      confirmationUrl,
      masterUser,
    );
  }

  async confirmEmail(token: string) {
    const payload = jwt.verify(
      token,
      process.env.DISASTREAM_SECRET,
    ) as jwt.JwtPayload;

    if (payload.id == null) {
      throw new UnauthorizedException('Token incorrect');
    }

    // Récupérer l'utilisateur à partir de l'ID du payload
    const user = await this.userService.findOneByPk(payload.id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier si l'utilisateur a déjà confirmé son email
    if (user.isEmailVerified) {
      throw new Error('L’email a déjà été vérifié.');
    }

    // Confirme l’email
    user.isEmailVerified = true;
    await this.userService.saveUser(user);

    // Rechercher le mailAlert associé
    await this.mailAlertService.verifyAssociatedMailAlert(user.mail, user.id);

    this.logger.log(`${user.mail} a confirmé son adresse mail`);
  }

  async confirmAssociation(token: string) {
    const payload = jwt.verify(
      token,
      process.env.DISASTREAM_SECRET,
    ) as jwt.JwtPayload;

    if (payload.masterId == null || payload.mail == null) {
      throw new UnauthorizedException('Token incorrect');
    }

    // Récupérer l'utilisateur à partir de l'ID du payload
    const user = await this.userService.findOneByPk(payload.masterId);
    if (!user) {
      throw new UnauthorizedException(
        'Token incorrect : utilisateur non trouvé',
      );
    }

    // Rechercher le mailAlert associé
    await this.mailAlertService.verifyAssociatedMailAlert(
      payload.mail,
      user.id,
    );

    this.logger.log(
      `${payload.mail} a confirmé son association à ${user.mail}`,
    );
  }

  /**
   * Search for a user send by google and create it if not exists
   * @param googleLogin user mail
   * @returns token with user
   */
  async googleLogin(googleLogin: IGoogleLogin): Promise<any> {
    this.logger.log(`${googleLogin.mail} vient de se connecter (Gmail)`);
    //Give token
    return {
      access_token: this.jwtService.sign({ user: googleLogin }),
    };
  }

  /**
   * Complete Google registration with the form fields from the frontend
   */
  async completeGoogleRegistration(dto: GoogleRegisterDto): Promise<any> {
    const payload = jwt.verify(
      dto.token,
      process.env.DISASTREAM_SECRET,
    ) as IGoogleLogin;

    if (!payload || !payload.mail) {
      throw new UnauthorizedException(
        "Token d'inscription Google invalide ou expiré",
      );
    }

    const mergedGoogleLogin: IGoogleLogin = {
      ...payload,
      username: dto.username,
      rgpdConsent: dto.rgpdConsent,
      allowMarketing: dto.allowMarketing,
    };

    return await this.googleRegister(mergedGoogleLogin);
  }

  /**
   * Search for a user send by google and create an interim token
   * @param googleLogin user mail
   * @returns Interim JWT Token
   */
  async signInterimGoogleProfile(googleLogin: IGoogleLogin): Promise<string> {
    // We already check if user exists here to fail fast before the form
    const userExists = await this.userService.findOne(googleLogin.mail);
    if (userExists) {
      throw new ConflictException(
        'Cet email est déjà utilisé. Veuillez-vous connecter.',
      );
    }

    const interimToken = jwt.sign(
      { ...googleLogin },
      process.env.DISASTREAM_SECRET,
      { expiresIn: '15m' },
    );

    return interimToken;
  }

  /**
   * Search for a user send by google and create it if not exists
   * @param googleLogin user mail
   * @returns token with user
   */
  async googleRegister(googleLogin: IGoogleLogin): Promise<any> {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await this.userService.findOne(googleLogin.mail);
    if (userExists) {
      throw new ConflictException(
        'Cet email est déjà utilisé. Veuillez-vous connecter.',
      );
    }

    //Générer un avatar aléatoire
    const randomNb = Math.floor(Math.random() * 5);
    const avatar = `https://disastream-bucket.s3.fr-par.scw.cloud/default_avatars/default_${randomNb}.png`;

    // Créer et sauvegarder l'utilisateur
    const user = await this.userService.createUser({
      ...googleLogin,
      avatar,
      isEmailVerified: false,
    });

    //Associer le mail d'alerte par défaut
    await this.mailAlertService.CreateMailAlert(user.id, user.mail);

    // Créer le token de vérification
    const emailVerificationToken = jwt.sign(
      { id: user.id, mail: user.mail },
      process.env.DISASTREAM_SECRET,
      { expiresIn: '1h' },
    );

    // Envoi de l'email de confirmation
    const confirmationUrl = `${process.env.DISASTREAM_FRONT_BASE_URI}/confirm-email?token=${encodeURIComponent(emailVerificationToken)}`;
    await this.mailService.sendConfirmationMail(user.mail, confirmationUrl);
    this.logger.log(`Inscription d'un nouvel utilisateur Gmail ${user.mail}`);

    return user;
  }
}
