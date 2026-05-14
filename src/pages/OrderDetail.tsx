import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Coffee,
    Gauge,
    Thermometer,
    Droplets,
    FlaskConical,
    Clock,
    Check,
    Image as ImageIcon,
    Wind,
    Zap,
    Hash,
    Waves,
    Activity,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './OrderDetail.css';

/* ─── Types ───────────────────────────────────────── */

type OrderType = 'fb' | 'cl';

type Stage = 'order' | 'fermentation' | 'drying' | 'ready';

interface FbOrderRow {
    id: string;
    variety: string | null;
    harvest_date: string | null;
    flavor_profile: string | null;
    process: string | null;
    bag_size: number;
    quantity: number;
    total_kg: number | null;
    status: string;
    created_at: string;
    lote_id: string | null;
}

interface ClOrderRow {
    id: string;
    variety: string | null;
    shipment_window: string | null;
    flavor: string | null;
    process: string | null;
    quantity_kg: number | null;
    macro: string | null;
    category: string | null;
    status: string;
    created_at: string;
}

interface TankRow {
    id: string;
    name: string;
    capacity_kg: number;
    status: string;
}

interface SensorReadingRow {
    ph: number | null;
    temp_c: number | null;
    brix: number | null;
    orp_mv: number | null;
    sg: number | null;
    tds_ppm: number | null;
    ec_us_cm: number | null;
    salinity_ppm: number | null;
    cf: number | null;
    rh_pct: number | null;
    recorded_at: string;
}

interface AssignmentRow {
    tank_id: string;
    assigned_at: string;
    released_at: string | null;
}

interface OrderUpdateRow {
    id: string;
    stage: string;
    message: string | null;
    image_url: string | null;
    created_at: string;
}

interface OrderDetail {
    shortId: string;
    variety: string;
    process: string;
    flavor: string;
    weightKg: number;
    harvestDate: string;
    status: string;
    stage: Stage;
    statusLabel: string;
    statusClass: string;
    gradient: string;
}

interface TankDetail {
    id: string;
    name: string;
    capacityKg: number;
    status: string;
    latestReading: SensorReadingRow | null;
}

/* ─── Constants ──────────────────────────────────── */

const STAGES: Stage[] = ['order', 'fermentation', 'drying', 'ready'];

const STAGE_LABELS: Record<Stage, string> = {
    order: 'Order',
    fermentation: 'Fermentation',
    drying: 'Drying',
    ready: 'Ready',
};

const VARIETY_GRADIENTS: Record<string, string> = {
    Geisha:         'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
    Sidra:          'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
    Java:           'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
    Caturra:        'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
    'Pink Bourbon': 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
    default:        'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',
};

/* ─── Helpers ─────────────────────────────────────── */

function stageFromStatus(status: string): Stage {
    if (status === 'fermentation' || status === 'in_lab') return 'fermentation';
    if (status === 'drying') return 'drying';
    if (status === 'ready' || status === 'shipped' || status === 'delivered') return 'ready';
    return 'order';
}

function statusLabel(status: string): string {
    const map: Record<string, string> = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        in_lab: 'In lab',
        fermentation: 'Fermenting',
        drying: 'Drying',
        ready: 'Ready to ship',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };
    return map[status] ?? status;
}

