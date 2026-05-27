import { createClient } from '@supabase/supabase-js';

// Leemos las llaves secretas de nuestro archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Creamos y exportamos la conexión oficial
export const supabase = createClient(supabaseUrl, supabaseKey);