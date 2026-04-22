import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Leaf, Coffee, TestTube2, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { startFB } from '../lib/fb-utils';
import type { FBStep } from '../lib/fb-utils';
import './ForwardBookingRoute.css';
import './Selectors.css';

interface StepConfig {
    key: FBStep;
    label: string;
    placeholder: string;
    Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    gradient: string;
    iconColor: string;
}

const STEPS: StepConfig[] = [
    {
        key: 'date',
        label: 'Harvest date',
        placeholder: 'Pick a harvest window',
        Icon: Calendar,
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
        iconColor: '#b45309',
    },
    {
        key: 'variety',
        label: 'Coffee variety',
        placeholder: 'Choose a variety',
        Icon: Leaf,
        gradient: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
        iconColor: '#065f46',
    },
    {
        key: 'flavor',
        label: 'Flavor profile',
        placeholder: 'Define your flavor',
        Icon: Coffee,
        gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
        iconColor: '#9d174d',
    },
    {
        key: 'process',
        label: 'Process method',
        placeholder: 'Select fermentation',
        Icon: TestTube2,
        gradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
        iconColor: '#1e40af',
    },
];

export const ForwardBookingRoute: React.FC = () => {
    const navigate = useNavigate();
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);
    const [pendingStep, setPendingStep] = React.useState<FBStep | null>(null);

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
            <main className="vs-grid" style={{ padding: '0 20px' }}>
                {STEPS.map((step) => {
                    const value = progress[step.key];
                    const isComplete = Boolean(value);
                    const isPending = pendingStep === step.key;
                    const Icon = step.Icon;
                    return (
                        <button
                            key={step.key}
                            className={`vs-card${isComplete ? ' active' : ''}${isPending ? ' pending' : ''}`}
                            onClick={() => setPendingStep(step.key)}
                            aria-pressed={isPending}
                            aria-label={`${step.label}: ${value ?? 'not selected'}`}
                        >
                            <div
                                className="vs-card-image"
                                style={{ background: step.gradient }}
                                aria-hidden="true"
                            >
                                <Icon size={44} color={step.iconColor} strokeWidth={1.5} />
                                {isComplete && (
                                    <div className="vs-card-check" aria-hidden="true">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <div className="vs-card-content">
                                <span className="vs-card-label">{step.label}</span>
                                <span className={`vs-card-sub${value ? ' has-value' : ''}`}>
                                    {value ?? step.placeholder}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </main>

            {/* Footer CTA */}
            <div className="fb-route-footer">
                <Button
                    variant="primary"
                    size="full"
                    onClick={() => {
                        if (pendingStep) {
                            startFB(pendingStep, navigate);
                        } else if (allCompleted) {
                            navigate('/forward-booking/quantity');
                        }
                    }}
                    disabled={!pendingStep && !allCompleted}
                >
                    {pendingStep
                        ? `Continue to ${STEPS.find(s => s.key === pendingStep)?.label.toLowerCase()} →`
                        : allCompleted
                            ? 'Continue to quantity →'
                            : 'Select a step'}
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
