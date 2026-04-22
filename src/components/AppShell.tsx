import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Home as HomeIcon,
    ShoppingBag,
    Info,
    User,
    Bell,
    LogOut,
    Star,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { ProtectedRoute } from './ProtectedRoute';
import './AppShell.css';

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useProfile();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
    };

    // Rutas de wizard fullscreen: no muestran sidebar ni bottom-nav
    const isFullScreenFlow =
        location.pathname.startsWith('/forward-booking') ||
        location.pathname.startsWith('/craftlab/');

    if (isFullScreenFlow) {
        return <ProtectedRoute>{children}</ProtectedRoute>;
    }

    return (
        <ProtectedRoute>
            <div className="app-shell">
                {/* ── Sidebar (desktop only) ── */}
                <aside className="app-sidebar" aria-label="Main navigation">
                    <div className="app-sidebar-brand">
                        <img
                            src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1735702592/logo_horizontal_ss9bvn.png"
                            alt="La Palma & El Tucán"
                            className="app-sidebar-logo"
                        />
                    </div>

                    <nav className="app-sidebar-nav">
                        <NavLink
                            to="/home"
                            className={({ isActive }) =>
                                `app-nav-link${isActive ? ' is-active' : ''}`
                            }
                        >
                            <HomeIcon size={18} strokeWidth={1.75} />
                            <span>Home</span>
                        </NavLink>

                        <NavLink
                            to="/orders"
                            className={({ isActive }) =>
                                `app-nav-link${isActive ? ' is-active' : ''}`
                            }
                        >
                            <ShoppingBag size={18} strokeWidth={1.75} />
                            <span>Orders</span>
                        </NavLink>

                        <NavLink
                            to="/notifications"
                            className={({ isActive }) =>
                                `app-nav-link${isActive ? ' is-active' : ''}`
                            }
                        >
                            <Bell size={18} strokeWidth={1.75} />
                            <span>Notifications</span>
                        </NavLink>

                        <NavLink
                            to="/about"
                            className={({ isActive }) =>
                                `app-nav-link${isActive ? ' is-active' : ''}`
                            }
                        >
                            <Info size={18} strokeWidth={1.75} />
                            <span>About us</span>
                        </NavLink>

                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                `app-nav-link${isActive ? ' is-active' : ''}`
                            }
                        >
                            <User size={18} strokeWidth={1.75} />
                            <span>Profile</span>
                        </NavLink>
                    </nav>

                    {profile && (
                        <div className="app-sidebar-user">
                            <div
                                className="app-user-avatar"
                                aria-label={`Avatar de ${profile.fullName}`}
                            >
                                {profile.initials}
                            </div>
                            <div className="app-user-info">
                                <div className="app-user-name">{profile.fullName}</div>
                                <div className="app-user-points">
                                    <Star
                                        size={11}
                                        fill="#c1004a"
                                        color="#c1004a"
                                        strokeWidth={2}
                                    />
                                    {profile.points.toLocaleString()} pts
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        className="app-sidebar-signout"
                        onClick={handleSignOut}
                        aria-label="Sign out"
                    >
                        <LogOut size={16} strokeWidth={2} />
                        <span>Sign out</span>
                    </button>
                </aside>

                {/* ── Main content ── */}
                <main className="app-main">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
};
