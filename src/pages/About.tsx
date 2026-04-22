import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    FlaskConical,
    Sparkles,
    Users,
    Mail,
    Home as HomeIcon,
    ShoppingBag,
    Info,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import './About.css';

// ---- Datos de la página ----

const pillars = [
    {
        id: 'science',
        icon: <FlaskConical size={22} strokeWidth={1.75} />,
        iconClass: 'ab-pillar-icon--science',
        title: 'Science',
        desc: 'Three pillars shape our process: metabolic pathways, native microflora, and precise pH control.',
    },
    {
        id: 'craft',
        icon: <Sparkles size={22} strokeWidth={1.75} />,
        iconClass: 'ab-pillar-icon--craft',
        title: 'Craft',
        desc: 'Five signature protocols — LPX-500, BIW-200, NO-120, CSP-48, BNX-100 — each a deliberate exploration.',
    },
    {
        id: 'community',
        icon: <Users size={22} strokeWidth={1.75} />,
        iconClass: 'ab-pillar-icon--community',
        title: 'Community',
        desc: 'We work alongside smallholder farmers through our Neighbors & Crops program. 500 bags a year, curated together.',
    },
] as const;

const stats = [
    { num: '14', label: 'Years crafting' },
    { num: '500', label: 'Bags per year' },
    { num: '50', label: 'Premium partners' },
    { num: '1,800m', label: 'Elevation' },
] as const;

const team = [
    {
        initials: 'FS',
        avatarClass: 'ab-team-avatar--founder',
        name: 'Felipe Sardi',
        role: 'Founder',
    },
    {
        initials: 'EM',
        avatarClass: 'ab-team-avatar--cofounder',
        name: 'Elisa Madriñán',
        role: 'Co-founder',
    },
    {
        initials: 'KR',
        avatarClass: 'ab-team-avatar--science',
        name: 'Katherine Rodríguez',
        role: 'Science Lead',
    },
] as const;

// ---- Componente ----

export function About() {
    const navigate = useNavigate();

    const handleContact = () => {
        window.location.href = 'mailto:hello@lapalmayeltucan.com';
    };

    return (
        <div className="ab-container">

            {/* Header sticky */}
            <header className="ab-header">
                <button
                    className="ab-header-close"
                    onClick={() => navigate('/home')}
                    aria-label="Volver al inicio"
                >
                    <X size={18} strokeWidth={2} />
                </button>
                <h1 className="ab-header-title">About Us</h1>
                <div className="ab-header-spacer" aria-hidden="true" />
            </header>

            {/* Hero */}
            <section className="ab-hero" role="img" aria-label="La Palma y El Tucán brand">
                <div className="ab-hero-overlay">
                    <img
                        src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1735702592/logo_horizontal_ss9bvn.png"
                        alt="La Palma & El Tucán"
                        className="ab-hero-logo"
                    />
                    <p className="ab-hero-sub">Born at origin · Shared with intention</p>
                </div>
            </section>

            {/* Our Story */}
            <section className="ab-section">
                <span className="ab-kicker">Our story</span>
                <p className="ab-story-text">
                    Since 2012, La Palma y El Tucán has worked at 1,800 meters in Colombia's
                    cloud forest, where coffee grows alongside 24+ species. We've reimagined
                    fermentation through precision science — turning each lot into something
                    unmistakably ours.
                </p>
            </section>

            {/* 3 Pilares */}
            <section className="ab-section ab-section--alt">
                <span className="ab-kicker">What drives us</span>
                <div className="ab-pillars">
                    {pillars.map((p) => (
                        <article key={p.id} className="ab-pillar">
                            <div className={`ab-pillar-icon ${p.iconClass}`} aria-hidden="true">
                                {p.icon}
                            </div>
                            <h2 className="ab-pillar-title">{p.title}</h2>
                            <p className="ab-pillar-desc">{p.desc}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* By the numbers */}
            <section className="ab-section">
                <span className="ab-kicker">By the numbers</span>
                <div className="ab-stats-grid">
                    {stats.map((s) => (
                        <div key={s.label} className="ab-stat">
                            <span className="ab-stat-num">{s.num}</span>
                            <span className="ab-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Meet the team */}
            <section className="ab-section ab-section--alt">
                <span className="ab-kicker">Meet the team</span>
                <div className="ab-team">
                    {team.map((member) => (
                        <div key={member.name} className="ab-team-card">
                            <div
                                className={`ab-team-avatar ${member.avatarClass}`}
                                aria-hidden="true"
                            >
                                {member.initials}
                            </div>
                            <p className="ab-team-name">{member.name}</p>
                            <p className="ab-team-role">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="ab-cta-wrap">
                <Button
                    variant="primary"
                    size="full"
                    onClick={handleContact}
                    aria-label="Contact us by email"
                >
                    <span className="ab-cta-inner">
                        <Mail size={16} strokeWidth={2} aria-hidden="true" />
                        Contact us
                    </span>
                </Button>
            </div>

            {/* Bottom nav */}
            <nav className="ab-bottom-nav" aria-label="Main navigation">
                <button
                    className="ab-nav-item"
                    onClick={() => navigate('/home')}
                    aria-label="Home"
                >
                    <HomeIcon size={24} aria-hidden="true" />
                    <span>Home</span>
                </button>
                <button
                    className="ab-nav-item"
                    onClick={() => navigate('/orders')}
                    aria-label="Orders"
                >
                    <ShoppingBag size={24} aria-hidden="true" />
                    <span>Orders</span>
                </button>
                <button
                    className="ab-nav-item active"
                    aria-label="About us — current page"
                    aria-current="page"
                >
                    <Info size={24} aria-hidden="true" />
                    <span>Us</span>
                    <span className="ab-nav-dot" aria-hidden="true" />
                </button>
            </nav>

        </div>
    );
}
