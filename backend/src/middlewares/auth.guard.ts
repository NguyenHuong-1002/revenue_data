import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

// Các từ khóa định danh (Key) dùng để lưu và đọc dữ liệu Metadata của một API Route
export const ROLES_KEY = 'roles';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Định nghĩa cấu trúc dữ liệu của đối tượng người dùng (Payload) nằm bên trong Token JWT
 */
export interface JwtPayload {
  sub: string; // ID định danh của tài khoản (thường là UUID)
  username: string; // Tên đăng nhập
  role: 'ADMIN' | 'STAFF'; // Vai trò/Quyền hạn hệ thống
  exp: number; // Thời gian hết hạn của token (Timestamp tính bằng giây)
}

/**
 * Mở rộng cấu trúc Interface Request của Express trên phạm vi toàn cục (Global)
 * Mục đích: Cho phép chúng ta đính kèm thuộc tính `user` vào request sau khi xác thực thành công
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Decorator `@Roles('ADMIN', ...)` dùng để đánh dấu và giới hạn các vai trò được phép truy cập API
 * Có thể gắn ở cấp độ Class (Controller) hoặc cấp độ Hàm (Method API)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorator `@Public()` dùng để đánh dấu API này là công khai, cho phép truy cập tự do không cần Token
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Custom Param Decorator `@CurrentUser()` giúp lấy nhanh thông tin User đang đăng nhập ngay tại tham số của hàm trong Controller
 * Ví dụ sử dụng: `async getProfile(@CurrentUser() user: JwtPayload)`
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user; // Trả về thông tin user đã được Guard xác thực và lưu vào request trước đó
});

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    // Reflector là một tiện ích của NestJS dùng để đọc các Metadata được gắn từ các Decorator (@Public, @Roles)
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Hàm cốt lõi của Guard: Quyết định một Request có hợp lệ để đi tiếp vào API hay không
   * @param context Ngữ cảnh thực thi hiện tại của Request (HTTP context)
   * @returns `true` nếu vượt qua tất cả các bước xác thực và phân quyền
   * @throws UnauthorizedException Khi thiếu Token, Token không hợp lệ hoặc đã hết hạn sử dụng
   * @throws ForbiddenException Khi tài khoản không đủ quyền hạn truy cập (Sai vai trò - Role)
   */
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    const fs = require('fs');
    const path = require('path');
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logPath = path.join(logDir, 'auth-debug.log');

    let user: JwtPayload;
    try {
      user = this.jwtService.verify<JwtPayload>(token || '');
      request.user = user;
      fs.appendFileSync(
        logPath,
        `[SUCCESS] ${request.method} ${request.url} | Token: ${token ? token.substring(0, 15) + '...' : 'NONE'} | User: ${user.username} | Role: ${user.role}\n`,
      );
    } catch (err: any) {
      fs.appendFileSync(
        logPath,
        `[FAILED] ${request.method} ${request.url} | Token: ${token ? token.substring(0, 20) + '...' : 'NONE'} | Raw Token Length: ${token ? token.length : 0} | Error: ${err.message}\n`,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }

    this.checkRoles(context, user);
    return true;
  }

  /**
   * Hàm nội bộ: Kiểm tra quyền hạn (Role) của người dùng đối với API đang yêu cầu
   * @param context Ngữ cảnh thực thi của Request
   * @param user Thông tin tài khoản đã giải mã từ Token
   * @throws ForbiddenException Nếu vai trò hiện tại của User không nằm trong danh sách vai trò được phép truy cập
   */
  private checkRoles(context: ExecutionContext, user: JwtPayload): void {
    // Đọc danh sách các vai trò được yêu cầu bởi decorator `@Roles(...)` trên API đó
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Nếu API không yêu cầu phân quyền cụ thể (không gắn @Roles), mặc định là ai đăng nhập cũng được vào
    if (!requiredRoles?.length) {
      return;
    }
    // Nếu vai trò của user không nằm trong danh sách các vai trò được phép truy cập, báo lỗi 403
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  /**
   * Hàm nội bộ: Trích xuất và cắt chuỗi Token nguyên bản từ Header "Authorization"
   * @param request Đối tượng Request của Express
   * @returns Chuỗi Token dạng JWT nếu hợp lệ, ngược lại trả về `null`
   * @example Định dạng tiêu chuẩn trên Header: "Authorization: Bearer eyJhbGciOi..." -> Hàm sẽ trả về "eyJhbGciOi..."
   */
  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;

    // Kiểm tra xem Header Authorization có tồn tại và bắt đầu bằng chữ "Bearer " hay không
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    // Bỏ 7 ký tự đầu tiên (chính là chữ "Bearer ") để lấy ra chuỗi Token mã hóa JWT nguyên bản
    return authHeader.slice(7);
  }
}
