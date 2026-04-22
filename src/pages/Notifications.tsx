import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Package,
    FlaskConical,
    Sparkles,
    Check,
    Gift,
    Bell,
    Star,
    Home as HomeIcon,
    ShoppingBag,
    Info,
} from 'lucide-react';
import './Notifications.css';

/* ─── Types ─────────────────────────────────────────── */
type NotificationType = 'order' | 'promo';
type FilterTab = 'all' | 'orders' | 'offers';

interface Notification {
    id: number;
    type: NotificationType;
    unread: boolean;
    icon: React.ElementType;
    title: string;
    body: string;
    time: string;
}

/* ─── Mock data ─────────────────────────────────────── */
const NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        type: 'order',
        unread: true,
        icon: Package,
        title: 'Order shipped',
        body: 'Your Geisha lot (35 kg) is on its way.',
        time: '2h ago',
    },
    {
        id: 2,
        type: 'order',
        unread: true,
        icon: FlaskConical,
        title: 'Fermentation started',
        body: 'Bio-Innovation process begins today for your lot.',
        time: '1d ago',
    },
    {
        id: 3,
        type: 'promo',
        unread: false,
        icon: Sparkles,
        title: 'New Sidra harvest',
        body: 'Limited Q2 Sidra available — reserve now.',
        time: '2d ago',
    },
    {
        id: 4,
        type: 'order',
        unread: false,
        icon: Check,
        title: 'Order delivered',
        body: 'Your last 70 kg Pink Bourbon reached your roastery.',
        time: '1w ago',
    },
    {
        id: 5,
        type: 'promo',
        unread: false,
        icon: Gift,
        title: '5,000 bonus points',
        body: 'Welcome gift for completing education.',
        time: '2w ago',
    },
    {
        id: 6,
        type: 'order',
        unread: false,
        icon: Star,
        title: 'New stage: Drying',
        body: 'Your Pink Bourbon enters controlled solar drying.',
        time: '3w ago',
    },
];

/* ─── Constants ─────────────────────────────────────── */
const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'orders', label: 'Orders' },
    { key: 'offers', label: 'Offers' },
];

/* ─── Icon color mapping ─────────────────────────────── */
function getIconClass(notif: Notification): string {
    const { icon } = notif;
    if (icon === Package || icon === Check) return 'nt-card-icon--order';
    if (icon === FlaskConical) return 'nt-card-icon--promo';
    if (icon === Sparkles || icon === Gift) return 'nt-card-icon--milestone';
    return 'nt-card-icon--amber';
}

