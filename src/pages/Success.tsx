import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './Selectors.css';

type FlowType = 'fb' | 'cl';

const FLOW_COPY: Record<FlowType, { header: string; subtitle: string; points: string }> = {
    fb: {
        header: 'Forward Booking',
        subtitle: "Your Forward Booking reservation is being prepared.\nWe'll keep you posted on every stage.",
        points: '+5,000 points earned',
    },
    cl: {
        header: 'CraftLab',
        subtitle: "Your custom build is entering the lab.\nWe'll keep you posted on every stage.",
        points: '+10,000 points earned',
    },
};

export function Success() {
    const navigate = useNavigate();
    const location = useLocation();
    const type: FlowType = (location.state as { type?: FlowType } | null)?.type === 'cl' ? 'cl' : 'fb';
    const copy = FLOW_COPY[type];

    useEffect(() => {
        const prefix = type === 'cl' ? 'craftlab_' : 'fb_';
        Object.keys(localStorage)
            .filter(k => k.startsWith(prefix))
            .forEach(k => localStorage.removeItem(k));
    }, [type]);

    return (
        <div className="selector-container" style={{ background: '#ffffff' }}>
            <header className="ds-header">
                <div className="ds-header-spacer" aria-hidden="true" />
                <span className="ds-header-title">{copy.header}</span>
                <div className="ds-header-spacer" aria-hidden="true" />
            </header>

            <main className="ss-main">
                <div className="ss-check-wrap">
                    <Check size={52} strokeWidth={3} color="#ffffff" />
                </div>

                <h1 className="ss-title">Order confirmed</h1>

                <p className="ss-subtitle" style={{ whiteSpace: 'pre-line' }}>
                    {copy.subtitle}
                </p>

                <div className="ss-points-badge">
                    <Star size={16} strokeWidth={2} fill="#854d0e" color="#854d0e" />
                    <span>{copy.points}</span>
                </div>
            </main>

            <div className="ss-footer">
                <Button
                    variant="primary"
                    size="full"
                    onClick={() => navigate('/orders')}
                >
                    Go to Orders
                </Button>
                <Button
                    variant="ghost"
                    size="full"
                    onClick={() => navigate('/home')}
                >
                    Return Home
                </Button>
            </div>
        </div>
    );
}
