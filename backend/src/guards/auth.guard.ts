import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// eslint-disable-next-line no-duplicate-imports
import type { LoggerService } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ROLES_KEY, IS_PUBLIC_KEY } from './auth.constants';
import type { JwtPayload } from './auth.interfaces';

export { ROLES_KEY, IS_PUBLIC_KEY } from './auth.constants';
export type { JwtPayload } from './auth.interfaces';
export { Roles, Public, CurrentUser } from './auth.decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, // đọc các thẻ đã setmeta @role
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    let user: JwtPayload;
    try {
      user = this.jwtService.verify<JwtPayload>(token || '');
      request.user = user;
      this.logger.log(
        `[SUCCESS] ${request.method} ${request.url} | User: ${user.username} | Role: ${user.role}`,
        'AuthGuard',
      );
    } catch (err: any) {
      this.logger.warn(
        `[FAILED] ${request.method} ${request.url} | Token: ${token ? token.substring(0, 20) + '...' : 'NONE'} | Error: ${err.message}`,
        'AuthGuard',
      );
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization; // lấy ra auth
    if (!authHeader?.startsWith('Bearer ')) return null; // kiểm tra xem header có tồn tại và đúng format chưa
    return authHeader.slice(7);
  }
}
