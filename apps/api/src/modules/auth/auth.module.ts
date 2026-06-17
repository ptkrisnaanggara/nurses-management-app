import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { USER_REPOSITORY } from './user.repository';
import { UserTypeOrmRepository } from './user.typeorm.repository';
import { REFRESH_TOKEN_STORE } from './refresh-token.store';
import { RefreshTokenRedisStore } from './refresh-token.redis-store';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    { provide: REFRESH_TOKEN_STORE, useClass: RefreshTokenRedisStore },
  ],
  exports: [AuthService],
})
export class AuthModule {}
