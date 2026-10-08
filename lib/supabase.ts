import { createClient } from '@supabase/supabase-js';

// Forçamos o uso do túnel seguro configurado no next.config
const supabaseUrl = '/api-banco'; 
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);