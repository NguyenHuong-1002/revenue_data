import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './global/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';

import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import * as path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // todo : Cấu hình phục vụ file tĩnh (static assets) từ thư mục public
  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // * tự động xóa các property không có sẵn trong DTO
      transform: true, // * tự động chuyển type
      forbidNonWhitelisted: true, //* throw lỗi nếu có property không có trong DTO
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(app.get(WINSTON_MODULE_NEST_PROVIDER)));
  app.useGlobalGuards(
    new AuthGuard(app.get(Reflector), app.get(JwtService), app.get(WINSTON_MODULE_NEST_PROVIDER)),
  );

  // todo : Kiểm tra các corsOrigins trong env
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
    : [];

  // todo : Kiểm tra môi trường phát triển
  const isDev = process.env.NODE_ENV === 'development';
  app.enableCors({
    origin: isDev ? true : corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // todo : Định nghĩa port
  const port = Number(process.env.PORT);
  await app.listen(port);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (module.hot) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    module.hot.accept();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.hot.dispose(() => app.close());
  }
}
void bootstrap();
