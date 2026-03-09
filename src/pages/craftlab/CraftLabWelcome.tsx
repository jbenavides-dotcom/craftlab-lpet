import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Target, Leaf, FlaskConical, Package } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import './CraftLabWelcome.css';

export const CraftLabWelcome: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'welcome' | 'roadmap'>('welcome');

    const handleClose = () => {
        navigate('/home');
    };

    const proceedToRoadmap = () => {
        setStep('roadmap');
        window.scrollTo(0, 0);
    };

    const startConfigurator = () => {
        localStorage.removeItem('craftlab_config');
        navigate('/craftlab/configurator');
    };

    if (step === 'welcome') {
        return (
            <div className="cl-welcome-container fade-in">
                <div className="cl-welcome-card">
                    <button className="cl-welcome-close" onClick={handleClose}>
                        <X size={24} />
                    </button>
                    <div className="cl-welcome-header">
                        <h1 className="cl-welcome-title">
                            Craft<span className="highlight">Lab</span>
                        </h1>
                    </div>
                    <div className="cl-welcome-content">
                        <p>
                            Welcome to CraftLab—your coffee co-creation platform. Design a unique lot
                            using La Palma & El Tucán's proprietary fermentation protocols.
                        </p>
                        <Button variant="primary" size="full" onClick={proceedToRoadmap}>
                            Start Designing
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Roadmap with new 4-step flow
    return (
        <div className="cl-roadmap-container fade-in">
            <header className="roadmap-header">
                <div className="roadmap-logo-text">C<span className="highlight">L</span></div>
                <button className="tech-close-btn" style={{ padding: 0 }} onClick={handleClose}>
                    <X size={24} />
                </button>
            </header>

            <main className="roadmap-body">
                <h1 className="roadmap-greeting">Let's design your lot</h1>
                <p className="roadmap-intro">
                    In 4 simple steps, you'll create a custom coffee lot tailored to your needs.
                    Each choice unlocks recommendations based on our decade of fermentation research.
                </p>

                <div className="roadmap-list">
                    <div className="roadmap-item">
                        <div className="roadmap-icon"><Target size={20} /></div>
                        <div className="roadmap-text">
                            <h3>Your Goal</h3>
                            <p>Competition, retail, experimental, or blend component?</p>
                        </div>
                    </div>
                    <div className="roadmap-item">
                        <div className="roadmap-icon"><Leaf size={20} /></div>
                        <div className="roadmap-text">
                            <h3>Coffee Variety</h3>
                            <p>Choose from our Heroes & Warriors collection with real-time availability.</p>
                        </div>
                    </div>
                    <div className="roadmap-item">
                        <div className="roadmap-icon"><FlaskConical size={20} /></div>
                        <div className="roadmap-text">
                            <h3>Fermentation Protocol</h3>
                            <p>5 proprietary protocols with precise pH, temperature, and duration control.</p>
                            <ul className="roadmap-sublist">
                                <li>Lactic LPX — Bright acidity, clean finish</li>
                                <li>Bio-Innovation Washed — Winey, intense florals</li>
                                <li>Natural Oscillating 120 — Ripe fruit, full body</li>
                                <li>Clarity Select pH — Extreme elegance</li>
                                <li>Bionatural Selection X — Native strains, terroir amplified</li>
                            </ul>
                        </div>
                    </div>
                    <div className="roadmap-item">
                        <div className="roadmap-icon"><Package size={20} /></div>
                        <div className="roadmap-text">
                            <h3>Quantity & Options</h3>
                            <p>Select lot size and optional drying method customization.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="roadmap-footer">
                <div style={{ maxWidth: '400px', width: '100%' }}>
                    <Button variant="primary" size="full" onClick={startConfigurator}>
                        Begin Configuration
                    </Button>
                </div>
            </footer>
        </div>
    );
};
