import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { MessagingModule } from './messaging/messaging.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { HealthModule } from './modules/health/health.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { RulesModule } from './modules/rules/rules.module';
import { NursesModule } from './modules/nurses/nurses.module';
import { WardsModule } from './modules/wards/wards.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { RosterModule } from './modules/roster/roster.module';
import { LeaveModule } from './modules/leave/leave.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        redact: ['req.headers.authorization'],
      },
    }),
    DatabaseModule,
    RedisModule,
    MessagingModule,
    AuthModule,
    HealthModule,
    FacilitiesModule,
    RulesModule,
    NursesModule,
    WardsModule,
    ShiftsModule,
    HolidaysModule,
    RosterModule,
    LeaveModule,
  ],
  providers: [
    // Auth is enforced globally; routes opt out with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // RolesGuard runs after auth and enforces @Roles() where present.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
