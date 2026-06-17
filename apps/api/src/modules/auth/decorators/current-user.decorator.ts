import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../auth.types';

/** Injects the authenticated user (or one of its fields) into a handler. */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
    return data ? request.user?.[data] : request.user;
  },
);
