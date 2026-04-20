import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, Calendar, Leaf, Coffee, TestTube2, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { startFB } from '../lib/fb-utils';
import type { FBStep } from '../lib/fb-utils';
import './ForwardBookingRoute.css';

interface StepConfig {
    key: FBStep;
    label: string;
    placeholder: string;
    Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    bgColor: string;
    iconColor: string;
}

const STEPS: StepConfig[] = [
    {
        key: 'date',
        label: 'Harvest date',
        placeholder: 'Pick a harvest window',
        Icon: Calendar,
        bgColor: '#fef3c7',
        iconColor: '#b45309',
    },
    {
        key: 'variety',
        label: 'Coffee variety',
        placeholder: 'Choose a variety',
        Icon: Leaf,
        bgColor: '#d1fae5',
        iconColor: '#065f46',
    },
    {
        key: 'flavor',
        label: 'Flavor profile',
        placeholder: 'Define your flavor',
        Icon: Coffee,
        bgColor: '#fce7f3',
        iconColor: '#9d174d',
    },
    {
        key: 'process',
        label: 'Process method',
        placeholder: 'Select fermentation',
        Icon: TestTube2,
        bgColor: '#dbeafe',
        iconColor: '#1e40af',
    },
];

export const ForwardBookingRoute: React.FC = () => {
    const navigate = useNavigate();
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);

    const [progress] = React.useState({
        date: localStorage.getItem('fb_date'),
        variety: localStorage.getItem('fb_variety'),
        flavor: localStorage.getItem('fb_flavor'),
        process: localStorage.getItem('fb_process'),
    });

    const allCompleted = Boolean(
        progress.date && progress.variety && progress.flavor && progress.process
    );

    const completedCount = Object.values(progress).filter(Boolean).length;

    const getSubtitle = (step: StepConfig): string => {
        const value = progress[step.key];
        if (value) return value;
        return step.placeholder;
    };

    const handleExit = () => {
        localStorage.removeItem('fb_started');
        navigate('/home');
    };

    return (
        <div className="fb-route-container">
            {/* Header */}
            <header className="fb-header">
                <button
                    className="fb-header-close"
                    onClick={() => setShowExitConfirm(true)}
                    aria-label="Close and go back"
                >
                    <X size={20} />
                </button>
                <span className="fb-header-title">Customize your order</span>
                <div className="fb-header-spacer" aria-hidden="true" />
            </header>

            {/* Progress section */}
            <section className="fb-progress" aria-label="Selection progress">
                <div className="fb-progress-bar" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={4}>
                    <div
                        className="fb-progress-fill"
                        style={{ width: `${(completedCount / 4) * 100}%` }}
                    />
                </div>
                <p className="fb-progress-label">
                    {allCompleted
                        ? 'All set — ready to continue'
                        : `${completedCount} of 4 selected`}
                </p>
            </section>

            {/* Intro text */}
            <p className="fb-intro">
                Choose your variables in any order. Each selection filters the available options
                in the next steps.
            </p>

            {/* Cards stack */}
            <main className="fb-cards-stack">
                {STEPS.map((step) => {
                    const isCompleted = Boolean(progress[step.key]);
                    const subtitle = getSubtitle(step);
                    return (
                        <button
                            key={step.key}
                            className={`fb-card${isCompleted ? ' completed' : ''}`}
                            onClick={() => startFB(step.key, navigate)}
                            aria-label={`${step.label}: ${subtitle}`}
                        >
                            {/* Icon circle */}
                            <div
                                className="fb-card-icon"
                                style={{ backgroundColor: step.bgColor }}
                                aria-hidden="true"
                            >
                                <step.Icon size={22} strokeWidth={1.75} style={{ color: step.iconColor }} />
                            </div>

                            {/* Body */}
                            <div className="fb-card-body">
                                <span className="fb-card-label">{step.label}</span>
                                <span className={`fb-card-sub${isCompleted ? ' has-value' : ''}`}>
                                    {subtitle}
                                </span>
                            </div>

                            {/* Status badge */}
                            <div
                                className={`fb-card-status${isCompleted ? ' completed' : ' pending'}`}
                                aria-hidden="true"
                            >
                                {isCompleted && <Check size={12} strokeWidth={2.5} />}
                            </div>

                            {/* Chevron */}
                            <ChevronRight size={18} className="fb-card-chevron" aria-hidden="true" />
                        </button>
                    );
                })}
            </main>

            {/* Footer CTA */}
            <div className="fb-route-footer">
                <Button
                    variant={allCompleted ? 'primary' : 'secondary'}
                    size="full"
                    onClick={() => navigate('/forward-booking/quantity')}
                    disabled={!allCompleted}
                >
                    {allCompleted
                        ? 'Continue to quantity →'
                        : `Complete ${4 - completedCount} more step${4 - completedCount !== 1 ? 's' : ''}`}
                </Button>
            </div>

            {/* Exit confirm modal */}
            <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)}>
                <div className="fb-exit-modal">
                    <h2 className="fb-exit-modal-title">Exit Forward Booking?</h2>
                    <p className="fb-exit-modal-body">
                        Your progress will be saved, but you will leave the booking process.
                    </p>
                    <div className="fb-exit-modal-actions">
                        <Button variant="outline" size="full" onClick={() => setShowExitConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="secondary" size="full" onClick={handleExit}>
                            Exit
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
