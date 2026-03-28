import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../Services/auth.service';
import { AuthController } from '../Controllers/auth.controller';
import { LocalStrategy } from '../Strategy/Auth/local.strategy';
import { JwtStrategy } from '../Strategy/Auth/jwt.strategy';
import { UserModule } from './user.module';
import { DownloadService } from '../Services/download.service';
import { S3Service } from '../Services/s3.service';
import { GoogleSigninStrategy } from '../Strategy/Auth/google-signin.strategy';
import { GoogleLoginStrategy } from '../Strategy/Auth/google-login.strategy';
import { EmailerModule } from './emailer.module';
import { LogModule } from './log.module';
import { GoogleStrategy } from '../Strategy/Auth/google.strategy';

@Module({
  imports: [
    UserModule,
    LogModule,
    EmailerModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('DISASTREAM_SECRET') || process.env.DISASTREAM_SECRET,
        signOptions: { expiresIn: '36000s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GoogleSigninStrategy,
    GoogleLoginStrategy,
    DownloadService,
    S3Service,
  ],
})
export class AuthModule { }
