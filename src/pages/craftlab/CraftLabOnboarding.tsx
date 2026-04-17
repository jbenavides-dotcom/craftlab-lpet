import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Lock, GraduationCap } from 'lucide-react';
import { checkCraftLabUnlocked } from '../../lib/user-progress';
import './CraftLabOnboarding.css';

export const CraftLabOnboarding: React.FC = () => {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [educationCompleted, setEducationCompleted] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const completed = await checkCraftLabUnlocked();
                setEducationCompleted(completed);
            } catch (err) {
                console.error("Failed to check CraftLab unlock status:", err);
                setEducationCompleted(localStorage.getItem('craftlab_unlocked') === 'true');
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleChoice = (choice: 'education' | 'configurator') => {
        if (choice === 'configurator' && !educationCompleted) return;

        setIsTransitioning(true);
        setTimeout(() => {
            if (choice === 'education') {
                navigate('/craftlab/education/basic');
            } else {
                navigate('/craftlab/welcome');
            }
        }, 500);
    };

    if (loading) {
        return <div className="craftlab-loading">Loading...</div>;
    }

    return (
        <div className={`craftlab-onboarding-container ${isTransitioning ? 'fade-out' : ''}`}>
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

                <div className="choice-container">
                    <div className="choice-card education" onClick={() => handleChoice('education')}>
                        <div className="choice-icon">
                            <GraduationCap size={40} />
                        </div>
                        <div className="choice-info">
                            <h3>Education Tool</h3>
                            <p>Learn the science and master the metabolic routes.</p>
                            {educationCompleted && <span className="status-tag completed">Completed</span>}
                        </div>
                    </div>

                    <div
                        className={`choice-card configurator ${!educationCompleted ? 'locked' : ''}`}
                        onClick={() => handleChoice('configurator')}
                    >
                        <div className="choice-icon">
                            {educationCompleted ? <FlaskConical size={40} /> : <Lock size={40} />}
                        </div>
                        <div className="choice-info">
                            <h3>CraftLab</h3>
                            <p>Design your unique fermentation process.</p>
                            {!educationCompleted && <span className="status-tag locked">Locked - Complete Education First</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
