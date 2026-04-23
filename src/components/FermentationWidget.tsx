import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets, Activity, ExternalLink, Maximize2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { supabase } from '../lib/supabase';
import './FermentationWidget.css';

interface SensorReading {
    ph: number | null;
    temp_c: number | null;
    brix: number | null;
    recorded_at: string;
}

interface TankInfo {
    tankId: string;
    tankName: string;
    protocolCode: string | null;
}

interface Props {
    orderType: 'fb' | 'cl';
    orderId: string;
}

const READINGS_LIMIT = 60; // 60 puntos = ~5 horas a 1 lectura/5min. Se usan los últimos 24 para sparkline y todos para modal

// Target ranges por protocolo (aproximado, para mostrar en modal)
const PROTOCOL_TARGETS: Record<string, { ph: [number, number]; temp: [number, number]; brix: [number, number]; name: string }> = {
    'LPX-500': { ph: [4.0, 4.8], temp: [20, 26], brix: [14, 20], name: 'Long Press Extended' },
    'BIW-200': { ph: [4.1, 4.9], temp: [22, 28], brix: [14, 20], name: 'Bio-Innovation Washed' },
    'NO-120':  { ph: [4.5, 5.4], temp: [24, 30], brix: [16, 22], name: 'Natural Oxidized' },
    'CSP-48':  { ph: [4.0, 4.5], temp: [18, 24], brix: [14, 18], name: 'Cold Shock Process' },
    'BNX-100': { ph: [3.8, 4.6], temp: [20, 26], brix: [14, 20], name: 'Bio-Natural Extended' },
};

/**
 * Widget "Live fermentation" — se muestra dentro de una card de Orders cuando
 * stage === 'fermentation'. Lee el tanque asignado + últimas readings de Supabase.
 */
