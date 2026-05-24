import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient | undefined;

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
      throw new Error('Supabase configuration missing');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Connected to Supabase client');
  }

  get client(): SupabaseClient | undefined {
    return this.supabaseClient;
  }
}
