export interface JwtPayload {
  sub: string;
  username: string;
  role: 'ADMIN' | 'STAFF';
  exp: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
