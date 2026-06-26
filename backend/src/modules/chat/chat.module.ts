import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { SaleReportEntity } from '../sale-reports/entities/sale-report.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { StoreBranchEntity } from '../branches/entities/branch.entity';
import { PlantEntity } from '../plants/entities/plant.entity';
import { InventoryReportEntity } from '../inventory-reports/entities/inventory-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSession,
      ChatMessage,
      SaleReportEntity,
      ProductEntity,
      StoreBranchEntity,
      PlantEntity,
      InventoryReportEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
