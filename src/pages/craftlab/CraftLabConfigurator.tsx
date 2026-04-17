import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronUp, Check, Package } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { ExitConfirmModal } from '../../components/ExitConfirmModal';
import { InfoPopover } from '../../components/InfoPopover';
import './CraftLabConfigurator.css';

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

const MACRO_PROFILES = [
    { id: 'fermented', label: 'Fermented', desc: 'Bold, fruity, and complex', color: '#9b2335' },
    { id: 'bright', label: 'Bright', desc: 'Crisp, acidic, and floral', color: '#e6a817' },
    { id: 'classic', label: 'Classic', desc: 'Balanced, sweet, and comforting', color: '#6b5344' },
];

const FLAVOR_PROFILES: Record<string, { id: string, label: string, color: string }[]> = {
    fermented: [
        { id: 'f1', label: 'Tropical / Spicy / Cacao', color: '#b78a48' },
        { id: 'f2', label: 'Red Fruits / Sweet', color: '#9b2335' }
    ],
    bright: [
        { id: 'b1', label: 'Citrus / Floral / Tea', color: '#e6a817' },
        { id: 'b2', label: 'Green Apple / Crisp', color: '#5c9e3a' }
    ],
    classic: [
        { id: 'c1', label: 'Balanced / Aromatic', color: '#6b5344' },
        { id: 'c2', label: 'Chocolate / Caramel', color: '#3d2b1f' }
    ]
};

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

const CATEGORIES: Record<string, { id: string, label: string }[]> = {
    fermented: [{ id: 'bio-innovation', label: 'Bio-Innovation' }],
    bright: [{ id: 'lactic', label: 'Lactic' }, { id: 'natural', label: 'Natural' }],
    classic: [{ id: 'washed', label: 'Washed' }, { id: 'honey', label: 'Honey' }]
};

const METHODS: Record<string, { id: string, label: string }[]> = {
    'bio-innovation': [{ id: 'mucilage-ferm', label: 'Mucilage' }, { id: 'cherry-ferm', label: 'Cherry' }],
    'lactic': [{ id: 'lactic-std', label: 'Lactic Standard' }],
    'natural': [{ id: 'natural-std', label: 'Natural Standard' }],
    'washed': [{ id: 'washed-std', label: 'Washed Standard' }],
    'honey': [{ id: 'honey-std', label: 'Honey Standard' }]
};

const SHIPMENT_QUARTERS = [
    { id: 'q1' as const, label: 'Q1', range: 'Jan – Mar', icon: '🌱' },
    { id: 'q2' as const, label: 'Q2', range: 'Apr – Jun', icon: '☀️' },
    { id: 'q3' as const, label: 'Q3', range: 'Jul – Sep', icon: '🍂' },
    { id: 'q4' as const, label: 'Q4', range: 'Oct – Dec', icon: '❄️' },
];

// Section ID -> image mapping
const SECTION_IMAGES: Record<string, string> = {
    'sec-macro':    'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop',
    'sec-flavor':   'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=1200&auto=format&fit=crop',
    'sec-variety':  'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1200&auto=format&fit=crop',
    'sec-quantity': 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=1200&auto=format&fit=crop',
    'sec-category': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    'sec-method':   'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop',
    'sec-params':   'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
    // TODO: replace with actual shipment / calendar image
    'sec-shipment': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop',
};

// Helper: count how many of the 12 decisions are filled
function countDecisions(config: ConfigState): number {
    const fields: (keyof ConfigState)[] = [
        'macro', 'flavor', 'variety', 'quantity',
        'category', 'process', 'stabilization', 'cherryFerm',
        'mucilageFerm', 'solarDry', 'mechDry', 'shipmentWindow',
    ];
    return fields.filter(k => config[k] !== null).length;
}

// Human-readable label for a config value
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
    { key: 'macro',         label: 'Macro Profile' },
    { key: 'flavor',        label: 'Flavor Profile' },
    { key: 'variety',       label: 'Coffee Variety' },
    { key: 'quantity',      label: 'Quantity' },
    { key: 'category',      label: 'Processing Category' },
    { key: 'process',       label: 'Processing Method' },
    { key: 'stabilization', label: 'Stabilization Time' },
    { key: 'cherryFerm',    label: 'Cherry Fermentation' },
    { key: 'mucilageFerm',  label: 'Mucilage Fermentation' },
    { key: 'solarDry',      label: 'Solar Dry' },
    { key: 'mechDry',       label: 'Mechanical Dry' },
    { key: 'shipmentWindow', label: 'Shipment Window' },
];

