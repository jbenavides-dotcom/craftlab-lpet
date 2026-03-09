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
        label: 'Lote de Competencia',
        sublabel: 'Para baristas y campeonatos',
        description: 'Buscas el puntaje SCA más alto posible. Protocolos de precisión máxima.',
        icon: Award,
        recommended: ['lactico', 'clarity'],
        color: '#c1004a'
    },
    {
        id: 'retail',
        label: 'Retail / Café',
        sublabel: 'Para tu tienda o menú',
        description: 'Balance entre complejidad y accesibilidad. Perfil que tus clientes amarán.',
        icon: Coffee,
        recommended: ['bio-innovation', 'natural'],
        color: '#b78a48'
    },
    {
        id: 'experimental',
        label: 'Experimental',
        sublabel: 'Quiero probar algo nuevo',
        description: 'Acceso a protocolos de innovación. Fermentaciones con cepas nativas únicas.',
        icon: Beaker,
        recommended: ['bionatural'],
        color: '#0e1e36'
    },
    {
        id: 'blend',
        label: 'Componente de Blend',
        sublabel: 'Para mezclar con otros orígenes',
        description: 'Cafés con características definidas que aportan notas específicas a tu blend.',
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
        profile: 'Jazmín, bergamota, miel, té Earl Grey',
        description: 'La variedad más premiada del mundo. Originaria de Etiopía, cultivada en nuestra finca desde 2014.',
        altitude: '1,700 msnm',
        harvest: 'Mayo-Julio',
        premium: 60
    },
    {
        id: 'sidra',
        label: 'Sidra',
        category: 'Heroes',
        available: 347,
        sca: '88-90',
        profile: 'Yogurt de fresa, rosas, textura cremosa',
        description: 'Variedad rara de excepcional dulzura. Perfil único que recuerda a lácteos fermentados.',
        altitude: '1,700 msnm',
        harvest: 'Mayo-Julio',
        premium: 45
    },
    {
        id: 'bourbon',
        label: 'Bourbon Amarillo',
        category: 'Warrior',
        available: 125,
        sca: '86-88',
        profile: 'Caramelo, frutas maduras, cuerpo redondo',
        description: 'Variedad tradicional con dulzura excepcional. Base perfecta para blends complejos.',
        altitude: '1,700 msnm',
        harvest: 'Abril-Junio',
        premium: 20
    },
    {
        id: 'java',
        label: 'Java',
        category: 'Warrior',
        available: 75,
        sca: '86-88',
        profile: 'Especias, madera, complejidad herbal',
        description: 'Variedad exótica con perfil distintivo. Notas especiadas únicas.',
        altitude: '1,700 msnm',
        harvest: 'Mayo-Julio',
        premium: 25
    },
    {
        id: 'mokka',
        label: 'Mokka',
        category: 'Warrior',
        available: 15,
        sca: '87-89',
        profile: 'Chocolate, frutas secas, intenso',
        description: 'Variedad histórica de granos pequeños. Producción muy limitada.',
        altitude: '1,700 msnm',
        harvest: 'Junio-Agosto',
        premium: 30,
        limited: true
    }
];

