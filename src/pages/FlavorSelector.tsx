import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Stepper } from '../components/ui/Stepper';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

export const FlavorSelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedMacro, setSelectedMacro] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<string | null>(localStorage.getItem('fb_flavor'));

    const handleSave = () => {
        if (selectedProfile) {
            localStorage.setItem('fb_flavor', selectedProfile);
            navigateNextFBStep('flavor', navigate);
        }
    };

    return (
        <div className="selector-container">
            <header className="selector-header">
                <div style={{ width: 24 }}></div> {/* Spacer */}
                <Stepper currentStep="flavor" />
                <button className="close-btn" onClick={() => navigate('/forward-booking/route')}>
                    <X size={24} />
                </button>
            </header>

            <main className="selector-main">
                {/* Placeholder image for flavor hero */}
                <div className="flavor-hero">
                    <img src="/logo-placeholder.svg" alt="Flavor preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <h1 className="selector-title">Choose Your Flavor Profile</h1>

                <div className="flavor-buttons">
                    <button
                        className={`flavor-btn ${selectedMacro === 'Fermented' ? 'active' : ''}`}
                        onClick={() => setSelectedMacro('Fermented')}
                    >
                        Fermented
                    </button>
                    <button
                        className={`flavor-btn ${selectedMacro === 'Classic' ? 'active' : ''}`}
                        onClick={() => setSelectedMacro('Classic')}
                    >
                        Classic
                    </button>
                    <button
                        className={`flavor-btn ${selectedMacro === 'Bright' ? 'active' : ''}`}
                        onClick={() => setSelectedMacro('Bright')}
                    >
                        Bright
                    </button>
                </div>

                {(selectedMacro || selectedProfile) && (
                    <div className="grid-2x2">
                        {[1, 2, 3, 4].map((item) => {
                            const profileName = `${selectedMacro || 'Selected'} Profile ${item}`;
                            return (
                                <button
                                    key={item}
                                    className={`grid-item ${selectedProfile === profileName ? 'active' : ''}`}
                                    onClick={() => setSelectedProfile(profileName)}
                                >
                                    {profileName}
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>

            <div className="selector-footer">
                <Button
                    variant="secondary"
                    size="full"
                    disabled={!selectedProfile}
                    onClick={handleSave}
                >
                    Save & Return
                </Button>
            </div>
        </div>
    );
};
