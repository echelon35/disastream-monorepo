import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import { CreateMailAlertDto } from './alert.controller';
import { MailAlertService } from '../Services/mailAlert.service';
import { UserService } from '../Services/user.service';

@Controller('alert')
export class MailAlertController {
  constructor(
    private readonly mailAlertService: MailAlertService,
    private readonly userService: UserService,
  ) { }

  @Post('/mail/create')
  async createMailAlert(
    @Body() createMailAlertDto: CreateMailAlertDto,
    @Request() req,
    @Response() res,
  ) {
    try {
      const id = req?.user?.user?.id;
      if (id === undefined || createMailAlertDto?.mail === null) {
        throw new ForbiddenException('Le mail ne peut pas être associé');
      }
      const masterUser = await this.userService.findOneByPk(id);
      const mailAlert = await this.mailAlertService.CreateMailAlert(
        req?.user?.user?.id,
        createMailAlertDto?.mail,
      );
      await this.mailAlertService.sendConfirmationMailToMailAlert(
        createMailAlertDto?.mail,
        masterUser,
        mailAlert.id,
      );
      res
        .status(HttpStatus.OK)
        .json(
          `Un mail vient de vous être envoyé à l'adresse ${createMailAlertDto?.mail}. Cliquez sur le lien pour vérifier l'email.`,
        );
    } catch (e: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: `Une erreur est survenue lors de l'ajout de l'email : ${e}.`,
      });
    }
  }

  @Get('/mails')
  async getMailAlerts(@Request() req, @Response() res) {
    const userId = req?.user?.user?.id;
    const mailAlerts =
      await this.mailAlertService.getMailAdressesOfUser(userId);
    res.status(HttpStatus.OK).json(mailAlerts);
  }
}
