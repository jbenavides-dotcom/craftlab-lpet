import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Home as HomeIcon, ShoppingBag, Info, ArrowRight } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
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
                    <button className="header-icon-btn" aria-label="Open menu"><Menu size={24} /></button>
                    <div className="header-brand-container">
                        <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1735702592/logo_horizontal_ss9bvn.png" alt="La Palma & El Tucán" className="header-logo-img" />
                    </div>
                    <button className="header-icon-btn" aria-label="User account"><User size={24} /></button>
                </div>
                <div className="home-greeting">
                    <div className="kicker">Harvest 2026 · Cundinamarca</div>
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
                        >
                            <span className="pc-num">01 — FORWARD BOOKING</span>
                            <span className="pc-tag">Harvest 2026</span>
                        </div>
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
                        >
                            <span className="pc-num">02 — CRAFTLAB</span>
                            <span className="pc-tag">Custom lab</span>
                        </div>
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

                    {/* 03 — Single Estate (olive) */}
                    <div
                        className="program-card se"
                        onClick={() => navigate('/single-estate')}
                        role="button"
                        tabIndex={0}
                        aria-label="Single Estate program"
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/single-estate')}
                    >
                        <div
                            className="pc-photo"
                            style={{ backgroundImage: `url(${singleEstateImage})` }}
                            role="img"
                            aria-label="Single Estate coffee lot placeholder"
                        >
                            <span className="pc-num">03 — SINGLE ESTATE</span>
                            <span className="pc-tag">Ready to ship</span>
                        </div>
                        <div className="pc-block">
                            <div className="pc-kicker">From our own cup</div>
                            <h2 className="pc-title">The farm's <em>current selection.</em></h2>
                            <p className="pc-sub">Curated lots from our estate, available today. Traceable, small-batch, roast-to-order.</p>
                            <div className="pc-meta">
                                <span>In stock</span>
                                <span>Small batch</span>
                                <span>Traceable</span>
                            </div>
                            <div className="pc-cta">
                                Browse lots <ArrowRight size={14} strokeWidth={2.25} />
                            </div>
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
                    variant="secondary"
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
                <div className="onboarding-modal-content">
                    <h1 className="onboarding-modal-title">
                        Welcome to Craft<span className="title-highlight">Lab</span>
                    </h1>
                    <p className="onboarding-modal-intro">
                        Discover the science behind extraordinary coffee. La Palma &amp; El Tucán has spent
                        over a decade perfecting fermentation. Now, we put the lab in your hands.
                    </p>

                    <div className="modal-choice-container">
                        <div
                            className="modal-choice-card education"
                            onClick={() => navigate('/craftlab/education/basic')}
                            role="button"
                            tabIndex={0}
                            aria-label="Go to Education Tool"
                            onKeyDown={(e) => e.key === 'Enter' && navigate('/craftlab/education/basic')}
                        >
                            <div className="modal-choice-icon">🎓</div>
                            <div className="modal-choice-info">
                                <h3>Education Tool</h3>
                                <p>Learn the science and master the metabolic routes.</p>
                                {educationCompleted && <span className="status-tag completed">Completed</span>}
                            </div>
                        </div>

                        <div
                            className={`modal-choice-card configurator ${!educationCompleted ? 'locked' : ''}`}
                            onClick={() => {
                                if (educationCompleted) navigate('/craftlab/welcome');
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={educationCompleted ? 'Go to CraftLab configurator' : 'CraftLab locked — complete education first'}
                            aria-disabled={!educationCompleted}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && educationCompleted) navigate('/craftlab/welcome');
                            }}
                        >
                            <div className="modal-choice-icon">
                                {educationCompleted ? '🧪' : '🔒'}
                            </div>
                            <div className="modal-choice-info">
                                <h3>CraftLab</h3>
                                <p>Design your unique fermentation process.</p>
                                {!educationCompleted && <span className="status-tag locked">Locked</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
