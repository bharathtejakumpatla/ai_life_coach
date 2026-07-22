import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** False until VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are set — lets auth UI degrade gracefully instead of crashing pre-setup. */
export const isAuthConfigured = Boolean(url && publishableKey)

export const supabase = url && publishableKey ? createClient(url, publishableKey) : null
