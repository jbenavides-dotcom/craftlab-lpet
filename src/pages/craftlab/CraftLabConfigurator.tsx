import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, Check, Target, Coffee, FlaskConical, SlidersHorizontal, Package, Leaf, Award, Beaker, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { ConfiguratorLoadingSkeleton } from '../../components/ui/Skeleton';
import { loadDraftConfig, saveDraftConfig, submitConfig, deleteDraftConfig } from '../../lib/lot-config';
import './CraftLabConfigurator.css';

// ══════════════════════════════════════════════════════════════════════════════
// CRAFTLAB CONFIGURATOR - La Palma & El Tucán
// Professional B2B coffee co-creation platform
// ══════════════════════════════════════════════════════════════════════════════

interface ConfigState {
    goal: string | null;
    variety: string | null;
    protocol: string | null;
    quantity: string | null;
    // Advanced parameters
    fermTime: number | null;
    dryMethod: string | null;
    solarDays: number | null;
}

// ── CLOUDINARY IMAGES (Real LP&ET photos) ─────────────────────────────────────
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dsylu9a7k/image/upload/f_auto,q_auto,w_1200';
const IMAGES = {
    hero: `${CLOUDINARY_BASE}/lpet-craftlab/cultivo-cafetales.jpg`,
    cherry: `${CLOUDINARY_BASE}/lpet-craftlab/cereza-madura.jpg`,
    fermentation: `${CLOUDINARY_BASE}/lpet-craftlab/fermentacion-tanques.jpg`,
    drying: `${CLOUDINARY_BASE}/lpet-craftlab/secado-marquesinas.jpg`,
    parchment: `${CLOUDINARY_BASE}/lpet-craftlab/cafe-pergamino.jpg`,
    roasting: `${CLOUDINARY_BASE}/lpet-craftlab/tostado-stronghold.jpg`,
};

// ── STEP 1: GOALS ─────────────────────────────────────────────────────────────
const GOALS = [
    {
        id: 'competition',
        label: 'Competition Lot',
        sublabel: 'For baristas & championships',
        description: 'Targeting the highest possible SCA score. Maximum precision protocols.',
        icon: Award,
        recommended: ['lactico', 'clarity'],
        color: '#c1004a'
    },
    {
        id: 'retail',
        label: 'Retail / Café',
        sublabel: 'For your shop or menu',
        description: 'Balance between complexity and accessibility. A profile your customers will love.',
        icon: Coffee,
        recommended: ['bio-innovation', 'natural'],
        color: '#b78a48'
    },
    {
        id: 'experimental',
        label: 'Experimental',
        sublabel: 'I want to try something new',
        description: 'Access to innovation protocols. Fermentations with unique native strains.',
        icon: Beaker,
        recommended: ['bionatural'],
        color: '#0e1e36'
    },
    {
        id: 'blend',
        label: 'Blend Component',
        sublabel: 'To blend with other origins',
        description: 'Coffees with defined characteristics that contribute specific notes to your blend.',
        icon: Leaf,
        recommended: ['natural', 'bio-innovation'],
        color: '#5c8a4a'
    }
];

// ── STEP 2: VARIETIES (Real inventory from Katherine's system) ────────────────
const VARIETIES = [
    {
        id: 'geisha',
        label: 'Geisha',
        category: 'Heroes',
        available: 350, // kg from inventario_actual.json
        sca: '89-91',
        profile: 'Jasmine, bergamot, honey, Earl Grey tea',
        description: 'The most awarded variety in the world. Originally from Ethiopia, cultivated at our farm since 2014.',
        altitude: '1,700 masl',
        harvest: 'May-July',
        premium: 60
    },
    {
        id: 'sidra',
        label: 'Sidra',
        category: 'Heroes',
        available: 347,
        sca: '88-90',
        profile: 'Strawberry yogurt, roses, creamy texture',
        description: 'Rare variety with exceptional sweetness. Unique profile reminiscent of fermented dairy.',
        altitude: '1,700 masl',
        harvest: 'May-July',
        premium: 45
    },
    {
        id: 'bourbon',
        label: 'Yellow Bourbon',
        category: 'Warrior',
        available: 125,
        sca: '86-88',
        profile: 'Caramel, ripe fruits, round body',
        description: 'Traditional variety with exceptional sweetness. Perfect base for complex blends.',
        altitude: '1,700 masl',
        harvest: 'April-June',
        premium: 20
    },
    {
        id: 'java',
        label: 'Java',
        category: 'Warrior',
        available: 75,
        sca: '86-88',
        profile: 'Spices, wood, herbal complexity',
        description: 'Exotic variety with a distinctive profile. Unique spiced notes.',
        altitude: '1,700 masl',
        harvest: 'May-July',
        premium: 25
    },
    {
        id: 'mokka',
        label: 'Mokka',
        category: 'Warrior',
        available: 15,
        sca: '87-89',
        profile: 'Chocolate, dried fruits, intense',
        description: 'Historic small-bean variety. Very limited production.',
        altitude: '1,700 masl',
        harvest: 'June-August',
        premium: 30,
        limited: true
    }
];

