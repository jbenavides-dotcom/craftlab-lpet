import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// DEV auto-login: al cargar en localhost, si no hay sesión, intenta iniciar
// con credenciales en .env.local (VITE_DEV_EMAIL / VITE_DEV_PASSWORD).
// NO se commitean credenciales — .env.local está en .gitignore.
if (import.meta.env.DEV) {
    const DEV_EMAIL    = import.meta.env.VITE_DEV_EMAIL    as string | undefined
    const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD as string | undefined
    if (DEV_EMAIL && DEV_PASSWORD) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                supabase.auth.signInWithPassword({ email: DEV_EMAIL, password: DEV_PASSWORD })
                    .then(({ error }) => {
                        if (error) console.warn('[dev auto-login failed]', error.message)
                        else console.info('[dev auto-login]', DEV_EMAIL)
                    })
            }
        })
    } else {
        console.info('[dev] No VITE_DEV_EMAIL/VITE_DEV_PASSWORD en .env.local → login manual')
    }
}