function statusClass(status: string): string {
    if (status === 'delivered' || status === 'shipped') return 'od-badge--delivered';
    if (status === 'ready') return 'od-badge--ready';
    return 'od-badge--active';
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/* ─── Sub-components ──────────────────────────────── */

function ProgressBar({ stage }: { stage: Stage }) {
    const current = STAGES.indexOf(stage);

    return (
        <div className="od-progress-bar" aria-label={`Current stage: ${STAGE_LABELS[stage]}`}>
            {STAGES.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={s}>
                        {i > 0 && (
                            <div
                                className={`od-progress-line${done || active ? ' od-progress-line--filled' : ''}`}
                            />
                        )}
                        <div className="od-progress-stage">
                            <div
                                className={[
                                    'od-progress-dot',
                                    done ? 'od-progress-dot--done' : '',
                                    active ? 'od-progress-dot--active' : '',
                                ].filter(Boolean).join(' ')}
                                aria-current={active ? 'step' : undefined}
                            >
                                {done && <Check size={10} strokeWidth={3} />}
                            </div>
                            <span
                                className={`od-progress-label${active ? ' od-progress-label--active' : ''}`}
                            >
                                {STAGE_LABELS[s]}
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function TankCard({ tank }: { tank: TankDetail }) {
    const r = tank.latestReading;
    const capacityPct = Math.min(100, Math.round((100 / tank.capacityKg) * 100));

    return (
        <div className="od-tank-wrap">
            <p className="od-tank-name">{tank.name}</p>

            {r && (
                r.ph !== null || r.temp_c !== null || r.orp_mv !== null ||
                r.sg !== null || r.tds_ppm !== null || r.ec_us_cm !== null ||
                r.salinity_ppm !== null || r.cf !== null || r.rh_pct !== null
            ) ? (
                <div className="od-tank-readings od-tank-readings--grid9">
                    {r.ph !== null && (
                        <div className="od-tank-reading">
                            <Gauge size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--ph">
                                {r.ph.toFixed(2)}
                            </span>
                            <span className="od-tank-reading-label">pH</span>
                        </div>
                    )}
                    {r.temp_c !== null && (
                        <div className="od-tank-reading">
                            <Thermometer size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--temp">
                                {r.temp_c.toFixed(1)}°
                            </span>
                            <span className="od-tank-reading-label">°C</span>
                        </div>
                    )}
                    {r.orp_mv !== null && (
                        <div className="od-tank-reading">
                            <Zap size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--orp">
                                {Math.round(r.orp_mv)}
                            </span>
                            <span className="od-tank-reading-label">ORP mV</span>
                        </div>
                    )}
                    {r.sg !== null && (
                        <div className="od-tank-reading">
                            <FlaskConical size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--sg">
                                {r.sg.toFixed(3)}
                            </span>
                            <span className="od-tank-reading-label">Density SG</span>
                        </div>
                    )}
                    {r.tds_ppm !== null && (
                        <div className="od-tank-reading">
                            <Activity size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--tds">
                                {Math.round(r.tds_ppm)}
                            </span>
                            <span className="od-tank-reading-label">TDS ppm</span>
                        </div>
                    )}
                    {r.ec_us_cm !== null && (
                        <div className="od-tank-reading">
                            <Zap size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--ec">
                                {Math.round(r.ec_us_cm)}
                            </span>
                            <span className="od-tank-reading-label">EC µS/cm</span>
                        </div>
                    )}
                    {r.salinity_ppm !== null && (
                        <div className="od-tank-reading">
                            <Waves size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--sal">
                                {Math.round(r.salinity_ppm)}
                            </span>
                            <span className="od-tank-reading-label">Salinity ppm</span>
                        </div>
                    )}
                    {r.cf !== null && (
                        <div className="od-tank-reading">
                            <Hash size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--cf">
                                {r.cf.toFixed(2)}
                            </span>
                            <span className="od-tank-reading-label">CF</span>
                        </div>
                    )}
                    {r.rh_pct !== null && (
                        <div className="od-tank-reading">
                            <Wind size={14} aria-hidden="true" />
                            <span className="od-tank-reading-value od-tank-reading-value--rh">
                                {r.rh_pct.toFixed(1)}
                            </span>
                            <span className="od-tank-reading-label">Humidity %</span>
                        </div>
                    )}
                </div>
            ) : null}

            <div className="od-capacity-row">
                <span className="od-capacity-label">Capacity</span>
                <span className="od-capacity-value">{tank.capacityKg} kg</span>
            </div>
            <div className="od-capacity-track">
                <div
                    className="od-capacity-fill"
                    style={{ width: `${capacityPct}%` }}
                    role="meter"
                    aria-valuenow={capacityPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Tank capacity: ${tank.capacityKg} kg`}
                />
            </div>

            <span className="od-tank-status">
                <span
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#10B981',
                        display: 'inline-block',
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                />
                {tank.status === 'in_use' ? 'Active' : tank.status}
            </span>
        </div>
    );
}

function TankPending() {
    return (
        <div className="od-tank-wrap">
            <div className="od-tank-pending">
                <div className="od-tank-pending-icon" aria-hidden="true">
                    <FlaskConical size={20} strokeWidth={1.5} />
                </div>
                <p>Tank will be assigned soon — our team is preparing your lot.</p>
            </div>
        </div>
    );
}

function UpdatesTimeline({ updates }: { updates: OrderUpdateRow[] }) {
    if (updates.length === 0) {
        return (
            <div className="od-updates-empty" role="status" aria-live="polite">
                <Clock size={32} strokeWidth={1.25} aria-hidden="true" />
                <p>No updates yet — your coffee is being prepared.</p>
            </div>
        );
    }

    return (
        <div className="od-timeline">
            {updates.map((u) => (
                <div key={u.id} className="od-timeline-item">
                    <div className="od-timeline-dot" aria-hidden="true">
                        <Check size={10} strokeWidth={3} />
                    </div>
                    <div className="od-timeline-content">
                        <div className="od-timeline-meta">
                            <span className="od-timeline-stage">{u.stage}</span>
                            <span className="od-timeline-date">{formatDateTime(u.created_at)}</span>
                        </div>
                        {u.message && (
                            <p className="od-timeline-message">{u.message}</p>
                        )}
                        {u.image_url && (
                            <img
                                src={u.image_url}
                                alt={`Update at ${u.stage} stage`}
                                className="od-timeline-photo"
                                loading="lazy"
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Page ────────────────────────────────────────── */

export function OrderDetail() {
    const { type, id } = useParams<{ type: string; id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [tank, setTank] = useState<TankDetail | null>(null);
    const [updates, setUpdates] = useState<OrderUpdateRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Validate route params early
    const orderType = type as OrderType | undefined;
    const isValidType = orderType === 'fb' || orderType === 'cl';

    useEffect(() => {
        if (!isValidType || !id) {
            setError('Invalid order URL.');
            setLoading(false);
            return;
        }

        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Load order row
                const table = orderType === 'fb' ? 'fb_orders' : 'cl_orders';
                const { data: orderData, error: orderErr } = await supabase
                    .from(table)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (orderErr || !orderData) {
                    throw new Error(orderErr?.message ?? 'Order not found.');
                }

                if (!mounted) return;

                // Map to unified OrderDetail
                let detail: OrderDetail;
                if (orderType === 'fb') {
                    const o = orderData as FbOrderRow;
                    const wkg = (o.bag_size ?? 0) * (o.quantity ?? 0);
                    detail = {
                        shortId: `FB-${o.id.slice(0, 8).toUpperCase()}`,
                        variety: o.variety ?? 'Coffee',
                        process: o.process ?? '—',
                        flavor: o.flavor_profile ?? '—',
                        weightKg: o.total_kg ?? wkg,
                        harvestDate: o.harvest_date ? formatDate(o.harvest_date) : '—',
                        status: o.status,
                        stage: stageFromStatus(o.status),
                        statusLabel: statusLabel(o.status),
                        statusClass: statusClass(o.status),
                        gradient: VARIETY_GRADIENTS[o.variety ?? ''] ?? VARIETY_GRADIENTS.default,
                    };
                } else {
                    const o = orderData as ClOrderRow;
                    detail = {
                        shortId: `CL-${o.id.slice(0, 8).toUpperCase()}`,
                        variety: o.variety ?? 'Custom',
                        process: o.process ?? '—',
                        flavor: o.flavor ?? '—',
                        weightKg: Number(o.quantity_kg) || 0,
                        harvestDate: o.shipment_window ?? '—',
                        status: o.status,
                        stage: stageFromStatus(o.status),
                        statusLabel: statusLabel(o.status),
                        statusClass: statusClass(o.status),
                        gradient: VARIETY_GRADIENTS[o.variety ?? ''] ?? VARIETY_GRADIENTS.default,
                    };
                }

                setOrder(detail);

                // 2. Load tank via order_tank_assignments (active assignment only)
                const { data: assignData } = await supabase
                    .from('order_tank_assignments')
                    .select('tank_id, assigned_at, released_at')
                    .eq('order_type', orderType)
                    .eq('order_id', id)
                    .is('released_at', null)
                    .order('assigned_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (!mounted) return;

                if (assignData) {
                    const assignment = assignData as AssignmentRow;

                    const { data: tankData } = await supabase
                        .from('tanks')
                        .select('id, name, capacity_kg, status')
                        .eq('id', assignment.tank_id)
                        .single();

                    if (!mounted) return;

                    if (tankData) {
                        const t = tankData as TankRow;

                        // Latest sensor reading for this tank
                        const { data: readingData } = await supabase
                            .from('sensor_readings')
                            .select('ph, temp_c, brix, orp_mv, sg, tds_ppm, ec_us_cm, salinity_ppm, cf, rh_pct, recorded_at')
                            .eq('tank_id', t.id)
                            .order('recorded_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();

                        setTank({
                            id: t.id,
                            name: t.name,
                            capacityKg: t.capacity_kg,
                            status: t.status,
                            latestReading: (readingData as SensorReadingRow | null) ?? null,
                        });
                    }
                }

                // 3. Load order updates (newest first)
                const { data: updatesData } = await supabase
                    .from('order_updates')
                    .select('id, stage, message, image_url, created_at')
                    .eq('order_type', orderType)
                    .eq('order_id', id)
                    .order('created_at', { ascending: false });

                if (!mounted) return;

                setUpdates((updatesData as OrderUpdateRow[]) ?? []);
            } catch (err) {
                if (!mounted) return;
                const msg = err instanceof Error ? err.message : 'Could not load order.';
                setError(msg);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => { mounted = false; };
    }, [type, id, isValidType, orderType]);

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="od-container">
                <div className="od-loading" role="status" aria-live="polite">
                    <div className="od-spinner" aria-hidden="true" />
                    <p>Loading order…</p>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error || !order) {
        return (
            <div className="od-container">
                <div className="od-error" role="alert">
                    <Coffee size={36} strokeWidth={1.25} aria-hidden="true" />
                    <p>{error ?? 'Order not found.'}</p>
                    <button
                        className="od-error-btn"
                        onClick={() => navigate('/orders')}
                        aria-label="Go back to orders list"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    /* ── Main render ── */
    return (
        <div className="od-container">
            {/* Top bar */}
            <div className="od-topbar">
                <button
                    className="od-back-btn"
                    onClick={() => navigate('/orders')}
                    aria-label="Back to orders"
                >
                    <ArrowLeft size={18} strokeWidth={2} />
                </button>
                <p className="od-topbar-title">Order {order.shortId}</p>
                <span className={`od-badge ${order.statusClass}`} aria-label={`Status: ${order.statusLabel}`}>
                    {order.statusLabel}
                </span>
            </div>

            {/* Hero */}
            <div className="od-hero" style={{ background: order.gradient }}>
                <p className="od-hero-kicker">
                    {orderType === 'fb' ? 'Forward Booking' : 'CraftLab'}
                </p>
                <p className="od-hero-variety">{order.variety}</p>
                <p className="od-hero-weight">{order.weightKg} kg · {order.process}</p>
            </div>

            {/* Sections */}
            <div className="od-sections">

                {/* Section: Your coffee */}
                <section className="od-section" aria-label="Coffee details">
                    <div className="od-section-header">
                        <div className="od-section-icon od-section-icon--rose" aria-hidden="true">
                            <Coffee size={16} strokeWidth={1.75} />
                        </div>
                        <h2 className="od-section-title">Your Coffee</h2>
                    </div>
                    <div className="od-coffee-grid">
                        <div className="od-coffee-item">
                            <p className="od-coffee-label">Variety</p>
                            <p className="od-coffee-value">{order.variety}</p>
                        </div>
                        <div className="od-coffee-item">
                            <p className="od-coffee-label">Process</p>
                            <p className="od-coffee-value">{order.process}</p>
                        </div>
                        <div className="od-coffee-item">
                            <p className="od-coffee-label">Flavor profile</p>
                            <p className="od-coffee-value">{order.flavor}</p>
                        </div>
                        <div className="od-coffee-item">
                            <p className="od-coffee-label">Weight</p>
                            <p className="od-coffee-value">{order.weightKg} kg</p>
                        </div>
                        <div className="od-coffee-item">
                            <p className="od-coffee-label">
                                {orderType === 'fb' ? 'Harvest date' : 'Shipment window'}
                            </p>
                            <p className="od-coffee-value">{order.harvestDate}</p>
                        </div>
                        <div className="od-coffee-item">
                            <p className="od-coffee-label">Order ID</p>
                            <p className="od-coffee-value" style={{ fontSize: '0.75rem' }}>
                                {order.shortId}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section: Progress */}
                <section className="od-section" aria-label="Order progress">
                    <div className="od-section-header">
                        <div className="od-section-icon od-section-icon--blue" aria-hidden="true">
                            <Gauge size={16} strokeWidth={1.75} />
                        </div>
                        <h2 className="od-section-title">Progress</h2>
                    </div>
                    <div className="od-progress-wrap">
                        <ProgressBar stage={order.stage} />
                    </div>
                </section>

                {/* Section: Tank */}
                <section className="od-section" aria-label="Tank assignment">
                    <div className="od-section-header">
                        <div className="od-section-icon od-section-icon--green" aria-hidden="true">
                            <FlaskConical size={16} strokeWidth={1.75} />
                        </div>
                        <h2 className="od-section-title">Tank Assigned</h2>
                    </div>
                    {tank ? <TankCard tank={tank} /> : <TankPending />}
                </section>

                {/* Section: Updates */}
                <section className="od-section" aria-label="Order updates">
                    <div className="od-section-header">
                        <div className="od-section-icon od-section-icon--amber" aria-hidden="true">
                            {updates.length > 0
                                ? <Wind size={16} strokeWidth={1.75} />
                                : <ImageIcon size={16} strokeWidth={1.75} />
                            }
                        </div>
                        <h2 className="od-section-title">
                            Updates
                            {updates.length > 0 && (
                                <span
                                    style={{
                                        marginLeft: 8,
                                        background: '#f3f4f6',
                                        color: '#6b7280',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        padding: '2px 7px',
                                        borderRadius: 999,
                                    }}
                                >
                                    {updates.length}
                                </span>
                            )}
                        </h2>
                    </div>
                    <UpdatesTimeline updates={updates} />
                </section>

            </div>
        </div>
    );
}
