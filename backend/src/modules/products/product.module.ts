import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/models/database.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
