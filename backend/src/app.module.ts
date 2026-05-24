import { Module } from '@nestjs/common';
import { ProductModule } from './modules/products/product.module';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './models/supabase.module';

@Module({
  imports: [ProductModule, ConfigModule.forRoot({
    isGlobal: true,
  }), SupabaseModule,],
})
export class AppModule { }
