import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';
import { UserService } from '../../Services/user.service';

config();

@Injectable()
export class GoogleLoginStrategy extends PassportStrategy(
  Strategy,
  'google-login',
) {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.GOOGLE_API,
      clientSecret: process.env.GOOGLE_API_SECRET,
      callbackURL: process.env.BASE_URI + '/auth/google/login/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails } = profile;
    const mail = emails[0].value;
    const userInDb = await this.userService.findOne(mail, false, false);

    if (userInDb) {
      await this.userService.updateConnectionTime(userInDb.id);
    }

    return done(null, userInDb || null);
  }
}
