import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../Controllers/user.controller';
import { User } from '../Domain/user.model';
import { UserService } from '../Services/user.service';
import { AlertModule } from './alert.module';
import { MailAlertService } from '../Services/mailAlert.service';
import { Repository } from 'typeorm';
import { MailAlert } from '../Domain/mailAlert.model';
import { EmailerModule } from './emailer.module';
import { MailAlertController } from '../Controllers/mailAlert.controller';
import { Role } from '../Domain/role.model';
import { LogModule } from './log.module';

@Module({
  providers: [
    UserService,
    MailAlertService,
    Repository<MailAlert>,
    Repository<Role>,
  ],
  imports: [
    TypeOrmModule.forFeature([User, MailAlert, Role]),
    AlertModule,
    EmailerModule,
    LogModule,
  ],
  controllers: [UserController, MailAlertController],
  exports: [UserService, MailAlertService],
})
export class UserModule { }
