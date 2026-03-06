import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Stepper } from '../components/ui/Stepper';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

export const ProcessSelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedProcess, setSelectedProcess] = useState<string | null>(localStorage.getItem('fb_process'));

    const processes = ['Natural', 'Washed', 'Honey', 'Bio-Innovation'];

    const handleSave = () => {
        if (selectedProcess) {
            localStorage.setItem('fb_process', selectedProcess);
            navigateNextFBStep('process', navigate);
        }
    };

    return (
        <div className="selector-container">
            <header className="selector-header">
                <div style={{ width: 24 }}></div> {/* Spacer */}
                <Stepper currentStep="process" />
                <button className="close-btn" onClick={() => navigate('/forward-booking/route')}>
                    <X size={24} />
                </button>
            </header>

            <main className="selector-main">
                {/* Placeholder image for process hero */}
                <div className="flavor-hero">
                    <img src="/logo-placeholder.svg" alt="Process preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <h1 className="selector-title">Select Fermentation Process</h1>

                <div className="grid-2x2">
                    {processes.map((process) => (
                        <button
                            key={process}
                            className={`grid-item ${selectedProcess === process ? 'active' : ''}`}
                            onClick={() => setSelectedProcess(process)}
                        >
                            {process}
                        </button>
                    ))}
                </div>
            </main>

            <div className="selector-footer">
                <Button
                    variant="secondary"
                    size="full"
                    disabled={!selectedProcess}
                    onClick={handleSave}
                >
                    Save & Return
                </Button>
            </div>
        </div>
    );
};
