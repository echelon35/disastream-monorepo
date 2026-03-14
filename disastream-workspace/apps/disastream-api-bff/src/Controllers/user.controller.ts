import {
  Controller,
  Get,
  Post,
  HttpStatus,
  NotFoundException,
  Request,
  Response,
  UnauthorizedException,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserDto } from '../DTO/user.dto';
import { UserService } from '../Services/user.service';
import { InterestedUserDto } from '../DTO/interestedUser.dto';
import { Public } from '../Common/Decorators/public.decorator';
import { CustomLogger } from '../Services/logger.service';

@Controller()
export class UserController {
  constructor(
    private userService: UserService,
    private readonly logger: CustomLogger,
  ) { }

  @Get('users')
  async findAll(): Promise<UserDto[]> {
    const users = await this.userService.findAll();
    return users;
  }

  @Get('user/summary')
  async getInfos(@Request() req, @Response() res): Promise<string> {
    const userId = req.user?.user?.id;
    if (userId === undefined) {
      throw new UnauthorizedException(
        'Un erreur est survenue : token incorrect',
      );
    }
    try {
      const path = await this.userService.getSummaryInfos(userId);
      return res.status(HttpStatus.OK).json(path);
    } catch (e) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          'Une erreur est survenue lors de la récupération des informations : ' +
          e,
        );
    }
  }

  @Get('profile')
  async findMe(@Request() req): Promise<UserDto> {
    if (req.user != null) {
      const me = await this.userService.findMe(req?.user?.user?.id);
      return me;
    } else {
      throw new NotFoundException();
    }
  }

  @Post('user/pro/interested')
  @Public()
  async addInterestedProUser(
    @Body() body: InterestedUserDto,
  ): Promise<boolean> {
    const mail = body?.mail;
    if (!mail) {
      return false;
    }
    const comment = body?.comment;

    try {
      await this.userService.sendMailToInterestedProUser(mail, comment);
    } catch (e) {
      this.logger.error(
        `Une erreur est survenue lors de l\'envoi d'email à un professionnel intéressé.`,
        e.stack,
      );
      throw new InternalServerErrorException(
        `Une erreur est survenue lors de l\'envoi d'email à un professionnel intéressé.`,
      );
    }

    return true;
  }
}
