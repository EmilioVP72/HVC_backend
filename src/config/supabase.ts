import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';

let supabaseClient: SupabaseClient | null = null;

const sanitizeSupabaseUrl = (url: string): string => {
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

if (config.supabaseUrl && config.supabaseKey) {
  try {
    const cleanUrl = sanitizeSupabaseUrl(config.supabaseUrl);
    supabaseClient = createClient(cleanUrl, config.supabaseKey.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log(`⚡ Conexión a Supabase inicializada correctamente en: ${cleanUrl}`);
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar cliente de Supabase:', error);
  }
} else {
  console.log('ℹ️ Supabase credentials no detectadas en .env. Modo simulado/desarrollo activo.');
}

export const getSupabase = (): SupabaseClient | null => supabaseClient;
