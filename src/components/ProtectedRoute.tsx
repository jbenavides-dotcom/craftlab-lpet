import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wrapper que protege rutas: si no hay sesión activa en Supabase,
 * redirige a /login. Mientras verifica, muestra un loading mínimo.
 */
// DEV bypass: en localhost saltarse la validación de sesión para iterar más rápido.
// En producción (GH Pages) esto es false y sigue protegido normal.
const DEV_BYPASS_AUTH = import.meta.env.DEV;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [status, setStatus] = useState<'checking' | 'authed' | 'unauthed'>(
        DEV_BYPASS_AUTH ? 'authed' : 'checking'
    );

    useEffect(() => {
        if (DEV_BYPASS_AUTH) return;
        let isMounted = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!isMounted) return;
            setStatus(session ? 'authed' : 'unauthed');
        });

        // Escucha cambios de auth (logout, expire, refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setStatus(session ? 'authed' : 'unauthed');
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    if (status === 'checking') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafaf5',
                color: '#6b7280',
                fontSize: '0.85rem',
                fontFamily: 'system-ui, sans-serif',
            }}>
                Loading…
            </div>
        );
    }

    if (status === 'unauthed') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
