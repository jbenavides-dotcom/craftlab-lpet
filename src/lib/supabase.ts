import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// DEV auto-login: al cargar en localhost, si no hay sesión inicia con la cuenta
// dev para que órdenes/puntos/notifs se escriban contra Supabase igual que en prod.
if (import.meta.env.DEV) {
    const DEV_EMAIL    = import.meta.env.VITE_DEV_EMAIL    ?? 'jbenavides@lapalmayeltucan.com'
    const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD ?? 'CraftLab2026!'
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            supabase.auth.signInWithPassword({ email: DEV_EMAIL, password: DEV_PASSWORD })
                .then(({ error }) => {
                    if (error) console.warn('[dev auto-login failed]', error.message)
                    else console.info('[dev auto-login]', DEV_EMAIL)
                })
        }
    })
}
