import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Request,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAlertDto } from '../DTO/createAlert.dto';
import { EditAlertDto } from '../DTO/editAlert.dto';
import { AlertService } from '../Services/alert.service';
import { AlertHistoryService } from '../Services/alertHistory.service';
import { DisasterService } from '../Services/disaster.service';

export class CreateMailAlertDto {
  mail: string;
}

@Controller('alert')
export class AlertController {
  constructor(
    private readonly alertService: AlertService,
    private readonly disasterService: DisasterService,
    private readonly alertHistoryService: AlertHistoryService,
  ) { }

  @Post('/create')
  async createAlert(
    @Body() alertDto: CreateAlertDto,
    @Request() req,
    @Response() res,
  ) {
    const userId = req?.user?.user?.id;

    const alert = {
      name: alertDto.name,
      areas: alertDto.areas,
      aleas: alertDto.aleas,
      mailAlerts: alertDto.mailAlerts,
      userId: userId,
      isCountryShape: alertDto.isCountryShape,
      countryId: alertDto.countryId,
      criterias: alertDto.criterias,
      expirationDate: alertDto.expirationDate,
    };

    const newAlert = await this.alertService.CreateAlert(alert);
    return res.status(HttpStatus.OK).send(newAlert);
  }

  @Get('')
  async getUserAlerts(@Request() req) {
    const userId = req?.user?.user?.id;
    return await this.alertService.getUserAlerts(userId);
  }

  @Delete('/delete/:id')
  async deleteAlert(@Param('id') id: number, @Request() req, @Response() res) {
    const userId = req?.user?.user?.id;
    const deleteId = id;
    const deletion = await this.alertService.deleteAlert(userId, deleteId);
    if (deletion) {
      res.status(HttpStatus.OK).json("L'alerte a bien été supprimée");
    } else {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json("L'alerte n'a pas été supprimée");
    }
  }

  @Post('/concerned-users')
  async getConcernedUsers(@Body() body, @Response() res) {
    const type = body?.disaster_type;
    const disaster = body?.disaster;
    if (type === null || disaster === null) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Missing arguments' });
    }
    const usersToAlert = await this.alertService.findUserToAlert(
      type,
      disaster,
    );
    return res.status(HttpStatus.OK).json(usersToAlert);
  }

  @Get('/:id')
  async getUserAlert(@Request() req, @Param('id') id: number, @Response() res) {
    const userId = req?.user?.user?.id;
    const alert = await this.alertService.getAlert(id, userId);
    if (alert == null) {
      throw new UnauthorizedException();
    } else {
      return res.send(alert);
    }
  }

  @Put('activate/:id')
  async activateAlert(
    @Request() req,
    @Param('id') id: number,
    @Query('isActivate') activate: boolean,
  ) {
    const userId = req?.user?.user?.id;

    if (id == null || activate == null) {
      throw new InternalServerErrorException();
    }
    return await this.alertService.activate(id, userId, activate);
  }

  @Put('/edit')
  async updateUserAlert(
    @Request() req,
    @Body() alertDto: EditAlertDto,
    @Response() res,
  ) {
    const userId = req?.user?.user?.id;

    //Is this alert from user ?
    const oldAlert = await this.alertService.getAlert(alertDto.id, userId);
    if (oldAlert == null) {
      throw new ForbiddenException(
        'Cette alerte appartient à un autre utilisateur.',
      );
    }

    const alert = {
      id: alertDto.id,
      name: alertDto.name,
      areas: alertDto.areas,
      aleas: alertDto.aleas,
      mailAlerts: alertDto.mailAlerts,
      isCountryShape: alertDto.isCountryShape,
      countryId: alertDto.countryId,
      criterias: alertDto.criterias,
    };

    const updatedAlert = await this.alertService.updateAlert(alert);
    if (updatedAlert != null) {
      return res.status(HttpStatus.OK).send(updatedAlert);
    } else {
      throw new InternalServerErrorException();
    }
  }

  @Get('/disasters/:id')
  async getDisastersByArea(
    @Request() req,
    @Param('id') id: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('filter') filter: string = 'dernier_releve',
    @Query('order') order: string = 'desc',
    @Query('city') city: string = '',
    @Query('country') country: string = '',
    @Query('premier_releve') premier_releve: string = '',
    @Query('dernier_releve') dernier_releve: string = '',
    @Query('strict') strict: string = 'false',
    @Response() res,
  ) {
    // Get alert id
    const userId = req?.user?.user?.id;
    const strictBoolean = strict === 'true';

    //Is this alert from user ?
    const alert = await this.alertService.getAlert(id, userId);
    if (alert == null) {
      throw new ForbiddenException(
        'Cette alerte appartient à un autre utilisateur.',
      );
    }
    // Find disasters Ids
    const disastersAndCount = await this.disasterService.getDisastersFromArea(
      alert,
      page,
      limit,
      filter,
      order,
      {
        city: city,
        country: country,
        premier_releve: premier_releve,
        dernier_releve: dernier_releve,
      },
      strictBoolean,
    );

    if (alert != null) {
      return res.status(HttpStatus.OK).send(disastersAndCount);
    } else {
      throw new InternalServerErrorException();
    }
  }
}
