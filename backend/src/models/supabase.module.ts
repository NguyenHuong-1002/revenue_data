// src/supabase/supabase.module.ts
import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global() // Biến thành module toàn cục
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService], // Xuất Service ra ngoài để các module khác có thể Inject
})
export class SupabaseModule { }
