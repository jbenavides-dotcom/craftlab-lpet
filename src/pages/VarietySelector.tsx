import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Stepper } from '../components/ui/Stepper';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

export const VarietySelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVariety, setSelectedVariety] = useState<string | null>(localStorage.getItem('fb_variety'));

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
                <div style={{ width: 24 }}></div> {/* Spacer */}
                <Stepper currentStep="variety" />
                <button className="close-btn" onClick={() => navigate('/forward-booking/route')}>
                    <X size={24} />
                </button>
            </header>

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
                    variant="secondary"
                    size="full"
                    disabled={!selectedVariety}
                    onClick={handleSave}
                >
                    Save & Return
                </Button>
            </div>
        </div>
    );
};