export const FermentationWidget: React.FC<Props> = ({ orderType, orderId }) => {
    const [tank, setTank]         = useState<TankInfo | null>(null);
    const [readings, setReadings] = useState<SensorReading[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);

            // 1) Asignación activa orden ↔ tanque
            const { data: assignment, error: assignErr } = await supabase
                .from('order_tank_assignments')
                .select('tank_id, released_at')
                .eq('order_type', orderType)
                .eq('order_id', orderId)
                .is('released_at', null)
                .order('assigned_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!mounted) return;

            if (assignErr || !assignment) {
                setError('No tank assigned yet');
                setLoading(false);
                return;
            }

            // 2) Info del tanque + protocolo
            const { data: tankRow } = await supabase
                .from('tanks')
                .select('id, name, fermentation_protocols(code)')
                .eq('id', assignment.tank_id)
                .maybeSingle();

            if (!mounted) return;

            if (tankRow) {
                const protocolCode =
                    (tankRow as { fermentation_protocols?: { code?: string } | null }).fermentation_protocols?.code
                    ?? null;
                setTank({
                    tankId: tankRow.id as string,
                    tankName: tankRow.name as string,
                    protocolCode,
                });
            }

            // 3) Últimas N readings
            const { data: rows } = await supabase
                .from('sensor_readings')
                .select('ph, temp_c, brix, recorded_at')
                .eq('tank_id', assignment.tank_id)
                .order('recorded_at', { ascending: false })
                .limit(READINGS_LIMIT);

            if (!mounted) return;

            setReadings(rows ? [...rows].reverse() : []);
            setLoading(false);
        };

        load();

        // Realtime subscription a nuevas lecturas
        const channel = supabase
            .channel(`ferment-${orderType}-${orderId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
                (payload) => {
                    if (!mounted) return;
                    const r = payload.new as SensorReading & { tank_id: string };
                    setTank(currentTank => {
                        if (currentTank && r.tank_id === currentTank.tankId) {
                            setReadings(prev => [...prev.slice(-(READINGS_LIMIT - 1)), {
                                ph: r.ph, temp_c: r.temp_c, brix: r.brix, recorded_at: r.recorded_at,
                            }]);
                        }
                        return currentTank;
                    });
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [orderType, orderId]);

    if (loading) {
        return (
            <div className="fw-container fw-loading" aria-busy="true">
                <span className="fw-loading-label">Reading tank…</span>
            </div>
        );
    }

    if (error || !tank) {
        return null; // Silencioso: si no hay asignación, no molestar
    }

    const latest = readings[readings.length - 1];
    const phVals   = readings.map(r => r.ph).filter((v): v is number => v !== null);
    const tempVals = readings.map(r => r.temp_c).filter((v): v is number => v !== null);
    const brixVals = readings.map(r => r.brix).filter((v): v is number => v !== null);

    // Últimos 24 puntos para el sparkline mini
    const sparkSlice = <T,>(arr: T[]) => arr.slice(-24);

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDetailOpen(true);
    };

    return (
        <>
            <button
                type="button"
                className="fw-container fw-clickable"
                onClick={handleCardClick}
                aria-label="Open fermentation details"
            >
                {/* Header */}
                <div className="fw-header">
                    <div className="fw-pulse-wrap" aria-hidden="true">
                        <span className="fw-pulse" />
                        <span className="fw-pulse-ring" />
                    </div>
                    <span className="fw-title">LIVE · {tank.tankName}</span>
                    {tank.protocolCode && (
                        <span className="fw-protocol">{tank.protocolCode}</span>
                    )}
                    <Maximize2 size={13} className="fw-expand-icon" aria-hidden="true" />
                </div>

                {/* 3 metrics */}
                <div className="fw-metrics">
                    <Metric
                        Icon={Activity}
                        label="pH"
                        value={latest?.ph != null ? latest.ph.toFixed(2) : '—'}
                        color="#c1004a"
                        series={sparkSlice(phVals)}
                    />
                    <Metric
                        Icon={Thermometer}
                        label="Temp"
                        value={latest?.temp_c != null ? `${latest.temp_c.toFixed(1)}°` : '—'}
                        color="#F59E0B"
                        series={sparkSlice(tempVals)}
                    />
                    <Metric
                        Icon={Droplets}
                        label="Brix"
                        value={latest?.brix != null ? latest.brix.toFixed(1) : '—'}
                        color="#1D4ED8"
                        series={sparkSlice(brixVals)}
                    />
                </div>

                <span className="fw-tap-hint">Tap to open full lab view →</span>
            </button>

            <Modal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                className="fw-modal"
            >
                <DetailView
                    tank={tank}
                    readings={readings}
                    latest={latest}
                />
            </Modal>
        </>
    );
};

/* ─── Sub-component: Full detail view ──────────────────── */

interface DetailProps {
    tank: TankInfo;
    readings: SensorReading[];
    latest: SensorReading | undefined;
}

const DetailView: React.FC<DetailProps> = ({ tank, readings, latest }) => {
    const phVals   = readings.map(r => r.ph).filter((v): v is number => v !== null);
    const tempVals = readings.map(r => r.temp_c).filter((v): v is number => v !== null);
    const brixVals = readings.map(r => r.brix).filter((v): v is number => v !== null);

    const target = tank.protocolCode ? PROTOCOL_TARGETS[tank.protocolCode] : null;

    const minutesAgo = latest
        ? Math.max(0, Math.round((Date.now() - new Date(latest.recorded_at).getTime()) / 60000))
        : null;

    const stats = (vals: number[]) => ({
        min: vals.length ? Math.min(...vals).toFixed(2) : '—',
        max: vals.length ? Math.max(...vals).toFixed(2) : '—',
        avg: vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '—',
    });

    return (
        <div className="fw-detail">
            {/* Header grande */}
            <div className="fw-detail-header">
                <div className="fw-detail-pulse" aria-hidden="true">
                    <span className="fw-pulse" />
                    <span className="fw-pulse-ring" />
                </div>
                <div>
                    <div className="fw-detail-kicker">LIVE FERMENTATION</div>
                    <h2 className="fw-detail-title">{tank.tankName}</h2>
                    {target && (
                        <p className="fw-detail-sub">
                            {tank.protocolCode} · {target.name}
                        </p>
                    )}
                </div>
            </div>

            {minutesAgo !== null && (
                <p className="fw-detail-updated">
                    Last reading {minutesAgo === 0 ? 'just now' : `${minutesAgo} min ago`}
                </p>
            )}

            {/* 3 metric cards grandes */}
            <div className="fw-detail-metrics">
                <DetailMetric
                    Icon={Activity}
                    label="pH"
                    value={latest?.ph != null ? latest.ph.toFixed(2) : '—'}
                    color="#c1004a"
                    series={phVals}
                    targetRange={target?.ph}
                    stats={stats(phVals)}
                />
                <DetailMetric
                    Icon={Thermometer}
                    label="Temperature"
                    unit="°C"
                    value={latest?.temp_c != null ? latest.temp_c.toFixed(1) : '—'}
                    color="#F59E0B"
                    series={tempVals}
                    targetRange={target?.temp}
                    stats={stats(tempVals)}
                />
                <DetailMetric
                    Icon={Droplets}
                    label="Brix"
                    unit="°"
                    value={latest?.brix != null ? latest.brix.toFixed(1) : '—'}
                    color="#1D4ED8"
                    series={brixVals}
                    targetRange={target?.brix}
                    stats={stats(brixVals)}
                />
            </div>

            <a
                className="fw-detail-external"
                href="https://jbenavides-dotcom.github.io/fermentacion-dashboard/"
                target="_blank"
                rel="noopener noreferrer"
            >
                Open full lab dashboard <ExternalLink size={14} />
            </a>
        </div>
    );
};

interface DetailMetricProps {
    Icon: React.ElementType;
    label: string;
    unit?: string;
    value: string;
    color: string;
    series: number[];
    targetRange?: [number, number];
    stats: { min: string; max: string; avg: string };
}

const DetailMetric: React.FC<DetailMetricProps> = ({ Icon, label, unit, value, color, series, targetRange, stats }) => (
    <div className="fw-detail-metric" style={{ borderColor: color + '40' }}>
        <div className="fw-detail-metric-head">
            <Icon size={16} color={color} strokeWidth={2} />
            <span>{label}</span>
        </div>
        <div className="fw-detail-metric-value" style={{ color }}>
            {value}<span className="fw-detail-metric-unit">{unit}</span>
        </div>
        {targetRange && (
            <div className="fw-detail-metric-target">
                Target: {targetRange[0]}–{targetRange[1]}{unit}
            </div>
        )}
        {series.length > 1 && <BigChart values={series} color={color} />}
        <div className="fw-detail-metric-stats">
            <span><em>min</em> {stats.min}</span>
            <span><em>avg</em> {stats.avg}</span>
            <span><em>max</em> {stats.max}</span>
        </div>
    </div>
);

const BigChart: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
    const W = 320;
    const H = 80;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - ((v - min) / range) * H * 0.9 - H * 0.05;
        return `${x},${y}`;
    }).join(' ');

    const area = `0,${H} ${points} ${W},${H}`;

    return (
        <svg className="fw-detail-chart" width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon fill={`url(#grad-${color.replace('#', '')})`} points={area} />
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

/* ─── Sub-component: Metric ─────────────────────────────── */

interface MetricProps {
    Icon: React.ElementType;
    label: string;
    value: string;
    color: string;
    series: number[];
}

const Metric: React.FC<MetricProps> = ({ Icon, label, value, color, series }) => (
    <div className="fw-metric">
        <div className="fw-metric-top">
            <div className="fw-metric-icon" style={{ color }}>
                <Icon size={14} strokeWidth={2} />
            </div>
            <span className="fw-metric-label">{label}</span>
        </div>
        <div className="fw-metric-value" style={{ color }}>{value}</div>
        {series.length > 1 && <Sparkline values={series} color={color} />}
    </div>
);

/* ─── Sub-component: Sparkline (SVG puro, sin libs) ─────── */

const Sparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
    const W = 80;
    const H = 24;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg className="fw-sparkline" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};
