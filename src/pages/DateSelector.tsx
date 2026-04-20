import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Flower2, Sun, Leaf, Moon, Zap, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

interface DateOption {
    key: string;
    label: string;
    sub: string;
    Icon: React.ElementType;
    bgColor: string;
    iconColor: string;
}

const DATE_OPTIONS: DateOption[] = [
    { key: 'Jan-Mar', label: 'Q1 · Jan – Mar', sub: 'Spring bloom · Bright acidity',      Icon: Flower2, bgColor: '#fef3c7', iconColor: '#b45309' },
    { key: 'Apr-Jun', label: 'Q2 · Apr – Jun', sub: 'Peak harvest · Balanced body',         Icon: Sun,     bgColor: '#fed7aa', iconColor: '#c2410c' },
    { key: 'Jul-Sep', label: 'Q3 · Jul – Sep', sub: 'Post-harvest · Fermented notes',       Icon: Leaf,    bgColor: '#d1fae5', iconColor: '#065f46' },
    { key: 'Oct-Dec', label: 'Q4 · Oct – Dec', sub: 'Late cycle · Complex profiles',        Icon: Moon,    bgColor: '#ddd6fe', iconColor: '#5b21b6' },
];

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

export const DateSelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<string | null>(localStorage.getItem('fb_date'));
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const handleSave = () => {
        if (selectedDate) {
            localStorage.setItem('fb_date', selectedDate);
            navigateNextFBStep('date', navigate);
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
                <span className="ds-header-title">Harvest date</span>
                <div className="ds-header-spacer" aria-hidden="true" />
            </header>

            {/* ── Progress ── */}
            <div className="ds-progress">
                <div className="ds-progress-meta">
                    <span>Step {CURRENT_STEP} of {TOTAL_STEPS}</span>
                    <span className="ds-progress-label">Harvest date</span>
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
                <h1 className="ds-title">Select your harvest window</h1>
                <p className="ds-subtitle">
                    Each quarter brings different flavor characteristics based on the coffee plant's bloom cycles and weather patterns.
                </p>

                {/* Quarter cards */}
                <div className="ds-cards-stack">
                    {DATE_OPTIONS.map(({ key, label, sub, Icon, bgColor, iconColor }) => {
                        const isActive = selectedDate === key;
                        return (
                            <button
                                key={key}
                                className={`ds-card${isActive ? ' active' : ''}`}
                                onClick={() => setSelectedDate(key)}
                                aria-pressed={isActive}
                            >
                                <div
                                    className="ds-card-icon"
                                    style={{ backgroundColor: bgColor }}
                                    aria-hidden="true"
                                >
                                    <Icon size={22} color={iconColor} />
                                </div>
                                <div className="ds-card-body">
                                    <span className="ds-card-label">{label}</span>
                                    <span className="ds-card-sub">{sub}</span>
                                </div>
                                <div className="ds-card-check" aria-hidden="true">
                                    <Check size={13} strokeWidth={3} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* OR divider */}
                <div className="ds-divider" aria-hidden="true">
                    <div className="ds-divider-line" />
                    <span className="ds-divider-text">OR</span>
                    <div className="ds-divider-line" />
                </div>

                {/* Earliest availability */}
                <button
                    className={`ds-earliest${selectedDate === 'earliest' ? ' active' : ''}`}
                    onClick={() => setSelectedDate('earliest')}
                    aria-pressed={selectedDate === 'earliest'}
                >
                    <div className="ds-earliest-icon" aria-hidden="true">
                        <Zap size={22} color="#ffffff" />
                    </div>
                    <div className="ds-earliest-body">
                        <span className="ds-earliest-label">Earliest Availability</span>
                        <span className="ds-earliest-sub">Get the next available batch</span>
                    </div>
                    <div
                        className="ds-card-check"
                        style={{
                            opacity: selectedDate === 'earliest' ? 1 : 0,
                            transform: selectedDate === 'earliest' ? 'scale(1)' : 'scale(0.5)',
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            border: '1.5px solid rgba(255,255,255,0.6)',
                        }}
                        aria-hidden="true"
                    >
                        <Check size={13} strokeWidth={3} />
                    </div>
                </button>
            </main>

            {/* ── Footer ── */}
            <div className="ds-footer">
                <Button
                    variant="primary"
                    size="full"
                    disabled={!selectedDate}
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
