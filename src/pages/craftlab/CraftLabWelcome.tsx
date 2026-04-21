import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, FlaskConical, Star, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ExitConfirmModal } from '../../components/ExitConfirmModal';
import './CraftLabWelcome.css';

interface RoadmapStep {
    n: number;
    title: string;
    sub: string;
    color: string;
    pills?: string[];
}

const ROADMAP_STEPS: RoadmapStep[] = [
    { n: 1, title: 'Macroprofile',          sub: 'Choose the flavor family of your coffee.',               color: '#c1004a' },
    { n: 2, title: 'Flavor Profile',        sub: 'Refine to specific notes: citric, floral, winey.',       color: '#EC4899' },
    { n: 3, title: 'Coffee Variety',        sub: 'Geisha, Sidra, Java, Caturra — each unique genetics.',   color: '#10B981' },
    { n: 4, title: 'Quantity',              sub: '12.5 / 25 / 37.5 / 50 kg green coffee.',                 color: '#fbbf24' },
    { n: 5, title: 'Processing Category',   sub: 'Natural · Washed · Honey · Bio-Innovation.',             color: '#1D4ED8' },
    { n: 6, title: 'Processing Method',     sub: 'Specific fermentation protocol from Katherine.',         color: '#8B5CF6' },
    { n: 7, title: 'Processing Parameters', sub: 'Fine-tune times, temperatures and drying.',              color: '#c1004a',
        pills: ['Stabilization', 'Cherry Fermentation', 'Mucilage Fermentation', 'Solar Dry', 'Mechanical Dry'] },
    { n: 8, title: 'Shipment Timeframe',    sub: 'Select when you want your lot delivered.',               color: '#10B981' },
];

export const CraftLabWelcome: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'welcome' | 'roadmap'>('welcome');
    const [showExitModal, setShowExitModal] = useState(false);

    const handleClose = () => {
        setShowExitModal(true);
    };

    const handleConfirmExit = () => {
        navigate('/home');
    };

    const proceedToRoadmap = () => {
        setStep('roadmap');
        window.scrollTo(0, 0);
    };

    const startConfigurator = () => {
        // Clear any previous configuration state
        localStorage.removeItem('craftlab_config');
        navigate('/craftlab/configurator');
    };

    return (
        <>
            {step === 'welcome' ? (
                <div className="clw-hero">
                    <div className="clw-bg-pattern" aria-hidden="true" />

                    <button
                        className="clw-close"
                        onClick={handleClose}
                        aria-label="Exit CraftLab"
                    >
                        <X size={20} />
                    </button>

                    <div className="clw-hero-inner">
                        <div className="clw-sparks" aria-hidden="true">
                            <span className="clw-spark s1">✦</span>
                            <span className="clw-spark s2">✧</span>
                            <span className="clw-spark s3">✦</span>
                            <span className="clw-spark s4">✧</span>
                        </div>

                        <div className="clw-badge">
                            <Check size={14} />
                            Unlocked
                        </div>

                        <h1 className="clw-title">
                            Welcome to Craft<span className="clw-title-accent">Lab</span>
                        </h1>
                        <p className="clw-subtitle">Your coffee creation playground is ready.</p>

                        <div className="clw-perks">
                            <div className="clw-perk">
                                <div className="clw-perk-icon clw-perk-icon--green">
                                    <FlaskConical size={20} />
                                </div>
                                <span>Lab Access</span>
                            </div>
                            <div className="clw-perk">
                                <div className="clw-perk-icon clw-perk-icon--accent">
                                    <Star size={20} />
                                </div>
                                <span>Creator Status</span>
                            </div>
                            <div className="clw-perk">
                                <div className="clw-perk-icon clw-perk-icon--blue">
                                    <Lock size={20} />
                                </div>
                                <span>Full Unlock</span>
                            </div>
                        </div>

                        <Button variant="primary" size="full" onClick={proceedToRoadmap}>
                            Access CraftLab
                        </Button>
                    </div>
                </div>
            ) : (
                /* Step 9.1 Hoja de Ruta */
                <div className="clw-roadmap">
                    <header className="clw-roadmap-header">
                        <div className="clw-header-spacer" aria-hidden="true" />
                        <div className="clw-header-center">
                            <span className="clw-roadmap-kicker">YOUR JOURNEY</span>
                            <h1 className="clw-roadmap-title">8 steps to craft your coffee</h1>
                        </div>
                        <button
                            className="clw-close clw-close--inline"
                            onClick={handleClose}
                            aria-label="Exit CraftLab"
                        >
                            <X size={20} />
                        </button>
                    </header>

                    <main className="clw-steps-grid">
                        {ROADMAP_STEPS.map((roadmapStep) => (
                            <div
                                key={roadmapStep.n}
                                className="clw-step-card"
                            >
                                <div
                                    className="clw-step-badge"
                                    style={{ background: roadmapStep.color }}
                                >
                                    {roadmapStep.n}
                                </div>
                                <div className="clw-step-card-body">
                                    <h3 className="clw-step-title">{roadmapStep.title}</h3>
                                    {!roadmapStep.pills && (
                                        <p className="clw-step-sub">{roadmapStep.sub}</p>
                                    )}
                                    {roadmapStep.pills && (
                                        <div className="clw-step-pills">
                                            {roadmapStep.pills.map(p => (
                                                <span key={p} className="clw-step-pill">{p}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </main>

                    <footer className="clw-roadmap-footer">
                        <Button variant="primary" size="full" onClick={startConfigurator}>
                            Begin journey →
                        </Button>
                    </footer>
                </div>
            )}

            <ExitConfirmModal
                isOpen={showExitModal}
                onConfirm={handleConfirmExit}
                onCancel={() => setShowExitModal(false)}
                variant="craftlab"
            />
        </>
    );
};
