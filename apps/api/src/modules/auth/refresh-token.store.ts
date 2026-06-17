/**
 * Port for tracking valid refresh-token IDs (jti), enabling rotation and
 * server-side revocation (logout / "log out everywhere").
 */
export interface RefreshTokenStore {
  save(userId: string, jti: string, ttlSeconds: number): Promise<void>;
  exists(userId: string, jti: string): Promise<boolean>;
  revoke(userId: string, jti: string): Promise<void>;
}

export const REFRESH_TOKEN_STORE = Symbol('REFRESH_TOKEN_STORE');
