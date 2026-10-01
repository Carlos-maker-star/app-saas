/**
 * Configuración pública de Supabase (Project Settings > API).
 * Solo la "anon key" (pública). NUNCA pongas aquí la "service_role".
 * Si están vacías, la app funciona solo con las demos (/demo/cafeteria, etc.).
 */
export const env = {
  supabaseUrl: 'https://xcoezcrnokunynntdoca.supabase.co',
  supabaseAnonKey: 'sb_publishable_GPrAolyiNG2YrZNYfzfLIg_Ce6Cxo__', // clave pública (publishable)
  /** Dominio base de las landings: cliente.<dominioBase>. Vacío = solo ?s= o /n/:slug */
  dominioBase: '',
};

export const supabaseConfigurado = !!(env.supabaseUrl && env.supabaseAnonKey);
