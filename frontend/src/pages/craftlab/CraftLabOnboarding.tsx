import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Dna, TerminalSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import './CraftLabOnboarding.css';

export const CraftLabOnboarding: React.FC = () => {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleLevelSelection = (level: 'basic' | 'advanced') => {
        setIsTransitioning(true);

        // Store user's selected level
        localStorage.setItem('craftlab_knowledge_level', level);

        // Smooth transition
        setTimeout(() => {
            if (level === 'basic') {
                navigate('/craftlab/education/basic');
            } else {
                navigate('/craftlab/education/advanced');
            }
        }, 500);
    };

    return (
        <div className={`craftlab-onboarding-container ${isTransitioning ? 'fade-out' : ''}`}>
            {/* 
        Ideally, use an actual looping mp4 video here. 
        Falling back to a dark placeholder image for now if video isn't available.
      */}
            <img
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop"
                alt="Coffee Fermentation"
                className="video-background"
            />

            <div className="onboarding-content">
                <div className="onboarding-header">
                    <h1 className="onboarding-title">
                        Welcome to Craft<span className="title-highlight">Lab</span>
                    </h1>
                    <p className="onboarding-intro">
                        Discover the science behind extraordinary coffee. La Palma & El Tucán has spent
                        over a decade perfecting fermentation. Now, we put the lab in your hands.
                    </p>
                </div>

                <div className="pillars-container">
                    <div className="pillar-item">
                        <div className="pillar-icon-wrapper">
                            <Dna size={24} />
                        </div>
                        <div className="pillar-text">
                            <h3>Metabolic Routes</h3>
                            <p>Control temperature and Brix to guide complex flavor development.</p>
                        </div>
                    </div>

                    <div className="pillar-item">
                        <div className="pillar-icon-wrapper">
                            <FlaskConical size={24} />
                        </div>
                        <div className="pillar-text">
                            <h3>Microorganisms</h3>
                            <p>Utilize indigenous yeast and lactic acid bacteria profiles.</p>
                        </div>
                    </div>

                    <div className="pillar-item">
                        <div className="pillar-icon-wrapper">
                            <TerminalSquare size={24} />
                        </div>
                        <div className="pillar-text">
                            <h3>Acidification</h3>
                            <p>Manipulate pH drops over time for crisp, vibrant cup clarity.</p>
                        </div>
                    </div>
                </div>

                <div className="diagnostic-footer">
                    <h2 className="diagnostic-question">How much do you know about fermentation?</h2>
                    <div className="diagnostic-buttons">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleLevelSelection('basic')}
                            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                        >
                            I'm new to this
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => handleLevelSelection('advanced')}
                        >
                            I know the basics
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
