import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, Droplets, TrendingDown } from 'lucide-react';
import { checkCraftLabUnlocked } from '../../lib/user-progress';
import './CraftLabOnboarding.css';

export const CraftLabOnboarding: React.FC = () => {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check unlock status — if already unlocked, skip straight to welcome
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const unlocked = await checkCraftLabUnlocked();
                if (unlocked) {
                    navigate('/craftlab/welcome', { replace: true });
                    return;
                }
            } catch (err) {
                console.error("Failed to check CraftLab unlock status:", err);
                // Fallback: localStorage check
                if (localStorage.getItem('craftlab_unlocked') === 'true') {
                    navigate('/craftlab/welcome', { replace: true });
                    return;
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [navigate]);

    const handleChoice = (destination: string) => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate(destination);
        }, 400);
    };

    if (loading) {
        return <div className="craftlab-loading">Loading...</div>;
    }

    return (
        <div className={`craftlab-onboarding-container ${isTransitioning ? 'fade-out' : ''}`}>

            {/* ── HERO VIDEO (fullwidth, ~40% height) ── */}
            <div className="onboarding-hero">
                {/* TODO: provide /public/hero-ferment.mp4 from LP&ET assets */}
                <video
                    className="onboarding-hero-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/hero-ferment-poster.jpg"
                    onError={(e) => {
                        // Hide broken video element; poster / fallback img takes over
                        (e.currentTarget as HTMLVideoElement).style.display = 'none';
                    }}
                >
                    <source src="/hero-ferment.mp4" type="video/mp4" />
                </video>
                {/* Fallback image shown when video cannot load */}
                <img
                    className="onboarding-hero-fallback"
                    src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop"
                    alt="Coffee fermentation tanks at La Palma y El Tucán"
                />
                <div className="onboarding-hero-overlay" />
                <div className="onboarding-hero-title">
                    <h1>
                        Welcome to Craft<span className="title-highlight">Lab</span>
                    </h1>
                    <p>La Palma &amp; El Tucán's fermentation science — in your hands.</p>
                </div>
            </div>

            {/* ── CONTENT AREA ── */}
            <div className="onboarding-content">

                {/* 3 PILLARS */}
                <div className="pillars-container">
                    <div className="pillar-block">
                        <div className="pillar-icon">
                            <Dna size={28} aria-hidden="true" />
                        </div>
                        <div className="pillar-text">
                            <h3>Metabolic Routes</h3>
                            <p>How temperature and sugar drive flavor complexity.</p>
                        </div>
                    </div>

                    <div className="pillar-block">
                        <div className="pillar-icon">
                            <Droplets size={28} aria-hidden="true" />
                        </div>
                        <div className="pillar-text">
                            <h3>Microorganisms</h3>
                            <p>The yeast and bacteria that sculpt your cup.</p>
                        </div>
                    </div>

                    <div className="pillar-block">
                        <div className="pillar-icon">
                            <TrendingDown size={28} aria-hidden="true" />
                        </div>
                        <div className="pillar-text">
                            <h3>Acidification</h3>
                            <p>How pH drops from 6.0 to 4.0 to define acidity.</p>
                        </div>
                    </div>
                </div>

                {/* DIAGNOSTIC QUESTION */}
                <div className="diagnostic-section">
                    <h2 className="diagnostic-question">
                        How much do you know about coffee fermentation?
                    </h2>

                    <div className="diagnostic-buttons">
                        <button
                            className="diagnostic-btn btn-novice"
                            onClick={() => handleChoice('/craftlab/education/basic')}
                            aria-label="I know nothing — go to basic education"
                        >
                            I know nothing
                            <span className="btn-sub">Start with the basics</span>
                        </button>

                        <button
                            className="diagnostic-btn btn-advanced"
                            onClick={() => handleChoice('/craftlab/education/tech')}
                            aria-label="I know the basics — go to technical education"
                        >
                            I know the basics
                            <span className="btn-sub">Go deeper into the science</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
