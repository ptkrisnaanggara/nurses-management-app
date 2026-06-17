import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@nurses/shared';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { RefreshTokenStore } from './refresh-token.store';

const JWT = {
  accessSecret: 'access-secret',
  refreshSecret: 'refresh-secret',
  accessTtl: 900,
  refreshTtl: 3600,
};

class FakeUserRepository implements UserRepository {
  private byEmail = new Map<string, User>();
  add(user: User) {
    this.byEmail.set(user.email, user);
  }
  async create(): Promise<User> {
    throw new Error('not used');
  }
  async findById(): Promise<User | null> {
    return null;
  }
  async findByEmailWithSecret(email: string): Promise<User | null> {
    return this.byEmail.get(email) ?? null;
  }
}

class FakeRefreshStore implements RefreshTokenStore {
  private set = new Set<string>();
  async save(userId: string, jti: string): Promise<void> {
    this.set.add(`${userId}:${jti}`);
  }
  async exists(userId: string, jti: string): Promise<boolean> {
    return this.set.has(`${userId}:${jti}`);
  }
  async revoke(userId: string, jti: string): Promise<void> {
    this.set.delete(`${userId}:${jti}`);
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let users: FakeUserRepository;
  let store: FakeRefreshStore;

  const config = {
    getOrThrow: () => JWT,
  } as unknown as ConfigService;

  beforeEach(async () => {
    users = new FakeUserRepository();
    store = new FakeRefreshStore();
    service = new AuthService(users, store, new JwtService({}), config);

    users.add({
      id: 'user-1',
      email: 'nurse@rs.id',
      passwordHash: await AuthService.hashPassword('secret123'),
      displayName: 'Nurse',
      role: UserRole.HEAD_NURSE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('logs in with valid credentials and issues a token pair', async () => {
    const tokens = await service.login('nurse@rs.id', 'secret123');
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
  });

  it('rejects an invalid password', async () => {
    await expect(service.login('nurse@rs.id', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rotates refresh tokens and invalidates the used one', async () => {
    const { refreshToken } = await service.login('nurse@rs.id', 'secret123');
    const rotated = await service.refresh(refreshToken);
    expect(rotated.refreshToken).not.toBe(refreshToken);
    // The original refresh token must no longer be accepted after rotation.
    await expect(service.refresh(refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
