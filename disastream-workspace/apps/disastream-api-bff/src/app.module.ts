import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Domain/user.model';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';
import { AuthModule } from './Modules/auth.module';
import { UserModule } from './Modules/user.module';
import { Alea } from './Domain/alea.model';
import { Category } from './Domain/category.model';
import { AleaModule } from './Modules/alea.module';
import { AlertModule } from './Modules/alert.module';
import { Alert } from './Domain/alert.model';
import { ReportType } from './Domain/reportType.model';
import { MailAlert } from './Domain/mailAlert.model';
import { AlertHistory } from './Domain/alertHistory.model';
import { Criterion } from './Domain/criterion.model';
import { ScheduleModule } from '@nestjs/schedule';
import {
  City,
  Country,
  Earthquake,
  Eruption,
  Flood,
  Hurricane,
  Source,
} from '@disastream/models';
import { LogModule } from './Modules/log.module';
import { RolesGuard } from './Guards/role.guard';
import { Role } from './Domain/role.model';
import { AdminModule } from './Modules/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/disastream-api-bff/src/.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DISASTREAM_DB_HOST,
      port: parseInt(process.env.DISASTREAM_DB_PORT),
      username: process.env.DISASTREAM_DB_USER,
      password: process.env.DISASTREAM_DB_PASSWORD,
      database: process.env.DISASTREAM_DB_NAME,
      entities: [
        User,
        Alea,
        Category,
        Alert,
        ReportType,
        MailAlert,
        AlertHistory,
        Role,
        Criterion,
      ],
      synchronize: true,
      schema: 'public',
      logging: 'all',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      name: 'DisasterDb',
      host: process.env.DISASTER_DB_HOST,
      port: parseInt(process.env.DISASTER_DB_PORT),
      username: process.env.DISASTER_DB_USER,
      password: process.env.DISASTER_DB_PASSWORD,
      database: process.env.DISASTER_DB_NAME,
      entities: [City, Country, Flood, Eruption, Hurricane, Earthquake, Source],
      schema: 'public',
      logging: 'all',
    }),
    UserModule,
    AuthModule,
    AleaModule,
    ScheduleModule.forRoot(),
    AlertModule,
    AdminModule,
    LogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
