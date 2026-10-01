import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, supabaseConfigurado } from './env';

/** null si todavía no se configuró Supabase (modo demo). */
export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;
