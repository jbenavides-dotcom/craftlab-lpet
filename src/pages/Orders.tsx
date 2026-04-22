import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FlaskConical,
    Check,
    Coffee,
    Package,
    ShoppingBag,
    Home as HomeIcon,
    Info,
} from 'lucide-react';
import './Orders.css';

/* ─── Types ─────────────────────────────────────────── */
type Stage = 'order' | 'fermentation' | 'drying' | 'ready';
type Status = 'active' | 'ready' | 'delivered';
type FilterTab = 'all' | 'active' | 'completed';

interface Order {
    id: string;
    variety: string;
    harvest: string;
    process: string;
    weight_kg: number;
    stage: Stage;
    status: Status;
    created: string;
    gradient: string;
}

/* ─── Mock data ─────────────────────────────────────── */
const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-2024-001',
        variety: 'Geisha',
        harvest: 'Jan – Mar 2026',
        process: 'Natural · Anaerobic',
        weight_kg: 70,
        stage: 'fermentation',
        status: 'active',
        created: '2025-10-24',
        gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
    },
    {
        id: 'ORD-2024-002',
        variety: 'Sidra',
        harvest: 'Apr – Jun 2026',
        process: 'Bio-Innovation · Mucilage',
        weight_kg: 35,
        stage: 'order',
        status: 'active',
        created: '2025-11-02',
        gradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
    },
    {
        id: 'ORD-2023-007',
        variety: 'Pink Bourbon',
        harvest: 'Oct – Dec 2025',
        process: 'Washed · Standard',
        weight_kg: 35,
        stage: 'ready',
        status: 'delivered',
        created: '2025-06-12',
        gradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
    },
];

/* ─── Constants ─────────────────────────────────────── */
const STAGES: Stage[] = ['order', 'fermentation', 'drying', 'ready'];

const STAGE_LABELS: Record<Stage, string> = {
    order: 'Order',
    fermentation: 'Fermentation',
    drying: 'Drying',
    ready: 'Ready',
};

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
    active: { label: 'In progress', className: 'ord-badge--active' },
    ready: { label: 'Ready to ship', className: 'ord-badge--ready' },
    delivered: { label: 'Delivered', className: 'ord-badge--delivered' },
};

/* ─── Helpers ───────────────────────────────────────── */
function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function stageIndex(stage: Stage): number {
    return STAGES.indexOf(stage);
}

/* ─── Sub-components ─────────────────────────────────── */
function ProgressLine({ stage }: { stage: Stage }) {
    const current = stageIndex(stage);

    return (
        <div className="ord-card-progress" aria-label={`Stage: ${STAGE_LABELS[stage]}`}>
            {STAGES.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={s}>
                        {i > 0 && (
                            <div
                                className={`ord-progress-line${done || active ? ' ord-progress-line--filled' : ''}`}
                            />
                        )}
                        <div className="ord-progress-stage">
                            <div
                                className={[
                                    'ord-progress-dot',
                                    done ? 'ord-progress-dot--done' : '',
                                    active ? 'ord-progress-dot--active' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                aria-current={active ? 'step' : undefined}
                            >
                                {done && <Check size={8} strokeWidth={3} />}
                            </div>
                            <span className="ord-progress-label">{STAGE_LABELS[s]}</span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function OrderCard({ order }: { order: Order }) {
    const badge = STATUS_CONFIG[order.status];

    return (
        <article
            className="ord-card"
            onClick={() => alert('Order detail — coming in a future update.')}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && alert('Order detail — coming in a future update.')}
            aria-label={`Order ${order.id}, ${order.variety}`}
        >
            {/* Hero gradient */}
            <div
                className="ord-card-hero"
                style={{ background: order.gradient }}
                aria-hidden="true"
            >
                <span className={`ord-card-status ${badge.className}`}>{badge.label}</span>
                <span className="ord-card-weight">{order.weight_kg} kg</span>
            </div>

            {/* Body */}
            <div className="ord-card-body">
                <p className="ord-card-variety">{order.variety} · {order.harvest}</p>
                <p className="ord-card-process">{order.process}</p>

                <ProgressLine stage={order.stage} />

                <p className="ord-card-meta">
                    Created {formatDate(order.created)} · {order.id}
                </p>
            </div>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="ord-empty" role="status" aria-live="polite">
            <Package size={40} strokeWidth={1.25} aria-hidden="true" />
            <p>No orders in this category</p>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────── */
export function Orders() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    const filtered = MOCK_ORDERS.filter((o) => {
        if (activeTab === 'active') return o.status === 'active';
        if (activeTab === 'completed') return o.status === 'delivered';
        return true;
    });

    const activeCount = MOCK_ORDERS.filter((o) => o.status === 'active').length;
    const completedCount = MOCK_ORDERS.filter((o) => o.status === 'delivered').length;
    const totalKg = MOCK_ORDERS.reduce((sum, o) => sum + o.weight_kg, 0);

    return (
        <div className="ord-container">
            {/* ── Header ── */}
            <header className="ord-header">
                <p className="ord-kicker">Your orders</p>
                <h1 className="ord-title">
                    Your coffee,{' '}
                    <em className="ord-title-accent">in motion.</em>
                </h1>
                <p className="ord-subtitle">Every lot, every stage, from cherry to cup.</p>
            </header>

            {/* ── Stats row ── */}
            <div className="ord-stats-row" role="list" aria-label="Order statistics">
                <div className="ord-stat ord-stat--pink" role="listitem">
                    <div className="ord-stat-icon" aria-hidden="true">
                        <FlaskConical size={18} strokeWidth={1.75} />
                    </div>
                    <span className="ord-stat-value">{activeCount}</span>
                    <span className="ord-stat-label">Active</span>
                </div>

                <div className="ord-stat ord-stat--green" role="listitem">
                    <div className="ord-stat-icon" aria-hidden="true">
                        <Check size={18} strokeWidth={2} />
                    </div>
                    <span className="ord-stat-value">{completedCount}</span>
                    <span className="ord-stat-label">Completed</span>
                </div>

                <div className="ord-stat ord-stat--amber" role="listitem">
                    <div className="ord-stat-icon" aria-hidden="true">
                        <Coffee size={18} strokeWidth={1.75} />
                    </div>
                    <span className="ord-stat-value">{totalKg}</span>
                    <span className="ord-stat-label">Kg total</span>
                </div>
            </div>

            {/* ── Filter tabs ── */}
            <div className="ord-tabs" role="tablist" aria-label="Filter orders">
                {(['all', 'active', 'completed'] as FilterTab[]).map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={`ord-tab${activeTab === tab ? ' ord-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* ── Orders grid ── */}
            <section aria-label="Orders list" className="ord-grid-wrapper">
                {filtered.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="ord-grid">
                        {filtered.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Bottom nav (mobile only — AppShell oculta en desktop) ── */}
            <nav className="bottom-nav" aria-label="Main navigation">
                <button
                    className="nav-item"
                    onClick={() => navigate('/home')}
                    aria-label="Go to Home"
                >
                    <HomeIcon size={24} aria-hidden="true" />
                    <span>Home</span>
                </button>
                <button
                    className="nav-item active"
                    aria-current="page"
                    aria-label="Orders — current page"
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
