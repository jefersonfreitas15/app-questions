import { createClient } from '@supabase/supabase-js';

// Cria o URL absoluto dinamicamente no navegador, ou usa o URL do servidor
const supabaseUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/api-banco` 
  : process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);