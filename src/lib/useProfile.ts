import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    initials: string;
    role: 'partner' | 'admin' | 'operator';
    companyName: string | null;
    country: string | null;
    joinedYear: number;
    // Progress
    craftlabUnlocked: boolean;
    points: number;
}

/**
 * Hook que devuelve el profile + user_progress del usuario autenticado.
 * Null mientras carga o si no hay sesión.
 */
export function useProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const computeInitials = (name: string) => name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((s: string) => s[0]?.toUpperCase() ?? '')
            .join('') || 'P';

        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !isMounted) {
                if (isMounted) setLoading(false);
                return;
            }

            // 1) Placeholder inmediato desde auth.user (no espera DB)
            const metaFullName = (user.user_metadata?.full_name as string | undefined) ?? '';
            const emailSlug = user.email?.split('@')[0] ?? 'Partner';
            const immediateName = metaFullName || emailSlug;

            setProfile((prev) => prev ?? {
                id: user.id,
                email: user.email ?? '',
                fullName: immediateName,
                initials: computeInitials(immediateName),
                role: 'partner',
                companyName: null,
                country: null,
                joinedYear: new Date().getFullYear(),
                craftlabUnlocked: false,
                points: 0,
            });
            setLoading(false);

            // 2) Luego busca datos reales de la DB y actualiza
            const [profileRes, progressRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
            ]);

            if (!isMounted) return;

            const p = profileRes.data;
            const pr = progressRes.data;
            const fullName = (p?.full_name as string | null) || immediateName;

            setProfile({
                id: user.id,
                email: p?.email ?? user.email ?? '',
                fullName,
                initials: computeInitials(fullName),
                role: (p?.role as UserProfile['role']) ?? 'partner',
                companyName: p?.company_name ?? null,
                country: p?.country ?? null,
                joinedYear: p?.joined_at ? new Date(p.joined_at as string).getFullYear() : new Date().getFullYear(),
                craftlabUnlocked: pr?.craftlab_unlocked ?? false,
                points: pr?.points ?? 0,
            });
        };

        load();

        // Escucha cambios de auth (logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                setProfile(null);
                setLoading(false);
            } else {
                load();
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { profile, loading };
}
