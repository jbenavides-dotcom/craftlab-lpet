import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, ChevronUp, Check, Clock, FlaskConical, Droplets, Sun, Zap,
    Flower2, Moon, Leaf, Package,
    Banana, Cherry, Citrus, Apple, Sparkles, Coffee,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { ExitConfirmModal } from '../../components/ExitConfirmModal';
import { InfoPopover } from '../../components/InfoPopover';
import './CraftLabConfigurator.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigState {
    macro: string | null;
    flavor: string | null;
    variety: string | null;
    quantity: string | null;
    category: string | null;
    process: string | null;
    stabilization: number | null;
    cherryFerm: number | null;
    mucilageFerm: number | null;
    solarDry: number | null;
    mechDry: number | null;
    shipmentWindow: 'q1' | 'q2' | 'q3' | 'q4' | 'earliest' | null;
}

// ─── Wizard steps ─────────────────────────────────────────────────────────────

const STEPS = [
    { id: 'sec-macro',    label: 'Macro Profile' },
    { id: 'sec-flavor',   label: 'Flavor Profile' },
    { id: 'sec-variety',  label: 'Coffee Variety' },
    { id: 'sec-quantity', label: 'Quantity' },
    { id: 'sec-category', label: 'Processing Category' },
    { id: 'sec-method',   label: 'Processing Method' },
    { id: 'sec-params',   label: 'Parameters' },
    { id: 'sec-shipment', label: 'Shipment Window' },
] as const;

// ─── Static data ──────────────────────────────────────────────────────────────

const MACRO_PROFILES = [
    {
        id: 'fermented',
        label: 'Fermented',
        desc: 'Bold, fruity, and complex',
        color: '#9b2335',
        gradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
    },
    {
        id: 'bright',
        label: 'Bright',
        desc: 'Crisp, acidic, and floral',
        color: '#e6a817',
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
    },
    {
        id: 'classic',
        label: 'Classic',
        desc: 'Balanced, sweet, and comforting',
        color: '#6b5344',
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #d4a373 100%)',
    },
];

const FLAVOR_PROFILES: Record<
    string,
    { id: string; label: string; color: string; gradient: string; Icon: React.ElementType }[]
> = {
    fermented: [
        { id: 'f1', label: 'Tropical / Spicy / Cacao', color: '#b78a48', gradient: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)', Icon: Banana },
        { id: 'f2', label: 'Red Fruits / Sweet',       color: '#9b2335', gradient: 'linear-gradient(135deg, #fee2e2 0%, #f87171 100%)', Icon: Cherry },
    ],
    bright: [
        { id: 'b1', label: 'Citrus / Floral / Tea',    color: '#e6a817', gradient: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)', Icon: Citrus },
        { id: 'b2', label: 'Green Apple / Crisp',      color: '#5c9e3a', gradient: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)', Icon: Apple },
    ],
    classic: [
        { id: 'c1', label: 'Balanced / Aromatic',      color: '#6b5344', gradient: 'linear-gradient(135deg, #fef3c7 0%, #d4a373 100%)', Icon: Sparkles },
        { id: 'c2', label: 'Chocolate / Caramel',      color: '#3d2b1f', gradient: 'linear-gradient(135deg, #fef3c7 0%, #92400e 100%)', Icon: Coffee },
    ],
};

// Cycle of 4 gradients for varieties
const VARIETY_GRADIENTS = [
    'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
    'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
    'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
    'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
];

