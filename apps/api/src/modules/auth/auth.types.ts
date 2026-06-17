import { UserRole } from '@nurses/shared';

/** Decoded access-token payload, attached to the request as `req.user`. */
export interface JwtUser {
  sub: string;
  email: string;
  role: UserRole;
}

/** Refresh-token payload — carries a jti so it can be tracked/revoked. */
export interface RefreshPayload extends JwtUser {
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
