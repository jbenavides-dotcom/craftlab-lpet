import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Stepper } from '../components/ui/Stepper';
import { Modal } from '../components/ui/Modal';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

export const VarietySelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVariety, setSelectedVariety] = useState<string | null>(localStorage.getItem('fb_variety'));
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const varieties = ['Geisha', 'Sidra', 'Java', 'Caturra'];

    const handleSave = () => {
        if (selectedVariety) {
            localStorage.setItem('fb_variety', selectedVariety);
            navigateNextFBStep('variety', navigate);
        }
    };

    return (
        <div className="selector-container">
            <header className="selector-header">
                <div className="header-left-actions">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <img
                        src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1735702592/logo_horizontal_ss9bvn.png"
                        alt="Logo"
                        className="brand-logo-small"
                    />
                </div>

                <Stepper currentStep="variety" />

                <button className="close-btn" onClick={() => setShowExitConfirm(true)}>
                    <X size={24} />
                </button>
            </header>

            <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '15px', color: 'var(--color-navy)' }}>Exit Forward Booking?</h2>
                    <p style={{ marginBottom: '25px', color: 'var(--color-gray-dark)' }}>
                        Your progress will be saved, but you will leave the booking process.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="outline" size="full" onClick={() => setShowExitConfirm(false)}>Cancel</Button>
                        <Button variant="secondary" size="full" onClick={() => navigate('/home')}>Exit</Button>
                    </div>
                </div>
            </Modal>

            <main className="selector-main">
                {/* Placeholder image for variety hero */}
                <div className="flavor-hero">
                    <img src="/logo-placeholder.svg" alt="Variety preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <h1 className="selector-title">Select Coffee Variety</h1>

                <div className="grid-2x2">
                    {varieties.map((variety) => (
                        <button
                            key={variety}
                            className={`grid-item ${selectedVariety === variety ? 'active' : ''}`}
                            onClick={() => setSelectedVariety(variety)}
                        >
                            {variety}
                        </button>
                    ))}
                </div>
            </main>

            <div className="selector-footer">
                <Button
                    variant="primary"
                    size="full"
                    disabled={!selectedVariety}
                    onClick={handleSave}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};
