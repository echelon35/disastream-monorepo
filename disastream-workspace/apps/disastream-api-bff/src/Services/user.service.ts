import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateUser } from '../Domain/Interfaces/ICreateUser';
import { User } from '../Domain/user.model';
import { Repository } from 'typeorm';
import { MailAlertService } from './mailAlert.service';
import { Role } from '../Domain/role.model';
import { EmailerService } from './emailer.service';
import { CustomLogger } from './logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private mailAlertService: MailAlertService,
    private emailerService: EmailerService,
    private logger: CustomLogger,
  ) { }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getSummaryInfos(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { avatar: true, firstname: true, lastname: true, username: true },
    });
    return user;
  }

  async updatePassword(userId: number, hashedPassword: string) {
    await this.userRepository.update(
      { id: userId },
      { password: hashedPassword },
    );
  }

  async findOne(
    mail: string,
    verified = true,
    checkVerification = true,
  ): Promise<User> {
    try {
      const user = checkVerification
        ? await this.userRepository
          .createQueryBuilder('user')
          .where({
            mail: `${mail}`,
            isEmailVerified: verified,
          })
          .leftJoinAndSelect('user.roles', 'roles')
          .getOne()
        : await this.userRepository
          .createQueryBuilder('user')
          .where({
            mail: `${mail}`,
          })
          .leftJoinAndSelect('user.roles', 'roles')
          .getOne();
      return user;
    } catch (e) {
      console.log(e);
    }
  }

  async findMe(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['roles'],
      select: {
        id: true,
        mail: true,
        firstname: true,
        lastname: true,
        last_connexion: true,
        avatar: true,
        username: true,
        roles: true,
      },
    });
  }

  async findOneByPk(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id: id });
  }

  /**
   * Update last connexion field
   * @param user User connected
   */
  async updateConnectionTime(userId: number): Promise<void> {
    try {
      const propertyToUpdate = {
        last_connexion: new Date(),
      };
      await this.userRepository.update({ id: userId }, propertyToUpdate);
    } catch (e) {
      console.error(
        "Une erreur est survenue lors de l'update : " + e.message.toString(),
      );
    }
  }

  async logout(user: User): Promise<boolean> {
    this.updateConnectionTime(user.id);
    const updatedUser = await this.userRepository.update({ id: user.id }, user);
    return updatedUser.affected > 0;
  }

  async saveUser(user: User) {
    return await this.userRepository.save(user);
  }

  async updateOrCreate(user: ICreateUser): Promise<User> {
    await this.userRepository.upsert(user, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['mail'],
    });

    const userCreated = await this.userRepository.findOneBy({
      mail: user.mail,
    });

    //Be sure User has always at least a mail alert with its own mail
    const mailAdresses = await this.mailAlertService.getMailAdressesOfUser(
      userCreated.id,
    );
    if (mailAdresses.length == 0) {
      await this.mailAlertService.CreateMailAlert(
        userCreated.id,
        userCreated.mail,
      );
    }

    return userCreated;
  }

  async createUser(createUserDto: Partial<User>): Promise<User> {
    const { username, mail } = createUserDto;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await this.userRepository.findOne({
      where: [{ username }, { mail }],
    });
    if (userExists) {
      throw new ConflictException('Nom d’utilisateur ou email déjà utilisé');
    }

    createUserDto.roles = [];
    //Ajouter le rôle par défaut à l'utilisateur
    const defaultRole = await this.roleRepository.findOneBy({
      name: 'Basic',
    });
    if (defaultRole != null) {
      createUserDto.roles.push(defaultRole);
    }

    try {
      await this.emailerService.sendEmail(
        'support@disastream.com',
        "Un nouvel utilisateur vient de s'inscrire",
        `
        L'utilisateur ${createUserDto.username} (${createUserDto.mail}) vient de s'inscrire sur Disastream.
      `,
      );
    } catch (e) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email de notification pour le nouvel utilisateur ${createUserDto.username}`,
        e.stack,
      );
    }

    // Créer et enregistrer l'utilisateur
    const user = this.userRepository.create(createUserDto);

    return await this.userRepository.save(user);
  }

  async sendMailToInterestedProUser(mail: string, comment: string) {
    await this.emailerService.sendEmail(
      'support@disastream.com',
      'Un pro est interessé',
      `
      <p>${mail} a laissé ce message :</p>
      <p>${comment}</p>
      `,
    );
  }
}
