import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Stepper } from '../components/ui/Stepper';
import { Modal } from '../components/ui/Modal';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

export const ProcessSelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedProcess, setSelectedProcess] = useState<string | null>(localStorage.getItem('fb_process'));
    const [showExitConfirm, setShowExitConfirm] = useState(false);

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
                <div className="header-left-actions">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <Stepper currentStep="process" />
                </div>
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
                    Next
                </Button>
            </div>
        </div>
    );
};