export const CraftLabConfigurator: React.FC = () => {
    const navigate = useNavigate();
    const [showExitModal, setShowExitModal]   = useState(false);
    const [activeSection, setActiveSection]   = useState('sec-macro');
    const [showSheet, setShowSheet]           = useState(false);
    const [agreedToTerms, setAgreedToTerms]   = useState(false);
    const [showReview, setShowReview]         = useState(false);
    const controlsRef = useRef<HTMLDivElement>(null);
    const sheetCloseRef = useRef<HTMLButtonElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);

    const [config, setConfig] = useState<ConfigState>({
        macro: null, flavor: null, variety: null, quantity: null,
        category: null, process: null, stabilization: null,
        cherryFerm: null, mucilageFerm: null, solarDry: null, mechDry: null,
        shipmentWindow: null,
    });

    // Scroll spy — update active image as user scrolls through option panels
    useEffect(() => {
        const container = controlsRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { root: container, threshold: 0.4 }
        );

        const sections = container.querySelectorAll('.config-section[id]');
        sections.forEach(s => observer.observe(s));
        return () => observer.disconnect();
    }, [config.macro, config.flavor, config.variety, config.quantity, config.category, config.process]);

    const currentImage = SECTION_IMAGES[activeSection] ?? SECTION_IMAGES['sec-macro'];

    const updateConfig = (key: keyof ConfigState, value: ConfigState[keyof ConfigState]) => {
        setConfig(prev => {
            const next = { ...prev, [key]: value };
            if (key === 'macro' && prev.macro !== value) next.flavor = null;
            return next;
        });
    };

    const confirmExit = () => {
        localStorage.removeItem('craftlab_config');
        navigate('/home');
    };

    // Bottom sheet keyboard handling
    const closeSheet = useCallback(() => setShowSheet(false), []);

    useEffect(() => {
        if (!showSheet) return;
        // Focus close button
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
                const last = focusable[focusable.length - 1];
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
        // TODO: POST order to Supabase when DB schema is ready
        navigate('/forward-booking/success');
    };

    return (
        <div className="cl-config-container">

            {/* ──── HEADER (sticky, minimal) ──────────────── */}
            <header className="cl-config-header">
                <img
                    src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1742314508/CL_completo_ly3ecz.png"
                    alt="CraftLab"
                    className="cl-brand-logo-img"
                />
                <div className="cl-config-subtitle">Design your coffee</div>
                <button className="cl-close-btn" onClick={() => setShowExitModal(true)} aria-label="Exit configurator">
                    <X size={20} />
                </button>
            </header>

            <div className="cl-body">

                {/* ──── STICKY IMAGE PANEL ─────────────────── */}
                <div className="cl-visual-panel">
                    <img
                        key={currentImage}
                        src={currentImage}
                        alt="Coffee visual"
                        className="cl-visual-image"
                    />
                    <div className="cl-visual-gradient" />
                    <div className="cl-visual-tag">
                        {config.macro ? config.macro.toUpperCase() : 'SELECT PROFILE'}
                        {config.flavor ? ` · ${config.flavor}` : ''}
                    </div>
                </div>

                {/* ──── SCROLLABLE OPTIONS PANEL ───────────── */}
                <div className="cl-controls-panel" ref={controlsRef}>

                    {/* SECTION 1: MACRO PROFILE */}
                    <section className="config-section" id="sec-macro">
                        <div className="section-label">Step 01</div>
                        <h2 className="section-title">
                            Macro Profile
                            {/* TODO cata: refine copy */}
                            <InfoPopover title="Macro Profile">
                                A macroprofile is the overall character of your coffee. Fermented leans into funky, complex notes. Bright leans into acidity and clarity. Classic leans into body and balance.
                            </InfoPopover>
                        </h2>
                        <p className="section-desc">Choose the flavor direction that defines your lot.</p>
                        <div className="tesla-options-list">
                            {MACRO_PROFILES.map(m => (
                                <div
                                    key={m.id}
                                    className={`tesla-option ${config.macro === m.id ? 'selected' : ''}`}
                                    onClick={() => updateConfig('macro', m.id)}
                                    style={config.macro === m.id ? { borderColor: m.color } : {}}
                                    role="radio"
                                    aria-checked={config.macro === m.id}
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? updateConfig('macro', m.id) : undefined}
                                >
                                    <div>
                                        <div className="topt-name">{m.label}</div>
                                        <div className="topt-desc">{m.desc}</div>
                                    </div>
                                    {config.macro === m.id && <Check size={18} color={m.color} />}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 2: FLAVOR PROFILE */}
                    {config.macro && (
                        <section className="config-section fade-in" id="sec-flavor">
                            <div className="section-label">Step 02</div>
                            <h2 className="section-title">
                                Flavor Profile
                                {/* TODO cata: refine copy */}
                                <InfoPopover title="Flavor Profile">
                                    Within each macroprofile, flavor profiles define specific note families — like tropical fruits, citrus or cocoa — that your fermentation will amplify.
                                </InfoPopover>
                            </h2>
                            <p className="section-desc">Select the specific tasting notes for your coffee.</p>
                            <div className="tesla-options-list">
                                {FLAVOR_PROFILES[config.macro].map(f => (
                                    <div
                                        key={f.id}
                                        className={`tesla-option ${config.flavor === f.label ? 'selected' : ''}`}
                                        onClick={() => updateConfig('flavor', f.label)}
                                        style={config.flavor === f.label ? { borderColor: f.color } : {}}
                                        role="radio"
                                        aria-checked={config.flavor === f.label}
                                        tabIndex={0}
                                        onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? updateConfig('flavor', f.label) : undefined}
                                    >
                                        <div className="flavor-dot" style={{ background: f.color }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="topt-name">{f.label}</div>
                                        </div>
                                        {config.flavor === f.label && <Check size={18} color={f.color} />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SECTION 3: VARIETY */}
                    {config.flavor && (
                        <section className="config-section fade-in" id="sec-variety">
                            <div className="section-label">Step 03</div>
                            <h2 className="section-title">
                                Coffee Variety
                                {/* TODO cata: refine copy */}
                                <InfoPopover title="Coffee Variety">
                                    The genetic material of your coffee. Each variety has distinct cup potential: Geisha floral, Sidra crystalline, Pink Bourbon tea-like. The variety sets the ceiling; process reveals it.
                                </InfoPopover>
                            </h2>
                            <p className="section-desc">Each variety brings its own genetic expression to the cup.</p>
                            <div className="tesla-options-list">
                                {VARIETIES.map(v => (
                                    <div
                                        key={v.id}
                                        className={`tesla-option ${config.variety === v.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('variety', v.id)}
                                        role="radio"
                                        aria-checked={config.variety === v.id}
                                        tabIndex={0}
                                        onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? updateConfig('variety', v.id) : undefined}
                                    >
                                        <div>
                                            <div className="topt-name">{v.label}</div>
                                            <div className="topt-desc">{v.desc}</div>
                                        </div>
                                        {config.variety === v.id && <Check size={18} />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SECTION 4: QUANTITY */}
                    {config.variety && (
                        <section className="config-section fade-in" id="sec-quantity">
                            <div className="section-label">Step 04</div>
                            <h2 className="section-title">
                                Quantity
                                {/* TODO cata: refine copy */}
                                <InfoPopover title="Quantity">
                                    7.3 kg of cherries = 1 kg of green coffee. We work in 12.5 kg green lots, allowing small-scale experimentation without committing to a full harvest.
                                </InfoPopover>
                            </h2>
                            <p className="section-desc">Each box is 35 kg of green coffee. Max. 500 boxes per season.</p>
                            <div className="quantity-chips">
                                {['35kg', '70kg', '105kg'].map(q => (
                                    <button
                                        key={q}
                                        className={`qty-chip ${config.quantity === q ? 'selected' : ''}`}
                                        onClick={() => updateConfig('quantity', q)}
                                        aria-pressed={config.quantity === q}
                                    >
                                        {q === '35kg' ? '1 Box · 35 kg' : q === '70kg' ? '2 Boxes · 70 kg' : '3 Boxes · 105 kg'}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SECTION 5: PROCESSING CATEGORY */}
                    {config.quantity && config.macro && (
                        <section className="config-section fade-in" id="sec-category">
                            <div className="section-label">Step 05</div>
                            <h2 className="section-title">
                                Processing Category
                                {/* TODO cata: refine copy */}
                                <InfoPopover title="Processing Category">
                                    Natural (dried whole), Washed (pulped and fermented with water), Honey (partial pulp removal), Bio-Innovation (our proprietary protocols). Each category unlocks different flavor architectures.
                                </InfoPopover>
                            </h2>
                            <p className="section-desc">The processing route shapes the final character of your coffee.</p>
                            <div className="tesla-options-list">
                                {(CATEGORIES[config.macro] || []).map(c => (
                                    <div
                                        key={c.id}
                                        className={`tesla-option ${config.category === c.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('category', c.id)}
                                        role="radio"
                                        aria-checked={config.category === c.id}
                                        tabIndex={0}
                                        onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? updateConfig('category', c.id) : undefined}
                                    >
                                        <div className="topt-name">{c.label}</div>
                                        {config.category === c.id && <Check size={18} />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SECTION 6: PROCESSING METHOD */}
                    {config.category && (
                        <section className="config-section fade-in" id="sec-method">
                            <div className="section-label">Step 06</div>
                            <h2 className="section-title">
                                Processing Method
                                {/* TODO cata: refine copy */}
                                <InfoPopover title="Processing Method">
                                    Within each category, methods define microbial environment: Lactic favors lactobacilli, Bio-Washed uses controlled yeasts, pH Clarity stops fermentation at target acidity.
                                </InfoPopover>
                            </h2>
                            <p className="section-desc">Select the specific fermentation technique for this lot.</p>
                            <div className="tesla-options-list">
                                {(METHODS[config.category] || []).map(m => (
                                    <div
                                        key={m.id}
                                        className={`tesla-option ${config.process === m.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('process', m.id)}
                                        role="radio"
                                        aria-checked={config.process === m.id}
                                        tabIndex={0}
                                        onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? updateConfig('process', m.id) : undefined}
                                    >
                                        <div className="topt-name">{m.label}</div>
                                        {config.process === m.id && <Check size={18} />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SECTION 7: PRECISION PARAMETERS */}
                    {config.process && (
                        <section className="config-section fade-in" id="sec-params">
                            <div className="section-label">Step 07</div>
                            <h2 className="section-title">
                                Precision Parameters
                                {/* TODO cata: refine copy */}
                                <InfoPopover title="Fermentation Parameters">
                                    Cherry stabilization, cherry fermentation and mucilage fermentation shape the final cup. Longer fermentations generally add body and complexity; shorter preserve clarity.
                                </InfoPopover>
                            </h2>
                            <p className="section-desc">Fine-tune the technical parameters for your custom process.</p>

                            <div className="params-container">
                                <Slider
                                    label="Stabilization Time"
                                    min={0} max={200} step={12}
                                    value={config.stabilization}
                                    onChange={v => updateConfig('stabilization', v)}
                                    unit=" hrs"
                                />

                                {config.process === 'cherry-ferm' && (
                                    <Slider
                                        label="Cherry Fermentation"
                                        min={0} max={200} step={12}
                                        value={config.cherryFerm}
                                        onChange={v => updateConfig('cherryFerm', v)}
                                        unit=" hrs"
                                    />
                                )}
                                {config.process === 'mucilage-ferm' && (
                                    <Slider
                                        label="Mucilage Fermentation"
                                        min={0} max={200} step={12}
                                        value={config.mucilageFerm}
                                        onChange={v => updateConfig('mucilageFerm', v)}
                                        unit=" hrs"
                                    />
                                )}

                                <Slider
                                    label="Solar Dry"
                                    min={0} max={100}
                                    value={config.solarDry}
                                    onChange={v => updateConfig('solarDry', v)}
                                    unit=" days"
                                />

                                <Slider
                                    label="Mechanical Dry"
                                    min={0} max={100} step={6}
                                    value={config.mechDry}
                                    onChange={v => updateConfig('mechDry', v)}
                                    unit=" hrs"
                                />
                            </div>
                        </section>
                    )}

                    {/* SECTION 8: SHIPMENT TIMEFRAME */}
                    {config.stabilization !== null && config.solarDry !== null && (
                        <section className="config-section fade-in" id="sec-shipment">
                            <div className="section-label">Step 08</div>
                            <h2 className="section-title">Shipment Timeframe</h2>
                            <p className="section-desc">Select your preferred delivery window for this lot.</p>

                            <div className="shipment-quarters">
                                {SHIPMENT_QUARTERS.map(q => (
                                    <button
                                        key={q.id}
                                        className={`shipment-quarter-card ${config.shipmentWindow === q.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('shipmentWindow', q.id)}
                                        aria-pressed={config.shipmentWindow === q.id}
                                        disabled={config.shipmentWindow === 'earliest'}
                                    >
                                        <span className="sqc-icon" aria-hidden="true">{q.icon}</span>
                                        <span className="sqc-label">{q.label}</span>
                                        <span className="sqc-range">{q.range}</span>
                                        {config.shipmentWindow === q.id && (
                                            <Check size={14} className="sqc-check" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <label className="shipment-earliest-toggle">
                                <input
                                    type="checkbox"
                                    checked={config.shipmentWindow === 'earliest'}
                                    onChange={e => {
                                        updateConfig(
                                            'shipmentWindow',
                                            e.target.checked ? 'earliest' : null
                                        );
                                    }}
                                    aria-label="Accept earliest available shipment window"
                                />
                                <span className="shipment-earliest-label">
                                    Earliest availability — ship whenever my lot is ready
                                </span>
                            </label>

                            <div className="params-cta">
                                <Button
                                    variant="primary"
                                    size="full"
                                    disabled={config.shipmentWindow === null}
                                    onClick={() => setShowReview(true)}
                                >
                                    Review &amp; Confirm
                                </Button>
                            </div>
                        </section>
                    )}

                    {/* SECTION 9: REVIEW & CONFIRM */}
                    {showReview && (
                        <section className="config-section fade-in" id="sec-review">
                            <div className="section-label">Review</div>
                            <h2 className="section-title">Confirm Your Order</h2>
                            <p className="section-desc">Check all your selections before placing your order.</p>

                            <div className="review-table">
                                {REVIEW_ROWS.map(row => {
                                    const val = displayValue(row.key, config);
                                    return (
                                        <div key={row.key} className="review-row">
                                            <span className="review-label">{row.label}</span>
                                            <span className={`review-value ${val === null ? 'review-value--empty' : ''}`}>
                                                {val ?? 'Not selected'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <label className="review-terms-label">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={e => setAgreedToTerms(e.target.checked)}
                                    aria-required="true"
                                />
                                <span>
                                    I agree to the{' '}
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
                        </section>
                    )}

                </div>{/* END controls panel */}
            </div>{/* END cl-body */}

            {/* ──── FLOATING SUMMARY TRIGGER (bottom-right) ──── */}
            <button
                className="cl-sheet-fab"
                onClick={() => setShowSheet(true)}
                aria-label={`View your selections — ${decisionCount} of 12 completed`}
                aria-haspopup="dialog"
            >
                <ChevronUp size={18} />
                <span className="cl-sheet-fab-counter">{decisionCount}/12</span>
            </button>

            {/* ──── BOTTOM SHEET BACKDROP ───────────────────── */}
            {showSheet && (
                <div
                    className="cl-sheet-backdrop"
                    onClick={closeSheet}
                    aria-hidden="true"
                />
            )}

            {/* ──── BOTTOM SHEET (navy) ─────────────────────── */}
            <div
                ref={sheetRef}
                className={`cl-summary-sheet ${showSheet ? 'cl-summary-sheet--open' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Your selections at a glance"
                aria-hidden={!showSheet}
            >
                {/* Handle */}
                <div className="cl-sheet-handle" aria-hidden="true" />

                {/* Header */}
                <div className="cl-sheet-header">
                    <span className="cl-sheet-title">Your Selections at a Glance</span>
                    <button
                        ref={sheetCloseRef}
                        className="cl-sheet-close"
                        onClick={closeSheet}
                        aria-label="Close summary"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="cl-sheet-body">
                    {REVIEW_ROWS.map(row => {
                        const val = displayValue(row.key, config);
                        return (
                            <div key={row.key} className="cl-sheet-row">
                                <span className="cl-sheet-key">{row.label}</span>
                                <span className={`cl-sheet-val ${val === null ? 'cl-sheet-val--empty' : ''}`}>
                                    {val ?? 'Not selected'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ──── EXIT MODAL ─────────────────────────── */}
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
