import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { JwtConfig } from '../../config/configuration';
import { AuthTokens, JwtUser, RefreshPayload } from './auth.types';
import {
  REFRESH_TOKEN_STORE,
  RefreshTokenStore,
} from './refresh-token.store';
import { USER_REPOSITORY, UserRepository } from './user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_STORE)
    private readonly refreshStore: RefreshTokenStore,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.jwtConfig = config.getOrThrow<JwtConfig>('jwt');
  }

  static hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.users.findByEmailWithSecret(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.validateUser(email, password);
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.jwtConfig.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const valid = await this.refreshStore.exists(payload.sub, payload.jti);
    if (!valid) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    // Rotate: invalidate the used token before issuing a new pair.
    await this.refreshStore.revoke(payload.sub, payload.jti);
    return this.issueTokens({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    } as User);
  }

  async logout(userId: string, jti: string): Promise<void> {
    await this.refreshStore.revoke(userId, jti);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const base: JwtUser = { sub: user.id, email: user.email, role: user.role };
    const jti = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(base, {
        secret: this.jwtConfig.accessSecret,
        expiresIn: this.jwtConfig.accessTtl,
      }),
      this.jwt.signAsync({ ...base, jti } satisfies RefreshPayload, {
        secret: this.jwtConfig.refreshSecret,
        expiresIn: this.jwtConfig.refreshTtl,
      }),
    ]);

    await this.refreshStore.save(user.id, jti, this.jwtConfig.refreshTtl);
    return { accessToken, refreshToken };
  }
}
