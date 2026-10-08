import { createClient } from '@supabase/supabase-js';

// Se estiver no navegador, usa o túnel da Vercel. 
// Se estiver no servidor/build, usa o URL real das variáveis de ambiente.
const supabaseUrl = typeof window !== 'undefined' 
  ? '/api-banco' 
  : process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);