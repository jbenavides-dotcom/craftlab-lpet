import React, { useState } from 'react';
import { ChevronDown, MapPin, Mountain, Clock, Award } from 'lucide-react';
import './ProducerCard.css';

export interface ProducerProfile {
    name: string;
    role: string;
    years: number;
    farm: string;
    region: string;
    elevation: string;
    story: string;
    specialty: string;
    photo: string;
}

interface ProducerCardProps {
    producer: ProducerProfile;
    varietyKey?: string;
}

export const PRODUCERS: Record<string, ProducerProfile> = {
    geisha: {
        name: 'Sergio Barrera',
        role: 'Jefe de Beneficio y Calidades',
        years: 5,
        farm: 'Hacienda Santa Elisa',
        region: 'Zipacón, Cundinamarca',
        elevation: '1,700 msnm',
        story: 'Sergio ingresó sin conocimiento cafetero y se desarrolló empíricamente hasta dominar los 5 protocolos de fermentación. "La fermentación es un proceso microbiológico donde bacterias, mohos y levaduras transforman azúcares en precursores de sabor."',
        specialty: 'Diseñador de los protocolos Láctico LPX y Bio-Innovation',
        photo: 'https://res.cloudinary.com/dxjlvlcao/image/upload/v1741403046/SERGIO-4_nnb9fm.jpg'
    },
    sidra: {
        name: 'Ismelda Cubillos',
        role: 'Coordinadora de Laboratorio de Calidad',
        years: 8,
        farm: 'Hacienda Santa Elisa',
        region: 'Zipacón, Cundinamarca',
        elevation: '1,700 msnm',
        story: 'Con 8 años en La Palma & El Tucán, Ismelda pasó de selección manual a coordinar todo el análisis sensorial. Evalúa cada lote según los 10 parámetros SCA y correlaciona resultados con los procesos de beneficio.',
        specialty: 'Análisis sensorial y físico de cada bache',
        photo: 'https://res.cloudinary.com/dxjlvlcao/image/upload/v1741403042/ISMELDA-2_etaflk.jpg'
    },
    java: {
        name: 'Katherine Rodríguez',
        role: 'Coordinadora de Inventario y Trazabilidad',
        years: 4,
        farm: 'Hacienda Santa Elisa',
        region: 'Zipacón, Cundinamarca',
        elevation: '1,700 msnm',
        story: 'Katherine mantiene el sistema de trazabilidad completo: desde el bache de cereza hasta el nanolote final. Cada código cuenta la historia del café: variedad, proceso, fecha, y destino.',
        specialty: 'Sistema de trazabilidad y conformación de nanolotes',
        photo: 'https://res.cloudinary.com/dxjlvlcao/image/upload/v1741403041/KATHERINE-2_xvwdok.jpg'
    },
    bourbon: {
        name: 'Equipo de Secado',
        role: 'Especialistas en Secado Solar',
        years: 3,
        farm: 'Hacienda Santa Elisa',
        region: 'Zipacón, Cundinamarca',
        elevation: '1,700 msnm',
        story: 'El secado en Zipacón es uno de los mayores desafíos por el clima variable. El equipo maneja camas africanas y marquesinas, monitoreando humedad hasta alcanzar 10-12% según estándar SCA.',
        specialty: 'Secado solar controlado de 15-45 días',
        photo: 'https://res.cloudinary.com/dxjlvlcao/image/upload/v1741403040/SECADO-1_qhwz1p.jpg'
    },
    mokka: {
        name: 'Felipe Sardi',
        role: 'Fundador y Director',
        years: 12,
        farm: 'La Palma & El Tucán',
        region: 'Zipacón, Cundinamarca',
        elevation: '1,700 msnm',
        story: 'Felipe fundó La Palma & El Tucán en 2012 con la visión de crear cafés de especialidad con prácticas regenerativas. "Same hands, seed to cup" - el mismo equipo que cultiva también tuesta.',
        specialty: 'Caficultura regenerativa y agricultura sostenible',
        photo: 'https://res.cloudinary.com/dxjlvlcao/image/upload/v1741403039/FELIPE-1_jqx2lk.jpg'
    },
    'gesha-sidra': {
        name: 'Sergio Barrera',
        role: 'Jefe de Beneficio y Calidades',
        years: 5,
        farm: 'Hacienda Santa Elisa',
        region: 'Zipacón, Cundinamarca',
        elevation: '1,700 msnm',
        story: 'Para los blends Gesha-Sidra, Sergio supervisa la co-fermentación de ambas variedades, ajustando tiempos y temperaturas para lograr un balance perfecto entre las notas florales de la Gesha y la intensidad frutal de la Sidra.',
        specialty: 'Diseñador de los protocolos Láctico LPX y Bio-Innovation',
        photo: 'https://res.cloudinary.com/dxjlvlcao/image/upload/v1741403046/SERGIO-4_nnb9fm.jpg'
    }
};

export const ProducerCard: React.FC<ProducerCardProps> = ({ producer }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="producer-card">
            <div className="producer-header">
                <div className="producer-photo-container">
                    <img
                        src={producer.photo}
                        alt={producer.name}
                        className="producer-photo"
                    />
                </div>
                <div className="producer-info">
                    <h3 className="producer-name">{producer.name}</h3>
                    <p className="producer-role">{producer.role}</p>
                    <div className="producer-meta">
                        <span className="producer-meta-item">
                            <Clock size={12} />
                            {producer.years} años
                        </span>
                        <span className="producer-meta-item">
                            <MapPin size={12} />
                            {producer.region}
                        </span>
                    </div>
                </div>
            </div>

            {/* Specialty Badge */}
            <div className="producer-specialty">
                <Award size={14} />
                <span>{producer.specialty}</span>
            </div>

            {/* Farm Info Bar */}
            <div className="producer-farm-bar">
                <span className="producer-farm-name">{producer.farm}</span>
                <span className="producer-elevation">
                    <Mountain size={12} />
                    {producer.elevation}
                </span>
            </div>

            <button
                className={`producer-expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>Conoce a {producer.name.split(' ')[0]}</span>
                <ChevronDown size={16} className={isExpanded ? 'rotate' : ''} />
            </button>

            {isExpanded && (
                <div className="producer-expanded">
                    <div className="producer-section">
                        <h4 className="producer-section-title">Su Historia</h4>
                        <p className="producer-section-text">{producer.story}</p>
                    </div>

                    <div className="producer-section producer-highlight">
                        <h4 className="producer-section-title">Experiencia</h4>
                        <div className="producer-experience-grid">
                            <div className="experience-item">
                                <span className="experience-value">{producer.years}</span>
                                <span className="experience-label">Años en LPET</span>
                            </div>
                            <div className="experience-item">
                                <span className="experience-value">{producer.elevation}</span>
                                <span className="experience-label">Altitud</span>
                            </div>
                        </div>
                    </div>

                    <div className="producer-section">
                        <h4 className="producer-section-title">Especialidad</h4>
                        <p className="producer-section-text">{producer.specialty}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