const VARIETIES = [
    { id: 'geisha',       label: 'Geisha',              desc: 'Delicate, tea-like, jasmine' },
    { id: 'sidra',        label: 'Sidra',               desc: 'Complex, tropical, wine-like' },
    { id: 'gesha-sidra',  label: 'Gesha / Sidra Blend', desc: 'Best of both worlds' },
    { id: 'pink-bourbon', label: 'Pink Bourbon',         desc: 'Rare mutation of Bourbon. Floral, tea-like, delicate acidity.' },
    { id: 'java',         label: 'Java',                desc: 'Indonesian origin, high altitude. Spicy, earthy, with herbal notes.' },
    { id: 'pacamara',     label: 'Pacamara',            desc: 'Cross of Pacas and Maragogype. Large beans, creamy body, citric.' },
    { id: 'tabi',         label: 'Tabi',                desc: 'Colombian hybrid. Sweet, balanced, notes of stone fruit.' },
    { id: 'mokka',        label: 'Mokka',               desc: 'Miniature beans from Ethiopian heritage. Chocolate, wine-like.' },
    { id: 'caturra',      label: 'Caturra',             desc: 'Brazilian Bourbon mutation. Clean acidity, medium body, classic.' },
    { id: 'tekisik',      label: 'Tekisik',             desc: 'Salvadoran selection. Bright citrus, honey sweetness, refined.' },
];

const CATEGORIES: Record<string, { id: string; label: string }[]> = {
    fermented: [{ id: 'bio-innovation', label: 'Bio-Innovation' }],
    bright: [{ id: 'lactic', label: 'Lactic' }, { id: 'natural', label: 'Natural' }],
    classic: [{ id: 'washed', label: 'Washed' }, { id: 'honey', label: 'Honey' }],
};

const METHODS: Record<string, { id: string; label: string }[]> = {
    'bio-innovation': [{ id: 'mucilage-ferm', label: 'Mucilage' }, { id: 'cherry-ferm', label: 'Cherry' }],
    'lactic':         [{ id: 'lactic-std',    label: 'Lactic Standard' }],
    'natural':        [{ id: 'natural-std',   label: 'Natural Standard' }],
    'washed':         [{ id: 'washed-std',    label: 'Washed Standard' }],
    'honey':          [{ id: 'honey-std',     label: 'Honey Standard' }],
};

const SHIPMENT_QUARTERS = [
    { id: 'q1' as const, label: 'Q1', range: 'Jan – Mar', Icon: Flower2, gradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)', iconColor: '#b45309' },
    { id: 'q2' as const, label: 'Q2', range: 'Apr – Jun', Icon: Sun,     gradient: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)', iconColor: '#c2410c' },
    { id: 'q3' as const, label: 'Q3', range: 'Jul – Sep', Icon: Leaf,    gradient: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)', iconColor: '#065f46' },
    { id: 'q4' as const, label: 'Q4', range: 'Oct – Dec', Icon: Moon,    gradient: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%)', iconColor: '#5b21b6' },
];

const PARAM_META = [
    { key: 'stabilization' as const, label: 'Stabilization Time',    Icon: Clock,        min: 0, max: 200, step: 12, unit: ' hrs' },
    { key: 'cherryFerm'    as const, label: 'Cherry Fermentation',    Icon: FlaskConical, min: 0, max: 200, step: 12, unit: ' hrs' },
    { key: 'mucilageFerm'  as const, label: 'Mucilage Fermentation',  Icon: Droplets,     min: 0, max: 200, step: 12, unit: ' hrs' },
    { key: 'solarDry'      as const, label: 'Solar Dry',              Icon: Sun,          min: 0, max: 100, step: 1,  unit: ' days' },
    { key: 'mechDry'       as const, label: 'Mechanical Dry',         Icon: Zap,          min: 0, max: 100, step: 6,  unit: ' hrs' },
];

