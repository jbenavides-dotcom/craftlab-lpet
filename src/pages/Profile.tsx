import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Settings,
    MapPin,
    CreditCard,
    Sliders,
    HelpCircle,
    LogOut,
    ChevronRight,
    Trophy,
    Star,
    Coffee,
    Calendar,
    Home as HomeIcon,
    ShoppingBag,
    Info,
} from 'lucide-react';
import './Profile.css';

interface MenuItem {
    icon: React.ElementType;
    label: string;
}

const MENU_ITEMS: MenuItem[] = [
    { icon: Settings, label: 'Account settings' },
    { icon: MapPin, label: 'Shipping address' },
    { icon: CreditCard, label: 'Payment methods' },
    { icon: Sliders, label: 'Preferences' },
    { icon: HelpCircle, label: 'Help & support' },
];

export function Profile() {
    const navigate = useNavigate();

    return (
        <div className="pf-container">
            {/* Header */}
            <header className="pf-header">
                <button
                    className="pf-close-btn"
                    onClick={() => navigate('/home')}
                    aria-label="Close profile"
                >
                    <X size={22} strokeWidth={2} />
                </button>
                <span className="pf-header-title">Profile</span>
                <div className="pf-header-spacer" aria-hidden="true" />
            </header>

            <main className="pf-main">
                {/* Avatar + Identity */}
                <section className="pf-identity">
                    <div className="pf-avatar" aria-label="User avatar — Elisa">
                        <span className="pf-avatar-initials">E</span>
                    </div>
                    <h1 className="pf-name">Elisa Madriñán</h1>
                    <p className="pf-email">elisa@lapalma.co</p>
                    <span className="pf-badge">Premium Partner · 2024</span>
                </section>

                {/* Stats grid 2×2 */}
                <section className="pf-stats" aria-label="Account statistics">
                    <div className="pf-stat pf-stat--orders">
                        <div className="pf-stat-icon-wrap">
                            <Trophy size={18} strokeWidth={1.75} />
                        </div>
                        <span className="pf-stat-value">3</span>
                        <span className="pf-stat-label">Orders completed</span>
                    </div>
                    <div className="pf-stat pf-stat--points">
                        <div className="pf-stat-icon-wrap">
                            <Star size={18} strokeWidth={1.75} />
                        </div>
                        <span className="pf-stat-value">15,000</span>
                        <span className="pf-stat-label">Points</span>
                    </div>
                    <div className="pf-stat pf-stat--kg">
                        <div className="pf-stat-icon-wrap">
                            <Coffee size={18} strokeWidth={1.75} />
                        </div>
                        <span className="pf-stat-value">105 kg</span>
                        <span className="pf-stat-label">Received</span>
                    </div>
                    <div className="pf-stat pf-stat--member">
                        <div className="pf-stat-icon-wrap">
                            <Calendar size={18} strokeWidth={1.75} />
                        </div>
                        <span className="pf-stat-value">2024</span>
                        <span className="pf-stat-label">Member since</span>
                    </div>
                </section>

                {/* Menu items */}
                <nav className="pf-menu" aria-label="Profile options">
                    {MENU_ITEMS.map(({ icon: Icon, label }, index) => (
                        <React.Fragment key={label}>
                            <button
                                className="pf-menu-item"
                                aria-label={label}
                            >
                                <span className="pf-menu-icon-wrap" aria-hidden="true">
                                    <Icon size={18} strokeWidth={1.75} />
                                </span>
                                <span className="pf-menu-label">{label}</span>
                                <ChevronRight size={16} strokeWidth={2} className="pf-menu-chev" aria-hidden="true" />
                            </button>
                            {index < MENU_ITEMS.length - 1 && (
                                <div className="pf-divider" role="separator" />
                            )}
                        </React.Fragment>
                    ))}
                </nav>

                {/* Sign out */}
                <button className="pf-signout" aria-label="Sign out">
                    <LogOut size={16} strokeWidth={2} />
                    Sign out
                </button>
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav pf-bottom-nav">
                <button
                    className="nav-item"
                    onClick={() => navigate('/home')}
                    aria-label="Home"
                >
                    <HomeIcon size={24} />
                    <span>Home</span>
                </button>
                <button
                    className="nav-item"
                    onClick={() => navigate('/orders')}
                    aria-label="Orders"
                >
                    <ShoppingBag size={24} />
                    <span>Orders</span>
                </button>
                <button
                    className="nav-item"
                    onClick={() => navigate('/about')}
                    aria-label="About us"
                >
                    <Info size={24} />
                    <span>Us</span>
                </button>
            </nav>
        </div>
    );
}
