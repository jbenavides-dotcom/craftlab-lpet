import React, { useState, useEffect, useRef, useCallback, useMemo, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { ToastContainer, useToast } from '../../components/ui/Toast';
import { ConfiguratorLoadingSkeleton } from '../../components/ui/Skeleton';
import { ProducerCard, PRODUCERS } from '../../components/ProducerCard';
import { loadDraftConfig, saveDraftConfig, submitConfig, deleteDraftConfig } from '../../lib/lot-config';
import './CraftLabConfigurator.css';

// Keyboard navigation handler for option lists
const handleOptionKeyDown = (
    e: KeyboardEvent<HTMLDivElement>,
    onSelect: () => void,
    container: HTMLElement | null
) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
        // Scroll the selected option into view
        (e.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const options = container?.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
        if (!options || options.length === 0) return;

        const currentIndex = Array.from(options).findIndex(opt => opt === e.target);
        let nextIndex: number;

        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        }

        options[nextIndex]?.focus();
        options[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

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

// ── REAL VARIETY OPTIONS FROM LA PALMA & EL TUCAN ──
const VARIETY_OPTIONS = [
    { id: 'geisha', label: 'Geisha', description: 'Variedad de campeonato', details: 'Jazmin, bergamota, miel | 350kg disponibles', premium: 60 },
    { id: 'sidra', label: 'Sidra', description: 'Rareza extrema', details: 'Yogurt fresa, rosas, cremoso | 347kg disponibles', premium: 45 },
    { id: 'java', label: 'Java', description: 'Variedad exotica', details: 'Complejo, especiado | 75kg disponibles', premium: 25 },
    { id: 'bourbon', label: 'Bourbon Amarillo', description: 'Dulzura excepcional', details: 'Caramelo, frutas maduras | 125kg disponibles', premium: 20 },
    { id: 'mokka', label: 'Mokka', description: 'Variedad historica', details: 'Distintivo, grano pequeno | 15kg disponibles', premium: 30 }
];

// Keep legacy VARIETIES for backward compatibility
const VARIETIES = [
    { id: 'geisha', label: 'Geisha', desc: 'Variedad de campeonato', why: 'Jazmin, bergamota, miel | 350kg disponibles' },
    { id: 'sidra', label: 'Sidra', desc: 'Rareza extrema', why: 'Yogurt fresa, rosas, cremoso | 347kg disponibles' },
    { id: 'java', label: 'Java', desc: 'Variedad exotica', why: 'Complejo, especiado | 75kg disponibles' },
    { id: 'bourbon', label: 'Bourbon Amarillo', desc: 'Dulzura excepcional', why: 'Caramelo, frutas maduras | 125kg disponibles' },
    { id: 'mokka', label: 'Mokka', desc: 'Variedad historica', why: 'Distintivo, grano pequeno | 15kg disponibles' }
];

// ── REAL LA PALMA & EL TUCAN FERMENTATION PROTOCOLS ──
const CATEGORY_OPTIONS = [
    {
        id: 'lactico',
        label: 'Lactico LPX',
        description: 'Fermentacion lactica controlada con acidez brillante',
        details: '96h cereza + 24-36h mucilago | pH 3.8 | SCA 89.5-90.5',
        flavor: 'Citrico, floral, acidez lactica marcada'
    },
    {
        id: 'bio-innovation',
        label: 'Bio-Innovation Washed',
        description: 'Expresion compleja con notas vinosas y florales',
        details: '90-110h cereza + 12-24h oxidativa | pH 3.8 | SCA 89.5-91',
        flavor: 'Vinoso, florales, persistencia elegante'
    },
    {
        id: 'natural',
        label: 'Natural Oscilante 120',
        description: 'Fermentacion extendida con oscilacion termica natural',
        details: '120h cereza completa | pH 3.9-4.1 | SCA 89-90.5',
        flavor: 'Fruta madura, ron, chocolate oscuro'
    },
    {
        id: 'clarity',
        label: 'Clarity Select pH',
        description: 'Control estricto de pH para acidez elegante',
        details: '48h cereza + 24h mucilago | pH 3.9 | SCA 90-91.25',
        flavor: 'Jazmin, limon dulce, flor blanca'
    },
    {
        id: 'bionatural',
        label: 'Bionatural Selection X',
        description: 'Cepas nativas aisladas de la finca',
        details: '72-100h con inoculos nativos | pH 3.8-4.0 | SCA 89-90',
        flavor: 'Ciruela, uva negra, cacao, vinosidad'
    }
];

// Process parameters for technical display
const PROCESS_PARAMS: Record<string, { phFinal: string, duration: string, tempRange: string }> = {
    'lactico': { phFinal: '3.8', duration: '96h + 24-36h', tempRange: '18-22°C' },
    'bio-innovation': { phFinal: '3.8', duration: '90-110h + 12-24h', tempRange: '18-24°C' },
    'natural': { phFinal: '3.9-4.1', duration: '120h', tempRange: '16-26°C (oscilante)' },
    'clarity': { phFinal: '3.9', duration: '48h + 24h', tempRange: '20-24°C' },
    'bionatural': { phFinal: '3.8-4.0', duration: '72-100h', tempRange: '18-24°C' }
};

const CATEGORIES: Record<string, { id: string, label: string }[]> = {
    fermented: [{ id: 'bio-innovation', label: 'Bio-Innovation' }, { id: 'bionatural', label: 'Bionatural Selection X' }],
    bright: [{ id: 'lactico', label: 'Lactico LPX' }, { id: 'clarity', label: 'Clarity Select pH' }],
    classic: [{ id: 'natural', label: 'Natural Oscilante 120' }]
};

const METHODS: Record<string, { id: string, label: string }[]> = {
    'bio-innovation': [{ id: 'mucilage-ferm', label: 'Mucilage' }, { id: 'cherry-ferm', label: 'Cherry' }],
    'lactico': [{ id: 'lactic-std', label: 'Lactic Standard' }, { id: 'lactic-extended', label: 'Lactic Extended' }],
    'natural': [{ id: 'natural-120', label: 'Natural 120h' }, { id: 'natural-extended', label: 'Natural 150h' }],
    'clarity': [{ id: 'clarity-std', label: 'Clarity Standard' }],
    'bionatural': [{ id: 'bionatural-std', label: 'Native Inoculum' }]
};

// ── EDUCATIONAL CONTENT WITH REAL DATA ──────────────────
const EDUCATIONAL_CONTENT = {
    variety: {
        title: 'Por que importa la variedad',
        content: 'Cultivamos 5 variedades de especialidad en 10.91 hectareas a 1,700 msnm. Cada variedad tiene una expresion genetica unica que define su potencial de sabor.',
        highlight: 'La altura, el suelo volcanico y el microclima de La Palma crean condiciones ideales para el desarrollo de azucares y acidos complejos.'
    },
    category: {
        title: 'Por que importa el proceso',
        content: 'El proceso de fermentacion determina hasta el 40% del perfil final. En La Palma & El Tucan usamos 5 protocolos desarrollados cientificamente:',
        bullets: [
            'pH controlado de 5.2 a 3.8-4.1 durante fermentacion',
            'Temperaturas entre 16-29C segun protocolo',
            'Duracion de 48 a 120 horas segun objetivo',
            'Inoculos nativos aislados de nuestra propia finca'
        ]
    },
    quantity: {
        title: 'Trazabilidad completa',
        content: 'Cada caja contiene 12.5kg de cafe verde (27.5 lbs). Nuestros nanolotes se conforman de 1 o mas baches con trazabilidad completa.',
        example: 'Codigo: PTNLG26001 = La Palma (PT), Nanolote (NL), Geisha (G), 2026, Lote #001'
    }
};

// ── PROCESS TIMELINE STEPS ──────────────────────────────
const PROCESS_TIMELINE = [
    { stage: 'CEREZA', duration: 'Dia 0', desc: 'Recoleccion selectiva' },
    { stage: 'FERMENTACION', duration: '48-120h', desc: 'Protocolo controlado' },
    { stage: 'DESPULPE', duration: 'Post-ferm', desc: 'Remocion de pulpa' },
    { stage: 'LAVADO', duration: '3-5min', desc: 'Limpieza final' },
    { stage: 'SECADO', duration: '15-45d', desc: 'Camas africanas' },
    { stage: 'REPOSO', duration: '60d', desc: 'Estabilizacion' },
    { stage: 'CATACION', duration: 'Dia 60+', desc: 'Evaluacion SCA' }
];

// ── PRICING SYSTEM ──────────────────────────────────────
const BASE_PRICES: Record<string, number> = {
    '35kg': 420,
    '70kg': 780,
    '105kg': 1100,
};

const MACRO_PREMIUMS: Record<string, { percent: number, label: string }> = {
    'fermented': { percent: 15, label: '+15%' },
    'bright': { percent: 10, label: '+10%' },
    'classic': { percent: 0, label: '' },
};

const VARIETY_PREMIUMS: Record<string, { percent: number, label: string }> = {
    'geisha': { percent: 60, label: '+60%' },
    'sidra': { percent: 45, label: '+45%' },
    'java': { percent: 25, label: '+25%' },
    'bourbon': { percent: 20, label: '+20%' },
    'mokka': { percent: 30, label: '+30%' },
};

interface PriceBreakdown {
    basePrice: number;
    macroPremium: number;
    varietyPremium: number;
    total: number;
}

const calculatePrice = (quantity: string | null, macro: string | null, variety: string | null): PriceBreakdown => {
    const basePrice = quantity ? BASE_PRICES[quantity] || 0 : 0;
    const macroPercent = macro ? MACRO_PREMIUMS[macro]?.percent || 0 : 0;
    const varietyPercent = variety ? VARIETY_PREMIUMS[variety]?.percent || 0 : 0;

    const macroPremium = Math.round(basePrice * (macroPercent / 100));
    const varietyPremium = Math.round(basePrice * (varietyPercent / 100));
    const total = basePrice + macroPremium + varietyPremium;

    return { basePrice, macroPremium, varietyPremium, total };
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

    // Refs for keyboard navigation containers
    const macroListRef = useRef<HTMLDivElement>(null);
    const flavorListRef = useRef<HTMLDivElement>(null);
    const varietyListRef = useRef<HTMLDivElement>(null);
    const categoryListRef = useRef<HTMLDivElement>(null);
    const methodListRef = useRef<HTMLDivElement>(null);

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

    // Calculate price reactively
    const priceBreakdown = useMemo(() => {
        return calculatePrice(config.quantity, config.macro, config.variety);
    }, [config.quantity, config.macro, config.variety]);

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

    // Show loading state with skeleton
    if (isLoading) {
        return (
            <div className="cl-config-container">
                <header className="cl-config-header">
                    <img src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1742314508/CL_completo_ly3ecz.png" alt="CraftLab" className="cl-brand-logo-img" />
                    <div className="cl-header-center">
                        <div className="cl-config-subtitle">Loading your configuration...</div>
                        <div className="cl-progress-bar">
                            <div className="cl-progress-fill" style={{ width: '0%' }} />
                        </div>
                    </div>
                    <div style={{ width: 28 }} /> {/* Spacer for close button */}
                </header>
                <div className="cl-body">
                    <ConfiguratorLoadingSkeleton />
                </div>
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
                        <h2 className="section-title" id="macro-label">Macro Profile</h2>
                        <p className="section-desc">Choose the flavor direction that defines your lot.</p>
                        <div className="tesla-options-list" role="listbox" aria-labelledby="macro-label" ref={macroListRef}>
                            {MACRO_PROFILES.map(m => (
                                <div
                                    key={m.id}
                                    className={`tesla-option ${config.macro === m.id ? 'selected' : ''}`}
                                    onClick={() => updateConfig('macro', m.id)}
                                    onKeyDown={(e) => handleOptionKeyDown(e, () => updateConfig('macro', m.id), macroListRef.current)}
                                    style={config.macro === m.id ? { borderColor: m.color } : {}}
                                    tabIndex={0}
                                    role="option"
                                    aria-selected={config.macro === m.id}
                                >
                                    <div>
                                        <div className="topt-name-row">
                                            <span className="topt-name">{m.label}</span>
                                            {MACRO_PREMIUMS[m.id]?.label && (
                                                <span className="premium-badge">{MACRO_PREMIUMS[m.id].label}</span>
                                            )}
                                        </div>
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
                            <h2 className="section-title" id="flavor-label">Flavor Profile</h2>
                            <p className="section-desc">Select the specific tasting notes for your coffee.</p>
                            <div className="tesla-options-list" role="listbox" aria-labelledby="flavor-label" ref={flavorListRef}>
                                {FLAVOR_PROFILES[config.macro].map(f => (
                                    <div
                                        key={f.id}
                                        className={`tesla-option ${config.flavor === f.label ? 'selected' : ''}`}
                                        onClick={() => updateConfig('flavor', f.label)}
                                        onKeyDown={(e) => handleOptionKeyDown(e, () => updateConfig('flavor', f.label), flavorListRef.current)}
                                        style={config.flavor === f.label ? { borderColor: f.color } : {}}
                                        tabIndex={0}
                                        role="option"
                                        aria-selected={config.flavor === f.label}
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
                            <h2 className="section-title" id="variety-label">Coffee Variety</h2>
                            <p className="section-desc">Each variety brings its own genetic expression to the cup.</p>

                            {/* Educational Box - Variety */}
                            <div className="edu-box">
                                <div className="edu-box-header">
                                    <span className="edu-box-icon">&#127793;</span>
                                    <h4 className="edu-box-title">{EDUCATIONAL_CONTENT.variety.title}</h4>
                                </div>
                                <p className="edu-box-content">{EDUCATIONAL_CONTENT.variety.content}</p>
                                <p className="edu-box-highlight">{EDUCATIONAL_CONTENT.variety.highlight}</p>
                            </div>

                            <div className="tesla-options-list" role="listbox" aria-labelledby="variety-label" ref={varietyListRef}>
                                {VARIETIES.map(v => (
                                    <div
                                        key={v.id}
                                        className={`tesla-option ${config.variety === v.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('variety', v.id)}
                                        onKeyDown={(e) => handleOptionKeyDown(e, () => updateConfig('variety', v.id), varietyListRef.current)}
                                        tabIndex={0}
                                        role="option"
                                        aria-selected={config.variety === v.id}
                                    >
                                        <div>
                                            <div className="topt-name-row">
                                                <span className="topt-name">{v.label}</span>
                                                {VARIETY_PREMIUMS[v.id]?.label && (
                                                    <span className="premium-badge">{VARIETY_PREMIUMS[v.id].label}</span>
                                                )}
                                            </div>
                                            <div className="topt-desc">{v.desc}</div>
                                            {config.variety === v.id && <div className="topt-why">{v.why}</div>}
                                        </div>
                                        {config.variety === v.id && <Check size={18} />}
                                    </div>
                                ))}
                            </div>

                            {/* PRODUCER STORYTELLING CARD */}
                            {config.variety && PRODUCERS[config.variety] && (
                                <ProducerCard producer={PRODUCERS[config.variety]} />
                            )}
                        </section>
                    )}

                    {/* SECTION 4: QUANTITY */}
                    {config.variety && (
                        <section className="config-section fade-in" id="sec-quantity">
                            <div className="section-label">Step 04</div>
                            <h2 className="section-title">Quantity</h2>
                            <p className="section-desc">Each box is 12.5 kg of green coffee (27.5 lbs). Max. 500 boxes per season.</p>

                            {/* Educational Box - Quantity/Traceability */}
                            <div className="edu-box">
                                <div className="edu-box-header">
                                    <span className="edu-box-icon">&#128230;</span>
                                    <h4 className="edu-box-title">{EDUCATIONAL_CONTENT.quantity.title}</h4>
                                </div>
                                <p className="edu-box-content">{EDUCATIONAL_CONTENT.quantity.content}</p>
                                <div className="edu-box-code">
                                    <code>{EDUCATIONAL_CONTENT.quantity.example}</code>
                                </div>
                            </div>

                            <div className="quantity-chips">
                                {(['35kg', '70kg', '105kg'] as const).map(q => (
                                    <button
                                        key={q}
                                        className={`qty-chip ${config.quantity === q ? 'selected' : ''}`}
                                        onClick={() => updateConfig('quantity', q)}
                                    >
                                        <span className="qty-chip-text">
                                            {q === '35kg' ? '1 Box · 12.5 kg' : q === '70kg' ? '2 Boxes · 25 kg' : '3 Boxes · 37.5 kg'}
                                        </span>
                                        <span className="qty-chip-price">${BASE_PRICES[q]}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SECTION 5: PROCESSING CATEGORY - La Palma & El Tucan Protocols */}
                    {config.quantity && config.macro && (
                        <section className="config-section fade-in" id="sec-category">
                            <div className="section-label">Step 05</div>
                            <h2 className="section-title" id="category-label">Protocolo de Fermentacion</h2>
                            <p className="section-desc">Selecciona el protocolo de fermentacion desarrollado por La Palma y El Tucan.</p>

                            {/* Educational Box - Category/Fermentation */}
                            <div className="edu-box">
                                <div className="edu-box-header">
                                    <span className="edu-box-icon">&#129514;</span>
                                    <h4 className="edu-box-title">{EDUCATIONAL_CONTENT.category.title}</h4>
                                </div>
                                <p className="edu-box-content">{EDUCATIONAL_CONTENT.category.content}</p>
                                <ul className="edu-box-bullets">
                                    {EDUCATIONAL_CONTENT.category.bullets.map((bullet, idx) => (
                                        <li key={idx}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Process Timeline Visual */}
                            <div className="process-timeline">
                                <h4 className="timeline-title">Linea de Tiempo del Proceso</h4>
                                <div className="timeline-container">
                                    {PROCESS_TIMELINE.map((step, idx) => (
                                        <div key={idx} className="timeline-step">
                                            <div className="timeline-node">
                                                <div className="timeline-dot"></div>
                                                {idx < PROCESS_TIMELINE.length - 1 && <div className="timeline-line"></div>}
                                            </div>
                                            <div className="timeline-content">
                                                <span className="timeline-stage">{step.stage}</span>
                                                <span className="timeline-duration">{step.duration}</span>
                                                <span className="timeline-desc">{step.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="tesla-options-list" role="listbox" aria-labelledby="category-label" ref={categoryListRef}>
                                {(CATEGORIES[config.macro] || []).map(c => {
                                    const categoryData = CATEGORY_OPTIONS.find(cat => cat.id === c.id);
                                    return (
                                        <div
                                            key={c.id}
                                            className={`tesla-option ${config.category === c.id ? 'selected' : ''}`}
                                            onClick={() => updateConfig('category', c.id)}
                                            onKeyDown={(e) => handleOptionKeyDown(e, () => updateConfig('category', c.id), categoryListRef.current)}
                                            tabIndex={0}
                                            role="option"
                                            aria-selected={config.category === c.id}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div className="topt-name">{categoryData?.label || c.label}</div>
                                                {categoryData && (
                                                    <>
                                                        <div className="topt-desc">{categoryData.description}</div>
                                                        {config.category === c.id && (
                                                            <>
                                                                <div className="topt-details">{categoryData.details}</div>
                                                                <div className="topt-flavor">Perfil: {categoryData.flavor}</div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            {config.category === c.id && <Check size={18} />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Technical Parameters Display */}
                            {config.category && PROCESS_PARAMS[config.category] && (
                                <div className="process-parameters">
                                    <h4>Parametros de Control</h4>
                                    <div className="param-grid">
                                        <div className="param">
                                            <span className="param-label">pH Inicial</span>
                                            <span className="param-value">5.2</span>
                                        </div>
                                        <div className="param">
                                            <span className="param-label">pH Final</span>
                                            <span className="param-value">{PROCESS_PARAMS[config.category].phFinal}</span>
                                        </div>
                                        <div className="param">
                                            <span className="param-label">Temperatura</span>
                                            <span className="param-value">{PROCESS_PARAMS[config.category].tempRange}</span>
                                        </div>
                                        <div className="param">
                                            <span className="param-label">Duracion</span>
                                            <span className="param-value">{PROCESS_PARAMS[config.category].duration}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* SECTION 6: PROCESSING METHOD */}
                    {config.category && (
                        <section className="config-section fade-in" id="sec-method">
                            <div className="section-label">Step 06</div>
                            <h2 className="section-title" id="method-label">Processing Method</h2>
                            <p className="section-desc">Select the specific fermentation technique for this lot.</p>
                            <div className="tesla-options-list" role="listbox" aria-labelledby="method-label" ref={methodListRef}>
                                {(METHODS[config.category] || []).map(m => (
                                    <div
                                        key={m.id}
                                        className={`tesla-option ${config.process === m.id ? 'selected' : ''}`}
                                        onClick={() => updateConfig('process', m.id)}
                                        onKeyDown={(e) => handleOptionKeyDown(e, () => updateConfig('process', m.id), methodListRef.current)}
                                        tabIndex={0}
                                        role="option"
                                        aria-selected={config.process === m.id}
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
                <div className="summary-bar-right">
                    {priceBreakdown.total > 0 && (
                        <span className="summary-bar-price">${priceBreakdown.total.toLocaleString()}</span>
                    )}
                    <ChevronDown size={18} className={showSummary ? 'rotate-180' : ''} />
                </div>
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

                    {/* Price Breakdown Section */}
                    {priceBreakdown.total > 0 && (
                        <>
                            <div className="summary-drawer-divider" />
                            <div className="summary-drawer-row">
                                <span className="summary-drawer-key">Base Price ({config.quantity})</span>
                                <span className="summary-drawer-val">${priceBreakdown.basePrice.toLocaleString()}</span>
                            </div>
                            {priceBreakdown.macroPremium > 0 && (
                                <div className="summary-drawer-row">
                                    <span className="summary-drawer-key">Processing Premium ({MACRO_PREMIUMS[config.macro!]?.label})</span>
                                    <span className="summary-drawer-val premium">+${priceBreakdown.macroPremium.toLocaleString()}</span>
                                </div>
                            )}
                            {priceBreakdown.varietyPremium > 0 && (
                                <div className="summary-drawer-row">
                                    <span className="summary-drawer-key">Variety Premium ({VARIETY_PREMIUMS[config.variety!]?.label})</span>
                                    <span className="summary-drawer-val premium">+${priceBreakdown.varietyPremium.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="summary-drawer-row total">
                                <span className="summary-drawer-key">Total</span>
                                <span className="summary-drawer-val total-price">${priceBreakdown.total.toLocaleString()}</span>
                            </div>
                        </>
                    )}
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