// ── STEP 3: FERMENTATION PROTOCOLS (Real LP&ET science — names preserved) ─────
const PROTOCOLS = [
    {
        id: 'lactico',
        label: 'Lactic LPX',
        tagline: 'Bright acidity, clean profile',
        description: 'Controlled lactic fermentation with LAB (lactic acid bacteria) inoculation. Developed to maximize citric acidity while preserving sweetness.',
        duration: '96h cherry + 24-36h mucilage',
        ph: { start: 5.2, end: 3.8 },
        temp: '18-22°C',
        sca: '89.5-90.5',
        flavor: ['Citric', 'Floral', 'Lactic acidity', 'Clean'],
        science: 'LAB (lactic acid bacteria) convert sugars into lactic acid, creating a smooth and prolonged acidity.',
        bestFor: ['competition', 'retail'],
        color: '#e6a817'
    },
    {
        id: 'bio-innovation',
        label: 'Bio-Innovation Washed',
        tagline: 'Winey complexity, intense florals',
        description: 'Proprietary protocol with T08 strain (yeast + LAB). Combines the best of natural fermentation with washed cleanliness.',
        duration: '90-110h cherry + 12-24h oxidative',
        ph: { start: 5.2, end: 3.8 },
        temp: '18-24°C',
        sca: '89.5-91',
        flavor: ['Winey', 'Florals', 'Persistence', 'Elegant'],
        science: 'The post-fermentation oxidative phase develops phenolic compounds that add structure and persistence.',
        bestFor: ['competition', 'retail', 'blend'],
        color: '#9b2335'
    },
    {
        id: 'natural',
        label: 'Natural Oscillating 120',
        tagline: 'Ripe fruit, full body',
        description: 'Whole cherry drying with day/night thermal oscillation. The cherry ferments while drying, intensifying sugars.',
        duration: '120h whole cherry',
        ph: { start: 5.2, end: '3.9-4.1' },
        temp: '16-26°C (oscillating)',
        sca: '89-90.5',
        flavor: ['Ripe fruit', 'Rum', 'Dark chocolate', 'Body'],
        science: 'Natural thermal oscillation (cold nights, warm days) creates fermentation cycles that develop complex fruit esters.',
        bestFor: ['retail', 'blend', 'experimental'],
        color: '#6b5344'
    },
    {
        id: 'clarity',
        label: 'Clarity Select pH',
        tagline: 'Extreme elegance, transparency',
        description: 'Strict real-time pH control. Short fermentation that preserves terroir clarity without masking.',
        duration: '48h cherry + 24h mucilage',
        ph: { start: 5.2, end: 3.9 },
        temp: '20-24°C',
        sca: '90-91.25',
        flavor: ['Jasmine', 'Sweet lemon', 'White flower', 'Transparent'],
        science: 'Constant pH monitoring allows stopping fermentation at the exact point of maximum aromatic expression.',
        bestFor: ['competition'],
        color: '#4a90a8'
    },
    {
        id: 'bionatural',
        label: 'Bionatural Selection X',
        tagline: 'Native strains, amplified terroir',
        description: 'Fermentation with microorganisms isolated from our own farm. Each lot expresses the unique La Palma ecosystem.',
        duration: '72-100h with native inoculants',
        ph: { start: 5.2, end: '3.8-4.0' },
        temp: '18-24°C',
        sca: '89-90',
        flavor: ['Plum', 'Black grape', 'Cacao', 'Winey'],
        science: 'Strains CL-113 and CB-113/114 were isolated from our farm microbiome, creating an unrepeatable profile.',
        bestFor: ['experimental', 'blend'],
        color: '#7a4a8a'
    }
];

