import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Home as HomeIcon, ShoppingBag, Info, ArrowRight, GraduationCap, FlaskConical, Lock, Check, Star } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useProfile } from '../lib/useProfile';
import './Home.css';

// Photo assets — served from /public/home/
const coffeeCherries = '/home/fb-cherries.png';
const coffeeFermentation = '/home/cl-lab.png';
const singleEstateImage = '/home/se-grain.png';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [showFBWelcome, setShowFBWelcome] = useState(false);
    const [showCLOnboarding, setShowCLOnboarding] = useState(false);
    const [isNavigatingToFB, setIsNavigatingToFB] = useState(false);
    const [educationCompleted, setEducationCompleted] = useState(false);
    const { profile } = useProfile();

    useEffect(() => {
        const checkStatus = async () => {
            const { checkCraftLabUnlocked } = await import('../lib/user-progress');
            const completed = await checkCraftLabUnlocked();
            setEducationCompleted(completed);
        };
        checkStatus();
    }, []);

    const handleFBClick = () => {
        setShowFBWelcome(true);
    };

    const handleCLClick = () => {
        setShowCLOnboarding(true);
    };

    const startFBCustomization = () => {
        setShowFBWelcome(false);
        setIsNavigatingToFB(true);
        setTimeout(() => {
            navigate('/forward-booking/route');
        }, 1500);
    };

    return (
        <div className="home-container">
            {isNavigatingToFB && (
                <div className="splash-screen">
                    <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1739544760/Logo_FB_blanco_xnub6p.png" alt="Forward Booking" className="splash-logo-fb-img" />
                    <div className="spinner-coffee"></div>
                </div>
            )}

            <header className="home-header">
                <div className="home-header-row">
                    <button className="header-icon-btn" aria-label="Open menu" onClick={() => navigate('/profile')}><Menu size={24} /></button>
                    <div className="header-brand-container">
                        <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1735702592/logo_horizontal_ss9bvn.png" alt="La Palma & El Tucán" className="header-logo-img" />
                    </div>
                    <button className="header-icon-btn" aria-label="User account" onClick={() => navigate('/notifications')}><User size={24} /></button>
                </div>
                <div className="home-greeting">
                    <div className="home-greeting-top">
                        <div className="kicker">Harvest 2026 · Cundinamarca</div>
                        <div className="home-points-badge" aria-label={`${profile?.points ?? 0} points`}>
                            <Star size={14} strokeWidth={2} fill="#c1004a" color="#c1004a" />
                            <span className="home-points-value">{(profile?.points ?? 0).toLocaleString()}</span>
                            <span className="home-points-label">pts</span>
                        </div>
                    </div>
                    <h1>Born at origin,<br /><em>shared with</em> <span className="accent">intention.</span></h1>
                </div>
            </header>

            <main className="home-main">
                {/* Program cards */}
                <section className="programs-visual-section">

                    {/* Section label */}
                    <div className="section-label">
                        <h3>Our programs</h3>
                        <span>3 paths</span>
                    </div>

                    {/* 01 — Forward Booking (navy) */}
                    <div
                        className="program-card fb"
                        onClick={handleFBClick}
                        role="button"
                        tabIndex={0}
                        aria-label="Forward Booking program"
                        onKeyDown={(e) => e.key === 'Enter' && handleFBClick()}
                    >
                        <div
                            className="pc-photo"
                            style={{ backgroundImage: `url(${coffeeCherries})` }}
                            role="img"
                            aria-label="Coffee cherries on the branch"
                        />

                        <div className="pc-block">
                            <div className="pc-kicker">Secure your harvest</div>
                            <h2 className="pc-title">A direct line from <em>soil to cup.</em></h2>
                            <p className="pc-sub">Reserve a lot ahead of harvest and receive the coffee within weeks of picking.</p>
                            <div className="pc-meta">
                                <span>35 kg boxes</span>
                                <span>8-week lead</span>
                                <span>Limited</span>
                            </div>
                            <div className="pc-cta">
                                Reserve a lot <ArrowRight size={14} strokeWidth={2.25} />
                            </div>
                        </div>
                    </div>

                    {/* 02 — CraftLab (terracotta) */}
                    <div
                        className="program-card cl"
                        onClick={handleCLClick}
                        role="button"
                        tabIndex={0}
                        aria-label="CraftLab program"
                        onKeyDown={(e) => e.key === 'Enter' && handleCLClick()}
                    >
                        <div
                            className="pc-photo"
                            style={{ backgroundImage: `url(${coffeeFermentation})` }}
                            role="img"
                            aria-label="Coffee fermentation process"
                        />

                        <div className="pc-block">
                            <div className="pc-kicker">Design your fermentation</div>
                            <h2 className="pc-title">Your profile, <em>our lab.</em></h2>
                            <p className="pc-sub">Configure variety, metabolic route, and seven process parameters with our R&amp;D team.</p>
                            <div className="pc-meta">
                                <span>7 parameters</span>
                                <span>Metabolic routes</span>
                                <span>R&amp;D team</span>
                            </div>
                            <div className="pc-cta">
                                Enter the lab <ArrowRight size={14} strokeWidth={2.25} />
                            </div>
                        </div>
                    </div>

                    {/* 03 — Community (olive, narrativo no-interactivo) */}
                    <div
                        className="program-card se is-narrative"
                        aria-label="Our community — narrative block"
                    >
                        <div
                            className="pc-photo"
                            style={{ backgroundImage: `url(${singleEstateImage})` }}
                            role="img"
                            aria-label="La Palma y El Tucán community"
                        />

                        <div className="pc-block">
                            <div className="pc-kicker">Our community</div>
                            <h2 className="pc-title">Every coffee, <em>an evolution.</em></h2>
                            <p className="pc-sub">Every coffee in this collection represents an evolution of how we study our coffee and understand our processes.</p>
                        </div>
                    </div>

                </section>
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <button className="nav-item active" aria-label="Home">
                    <HomeIcon size={24} />
                    <span>Home</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/orders')} aria-label="Orders">
                    <ShoppingBag size={24} />
                    <span>Orders</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/about')} aria-label="About us">
                    <Info size={24} />
                    <span>Us</span>
                </button>
            </nav>

            {/* FB Welcome Modal */}
            <Modal
                isOpen={showFBWelcome}
                onClose={() => setShowFBWelcome(false)}
                className="fb-welcome-modal"
            >
                <h2 className="fb-welcome-title">
                    Welcome to <span className="fb-highlight">Forward</span> Booking
                </h2>
                <div className="fb-welcome-body">
                    <p>
                        By securing your coffee in advance, you guarantee the highest quality selection
                        and directly support the smallholder farmers of our <strong>Neighbors &amp; Crops</strong> program.
                    </p>
                    <p>
                        Production is strictly limited to <strong>500 bags of 35 kg</strong> per year. Secure your lot before harvest.
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="full"
                    onClick={startFBCustomization}
                    className="mt-md"
                >
                    Customize your order
                </Button>
            </Modal>

            {/* CL Onboarding Modal */}
            <Modal
                isOpen={showCLOnboarding}
                onClose={() => setShowCLOnboarding(false)}
                className="cl-onboarding-modal"
            >
                <div className="clo-modal-content">
                    <div className="clo-kicker">CRAFTLAB</div>
                    <h1 className="clo-title">
                        Welcome to Craft<span className="clo-title-accent">Lab</span>
                    </h1>
                    <p className="clo-intro">
                        Choose your path. Learn the science first, or enter the lab directly.
                    </p>

                    <div className="clo-choices">
                        <button
                            type="button"
                            className="clo-choice"
                            onClick={() => navigate('/craftlab/education/basic')}
                            aria-label="Go to Education Tool"
                        >
                            <div className="clo-choice-icon clo-choice-icon--edu">
                                <GraduationCap size={22} strokeWidth={1.75} />
                            </div>
                            <div className="clo-choice-info">
                                <h3>Learn the craft</h3>
                                <p>The science first</p>
                            </div>
                            {educationCompleted ? (
                                <span className="clo-done-badge" aria-label="Completed">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                            ) : (
                                <ArrowRight size={16} className="clo-choice-chev" />
                            )}
                        </button>

                        <button
                            type="button"
                            className={`clo-choice${!educationCompleted ? ' is-locked' : ''}`}
                            onClick={() => { if (educationCompleted) navigate('/craftlab/welcome'); }}
                            disabled={!educationCompleted}
                            aria-label={educationCompleted ? 'Go to CraftLab configurator' : 'CraftLab locked — complete education first'}
                        >
                            <div className={`clo-choice-icon ${educationCompleted ? 'clo-choice-icon--lab' : 'clo-choice-icon--locked'}`}>
                                {educationCompleted ? <FlaskConical size={22} strokeWidth={1.75} /> : <Lock size={20} strokeWidth={2} />}
                            </div>
                            <div className="clo-choice-info">
                                <h3>Enter the Lab</h3>
                                <p>Craft your coffee</p>
                            </div>
                            {educationCompleted ? (
                                <ArrowRight size={16} className="clo-choice-chev" />
                            ) : (
                                <span className="clo-status clo-status--locked">Locked</span>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