/* ─── Sub-components ─────────────────────────────────── */
function NotifCard({
    notif,
    onMarkRead,
}: {
    notif: Notification;
    onMarkRead: (id: number) => void;
}) {
    const Icon = notif.icon;
    const iconClass = getIconClass(notif);

    return (
        <article
            className={`nt-card${notif.unread ? ' unread' : ''}`}
            onClick={() => onMarkRead(notif.id)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onMarkRead(notif.id)}
            aria-label={notif.title}
        >
            {/* Unread badge */}
            {notif.unread && (
                <span
                    className="nt-unread-badge"
                    role="status"
                    aria-label="Unread notification"
                />
            )}

            {/* Icon */}
            <div className={`nt-card-icon ${iconClass}`} aria-hidden="true">
                <Icon size={18} strokeWidth={1.75} />
            </div>

            {/* Body */}
            <div className="nt-card-body">
                <span className="nt-card-time">{notif.time.toUpperCase()}</span>
                <p className="nt-card-title">{notif.title}</p>
                <p className="nt-card-desc">{notif.body}</p>
            </div>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="nt-empty" role="status" aria-live="polite">
            <Bell size={64} strokeWidth={1.25} className="nt-empty-icon" aria-hidden="true" />
            <p className="nt-empty-title">You're all caught up</p>
            <p className="nt-empty-sub">No notifications in this category</p>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────── */
export function Notifications() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);

    const filtered = notifications.filter((n) => {
        if (activeTab === 'orders') return n.type === 'order';
        if (activeTab === 'offers') return n.type === 'promo';
        return true;
    });

    const unreadCount = notifications.filter((n) => n.unread).length;
    const orderCount = notifications.filter((n) => n.type === 'order').length;
    const offerCount = notifications.filter((n) => n.type === 'promo').length;

    function markRead(id: number) {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
        );
    }

    function markAllRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }

    return (
        <div className="nt-container">
            {/* Mobile close button — desktop sidebar ya da el contexto */}
            <button
                className="nt-mobile-close"
                onClick={() => navigate('/home')}
                aria-label="Close notifications"
            >
                <X size={20} strokeWidth={2} />
            </button>

            {/* ── Header editorial ── */}
            <header className="nt-header-intro">
                <p className="nt-kicker">INBOX</p>
                <h1 className="nt-title">
                    Stay in the{' '}
                    <em className="nt-title-accent">loop.</em>
                </h1>
                <p className="nt-subtitle">
                    Updates on your lots, offers, and new harvests.
                </p>
            </header>

            {/* ── Stats row ── */}
            <div className="nt-stats-row" role="list" aria-label="Notification statistics">
                <div className="nt-stat nt-stat--pink" role="listitem">
                    <div className="nt-stat-icon" aria-hidden="true">
                        <Bell size={17} strokeWidth={1.75} />
                    </div>
                    <span className="nt-stat-value">{unreadCount}</span>
                    <span className="nt-stat-label">Unread</span>
                </div>

                <div className="nt-stat nt-stat--blue" role="listitem">
                    <div className="nt-stat-icon" aria-hidden="true">
                        <Package size={17} strokeWidth={1.75} />
                    </div>
                    <span className="nt-stat-value">{orderCount}</span>
                    <span className="nt-stat-label">Orders</span>
                </div>

                <div className="nt-stat nt-stat--green" role="listitem">
                    <div className="nt-stat-icon" aria-hidden="true">
                        <Gift size={17} strokeWidth={1.75} />
                    </div>
                    <span className="nt-stat-value">{offerCount}</span>
                    <span className="nt-stat-label">Offers</span>
                </div>
            </div>

            {/* ── Toolbar: tabs + mark all read ── */}
            <div className="nt-toolbar">
                <div className="nt-tabs" role="tablist" aria-label="Notification filters">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            role="tab"
                            aria-selected={activeTab === key}
                            className={`nt-tab${activeTab === key ? ' nt-tab--active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {unreadCount > 0 && (
                    <button
                        className="nt-mark-all"
                        onClick={markAllRead}
                        aria-label="Mark all notifications as read"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* ── Grid de notificaciones ── */}
            <section className="nt-grid-wrapper" aria-label="Notifications list">
                {filtered.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="nt-grid" id="nt-list">
                        {filtered.map((notif) => (
                            <NotifCard
                                key={notif.id}
                                notif={notif}
                                onMarkRead={markRead}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Bottom nav (mobile only — AppShell oculta en desktop) ── */}
            <nav className="nt-bottom-nav" aria-label="Main navigation">
                <button
                    className="nav-item"
                    onClick={() => navigate('/home')}
                    aria-label="Go to Home"
                >
                    <HomeIcon size={24} aria-hidden="true" />
                    <span>Home</span>
                </button>
                <button
                    className="nav-item"
                    onClick={() => navigate('/orders')}
                    aria-label="Go to Orders"
                >
                    <ShoppingBag size={24} aria-hidden="true" />
                    <span>Orders</span>
                </button>
                <button
                    className="nav-item"
                    onClick={() => navigate('/about')}
                    aria-label="Go to About us"
                >
                    <Info size={24} aria-hidden="true" />
                    <span>Us</span>
                </button>
            </nav>
        </div>
    );
}
