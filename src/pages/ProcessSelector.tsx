import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sun, Droplets, Hexagon, FlaskConical, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

interface ProcessOption {
    key: string;
    label: string;
    sub: string;
    Icon: React.ElementType;
    gradient: string;
    iconColor: string;
}

const PROCESS_OPTIONS: ProcessOption[] = [
    {
        key: 'Natural',
        label: 'Natural',
        sub: 'Fruit-forward · Full body',
        Icon: Sun,
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        iconColor: '#b45309',
    },
    {
        key: 'Washed',
        label: 'Washed',
        sub: 'Clean · Bright · Elegant',
        Icon: Droplets,
        gradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
        iconColor: '#1e40af',
    },
    {
        key: 'Honey',
        label: 'Honey',
        sub: 'Sweet · Balanced · Smooth',
        Icon: Hexagon,
        gradient: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)',
        iconColor: '#854d0e',
    },
    {
        key: 'Bio-Innovation',
        label: 'Bio-Innovation',
        sub: 'Experimental · Unique',
        Icon: FlaskConical,
        gradient: 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)',
        iconColor: '#6b21a8',
    },
];

const TOTAL_STEPS = 4;
const CURRENT_STEP = 4;

export const ProcessSelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedProcess, setSelectedProcess] = useState<string | null>(localStorage.getItem('fb_process'));
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const handleSave = () => {
        if (selectedProcess) {
            localStorage.setItem('fb_process', selectedProcess);
            navigateNextFBStep('process', navigate);
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
                <span className="ds-header-title">Process method</span>
                <div className="ds-header-spacer" aria-hidden="true" />
            </header>

            {/* ── Progress ── */}
            <div className="ds-progress">
                <div className="ds-progress-meta">
                    <span>Step {CURRENT_STEP} of {TOTAL_STEPS}</span>
                    <span className="ds-progress-label">Process method</span>
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
            <main className="ds-main fs-main-compact">
                <h1 className="ds-title fs-title-compact">Fermentation process</h1>
                <p className="ds-subtitle fs-subtitle-compact">
                    Each method shapes texture, body and final flavor.
                </p>

                {/* Process cards */}
                <div className="vs-grid fs-grid-tight">
                    {PROCESS_OPTIONS.map(({ key, label, sub, Icon, gradient, iconColor }) => {
                        const isActive = selectedProcess === key;
                        return (
                            <button
                                key={key}
                                className={`vs-card${isActive ? ' active' : ''}`}
                                onClick={() => setSelectedProcess(key)}
                                aria-pressed={isActive}
                            >
                                <div
                                    className="vs-card-image"
                                    style={{ background: gradient }}
                                    aria-hidden="true"
                                >
                                    <Icon size={32} color={iconColor} strokeWidth={1.75} />
                                    {isActive && (
                                        <div className="vs-card-check" aria-hidden="true">
                                            <Check size={12} strokeWidth={3} />
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
                    disabled={!selectedProcess}
                    onClick={handleSave}
                >
                    Finish
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
