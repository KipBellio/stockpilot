import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  const message =
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment, then rebuild.'
  console.error(message)
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<div style="font-family:sans-serif;padding:2rem;max-width:40rem;margin:auto"><h1>Configuration error</h1><p>${message}</p></div>`
  }
  throw new Error(message)
}

export const supabase = createClient(supabaseUrl, supabaseKey)
