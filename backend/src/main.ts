import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './global/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { FileLogger } from './global/file-logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger(),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Kích hoạt CORS hỗ trợ gửi Authorization headers và credentials từ frontend
  app.enableCors({
    origin: true, // Tự động cho phép theo nguồn gốc (origin) của frontend yêu cầu
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Cho phép truyền gửi access tokens / cookies bảo mật
  });

  // Cấu hình tài liệu tự động Swagger (OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('Hệ thống Doanh thu - API Backend')
    .setDescription(
      'Tài liệu hướng dẫn tích hợp và chi tiết các đầu endpoints API phục vụ quản lý doanh thu, sản phẩm và tài khoản.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📑 Swagger API Document is available at: http://localhost:${port}/api/docs`,
  );

  // 3. Webpack Hot Module Replacement (HMR)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (module.hot) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    module.hot.accept();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    module.hot.dispose(() => app.close());
  }
}
void bootstrap();
