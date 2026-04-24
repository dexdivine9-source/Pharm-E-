// ========================================================================================
// PHARMA-E: Server-Side Supabase Client (for API routes / serverless functions)
// ========================================================================================
// Uses SUPABASE_SERVICE_KEY for RLS bypass — NEVER expose to frontend.
// ========================================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _serverClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client with service_role privileges.
 * Used by API routes, webhooks, and cron jobs.
 */
export function getServerSupabase(): SupabaseClient {
  if (_serverClient) return _serverClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || '';

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for server-side operations.'
    );
  }

  _serverClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _serverClient;
}
