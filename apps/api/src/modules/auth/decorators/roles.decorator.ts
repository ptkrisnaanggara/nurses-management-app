import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@nurses/shared';

export const ROLES_KEY = 'roles';

/** Restricts a route to the listed roles (enforced by RolesGuard). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
