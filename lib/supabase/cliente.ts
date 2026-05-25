// Cliente de Supabase para uso en el navegador
import { createBrowserClient } from '@supabase/ssr';

export function crearSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
