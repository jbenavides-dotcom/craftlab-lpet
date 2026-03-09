import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { loadDraftConfig, saveDraftConfig, submitConfig, deleteDraftConfig } from '../../lib/lot-config';
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
}

const MACRO_PROFILES = [
    { id: 'fermented', label: 'Fermented', desc: 'Bold, fruity, and complex', color: '#9b2335', why: 'Extended fermentation unlocks unique esters and alcohols, creating wine-like complexity.' },
    { id: 'bright', label: 'Bright', desc: 'Crisp, acidic, and floral', color: '#e6a817', why: 'Controlled lactic fermentation preserves delicate acids and floral aromatics.' },
    { id: 'classic', label: 'Classic', desc: 'Balanced, sweet, and comforting', color: '#6b5344', why: 'Traditional processing highlights the natural sweetness and terroir of the coffee.' },
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
    { id: 'geisha', label: 'Geisha', desc: 'Delicate, tea-like, jasmine', why: 'Ethiopian origin, prized for its exceptional aromatics and clarity.' },
    { id: 'sidra', label: 'Sidra', desc: 'Complex, tropical, wine-like', why: 'Colombian heritage variety known for intense fruit notes and body.' },
    { id: 'gesha-sidra', label: 'Gesha / Sidra Blend', desc: 'Best of both worlds', why: 'Our signature blend combines Geisha elegance with Sidra intensity.' }
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

// Section ID -> image mapping
const SECTION_IMAGES: Record<string, string> = {
    'sec-macro': 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200&auto=format&fit=crop',
    'sec-flavor': 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?q=80&w=1200&auto=format&fit=crop',
    'sec-variety': 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1200&auto=format&fit=crop',
    'sec-quantity': 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=1200&auto=format&fit=crop',
    'sec-category': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    'sec-method': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop',
    'sec-params': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop',
};

export const CraftLabConfigurator: React.FC = () => {
    const navigate = useNavigate();
    const { toasts, addToast, removeToast } = useToast();
    const [showExitModal, setShowExitModal] = useState(false);
    const [activeSection, setActiveSection] = useState('sec-macro');
    const [showSummary, setShowSummary] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const controlsRef = useRef<HTMLDivElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveSuccessRef = useRef<boolean>(true);

    const [config, setConfig] = useState<ConfigState>({
        macro: null, flavor: null, variety: null, quantity: null,
        category: null, process: null, stabilization: null,
        cherryFerm: null, mucilageFerm: null, solarDry: null, mechDry: null,
    });

    // Load existing draft on mount
    useEffect(() => {
        const loadExisting = async () => {
            try {
                const draft = await loadDraftConfig();
                if (draft) {
                    setConfig({
                        macro: draft.macro,
                        flavor: draft.flavor,
                        variety: draft.variety,
                        quantity: draft.quantity,
                        category: draft.category,
                        process: draft.process,
                        stabilization: draft.stabilization,
                        cherryFerm: draft.cherry_ferm,
                        mucilageFerm: draft.mucilage_ferm,
                        solarDry: draft.solar_dry,
                        mechDry: draft.mech_dry,
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

    // Auto-save with debounce
    const debouncedSave = useCallback((newConfig: ConfigState) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            const result = await saveDraftConfig({
                macro: newConfig.macro,
                flavor: newConfig.flavor,
                variety: newConfig.variety,
                quantity: newConfig.quantity,
                category: newConfig.category,
                process: newConfig.process,
                stabilization: newConfig.stabilization,
                cherry_ferm: newConfig.cherryFerm,
                mucilage_ferm: newConfig.mucilageFerm,
                solar_dry: newConfig.solarDry,
                mech_dry: newConfig.mechDry,
            });
            setIsSaving(false);

            // Show toast only on state change (success after failure, or failure)
            if (result && !lastSaveSuccessRef.current) {
                addToast('Configuration saved', 'success');
                lastSaveSuccessRef.current = true;
            } else if (!result) {
                addToast('Failed to save. Check connection.', 'error');
                lastSaveSuccessRef.current = false;
            }
        }, 1000);
    }, [addToast]);

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

    // Calculate progress (for SDT Competence feedback)
    const progress = useMemo(() => {
        let steps = 0;
        if (config.macro) steps++;
        if (config.flavor) steps++;
        if (config.variety) steps++;
        if (config.quantity) steps++;
        if (config.category) steps++;
        if (config.process) steps++;
        if (config.stabilization !== null && config.solarDry !== null) steps++;
        return Math.round((steps / 7) * 100);
    }, [config]);

    const updateConfig = (key: keyof ConfigState, value: any) => {
        setConfig(prev => {
            const next = { ...prev, [key]: value };
            if (key === 'macro' && prev.macro !== value) next.flavor = null;
            // Trigger auto-save
            debouncedSave(next);
            return next;
        });
    };

    const confirmExit = async () => {
        // Delete draft when user confirms exit
        await deleteDraftConfig();
        localStorage.removeItem('craftlab_config');
        navigate('/home');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await submitConfig();
            if (result) {
                // Fire celebration confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#c1004a', '#b78a48', '#0e1e36', '#4ade80']
                });

                // Second burst
                setTimeout(() => {
                    confetti({
                        particleCount: 50,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#c1004a', '#b78a48']
                    });
                    confetti({
                        particleCount: 50,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#0e1e36', '#4ade80']
                    });
                }, 200);

                addToast('Configuration submitted!', 'success');

                // Navigate after brief celebration
                setTimeout(() => {
                    navigate('/craftlab/success', { state: { config: result } });
                }, 1500);
            } else {
                addToast('Error submitting. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Submit error:', err);
            addToast('Error submitting. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="cl-config-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="cl-config-container">
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* ──── HEADER (sticky, minimal) ──────────────── */}
            <header className="cl-config-header">
                <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1742314508/CL_completo_ly3ecz.png" alt="CraftLab" className="cl-brand-logo-img" />
                <div className="cl-header-center">
                    <div className="cl-config-subtitle">
                        {isSaving ? 'Saving...' : progress === 100 ? 'Ready to submit!' : 'Design your coffee'}
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

                {/* ──── STICKY IMAGE PANEL ─────────────────── */}
                <div className="cl-visual-panel">
                    <img
                        key={currentImage}
                        src={currentImage}
                        alt="Coffee visual"
                        className="cl-visual-image"
                    />
                    <div className="cl-visual-gradient" />
                    {/* floating summary chip */}
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
                        <h2 className="section-title">Macro Profile</h2>
                        <p className="section-desc">Choose the flavor direction that defines your lot.</p>
                        <div className="tesla-options-list">
                            {MACRO_PROFILES.map(m => (
                                <div
                                    key={m.id}
                                    className={`tesla-option ${config.macro === m.id ? 'selected' : ''}`}
                                    onClick={() => updateConfig('macro', m.id)}
                                    style={config.macro === m.id ? { borderColor: m.color } : {}}
                                >
                                    <div>
                                        <div className="topt-name">{m.label}</div>
                                        <div className="topt-desc">{m.desc}</div>
                                        {config.macro === m.id && <div className="topt-why">{m.why}</div>}
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
                            <h2 className="section-title">Flavor Profile</h2>
                            <p className="section-desc">Select the specific tasting notes for your coffee.</p>
                            <div className="tesla-options-list">
                                {FLAVOR_PROFILES[config.macro].map(f => (
                                    <div
                                        key={f.id}
                                        className={`tesla-option ${config.flavor === f.label ? 'selected' : ''}`}
                                        onClick={() => updateConfig('flavor', f.label)}
                                        style={config.flavor === f.label ? { borderColor: f.color } : {}}
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
                            <h2 className="section-title">Coffee Variety</h2>
                            <p className="section-desc">Each variety brings its own genetic expression to the cup.</p>
                            <div className="tesla-options-list">
                                {VARIETIES.map(v => (
                                    <div
                                        key={v.id}
                                        className={`tesla-option ${config.variety === v.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('variety', v.id)}
                                    >
                                        <div>
                                            <div className="topt-name">{v.label}</div>
                                            <div className="topt-desc">{v.desc}</div>
                                            {config.variety === v.id && <div className="topt-why">{v.why}</div>}
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
                            <h2 className="section-title">Quantity</h2>
                            <p className="section-desc">Each box is 35 kg of green coffee. Max. 500 boxes per season.</p>
                            <div className="quantity-chips">
                                {['35kg', '70kg', '105kg'].map(q => (
                                    <button
                                        key={q}
                                        className={`qty-chip ${config.quantity === q ? 'selected' : ''}`}
                                        onClick={() => updateConfig('quantity', q)}
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
                            <h2 className="section-title">Processing Category</h2>
                            <p className="section-desc">The processing route shapes the final character of your coffee.</p>
                            <div className="tesla-options-list">
                                {(CATEGORIES[config.macro] || []).map(c => (
                                    <div
                                        key={c.id}
                                        className={`tesla-option ${config.category === c.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('category', c.id)}
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
                            <h2 className="section-title">Processing Method</h2>
                            <p className="section-desc">Select the specific fermentation technique for this lot.</p>
                            <div className="tesla-options-list">
                                {(METHODS[config.category] || []).map(m => (
                                    <div
                                        key={m.id}
                                        className={`tesla-option ${config.process === m.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('process', m.id)}
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
                            <h2 className="section-title">Precision Parameters</h2>
                            <p className="section-desc">Fine-tune the technical parameters for your custom process.</p>

                            <div className="params-container">
                                <div className="param-group">
                                    <Slider label="Stabilization Time" min={0} max={200} step={12}
                                        value={config.stabilization} onChange={v => updateConfig('stabilization', v)} unit=" hrs" />
                                    <p className="param-hint">Resting period before fermentation begins. Longer times develop more complex precursors.</p>
                                </div>

                                {config.process === 'cherry-ferm' && (
                                    <div className="param-group">
                                        <Slider label="Cherry Fermentation" min={0} max={200} step={12}
                                            value={config.cherryFerm} onChange={v => updateConfig('cherryFerm', v)} unit=" hrs" />
                                        <p className="param-hint">Whole cherry fermentation creates intense fruit notes and body.</p>
                                    </div>
                                )}
                                {config.process === 'mucilage-ferm' && (
                                    <div className="param-group">
                                        <Slider label="Mucilage Fermentation" min={0} max={200} step={12}
                                            value={config.mucilageFerm} onChange={v => updateConfig('mucilageFerm', v)} unit=" hrs" />
                                        <p className="param-hint">Pulped cherry fermentation balances sweetness with cleaner acidity.</p>
                                    </div>
                                )}

                                <div className="param-group">
                                    <Slider label="Solar Dry" min={0} max={100}
                                        value={config.solarDry} onChange={v => updateConfig('solarDry', v)} unit=" days" />
                                    <p className="param-hint">Sun drying preserves delicate aromatics and develops sweetness slowly.</p>
                                </div>

                                <div className="param-group">
                                    <Slider label="Mechanical Dry" min={0} max={100} step={6}
                                        value={config.mechDry} onChange={v => updateConfig('mechDry', v)} unit=" hrs" />
                                    <p className="param-hint">Controlled drying ensures consistent moisture levels for stability.</p>
                                </div>
                            </div>

                            <div className="params-cta">
                                <Button variant="primary" size="full"
                                    disabled={config.stabilization === null || config.solarDry === null || isSubmitting}
                                    onClick={handleSubmit}>
                                    {isSubmitting ? 'Submitting...' : 'Continue to Fulfillment'}
                                </Button>
                            </div>
                        </section>
                    )}

                </div>{/* END controls panel */}
            </div>{/* END cl-body */}

            {/* ──── STICKY SUMMARY BAR (mobile) ─────────── */}
            <div className="cl-summary-bar" onClick={() => setShowSummary(!showSummary)}>
                <div className="summary-bar-left">
                    <span>{config.macro ? config.macro.toUpperCase() : 'Configure your lot'}</span>
                    {config.flavor && <span className="summary-bar-sub">{config.flavor}</span>}
                </div>
                <ChevronDown size={18} className={showSummary ? 'rotate-180' : ''} />
            </div>

            {/* summary drawer */}
            {showSummary && (
                <div className="cl-summary-drawer">
                    {[
                        { label: 'Macro', val: config.macro },
                        { label: 'Flavor', val: config.flavor },
                        { label: 'Variety', val: config.variety ? VARIETIES.find(v => v.id === config.variety)?.label : null },
                        { label: 'Quantity', val: config.quantity },
                        { label: 'Category', val: config.category },
                        { label: 'Method', val: config.process },
                    ].map(row => (
                        <div key={row.label} className="summary-drawer-row">
                            <span className="summary-drawer-key">{row.label}</span>
                            <span className={`summary-drawer-val ${!row.val ? 'empty' : ''}`}>
                                {row.val || '—'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ──── EXIT MODAL ─────────────────────────── */}
            {showExitModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Are you sure?</h2>
                        <p>Your configuration will be lost if you leave now.</p>
                        <div className="modal-actions">
                            <Button variant="primary" size="full" onClick={confirmExit}>
                                Yes, leave
                            </Button>
                            <Button variant="outline" size="full" onClick={() => setShowExitModal(false)}>
                                Stay here
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
