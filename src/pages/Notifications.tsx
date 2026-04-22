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
    Home as HomeIcon,
    ShoppingBag,
    Info,
} from 'lucide-react';
import './Notifications.css';

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
];

const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'orders', label: 'Orders' },
    { key: 'offers', label: 'Offers' },
];

function getIconColor(type: NotificationType): string {
    if (type === 'order') return 'nt-item-icon--order';
    return 'nt-item-icon--promo';
}

export function Notifications() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered = NOTIFICATIONS.filter((n) => {
        if (activeTab === 'orders') return n.type === 'order';
        if (activeTab === 'offers') return n.type === 'promo';
        return true;
    });

    return (
        <div className="nt-container">
            {/* Header */}
            <header className="nt-header">
                <button
                    className="nt-close-btn"
                    onClick={() => navigate('/home')}
                    aria-label="Close notifications"
                >
                    <X size={22} strokeWidth={2} />
                </button>
                <span className="nt-header-title">Notifications</span>
                <div className="nt-header-spacer" aria-hidden="true" />
            </header>

            {/* Segmented control */}
            <div className="nt-tabs" role="tablist" aria-label="Notification filters">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`nt-tab${activeTab === key ? ' active' : ''}`}
                        onClick={() => setActiveTab(key)}
                        role="tab"
                        aria-selected={activeTab === key}
                        aria-controls="nt-list"
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Notification list */}
            <main className="nt-main">
                {filtered.length === 0 ? (
                    <div className="nt-empty" aria-live="polite">
                        <Bell size={36} strokeWidth={1.5} className="nt-empty-icon" aria-hidden="true" />
                        <p className="nt-empty-text">No notifications</p>
                    </div>
                ) : (
                    <ul className="nt-list" id="nt-list" role="list">
                        {filtered.map((notif) => {
                            const Icon = notif.icon;
                            return (
                                <li
                                    key={notif.id}
                                    className={`nt-item${notif.unread ? ' unread' : ''}`}
                                    role="listitem"
                                >
                                    <div
                                        className={`nt-item-icon ${getIconColor(notif.type)}`}
                                        aria-hidden="true"
                                    >
                                        <Icon size={18} strokeWidth={1.75} />
                                    </div>
                                    <div className="nt-item-body">
                                        <p className="nt-item-title">{notif.title}</p>
                                        <p className="nt-item-desc">{notif.body}</p>
                                        <span className="nt-item-time">{notif.time}</span>
                                    </div>
                                    {notif.unread && (
                                        <span
                                            className="nt-unread-dot"
                                            aria-label="Unread"
                                            role="status"
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="nt-bottom-nav" aria-label="Main navigation">
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
