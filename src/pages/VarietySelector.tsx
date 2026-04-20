import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Cherry, Coffee, Sprout, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

interface VarietyOption {
    key: string;
    label: string;
    sub: string;
    Icon: React.ElementType;
    gradient: string;
    iconColor: string;
    image?: string;
}

const VARIETY_OPTIONS: VarietyOption[] = [
    {
        key: 'Geisha',
        label: 'Geisha',
        sub: 'Floral · Jasmine · Bergamot',
        Icon: Crown,
        gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
        iconColor: '#9d174d',
    },
    {
        key: 'Sidra',
        label: 'Sidra',
        sub: 'Tropical · Fruit-forward',
        Icon: Cherry,
        gradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
        iconColor: '#991b1b',
    },
    {
        key: 'Java',
        label: 'Java',
        sub: 'Chocolate · Full body',
        Icon: Coffee,
        gradient: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
        iconColor: '#065f46',
    },
    {
        key: 'Caturra',
        label: 'Caturra',
        sub: 'Balanced · Sweet · Mild',
        Icon: Sprout,
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
        iconColor: '#b45309',
    },
];

const TOTAL_STEPS = 4;
const CURRENT_STEP = 2;

export const VarietySelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVariety, setSelectedVariety] = useState<string | null>(localStorage.getItem('fb_variety'));
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const handleSave = () => {
        if (selectedVariety) {
            localStorage.setItem('fb_variety', selectedVariety);
            navigateNextFBStep('variety', navigate);
        }
    };

    const handleExit = () => {
        setShowExitConfirm(false);
        navigate('/home');
    };

    return (
        <div className="selector-container">

            {/* ── Header ── */}
            <header className="ds-header">
                <button
                    className="ds-header-close"
                    onClick={() => setShowExitConfirm(true)}
                    aria-label="Exit forward booking"
                >
                    <X size={20} />
                </button>
                <span className="ds-header-title">Coffee variety</span>
                <div className="ds-header-spacer" aria-hidden="true" />
            </header>

            {/* ── Progress ── */}
            <div className="ds-progress">
                <div className="ds-progress-meta">
                    <span>Step {CURRENT_STEP} of {TOTAL_STEPS}</span>
                    <span className="ds-progress-label">Coffee variety</span>
                </div>
                <div className="ds-progress-bar" role="progressbar" aria-valuenow={CURRENT_STEP} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div
                            key={i}
                            className={`ds-progress-segment${i < CURRENT_STEP ? ' active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* ── Main ── */}
            <main className="ds-main">
                <h1 className="ds-title">Choose your coffee variety</h1>
                <p className="ds-subtitle">
                    Each variety expresses unique genetics, cup profiles and terroir characteristics from our farm.
                </p>

                {/* Variety product cards */}
                <div className="vs-grid">
                    {VARIETY_OPTIONS.map(({ key, label, sub, Icon, gradient, iconColor, image }) => {
                        const isActive = selectedVariety === key;
                        return (
                            <button
                                key={key}
                                className={`vs-card${isActive ? ' active' : ''}`}
                                onClick={() => setSelectedVariety(key)}
                                aria-pressed={isActive}
                            >
                                <div
                                    className="vs-card-image"
                                    style={image ? { backgroundImage: `url(${image})` } : { background: gradient }}
                                    aria-hidden="true"
                                >
                                    {!image && <Icon size={44} color={iconColor} strokeWidth={1.5} />}
                                    {isActive && (
                                        <div className="vs-card-check" aria-hidden="true">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <div className="vs-card-content">
                                    <span className="vs-card-label">{label}</span>
                                    <span className="vs-card-sub">{sub}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>

            {/* ── Footer ── */}
            <div className="ds-footer">
                <Button
                    variant="primary"
                    size="full"
                    disabled={!selectedVariety}
                    onClick={handleSave}
                >
                    Next
                </Button>
            </div>

            {/* ── Exit confirm modal ── */}
            <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '15px', color: 'var(--color-navy)' }}>Exit Forward Booking?</h2>
                    <p style={{ marginBottom: '25px', color: 'var(--color-gray-dark)' }}>
                        Your progress will be saved, but you will leave the booking process.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="outline" size="full" onClick={() => setShowExitConfirm(false)}>Cancel</Button>
                        <Button variant="secondary" size="full" onClick={handleExit}>Exit</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
