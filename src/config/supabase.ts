import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && config.supabaseKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('⚡ Conexión a Supabase inicializada correctamente.');
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar cliente de Supabase:', error);
  }
} else {
  console.log('ℹ️ Supabase credentials no detectadas en .env. Modo simulado/desarrollo activo.');
}

export const getSupabase = (): SupabaseClient | null => supabaseClient;