// ── STEP 4: DRYING METHODS ────────────────────────────────────────────────────
const DRYING_METHODS = [
    {
        id: 'solar',
        label: '100% Solar Drying',
        description: 'Raised African beds. 15-45 days depending on weather.',
        days: '15-45',
        benefit: 'Maximum aromatic preservation'
    },
    {
        id: 'hybrid',
        label: 'Hybrid (Solar + Mechanical)',
        description: 'Solar until 18% moisture, then controlled mechanical drying.',
        days: '10-20 + 12-24h',
        benefit: 'Balance between quality and consistency'
    },
    {
        id: 'mechanical',
        label: 'Controlled Mechanical',
        description: 'Silo drying with controlled temperature and airflow.',
        days: '24-48h',
        benefit: 'Maximum consistency and control'
    }
];

// ── PRICING ───────────────────────────────────────────────────────────────────
const BASE_PRICE_PER_KG = 35; // USD per kg green coffee

const calculatePrice = (variety: string | null, quantity: string | null): { base: number; premium: number; total: number } => {
    const varietyData = VARIETIES.find(v => v.id === variety);
    const premiumPercent = varietyData?.premium || 0;

    const kgMap: Record<string, number> = { '1box': 12.5, '2box': 25, '3box': 37.5 };
    const kg = quantity ? kgMap[quantity] || 0 : 0;

    const base = kg * BASE_PRICE_PER_KG;
    const premium = Math.round(base * (premiumPercent / 100));

    return { base, premium, total: base + premium };
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const CraftLabConfigurator: React.FC = () => {
    const navigate = useNavigate();
    const { toasts, addToast, removeToast } = useToast();
    const [showExitModal, setShowExitModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [config, setConfig] = useState<ConfigState>({
        goal: null,
        variety: null,
        protocol: null,
        quantity: null,
        fermTime: null,
        dryMethod: null,
        solarDays: null,
    });

    // Current step calculation
    const currentStep = useMemo(() => {
        if (!config.goal) return 1;
        if (!config.variety) return 2;
        if (!config.protocol) return 3;
        if (!config.quantity) return 4;
        return 5;
    }, [config]);

    const progress = useMemo(() => {
        return Math.round(((currentStep - 1) / 4) * 100);
    }, [currentStep]);

    // Current image based on step
    const currentImage = useMemo(() => {
        switch (currentStep) {
            case 1: return IMAGES.hero;
            case 2: return IMAGES.cherry;
            case 3: return IMAGES.fermentation;
            case 4: return IMAGES.drying;
            default: return IMAGES.parchment;
        }
    }, [currentStep]);

    // Price calculation
    const pricing = useMemo(() => calculatePrice(config.variety, config.quantity), [config.variety, config.quantity]);

    // Filter protocols based on goal
    const recommendedProtocols = useMemo(() => {
        if (!config.goal) return PROTOCOLS;
        const goal = GOALS.find(g => g.id === config.goal);
        return PROTOCOLS.map(p => ({
            ...p,
            isRecommended: goal?.recommended.includes(p.id) || false
        })).sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
    }, [config.goal]);

    // Load draft on mount
    useEffect(() => {
        const loadExisting = async () => {
            try {
                const draft = await loadDraftConfig();
                if (draft) {
                    setConfig({
                        goal: draft.macro,
                        variety: draft.variety,
                        protocol: draft.category,
                        quantity: draft.quantity,
                        fermTime: draft.cherry_ferm,
                        dryMethod: draft.process,
                        solarDays: draft.solar_dry,
                    });
                }
            } catch (err) {
                console.error('Error loading draft:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadExisting();
    }, []);

    // Auto-save
    const debouncedSave = useCallback((newConfig: ConfigState) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            await saveDraftConfig({
                macro: newConfig.goal,
                variety: newConfig.variety,
                category: newConfig.protocol,
                quantity: newConfig.quantity,
                cherry_ferm: newConfig.fermTime,
                process: newConfig.dryMethod,
                solar_dry: newConfig.solarDays,
            });
            setIsSaving(false);
        }, 1000);
    }, []);

    const updateConfig = (key: keyof ConfigState, value: any) => {
        setConfig(prev => {
            const next = { ...prev, [key]: value };
            debouncedSave(next);
            return next;
        });
    };

    const confirmExit = async () => {
        await deleteDraftConfig();
        navigate('/home');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await submitConfig();
            if (result) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#c1004a', '#b78a48', '#0e1e36', '#4ade80'] });
                setTimeout(() => {
                    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#c1004a', '#b78a48'] });
                    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#0e1e36', '#4ade80'] });
                }, 200);
                addToast('Configuration submitted!', 'success');
                setTimeout(() => navigate('/craftlab/success', { state: { config: result } }), 1500);
            } else {
                addToast('Error submitting. Please try again.', 'error');
            }
        } catch (err) {
            addToast('Error submitting. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="cl-config-container">
                <header className="cl-config-header">
                    <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1742314508/CL_completo_ly3ecz.png" alt="CraftLab" className="cl-brand-logo-img" />
                    <div className="cl-header-center">
                        <div className="cl-config-subtitle">Loading your configuration...</div>
                    </div>
                    <div style={{ width: 28 }} />
                </header>
                <div className="cl-body"><ConfiguratorLoadingSkeleton /></div>
            </div>
        );
    }

    return (
        <div className="cl-config-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* HEADER */}
            <header className="cl-config-header">
                <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1742314508/CL_completo_ly3ecz.png" alt="CraftLab" className="cl-brand-logo-img" />
                <div className="cl-header-center">
                    <div className="cl-config-subtitle">
                        {isSaving ? 'Saving...' : `Step ${currentStep} of 4`}
                    </div>
                    <div className="cl-progress-bar">
                        <div className="cl-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <button className="cl-close-btn" onClick={() => setShowExitModal(true)}>
                    <X size={20} />
                </button>
            </header>

            <div className="cl-body">
                {/* VISUAL PANEL */}
                <div className="cl-visual-panel">
                    <img key={currentImage} src={currentImage} alt="Coffee process" className="cl-visual-image" />
                    <div className="cl-visual-gradient" />
                    <div className="cl-visual-tag">
                        {config.variety ? VARIETIES.find(v => v.id === config.variety)?.label : 'DESIGN YOUR LOT'}
                        {config.protocol && ` · ${PROTOCOLS.find(p => p.id === config.protocol)?.label}`}
                    </div>
                </div>

                {/* CONTROLS PANEL */}
                <div className="cl-controls-panel">

                    {/* ═══ STEP 1: GOAL ═══ */}
                    <section className="config-section" id="sec-goal">
                        <div className="section-label">Step 01</div>
                        <h2 className="section-title">What's your goal?</h2>
                        <p className="section-desc">This helps us recommend the ideal protocol for you.</p>

                        <div className="goal-grid">
                            {GOALS.map(g => {
                                const Icon = g.icon;
                                return (
                                    <div
                                        key={g.id}
                                        className={`goal-card ${config.goal === g.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('goal', g.id)}
                                        style={config.goal === g.id ? { borderColor: g.color, background: `${g.color}10` } : {}}
                                    >
                                        <div className="goal-icon" style={{ color: g.color }}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="goal-content">
                                            <div className="goal-label">{g.label}</div>
                                            <div className="goal-sublabel">{g.sublabel}</div>
                                        </div>
                                        {config.goal === g.id && <Check size={18} className="goal-check" style={{ color: g.color }} />}
                                    </div>
                                );
                            })}
                        </div>

                        {config.goal && (
                            <div className="goal-description fade-in">
                                <p>{GOALS.find(g => g.id === config.goal)?.description}</p>
                            </div>
                        )}
                    </section>

                    {/* ═══ STEP 2: VARIETY ═══ */}
                    {config.goal && (
                        <section className="config-section fade-in" id="sec-variety">
                            <div className="section-label">Step 02</div>
                            <h2 className="section-title">Select the variety</h2>
                            <p className="section-desc">Grown at our farm at 1,700 masl in Zipacón, Colombia.</p>

                            <div className="variety-list">
                                {VARIETIES.map(v => (
                                    <div
                                        key={v.id}
                                        className={`variety-card ${config.variety === v.id ? 'selected' : ''} ${v.limited ? 'limited' : ''}`}
                                        onClick={() => updateConfig('variety', v.id)}
                                    >
                                        <div className="variety-header">
                                            <div className="variety-name-row">
                                                <span className="variety-name">{v.label}</span>
                                                <span className="variety-category">{v.category}</span>
                                            </div>
                                            <div className="variety-badges">
                                                <span className="variety-sca">SCA {v.sca}</span>
                                                {v.premium > 0 && <span className="variety-premium">+{v.premium}%</span>}
                                            </div>
                                        </div>

                                        <div className="variety-profile">{v.profile}</div>

                                        <div className="variety-footer">
                                            <div className="variety-available">
                                                <span className={`availability-dot ${v.available < 50 ? 'low' : ''}`}></span>
                                                {v.available} kg available
                                            </div>
                                            {v.limited && <span className="variety-limited">Very limited</span>}
                                        </div>

                                        {config.variety === v.id && (
                                            <div className="variety-expanded fade-in">
                                                <p>{v.description}</p>
                                                <div className="variety-meta">
                                                    <span>Altitude: {v.altitude}</span>
                                                    <span>Harvest: {v.harvest}</span>
                                                </div>
                                            </div>
                                        )}

                                        {config.variety === v.id && <Check size={18} className="variety-check" />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ═══ STEP 3: PROTOCOL ═══ */}
                    {config.variety && (
                        <section className="config-section fade-in" id="sec-protocol">
                            <div className="section-label">Step 03</div>
                            <h2 className="section-title">Fermentation Protocol</h2>
                            <p className="section-desc">5 scientifically developed protocols by our team.</p>

                            <div className="protocol-list">
                                {recommendedProtocols.map(p => (
                                    <div
                                        key={p.id}
                                        className={`protocol-card ${config.protocol === p.id ? 'selected' : ''} ${(p as any).isRecommended ? 'recommended' : ''}`}
                                        onClick={() => {
                                            updateConfig('protocol', p.id);
                                            setExpandedProtocol(expandedProtocol === p.id ? null : p.id);
                                        }}
                                        style={config.protocol === p.id ? { borderColor: p.color } : {}}
                                    >
                                        {(p as any).isRecommended && (
                                            <div className="protocol-recommended-badge">Recommended</div>
                                        )}

                                        <div className="protocol-header">
                                            <div className="protocol-color-bar" style={{ background: p.color }}></div>
                                            <div className="protocol-title-group">
                                                <span className="protocol-name">{p.label}</span>
                                                <span className="protocol-tagline">{p.tagline}</span>
                                            </div>
                                            <span className="protocol-sca">SCA {p.sca}</span>
                                        </div>

                                        <div className="protocol-flavors">
                                            {p.flavor.map((f, i) => (
                                                <span key={i} className="flavor-tag">{f}</span>
                                            ))}
                                        </div>

                                        <div className="protocol-params">
                                            <div className="param-item">
                                                <span className="param-label">Duration</span>
                                                <span className="param-value">{p.duration}</span>
                                            </div>
                                            <div className="param-item">
                                                <span className="param-label">pH</span>
                                                <span className="param-value">{p.ph.start} → {p.ph.end}</span>
                                            </div>
                                            <div className="param-item">
                                                <span className="param-label">Temp</span>
                                                <span className="param-value">{p.temp}</span>
                                            </div>
                                        </div>

                                        {(config.protocol === p.id || expandedProtocol === p.id) && (
                                            <div className="protocol-expanded fade-in">
                                                <p className="protocol-description">{p.description}</p>
                                                <div className="protocol-science">
                                                    <FlaskConical size={14} />
                                                    <span>{p.science}</span>
                                                </div>
                                            </div>
                                        )}

                                        {config.protocol === p.id && <Check size={18} className="protocol-check" style={{ color: p.color }} />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ═══ STEP 4: QUANTITY ═══ */}
                    {config.protocol && (
                        <section className="config-section fade-in" id="sec-quantity">
                            <div className="section-label">Step 04</div>
                            <h2 className="section-title">Quantity</h2>
                            <p className="section-desc">Each box contains 12.5 kg of green coffee (27.5 lbs).</p>

                            <div className="quantity-options">
                                {[
                                    { id: '1box', boxes: 1, kg: 12.5 },
                                    { id: '2box', boxes: 2, kg: 25 },
                                    { id: '3box', boxes: 3, kg: 37.5 }
                                ].map(q => (
                                    <div
                                        key={q.id}
                                        className={`quantity-card ${config.quantity === q.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('quantity', q.id)}
                                    >
                                        <div className="quantity-boxes">
                                            {Array.from({ length: q.boxes }).map((_, i) => (
                                                <Package key={i} size={20} />
                                            ))}
                                        </div>
                                        <div className="quantity-info">
                                            <span className="quantity-label">{q.boxes} {q.boxes === 1 ? 'Box' : 'Boxes'}</span>
                                            <span className="quantity-kg">{q.kg} kg</span>
                                        </div>
                                        {config.quantity === q.id && <Check size={18} className="quantity-check" />}
                                    </div>
                                ))}
                            </div>

                            {/* Advanced Options Toggle */}
                            <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                                <SlidersHorizontal size={16} />
                                <span>Advanced options</span>
                                <ChevronDown size={16} className={showAdvanced ? 'rotate-180' : ''} />
                            </button>

                            {showAdvanced && (
                                <div className="advanced-options fade-in">
                                    <h4>Drying Method</h4>
                                    <div className="drying-options">
                                        {DRYING_METHODS.map(d => (
                                            <div
                                                key={d.id}
                                                className={`drying-card ${config.dryMethod === d.id ? 'selected' : ''}`}
                                                onClick={() => updateConfig('dryMethod', d.id)}
                                            >
                                                <Sun size={18} />
                                                <div className="drying-content">
                                                    <span className="drying-label">{d.label}</span>
                                                    <span className="drying-desc">{d.description}</span>
                                                </div>
                                                {config.dryMethod === d.id && <Check size={16} />}
                                            </div>
                                        ))}
                                    </div>

                                    {config.dryMethod === 'solar' && (
                                        <div className="param-slider fade-in">
                                            <Slider
                                                label="Solar drying days"
                                                min={15}
                                                max={45}
                                                step={1}
                                                value={config.solarDays}
                                                onChange={v => updateConfig('solarDays', v)}
                                                unit=" days"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* ═══ SUMMARY & SUBMIT ═══ */}
                    {config.quantity && (
                        <section className="config-section fade-in" id="sec-summary">
                            <div className="section-label">Summary</div>
                            <h2 className="section-title">Your custom lot</h2>

                            <div className="summary-card">
                                <div className="summary-row">
                                    <span className="summary-label">Variety</span>
                                    <span className="summary-value">{VARIETIES.find(v => v.id === config.variety)?.label}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Protocol</span>
                                    <span className="summary-value">{PROTOCOLS.find(p => p.id === config.protocol)?.label}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Quantity</span>
                                    <span className="summary-value">{config.quantity === '1box' ? '12.5 kg' : config.quantity === '2box' ? '25 kg' : '37.5 kg'}</span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row">
                                    <span className="summary-label">Base price</span>
                                    <span className="summary-value">${pricing.base}</span>
                                </div>
                                {pricing.premium > 0 && (
                                    <div className="summary-row premium">
                                        <span className="summary-label">Variety premium</span>
                                        <span className="summary-value">+${pricing.premium}</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span className="summary-label">Total</span>
                                    <span className="summary-value">${pricing.total}</span>
                                </div>
                            </div>

                            <div className="submit-section">
                                <Button
                                    variant="primary"
                                    size="full"
                                    disabled={isSubmitting}
                                    onClick={handleSubmit}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                                </Button>
                                <p className="submit-note">
                                    We'll contact you within 24h to confirm availability and arrange payment.
                                </p>
                            </div>
                        </section>
                    )}

                </div>
            </div>

            {/* STICKY SUMMARY BAR */}
            <div className="cl-summary-bar">
                <div className="summary-bar-left">
                    <span>{config.variety ? VARIETIES.find(v => v.id === config.variety)?.label : 'Configure your lot'}</span>
                </div>
                <div className="summary-bar-right">
                    {pricing.total > 0 && <span className="summary-bar-price">${pricing.total}</span>}
                </div>
            </div>

            {/* EXIT MODAL */}
            {showExitModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Are you sure?</h2>
                        <p>Your configuration will be lost if you exit now.</p>
                        <div className="modal-actions">
                            <Button variant="primary" size="full" onClick={confirmExit}>Yes, exit</Button>
                            <Button variant="outline" size="full" onClick={() => setShowExitModal(false)}>Stay</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
