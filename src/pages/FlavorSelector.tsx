import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, Check,
    Citrus, Flower, Sun, Cherry,
    Banana, Wine, Sparkles, Coffee,
    Flame, Sprout, Heart,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

/* ── Types ─────────────────────────────────────────────── */
interface FlavorSub {
    key: string;
    label: string;
    sub: string;
    Icon: React.ElementType;
    gradient: string;
    iconColor: string;
}

interface MacroProfile {
    key: 'Balanced' | 'Fermented' | 'Classic';
    label: string;
    description: string;
    subs: FlavorSub[];
}

/* ── Data ───────────────────────────────────────────────── */
const MACRO_PROFILES: MacroProfile[] = [
    {
        key: 'Balanced',
        label: 'Balanced',
        description: 'Clean acidity, harmonious notes, everyday cup',
        subs: [
            { key: 'Citric',      label: 'Citric',      sub: 'Lemon · Orange · Grapefruit',   Icon: Citrus,   gradient: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)', iconColor: '#854d0e' },
            { key: 'Floral',      label: 'Floral',      sub: 'Jasmine · Rose · Lavender',     Icon: Flower,   gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)', iconColor: '#9d174d' },
            { key: 'Honey',       label: 'Honey',       sub: 'Sweet · Smooth · Warm',          Icon: Sun,      gradient: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)', iconColor: '#92400e' },
            { key: 'Stone Fruit', label: 'Stone Fruit', sub: 'Peach · Apricot · Plum',         Icon: Cherry,   gradient: 'linear-gradient(135deg, #ffedd5 0%, #fdba74 100%)', iconColor: '#9a3412' },
        ],
    },
    {
        key: 'Fermented',
        label: 'Fermented',
        description: 'Complex, bold flavors from extended fermentation',
        subs: [
            { key: 'Tropical Fruit', label: 'Tropical',  sub: 'Mango · Pineapple · Passion',    Icon: Banana,   gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)', iconColor: '#854d0e' },
            { key: 'Red Berry',      label: 'Red Berry', sub: 'Strawberry · Raspberry · Cherry', Icon: Cherry,   gradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', iconColor: '#991b1b' },
            { key: 'Winey',          label: 'Winey',     sub: 'Red wine · Grape · Boozy',       Icon: Wine,     gradient: 'linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)', iconColor: '#6b21a8' },
            { key: 'Funky',          label: 'Funky',     sub: 'Experimental · Wild · Unique',    Icon: Sparkles, gradient: 'linear-gradient(135deg, #ccfbf1 0%, #5eead4 100%)', iconColor: '#115e59' },
        ],
    },
    {
        key: 'Classic',
        label: 'Classic',
        description: 'Traditional cup with chocolate and caramel depth',
        subs: [
            { key: 'Cocoa',   label: 'Cocoa',   sub: 'Dark chocolate · Cocoa nibs',   Icon: Coffee, gradient: 'linear-gradient(135deg, #fef3c7 0%, #d4a373 100%)', iconColor: '#78350f' },
            { key: 'Caramel', label: 'Caramel', sub: 'Brown sugar · Toffee · Butter', Icon: Flame,  gradient: 'linear-gradient(135deg, #ffedd5 0%, #fb923c 100%)', iconColor: '#9a3412' },
            { key: 'Nutty',   label: 'Nutty',   sub: 'Almond · Hazelnut · Walnut',    Icon: Sprout, gradient: 'linear-gradient(135deg, #ecfccb 0%, #bef264 100%)', iconColor: '#3f6212' },
            { key: 'Sweet',   label: 'Sweet',   sub: 'Vanilla · Honey · Caramel',     Icon: Heart,  gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)', iconColor: '#9d174d' },
        ],
    },
];

/* ── Component ──────────────────────────────────────────── */
export function FlavorSelector() {
    const navigate = useNavigate();

    const [selectedMacro, setSelectedMacro] = useState<'Balanced' | 'Fermented' | 'Classic' | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<string | null>(
        localStorage.getItem('fb_flavor')
    );
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    /* Si hay un profile guardado, derivar su macro al montar */
    useEffect(() => {
        const saved = localStorage.getItem('fb_flavor');
        if (!saved) return;
        for (const macro of MACRO_PROFILES) {
            if (macro.subs.some(s => s.key === saved)) {
                setSelectedMacro(macro.key);
                break;
            }
        }
    }, []);

    const handleMacroClick = (macro: MacroProfile) => {
        setSelectedMacro(macro.key);
        /* Si el profile actual no pertenece al nuevo macro, resetear */
        const belongsToNewMacro = macro.subs.some(s => s.key === selectedProfile);
        if (!belongsToNewMacro) setSelectedProfile(null);
    };

    const handleSave = () => {
        if (!selectedProfile) return;
        localStorage.setItem('fb_flavor', selectedProfile);
        navigateNextFBStep('flavor', navigate);
    };

    const handleExit = () => {
        setShowExitConfirm(false);
        navigate('/home');
    };

    const activeMacroData = selectedMacro
        ? MACRO_PROFILES.find(m => m.key === selectedMacro)
        : null;

    return (
        <div className="selector-container">
            {/* Header */}
            <header className="ds-header">
                <button
                    className="ds-header-close"
                    onClick={() => setShowExitConfirm(true)}
                    aria-label="Exit forward booking"
                >
                    <X size={20} />
                </button>
                <span className="ds-header-title">Flavor profile</span>
                <div className="ds-header-spacer" aria-hidden="true" />
            </header>

            {/* Progress */}
            <div className="ds-progress">
                <div className="ds-progress-meta">
                    <span>Step 3 of 4</span>
                    <span className="ds-progress-label">Flavor profile</span>
                </div>
                <div
                    className="ds-progress-bar"
                    role="progressbar"
                    aria-valuenow={3}
                    aria-valuemin={1}
                    aria-valuemax={4}
                >
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className={`ds-progress-segment${i < 3 ? ' active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* Main */}
            <main className="ds-main">
                <h1 className="ds-title">Define your flavor profile</h1>
                <p className="ds-subtitle">
                    Start by choosing a macro-style, then refine to the specific notes that define your cup.
                </p>

                {/* Macroprofile pills */}
                <div className="fs-macro-tabs" role="tablist">
                    {MACRO_PROFILES.map((macro) => (
                        <button
                            key={macro.key}
                            className={`fs-macro-tab${selectedMacro === macro.key ? ' active' : ''}`}
                            onClick={() => handleMacroClick(macro)}
                            role="tab"
                            aria-selected={selectedMacro === macro.key}
                        >
                            {macro.label}
                        </button>
                    ))}
                </div>

                {/* Macro description */}
                {activeMacroData && (
                    <p className="fs-macro-desc">{activeMacroData.description}</p>
                )}

                {/* Sub-profile grid */}
                {activeMacroData && (
                    <div className="vs-grid">
                        {activeMacroData.subs.map(({ key, label, sub, Icon, gradient, iconColor }) => {
                            const isActive = selectedProfile === key;
                            return (
                                <button
                                    key={key}
                                    className={`vs-card${isActive ? ' active' : ''}`}
                                    onClick={() => setSelectedProfile(key)}
                                    aria-pressed={isActive}
                                >
                                    <div
                                        className="vs-card-image"
                                        style={{ background: gradient }}
                                        aria-hidden="true"
                                    >
                                        <Icon size={44} color={iconColor} strokeWidth={1.5} />
                                        {isActive && (
                                            <div className="vs-card-check" aria-hidden="true">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="vs-card-content">
                                        <span className="vs-card-label">{label}</span>
                                        <span className="vs-card-sub">{sub}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {!selectedMacro && (
                    <div className="fs-empty-hint">
                        Select a macro-style above to explore its flavor notes
                    </div>
                )}
            </main>

            {/* Footer */}
            <div className="ds-footer">
                <Button
                    variant="primary"
                    size="full"
                    disabled={!selectedProfile}
                    onClick={handleSave}
                >
                    Next
                </Button>
            </div>

            {/* Exit confirmation modal */}
            <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '15px', color: 'var(--color-navy)' }}>
                        Exit Forward Booking?
                    </h2>
                    <p style={{ marginBottom: '25px', color: 'var(--color-gray-dark)' }}>
                        Your progress will be saved, but you will leave the booking process.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="outline" size="full" onClick={() => setShowExitConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="secondary" size="full" onClick={handleExit}>
                            Exit
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