// ── STEP 3: FERMENTATION PROTOCOLS (Real LP&ET science) ───────────────────────
const PROTOCOLS = [
    {
        id: 'lactico',
        label: 'Láctico LPX',
        tagline: 'Acidez brillante, perfil limpio',
        description: 'Fermentación láctica controlada con inoculación de bacterias ácido-lácticas. Desarrollado para maximizar la acidez cítrica mientras preserva la dulzura.',
        duration: '96h cereza + 24-36h mucílago',
        ph: { start: 5.2, end: 3.8 },
        temp: '18-22°C',
        sca: '89.5-90.5',
        flavor: ['Cítrico', 'Floral', 'Acidez láctica', 'Limpio'],
        science: 'Las BAL (bacterias ácido-lácticas) convierten azúcares en ácido láctico, creando una acidez suave y prolongada.',
        bestFor: ['competition', 'retail'],
        color: '#e6a817'
    },
    {
        id: 'bio-innovation',
        label: 'Bio-Innovation Washed',
        tagline: 'Complejidad vinosa, florales intensos',
        description: 'Protocolo propietario con cepa T08 (levaduras + BAL). Combina lo mejor de la fermentación natural con la limpieza del lavado.',
        duration: '90-110h cereza + 12-24h oxidativa',
        ph: { start: 5.2, end: 3.8 },
        temp: '18-24°C',
        sca: '89.5-91',
        flavor: ['Vinoso', 'Florales', 'Persistencia', 'Elegante'],
        science: 'La fase oxidativa post-fermentación desarrolla compuestos fenólicos que aportan estructura y persistencia.',
        bestFor: ['competition', 'retail', 'blend'],
        color: '#9b2335'
    },
    {
        id: 'natural',
        label: 'Natural Oscilante 120',
        tagline: 'Fruta madura, cuerpo intenso',
        description: 'Secado de cereza completa con oscilación térmica día/noche. La cereza fermenta mientras seca, intensificando los azúcares.',
        duration: '120h cereza completa',
        ph: { start: 5.2, end: '3.9-4.1' },
        temp: '16-26°C (oscilante)',
        sca: '89-90.5',
        flavor: ['Fruta madura', 'Ron', 'Chocolate oscuro', 'Cuerpo'],
        science: 'La oscilación térmica natural (frío nocturno, calor diurno) crea ciclos de fermentación que desarrollan ésteres frutales complejos.',
        bestFor: ['retail', 'blend', 'experimental'],
        color: '#6b5344'
    },
    {
        id: 'clarity',
        label: 'Clarity Select pH',
        tagline: 'Elegancia extrema, transparencia',
        description: 'Control estricto de pH en tiempo real. Fermentación corta que preserva la claridad del terroir sin enmascarar.',
        duration: '48h cereza + 24h mucílago',
        ph: { start: 5.2, end: 3.9 },
        temp: '20-24°C',
        sca: '90-91.25',
        flavor: ['Jazmín', 'Limón dulce', 'Flor blanca', 'Transparente'],
        science: 'El monitoreo constante de pH permite detener la fermentación en el punto exacto de máxima expresión aromática.',
        bestFor: ['competition'],
        color: '#4a90a8'
    },
    {
        id: 'bionatural',
        label: 'Bionatural Selection X',
        tagline: 'Cepas nativas, terroir amplificado',
        description: 'Fermentación con microorganismos aislados de nuestra propia finca. Cada lote expresa el ecosistema único de La Palma.',
        duration: '72-100h con inóculos nativos',
        ph: { start: 5.2, end: '3.8-4.0' },
        temp: '18-24°C',
        sca: '89-90',
        flavor: ['Ciruela', 'Uva negra', 'Cacao', 'Vinosidad'],
        science: 'Las cepas CL-113 y CB-113/114 fueron aisladas del microbioma de nuestra finca, creando un perfil irrepetible.',
        bestFor: ['experimental', 'blend'],
        color: '#7a4a8a'
    }
];

