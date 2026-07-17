// lib/supabase-server.ts
// Server-side Supabase client — uses the service role key.
// Import only in Server Components, Server Actions, and route handlers.
// Never import in Client Components (the service role key must not reach the browser).

import { createClient } from '@supabase/supabase-js';

export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
