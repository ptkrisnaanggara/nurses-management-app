import { User } from './entities/user.entity';

/** Persistence port for users. Services depend on this, not on TypeORM. */
export interface UserRepository {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  /** Includes the (normally hidden) passwordHash column for credential checks. */
  findByEmailWithSecret(email: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
