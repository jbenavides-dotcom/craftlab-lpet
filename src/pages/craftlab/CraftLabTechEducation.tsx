import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Dna, Activity, FlaskConical, Unlock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ExitConfirmModal } from '../../components/ExitConfirmModal';
import './CraftLabTechEducation.css';

type HotspotId = 'microbes' | 'routes' | 'ph' | null;

export const CraftLabTechEducation: React.FC = () => {
    const navigate = useNavigate();
    const [activeSpot, setActiveSpot] = useState<HotspotId>(null);
    const [readSpots, setReadSpots] = useState<Set<HotspotId>>(new Set());
    const [showExitModal, setShowExitModal] = useState(false);

    const handleSpotClick = (id: HotspotId) => {
        setActiveSpot(id);
        setReadSpots(prev => new Set(prev).add(id));
    };

    const isUnlocked = readSpots.size === 3;

    const getSpotContent = () => {
        switch (activeSpot) {
            case 'microbes':
                return (
                    <div className="detail-content fade-in">
                        <h3><FlaskConical size={20} /> Microorganisms</h3>
                        <p>
                            We focus on cultivating indigenous strains like <em>Lactobacillus plantarum</em> and
                            <em>Saccharomyces cerevisiae</em>. These specific cultures are selected for their ability
                            to outcompete spoilage microbes and produce highly desirable ester compounds during anaerobic fermentation.
                        </p>
                    </div>
                );
            case 'routes':
                return (
                    <div className="detail-content fade-in">
                        <h3><Dna size={20} /> Metabolic Routes</h3>
                        <p>
                            By completely removing oxygen (Anaerobic), yeast and bacteria are forced into alternative
                            catabolic pathways. This stress response synthesizes complex organic acids (like lactic and acetic acid)
                            that translate into vibrant tropical and boozy notes in the cup.
                        </p>
                    </div>
                );
            case 'ph':
                return (
                    <div className="detail-content fade-in">
                        <h3><Activity size={20} /> Acidification & pH</h3>
                        <p>
                            Monitoring the pH drop is critical. Over a 110-hour Bio-Innovation fermentation, we track
                            the pH as it drops from ~5.5 to ~3.8. This controlled acidification ensures a crisp,
                            tartaric-like acidity that makes the coffee refreshing rather than overwhelmingly heavy.
                        </p>
                    </div>
                );
            default:
                return <p className="placeholder-text">Tap a glowing point on the tank to explore the science.</p>;
        }
    };

    return (
        <>
        <div className="tech-edu-container">
            <div className="tech-header">
                <h1 className="tech-title">Technical Explorer</h1>
                <button
                    className="tech-close-btn"
                    onClick={() => setShowExitModal(true)}
                    aria-label="Exit technical education"
                >
                    <X size={28} />
                </button>
            </div>

            <div className="tech-diagram-area">
                <div className="tank-graphic">
                    <span style={{ opacity: 0.3, letterSpacing: '4px', transform: 'rotate(-90deg)' }}>BIO-TANK A1</span>

                    <button
                        className={`hotspot-btn hs-microbes ${readSpots.has('microbes') ? 'read' : ''} ${activeSpot === 'microbes' ? 'active' : ''}`}
                        onClick={() => handleSpotClick('microbes')}
                    >
                        <FlaskConical size={20} />
                    </button>

                    <button
                        className={`hotspot-btn hs-routes ${readSpots.has('routes') ? 'read' : ''} ${activeSpot === 'routes' ? 'active' : ''}`}
                        onClick={() => handleSpotClick('routes')}
                    >
                        <Dna size={20} />
                    </button>

                    <button
                        className={`hotspot-btn hs-ph ${readSpots.has('ph') ? 'read' : ''} ${activeSpot === 'ph' ? 'active' : ''}`}
                        onClick={() => handleSpotClick('ph')}
                    >
                        <Activity size={20} />
                    </button>
                </div>
            </div>

            <div className="tech-right-col">
                <div className="tech-detail-panel">
                    {getSpotContent()}
                </div>

                <div className="tech-footer">
                    <button
                        className={`btn-unlock ${isUnlocked ? 'unlocked' : ''}`}
                        disabled={!isUnlocked}
                        onClick={() => navigate('/craftlab/education/quiz')}
                    >
                        {isUnlocked ? 'Proceed to Validation' : 'Explore all points to unlock'}
                        {isUnlocked && <Unlock size={18} style={{ marginLeft: '8px', verticalAlign: 'middle', display: 'inline-block' }} />}
                    </button>
                </div>
            </div>

        </div>

            <ExitConfirmModal
                isOpen={showExitModal}
                onConfirm={() => { navigate('/home'); }}
                onCancel={() => setShowExitModal(false)}
                variant="craftlab"
            />
        </>
    );
};