const SECTION_IMAGES: Record<string, string> = {
    'sec-macro':    'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop',
    'sec-flavor':   'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=1200&auto=format&fit=crop',
    'sec-variety':  'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1200&auto=format&fit=crop',
    'sec-quantity': 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=1200&auto=format&fit=crop',
    'sec-category': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    'sec-method':   'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop',
    'sec-params':   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
    'sec-shipment': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countDecisions(config: ConfigState): number {
    const fields: (keyof ConfigState)[] = [
        'macro', 'flavor', 'variety', 'quantity',
        'category', 'process', 'stabilization', 'cherryFerm',
        'mucilageFerm', 'solarDry', 'mechDry', 'shipmentWindow',
    ];
    return fields.filter(k => config[k] !== null).length;
}

function displayValue(key: keyof ConfigState, config: ConfigState): string | null {
    const v = config[key];
    if (v === null) return null;
    if (key === 'variety') return VARIETIES.find(x => x.id === v)?.label ?? String(v);
    if (key === 'category') {
        for (const cats of Object.values(CATEGORIES)) {
            const found = cats.find(c => c.id === v);
            if (found) return found.label;
        }
        return String(v);
    }
    if (key === 'process') {
        for (const methods of Object.values(METHODS)) {
            const found = methods.find(m => m.id === v);
            if (found) return found.label;
        }
        return String(v);
    }
    if (key === 'stabilization' || key === 'cherryFerm' || key === 'mucilageFerm') return `${v} hrs`;
    if (key === 'solarDry') return `${v} days`;
    if (key === 'mechDry') return `${v} hrs`;
    if (key === 'shipmentWindow') {
        if (v === 'earliest') return 'Earliest availability';
        const q = SHIPMENT_QUARTERS.find(x => x.id === v);
        return q ? `${q.label} (${q.range})` : String(v);
    }
    return String(v);
}

const REVIEW_ROWS: { key: keyof ConfigState; label: string }[] = [
    { key: 'macro',          label: 'Macro Profile' },
    { key: 'flavor',         label: 'Flavor Profile' },
    { key: 'variety',        label: 'Coffee Variety' },
    { key: 'quantity',       label: 'Quantity' },
    { key: 'category',       label: 'Processing Category' },
    { key: 'process',        label: 'Processing Method' },
    { key: 'stabilization',  label: 'Stabilization Time' },
    { key: 'cherryFerm',     label: 'Cherry Fermentation' },
    { key: 'mucilageFerm',   label: 'Mucilage Fermentation' },
    { key: 'solarDry',       label: 'Solar Dry' },
    { key: 'mechDry',        label: 'Mechanical Dry' },
    { key: 'shipmentWindow', label: 'Shipment Window' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const CraftLabConfigurator: React.FC = () => {
    const navigate = useNavigate();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(0);

    // UI state
    const [showExitModal, setShowExitModal] = useState(false);
    const [showSheet, setShowSheet]         = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showReview, setShowReview]       = useState(false);

    const sheetCloseRef = useRef<HTMLButtonElement>(null);
    const sheetRef      = useRef<HTMLDivElement>(null);

    const [config, setConfig] = useState<ConfigState>({
        macro: null, flavor: null, variety: null, quantity: null,
        category: null, process: null, stabilization: null,
        cherryFerm: null, mucilageFerm: null, solarDry: null, mechDry: null,
        shipmentWindow: null,
    });

    // ── Config updater (preserva lógica de reset de flavor si cambia macro)
    const updateConfig = (key: keyof ConfigState, value: ConfigState[keyof ConfigState]) => {
        setConfig(prev => {
            const next = { ...prev, [key]: value };
            if (key === 'macro' && prev.macro !== value) next.flavor = null;
            return next;
        });
    };

    // ── Wizard navigation ─────────────────────────────────────────────────────

    /**
     * Valida si el step actual tiene una selección mínima completa.
     * Step 6 (params) es especial: cherryFerm y mucilageFerm son opcionales
     * según el proceso seleccionado.
     */
    const isStepComplete = (stepIdx: number): boolean => {
        switch (stepIdx) {
            case 0: return !!config.macro;
            case 1: return !!config.flavor;
            case 2: return !!config.variety;
            case 3: return !!config.quantity;
            case 4: return !!config.category;
            case 5: return !!config.process;
            case 6: {
                // Siempre requeridos
                if (config.stabilization === null) return false;
                if (config.solarDry === null)       return false;
                if (config.mechDry === null)        return false;
                // Solo requeridos según método
                if (config.process === 'cherry-ferm'   && config.cherryFerm === null)   return false;
                if (config.process === 'mucilage-ferm' && config.mucilageFerm === null) return false;
                return true;
            }
            case 7: return !!config.shipmentWindow;
            default: return false;
        }
    };

    const goNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setShowReview(true);
        }
    };

    const goBack = () => {
        if (showReview) {
            setShowReview(false);
            return;
        }
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    // ── Imagen del visual panel según step activo
    const currentImage = SECTION_IMAGES[STEPS[currentStep].id] ?? SECTION_IMAGES['sec-macro'];

    // ── Exit
    const confirmExit = () => {
        localStorage.removeItem('craftlab_config');
        navigate('/home');
    };

    // ── Bottom sheet keyboard trap ────────────────────────────────────────────
    const closeSheet = useCallback(() => setShowSheet(false), []);

    useEffect(() => {
        if (!showSheet) return;
        sheetCloseRef.current?.focus();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
            if (e.key === 'Tab' && sheetRef.current) {
                const focusable = Array.from(
                    sheetRef.current.querySelectorAll<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    )
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last  = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [showSheet, closeSheet]);

    const decisionCount = countDecisions(config);

    const handleConfirmOrder = () => {
        navigate('/forward-booking/success');
    };

    // ── Params visibles según proceso seleccionado
    const visibleParams = PARAM_META.filter(p => {
        if (p.key === 'cherryFerm')   return config.process === 'cherry-ferm';
        if (p.key === 'mucilageFerm') return config.process === 'mucilage-ferm';
        return true;
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="cl-config-container">

            {/* ──── HEADER ──────────────────────────────────────────── */}
            <header className="cl-config-header">
                <img
                    src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1742314508/CL_completo_ly3ecz.png"
                    alt="CraftLab"
                    className="cl-brand-logo-img"
                />
                <div className="cl-config-subtitle">Design your coffee</div>
                <button
                    className="cl-close-btn"
                    onClick={() => setShowExitModal(true)}
                    aria-label="Exit configurator"
                >
                    <X size={20} />
                </button>

                {/* Progress bar — 8 segmentos (uno por step) */}
                <div
                    className="cl-progress-wrap"
                    aria-label={`Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].label}`}
                >
                    <div className="cl-progress-track">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={[
                                    'cl-progress-seg',
                                    i < currentStep  ? 'done'   : '',
                                    i === currentStep ? 'active' : '',
                                ].filter(Boolean).join(' ')}
                            />
                        ))}
                    </div>
                    <div className="cl-progress-label">
                        {STEPS[currentStep].label} · Step {currentStep + 1} of {STEPS.length}
                    </div>
                </div>
            </header>

            <div className="cl-body">

                {/* ──── VISUAL PANEL (imagen sticky) ─────────────────── */}
                <div className="cl-visual-panel">
                    <img
                        key={currentImage}
                        src={currentImage}
                        alt="Coffee visual"
                        className="cl-visual-image"
                    />
                    <div className="cl-visual-gradient" />
                    <div className={`cl-visual-tag${config.macro ? ' has-selection' : ''}`}>
                        {config.macro ? config.macro.toUpperCase() : 'SELECT PROFILE'}
                        {config.flavor ? ` · ${config.flavor}` : ''}
                    </div>
                </div>

                {/* ──── CONTENT PANEL (un step a la vez) ─────────────── */}
                <div className="cl-controls-panel">

                    {/* ── Pantalla de revisión final ── */}
                    {showReview ? (
                        <div key="review" className="cl-step-screen config-section">
                            <div className="section-label">REVIEW</div>
                            <h2 className="section-title">
                                Your CraftLab <span className="cl-accent-text">Build</span>
                            </h2>
                            <p className="section-desc">Check all your selections before placing your order.</p>

                            <div className="cl-review-table">
                                {REVIEW_ROWS.map(row => {
                                    const val = displayValue(row.key, config);
                                    return (
                                        <div key={row.key} className="cl-review-row">
                                            <span className="cl-review-label">{row.label}</span>
                                            <span className={`cl-review-value${val === null ? ' empty' : ''}`}>
                                                {val ?? 'Not selected'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <label className="cl-review-terms">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={e => setAgreedToTerms(e.target.checked)}
                                    aria-required="true"
                                />
                                <span>
                                    I confirm the parameters for my custom lot and agree to the{' '}
                                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                                        terms and conditions
                                    </a>
                                </span>
                            </label>

                            <div className="params-cta">
                                <Button
                                    variant="primary"
                                    size="full"
                                    disabled={!agreedToTerms}
                                    onClick={handleConfirmOrder}
                                >
                                    Confirm and Place Order
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* ── Steps 0-7 ── */
                        <div key={currentStep} className="cl-step-screen config-section">

                            {/* STEP 0 — MACRO PROFILE */}
                            {currentStep === 0 && (
                                <>
                                    <div className="section-label">STEP 01 · MACRO PROFILE</div>
                                    <h2 className="section-title">
                                        Macro <span className="cl-accent-text">Profile</span>
                                        <InfoPopover title="Macro Profile">
                                            A macroprofile is the overall character of your coffee. Fermented leans into funky, complex notes. Bright leans into acidity and clarity. Classic leans into body and balance.
                                        </InfoPopover>
                                    </h2>
                                    <p className="section-desc">Choose the flavor direction that defines your lot.</p>
                                    <div className="cl-choices-list">
                                        {MACRO_PROFILES.map(m => (
                                            <div
                                                key={m.id}
                                                className={`cl-choice${config.macro === m.id ? ' selected' : ''}`}
                                                onClick={() => updateConfig('macro', m.id)}
                                                role="radio"
                                                aria-checked={config.macro === m.id}
                                                tabIndex={0}
                                                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') ? updateConfig('macro', m.id) : undefined}
                                            >
                                                <div className="cl-choice-icon" style={{ background: m.gradient }} />
                                                <div className="cl-choice-content">
                                                    <div className="cl-choice-title">{m.label}</div>
                                                    <div className="cl-choice-desc">{m.desc}</div>
                                                </div>
                                                {config.macro === m.id && (
                                                    <div className="cl-choice-check"><Check size={14} /></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* STEP 1 — FLAVOR PROFILE */}
                            {currentStep === 1 && (
                                <>
                                    <div className="section-label">STEP 02 · FLAVOR PROFILE</div>
                                    <h2 className="section-title">
                                        Flavor <span className="cl-accent-text">Profile</span>
                                        <InfoPopover title="Flavor Profile">
                                            Within each macroprofile, flavor profiles define specific note families — like tropical fruits, citrus or cocoa — that your fermentation will amplify.
                                        </InfoPopover>
                                    </h2>
                                    <p className="section-desc">Select the specific tasting notes for your coffee.</p>
                                    <div className="cl-choices-list">
                                        {(config.macro ? FLAVOR_PROFILES[config.macro] : []).map(f => {
                                            const { Icon } = f;
                                            return (
                                                <div
                                                    key={f.id}
                                                    className={`cl-choice${config.flavor === f.label ? ' selected' : ''}`}
                                                    onClick={() => updateConfig('flavor', f.label)}
                                                    role="radio"
                                                    aria-checked={config.flavor === f.label}
                                                    tabIndex={0}
                                                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') ? updateConfig('flavor', f.label) : undefined}
                                                >
                                                    <div
                                                        className="cl-choice-icon cl-choice-icon--flavor"
                                                        style={{ background: f.gradient }}
                                                        aria-hidden="true"
                                                    >
                                                        <Icon size={22} color={f.color} />
                                                    </div>
                                                    <div className="cl-choice-content">
                                                        <div className="cl-choice-title">{f.label}</div>
                                                    </div>
                                                    {config.flavor === f.label && (
                                                        <div className="cl-choice-check"><Check size={14} /></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* STEP 2 — COFFEE VARIETY */}
                            {currentStep === 2 && (
                                <>
                                    <div className="section-label">STEP 03 · COFFEE VARIETY</div>
                                    <h2 className="section-title">
                                        Coffee <span className="cl-accent-text">Variety</span>
                                        <InfoPopover title="Coffee Variety">
                                            The genetic material of your coffee. Each variety has distinct cup potential: Geisha floral, Sidra crystalline, Pink Bourbon tea-like. The variety sets the ceiling; process reveals it.
                                        </InfoPopover>
                                    </h2>
                                    <p className="section-desc">Each variety brings its own genetic expression to the cup.</p>
                                    <div className="cl-choices-list cl-choices-grid">
                                        {VARIETIES.map((v, idx) => (
                                            <div
                                                key={v.id}
                                                className={`cl-choice${config.variety === v.id ? ' selected' : ''}`}
                                                onClick={() => updateConfig('variety', v.id)}
                                                role="radio"
                                                aria-checked={config.variety === v.id}
                                                tabIndex={0}
                                                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') ? updateConfig('variety', v.id) : undefined}
                                            >
                                                <div
                                                    className="cl-choice-icon cl-choice-icon--sm"
                                                    style={{ background: VARIETY_GRADIENTS[idx % VARIETY_GRADIENTS.length] }}
                                                />
                                                <div className="cl-choice-content">
                                                    <div className="cl-choice-title">{v.label}</div>
                                                    <div className="cl-choice-desc">{v.desc}</div>
                                                </div>
                                                {config.variety === v.id && (
                                                    <div className="cl-choice-check"><Check size={14} /></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* STEP 3 — QUANTITY */}
                            {currentStep === 3 && (
                                <>
                                    <div className="section-label">STEP 04 · QUANTITY</div>
                                    <h2 className="section-title">
                                        Select <span className="cl-accent-text">Quantity</span>
                                        <InfoPopover title="Quantity">
                                            7.3 kg of cherries = 1 kg of green coffee. We work in 12.5 kg green lots, allowing small-scale experimentation without committing to a full harvest.
                                        </InfoPopover>
                                    </h2>
                                    <p className="section-desc">Each box is 35 kg of green coffee. Max. 500 boxes per season.</p>
                                    <div className="cl-choices-list">
                                        {['35kg', '70kg', '105kg'].map(q => (
                                            <button
                                                key={q}
                                                className={`cl-choice cl-qty-btn${config.quantity === q ? ' selected' : ''}`}
                                                onClick={() => updateConfig('quantity', q)}
                                                aria-pressed={config.quantity === q}
                                            >
                                                <div className="cl-choice-icon" style={{ background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)' }}>
                                                    <Package size={18} color="#1D4ED8" />
                                                </div>
                                                <div className="cl-choice-content">
                                                    <div className="cl-choice-title">
                                                        {q === '35kg' ? '1 Box · 35 kg' : q === '70kg' ? '2 Boxes · 70 kg' : '3 Boxes · 105 kg'}
                                                    </div>
                                                </div>
                                                {config.quantity === q && (
                                                    <div className="cl-choice-check"><Check size={14} /></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* STEP 4 — PROCESSING CATEGORY */}
                            {currentStep === 4 && (
                                <>
                                    <div className="section-label">STEP 05 · PROCESSING CATEGORY</div>
                                    <h2 className="section-title">
                                        Processing <span className="cl-accent-text">Category</span>
                                        <InfoPopover title="Processing Category">
                                            Natural (dried whole), Washed (pulped and fermented with water), Honey (partial pulp removal), Bio-Innovation (our proprietary protocols). Each category unlocks different flavor architectures.
                                        </InfoPopover>
                                    </h2>
                                    <p className="section-desc">The processing route shapes the final character of your coffee.</p>
                                    <div className="cl-choices-list">
                                        {(config.macro ? CATEGORIES[config.macro] ?? [] : []).map(c => (
                                            <div
                                                key={c.id}
                                                className={`cl-choice${config.category === c.id ? ' selected' : ''}`}
                                                onClick={() => updateConfig('category', c.id)}
                                                role="radio"
                                                aria-checked={config.category === c.id}
                                                tabIndex={0}
                                                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') ? updateConfig('category', c.id) : undefined}
                                            >
                                                <div className="cl-choice-icon" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)' }} />
                                                <div className="cl-choice-content">
                                                    <div className="cl-choice-title">{c.label}</div>
                                                </div>
                                                {config.category === c.id && (
                                                    <div className="cl-choice-check"><Check size={14} /></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* STEP 5 — PROCESSING METHOD */}
                            {currentStep === 5 && (
                                <>
                                    <div className="section-label">STEP 06 · PROCESSING METHOD</div>
                                    <h2 className="section-title">
                                        Processing <span className="cl-accent-text">Method</span>
                                        <InfoPopover title="Processing Method">
                                            Within each category, methods define microbial environment: Lactic favors lactobacilli, Bio-Washed uses controlled yeasts, pH Clarity stops fermentation at target acidity.
                                        </InfoPopover>
                                    </h2>
                                    <p className="section-desc">Select the specific fermentation technique for this lot.</p>
                                    <div className="cl-choices-list">
                                        {(config.category ? METHODS[config.category] ?? [] : []).map(m => (
                                            <div
                                                key={m.id}
                                                className={`cl-choice${config.process === m.id ? ' selected' : ''}`}
                                                onClick={() => updateConfig('process', m.id)}
                                                role="radio"
                                                aria-checked={config.process === m.id}
                                                tabIndex={0}
                                                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') ? updateConfig('process', m.id) : undefined}
                                            >
                                                <div className="cl-choice-icon" style={{ background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)' }} />
                                                <div className="cl-choice-content">
                                                    <div className="cl-choice-title">{m.label}</div>
                                                </div>
                                                {config.process === m.id && (
                                                    <div className="cl-choice-check"><Check size={14} /></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* STEP 6 — PRECISION PARAMETERS */}
                            {currentStep === 6 && (
                                <>
                                    <div className="section-label">STEP 07 · PRECISION PARAMETERS</div>
                                    <h2 className="section-title">
                                        Precision <span className="cl-accent-text">Parameters</span>
                                        <InfoPopover title="Fermentation Parameters">
                                            Cherry stabilization, cherry fermentation and mucilage fermentation shape the final cup. Longer fermentations generally add body and complexity; shorter preserve clarity.
                                        </InfoPopover>
                                    </h2>
                                    <p className="section-desc">Fine-tune the technical parameters for your custom process.</p>
                                    <div className="cl-params-grid">
                                        {visibleParams.map(p => {
                                            const val = config[p.key] as number | null;
                                            const { Icon } = p;
                                            return (
                                                <div key={p.key} className={`cl-param-card${val !== null ? ' has-value' : ''}`}>
                                                    <div className="cl-param-card-top">
                                                        <div className="cl-param-icon">
                                                            <Icon size={16} />
                                                        </div>
                                                        <div className="cl-param-val">
                                                            {val !== null ? `${val}${p.unit}` : '—'}
                                                        </div>
                                                    </div>
                                                    <Slider
                                                        label={p.label}
                                                        min={p.min}
                                                        max={p.max}
                                                        step={p.step}
                                                        value={val}
                                                        onChange={v => updateConfig(p.key, v)}
                                                        unit={p.unit}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* STEP 7 — SHIPMENT WINDOW */}
                            {currentStep === 7 && (
                                <>
                                    <div className="section-label">STEP 08 · SHIPMENT TIMEFRAME</div>
                                    <h2 className="section-title">
                                        Shipment <span className="cl-accent-text">Window</span>
                                    </h2>
                                    <p className="section-desc">Select your preferred delivery window for this lot.</p>

                                    <div className="cl-shipment-grid">
                                        {SHIPMENT_QUARTERS.map(q => {
                                            const { Icon } = q;
                                            return (
                                                <button
                                                    key={q.id}
                                                    className={`cl-shipment-card${config.shipmentWindow === q.id ? ' selected' : ''}`}
                                                    onClick={() => updateConfig('shipmentWindow', q.id)}
                                                    aria-pressed={config.shipmentWindow === q.id}
                                                    disabled={config.shipmentWindow === 'earliest'}
                                                    style={{ background: config.shipmentWindow === q.id ? q.gradient : undefined }}
                                                >
                                                    <Icon size={22} color={q.iconColor} aria-hidden="true" />
                                                    <span className="cl-sqc-label">{q.label}</span>
                                                    <span className="cl-sqc-range">{q.range}</span>
                                                    {config.shipmentWindow === q.id && (
                                                        <Check size={13} className="cl-sqc-check" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <label className="cl-shipment-earliest">
                                        <input
                                            type="checkbox"
                                            checked={config.shipmentWindow === 'earliest'}
                                            onChange={e => {
                                                updateConfig('shipmentWindow', e.target.checked ? 'earliest' : null);
                                            }}
                                            aria-label="Accept earliest available shipment window"
                                        />
                                        <span className="cl-shipment-earliest-label">
                                            Earliest availability — ship whenever my lot is ready
                                        </span>
                                    </label>
                                </>
                            )}

                        </div>
                    )}

                    {/* ──── STEP FOOTER (Back / counter / Next) ──────── */}
                    {!showReview && (
                        <div className="cl-step-footer">
                            <button
                                className="cl-step-back"
                                onClick={goBack}
                                disabled={currentStep === 0}
                                aria-label="Previous step"
                            >
                                ← Back
                            </button>
                            <span className="cl-step-counter" aria-live="polite">
                                {currentStep + 1} / {STEPS.length}
                            </span>
                            <Button
                                variant="primary"
                                onClick={goNext}
                                disabled={!isStepComplete(currentStep)}
                                aria-label={currentStep === STEPS.length - 1 ? 'Review configuration' : 'Next step'}
                            >
                                {currentStep === STEPS.length - 1 ? 'Review →' : 'Next →'}
                            </Button>
                        </div>
                    )}

                    {/* Footer Back para pantalla review */}
                    {showReview && (
                        <div className="cl-step-footer cl-step-footer--review">
                            <button
                                className="cl-step-back"
                                onClick={goBack}
                                aria-label="Back to last step"
                            >
                                ← Back
                            </button>
                        </div>
                    )}

                </div>{/* END controls panel */}
            </div>{/* END cl-body */}

            {/* ──── FLOATING FAB (resumen) ─────────────────────── */}
            <button
                className="cl-sheet-fab"
                onClick={() => setShowSheet(true)}
                aria-label={`View your selections — ${decisionCount} of 12 completed`}
                aria-haspopup="dialog"
            >
                <ChevronUp size={18} />
                <span className="cl-sheet-fab-counter">{decisionCount}/12</span>
            </button>

            {/* ──── BOTTOM SHEET BACKDROP ─────────────────────── */}
            {showSheet && (
                <div
                    className="cl-sheet-backdrop"
                    onClick={closeSheet}
                    aria-hidden="true"
                />
            )}

            {/* ──── BOTTOM SHEET (navy) ───────────────────────── */}
            <div
                ref={sheetRef}
                className={`cl-summary-sheet${showSheet ? ' cl-summary-sheet--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Your selections at a glance"
                aria-hidden={!showSheet}
            >
                <div className="cl-sheet-handle" aria-hidden="true" />
                <div className="cl-sheet-header">
                    <span className="cl-sheet-title">Your Configuration · {decisionCount} of 12</span>
                    <button
                        ref={sheetCloseRef}
                        className="cl-sheet-close"
                        onClick={closeSheet}
                        aria-label="Close summary"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="cl-sheet-body">
                    {REVIEW_ROWS.map(row => {
                        const val = displayValue(row.key, config);
                        return (
                            <div key={row.key} className="cl-sheet-row">
                                <span className="cl-sheet-key">{row.label}</span>
                                <span className={`cl-sheet-val${val === null ? ' cl-sheet-val--empty' : ''}`}>
                                    {val ?? '—'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ──── EXIT MODAL ────────────────────────────────── */}
            <ExitConfirmModal
                isOpen={showExitModal}
                onConfirm={confirmExit}
                onCancel={() => setShowExitModal(false)}
                message="Your configuration will be lost if you leave now."
                confirmLabel="Yes, leave"
                cancelLabel="Stay here"
                variant="craftlab"
            />

        </div>
    );
};