// ── STEP 4: DRYING METHODS ────────────────────────────────────────────────────
const DRYING_METHODS = [
    {
        id: 'solar',
        label: 'Secado Solar 100%',
        description: 'Camas africanas elevadas. 15-45 días según clima.',
        days: '15-45',
        benefit: 'Máxima preservación de aromáticos'
    },
    {
        id: 'hybrid',
        label: 'Híbrido (Solar + Mecánico)',
        description: 'Solar hasta 18% humedad, luego secado mecánico controlado.',
        days: '10-20 + 12-24h',
        benefit: 'Balance entre calidad y consistencia'
    },
    {
        id: 'mechanical',
        label: 'Mecánico Controlado',
        description: 'Secado en silos con temperatura y flujo de aire controlados.',
        days: '24-48h',
        benefit: 'Máxima consistencia y control'
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
                addToast('¡Configuración enviada!', 'success');
                setTimeout(() => navigate('/craftlab/success', { state: { config: result } }), 1500);
            } else {
                addToast('Error al enviar. Intenta de nuevo.', 'error');
            }
        } catch (err) {
            addToast('Error al enviar. Intenta de nuevo.', 'error');
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
                        <div className="cl-config-subtitle">Cargando tu configuración...</div>
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
                        {isSaving ? 'Guardando...' : `Paso ${currentStep} de 4`}
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
                        {config.variety ? VARIETIES.find(v => v.id === config.variety)?.label : 'DISEÑA TU LOTE'}
                        {config.protocol && ` · ${PROTOCOLS.find(p => p.id === config.protocol)?.label}`}
                    </div>
                </div>

                {/* CONTROLS PANEL */}
                <div className="cl-controls-panel">

                    {/* ═══ STEP 1: GOAL ═══ */}
                    <section className="config-section" id="sec-goal">
                        <div className="section-label">Paso 01</div>
                        <h2 className="section-title">¿Cuál es tu objetivo?</h2>
                        <p className="section-desc">Esto nos ayuda a recomendarte el protocolo ideal.</p>

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
                            <div className="section-label">Paso 02</div>
                            <h2 className="section-title">Selecciona la variedad</h2>
                            <p className="section-desc">Cultivadas en nuestra finca a 1,700 msnm en Zipacón, Colombia.</p>

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
                                                {v.available} kg disponibles
                                            </div>
                                            {v.limited && <span className="variety-limited">Muy limitado</span>}
                                        </div>

                                        {config.variety === v.id && (
                                            <div className="variety-expanded fade-in">
                                                <p>{v.description}</p>
                                                <div className="variety-meta">
                                                    <span>Altitud: {v.altitude}</span>
                                                    <span>Cosecha: {v.harvest}</span>
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
                            <div className="section-label">Paso 03</div>
                            <h2 className="section-title">Protocolo de fermentación</h2>
                            <p className="section-desc">5 protocolos desarrollados científicamente por nuestro equipo.</p>

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
                                            <div className="protocol-recommended-badge">Recomendado</div>
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
                                                <span className="param-label">Duración</span>
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
                            <div className="section-label">Paso 04</div>
                            <h2 className="section-title">Cantidad</h2>
                            <p className="section-desc">Cada caja contiene 12.5 kg de café verde (27.5 lbs).</p>

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
                                            <span className="quantity-label">{q.boxes} {q.boxes === 1 ? 'Caja' : 'Cajas'}</span>
                                            <span className="quantity-kg">{q.kg} kg</span>
                                        </div>
                                        {config.quantity === q.id && <Check size={18} className="quantity-check" />}
                                    </div>
                                ))}
                            </div>

                            {/* Advanced Options Toggle */}
                            <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                                <SlidersHorizontal size={16} />
                                <span>Opciones avanzadas</span>
                                <ChevronDown size={16} className={showAdvanced ? 'rotate-180' : ''} />
                            </button>

                            {showAdvanced && (
                                <div className="advanced-options fade-in">
                                    <h4>Método de secado</h4>
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
                                                label="Días de secado solar"
                                                min={15}
                                                max={45}
                                                step={1}
                                                value={config.solarDays}
                                                onChange={v => updateConfig('solarDays', v)}
                                                unit=" días"
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
                            <div className="section-label">Resumen</div>
                            <h2 className="section-title">Tu lote personalizado</h2>

                            <div className="summary-card">
                                <div className="summary-row">
                                    <span className="summary-label">Variedad</span>
                                    <span className="summary-value">{VARIETIES.find(v => v.id === config.variety)?.label}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Protocolo</span>
                                    <span className="summary-value">{PROTOCOLS.find(p => p.id === config.protocol)?.label}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Cantidad</span>
                                    <span className="summary-value">{config.quantity === '1box' ? '12.5 kg' : config.quantity === '2box' ? '25 kg' : '37.5 kg'}</span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row">
                                    <span className="summary-label">Precio base</span>
                                    <span className="summary-value">${pricing.base}</span>
                                </div>
                                {pricing.premium > 0 && (
                                    <div className="summary-row premium">
                                        <span className="summary-label">Premium variedad</span>
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
                                    {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}
                                </Button>
                                <p className="submit-note">
                                    Te contactaremos en 24h para confirmar disponibilidad y coordinar el pago.
                                </p>
                            </div>
                        </section>
                    )}

                </div>
            </div>

            {/* STICKY SUMMARY BAR */}
            <div className="cl-summary-bar">
                <div className="summary-bar-left">
                    <span>{config.variety ? VARIETIES.find(v => v.id === config.variety)?.label : 'Configura tu lote'}</span>
                </div>
                <div className="summary-bar-right">
                    {pricing.total > 0 && <span className="summary-bar-price">${pricing.total}</span>}
                </div>
            </div>

            {/* EXIT MODAL */}
            {showExitModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>¿Estás seguro?</h2>
                        <p>Tu configuración se perderá si sales ahora.</p>
                        <div className="modal-actions">
                            <Button variant="primary" size="full" onClick={confirmExit}>Sí, salir</Button>
                            <Button variant="outline" size="full" onClick={() => setShowExitModal(false)}>Quedarme</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
