import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ExitConfirmModal } from '../../components/ExitConfirmModal';
import './CraftLabWelcome.css';

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
                <div className="cl-welcome-container fade-in">
                    <div className="cl-welcome-card">
                        <button
                            className="cl-welcome-close"
                            onClick={handleClose}
                            aria-label="Exit CraftLab"
                        >
                            <X size={24} />
                        </button>
                        <div className="cl-welcome-header">
                            <h1 className="cl-welcome-title">
                                Craft<span className="highlight">Lab</span>
                            </h1>
                        </div>
                        <div className="cl-welcome-content">
                            <p>
                                Welcome to CraftLab—your coffee creation playground! Let's get started on
                                designing a coffee profile that matches your vision.
                            </p>
                            <Button variant="primary" size="full" onClick={proceedToRoadmap}>
                                Access CraftLab
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Step 9.1 Hoja de Ruta */
                <div className="cl-roadmap-container fade-in">
                    <header className="roadmap-header">
                        <div className="roadmap-logo-text">C<span className="highlight">L</span></div>
                        <img src="/logo-placeholder.svg" alt="Logo" style={{ height: '32px' }} />
                        <button
                            className="tech-close-btn"
                            style={{ padding: 0 }}
                            onClick={handleClose}
                            aria-label="Exit CraftLab"
                        >
                            <X size={24} />
                        </button>
                    </header>

                    <main className="roadmap-body">
                        <h1 className="roadmap-greeting">Hello!</h1>
                        <p className="roadmap-intro">
                            You are about to embark on an 8-step journey to precision-craft your coffee.
                            Each decision will dynamically narrow down your options to ensure a perfect result.
                            Here is what we will cover:
                        </p>

                        <div className="roadmap-list">
                            <div className="roadmap-item">
                                <div className="roadmap-number">1</div>
                                <div className="roadmap-text"><h3>Macroprofile</h3></div>
                            </div>
                            <div className="roadmap-item">
                                <div className="roadmap-number">2</div>
                                <div className="roadmap-text"><h3>Flavor Profile</h3></div>
                            </div>
                            <div className="roadmap-item">
                                <div className="roadmap-number">3</div>
                                <div className="roadmap-text"><h3>Coffee Variety</h3></div>
                            </div>
                            <div className="roadmap-item">
                                <div className="roadmap-number">4</div>
                                <div className="roadmap-text"><h3>Quantity</h3></div>
                            </div>
                            <div className="roadmap-item">
                                <div className="roadmap-number">5</div>
                                <div className="roadmap-text"><h3>Processing Category</h3></div>
                            </div>
                            <div className="roadmap-item">
                                <div className="roadmap-number">6</div>
                                <div className="roadmap-text"><h3>Processing Method</h3></div>
                            </div>
                            <div className="roadmap-item">
                                <div className="roadmap-number">7</div>
                                <div className="roadmap-text">
                                    <h3>Processing Parameters</h3>
                                    <ul className="roadmap-sublist">
                                        <li>Stabilization</li>
                                        <li>Cherry Fermentation</li>
                                        <li>Mucilage Fermentation</li>
                                        <li>Solar Dry</li>
                                        <li>Mechanical Dry</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="roadmap-item">
                                <div className="roadmap-number">8</div>
                                <div className="roadmap-text"><h3>Shipment Time frame</h3></div>
                            </div>
                        </div>
                    </main>

                    <footer className="roadmap-footer">
                        <div style={{ maxWidth: '400px', width: '100%' }}>
                            <Button variant="primary" size="full" onClick={startConfigurator}>
                                Next
                            </Button>
                        </div>
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
