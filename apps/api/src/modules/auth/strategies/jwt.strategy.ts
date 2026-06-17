import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from '../../../config/configuration';
import { JwtUser } from '../auth.types';

/** Validates the access token and returns the payload as `req.user`. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<JwtConfig>('jwt').accessSecret,
    });
  }

  validate(payload: JwtUser): JwtUser {
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
