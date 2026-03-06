import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Home as HomeIcon, ShoppingBag, Info, ArrowRight } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import './Home.css';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [showFBWelcome, setShowFBWelcome] = useState(false);
    const [isNavigatingToFB, setIsNavigatingToFB] = useState(false);

    const handleFBClick = () => {
        setShowFBWelcome(true);
    };

    const handleCLClick = () => {
        navigate('/craftlab/onboarding');
    };

    const startFBCustomization = () => {
        setIsNavigatingToFB(true);
        setTimeout(() => {
            navigate('/forward-booking/route');
        }, 1500);
    };

    return (
        <div className="home-container">
            {isNavigatingToFB && (
                <div className="splash-screen">
                    <img src="/logo-placeholder.svg" alt="La Palma & El Tucán" className="splash-logo-main" />
                    <h1 className="splash-logo-fb">Forward Booking</h1>
                    <div className="spinner-coffee"></div>
                </div>
            )}

            <header className="home-header">
                <button className="header-icon-btn"><Menu size={24} /></button>
                <div className="header-brand-name">LA PALMA & EL TUCÁN</div>
                <button className="header-icon-btn"><User size={24} /></button>
            </header>

            <main className="home-main">
                {/* Hero Section — Styled exactly like the reference banner */}
                <section className="hero-section hero-brand-red">
                    <div className="cl-banner-content">
                        <h1 className="cl-logo-text">green<span className="cl-logo-light">coffee</span></h1>
                        <p className="cl-subtitle-text">Born at Origin.<br />Shared with Intention.</p>
                    </div>
                </section>

                {/* Intro Section */}
                <section className="intro-section">
                    <p>
                        Discover our exclusive programs. From securing upcoming harvests to
                        designing your own fermentation profiles, walk the land and taste the coffee
                        exactly where it was born.
                    </p>
                </section>

                <section className="programs-visual-section">
                    <div className="visual-block block-fb" onClick={handleFBClick}>
                        <div className="block-overlay"></div>
                        <div className="block-content">
                            <h2>Forward Booking</h2>
                            <p>Pre-order from our finest limited batches. A direct line from soil to cup.</p>
                            <span className="block-link">Explore the collection <ArrowRight size={16} /></span>
                        </div>
                    </div>

                    <div className="visual-block block-cl" onClick={handleCLClick}>
                        <div className="block-overlay"></div>
                        <div className="block-content">
                            <h2>CraftLab</h2>
                            <p>An experimental journey. Customize varieties, processing methods, and precision parameters.</p>
                            <span className="block-link">Start crafting <ArrowRight size={16} /></span>
                        </div>
                    </div>

                    <div className="visual-block block-pink">
                        <div className="block-content">
                            <h2>Community</h2>
                            <p>Every coffee in this collection represents an evolution of how we study our coffee and understand our processes.</p>
                            <span className="block-link">Read More <ArrowRight size={16} /></span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <button className="nav-item active">
                    <HomeIcon size={24} />
                    <span>Home</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/orders')}>
                    <ShoppingBag size={24} />
                    <span>Orders</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/about')}>
                    <Info size={24} />
                    <span>Us</span>
                </button>
            </nav>

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
                        and directly support the smallholder farmers of our <strong>Neighbors & Crops</strong> program.
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
        </div>
    );
};
