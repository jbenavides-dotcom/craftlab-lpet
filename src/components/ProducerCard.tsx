import React, { useState } from 'react';
import { ChevronDown, MapPin, Mountain } from 'lucide-react';
import './ProducerCard.css';

export interface ProducerData {
    id: string;
    name: string;
    farmName: string;
    elevation: string;
    region: string;
    photoUrl: string;
    quote: string;
    story: string;
    whySpecial: string;
    processingConnection: string;
}

interface ProducerCardProps {
    producer: ProducerData;
}

export const PRODUCERS: Record<string, ProducerData> = {
    geisha: {
        id: 'maria-rodriguez',
        name: 'Maria Rodriguez',
        farmName: 'Finca La Aurora',
        elevation: '1,850m',
        region: 'Huila, Colombia',
        photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop',
        quote: '"Every Geisha tree tells a story of patience. We wait three extra weeks for the cherries to reach their peak — that is where the jasmine hides."',
        story: 'Maria inherited La Aurora from her grandmother, who planted the first Geisha seedlings in 1987. For over 35 years, the Rodriguez family has perfected the art of growing this delicate variety at high altitude, where cool nights slow the maturation and intensify the aromatics.',
        whySpecial: 'Her microclimate produces some of the most aromatic Geisha in Colombia. The combination of volcanic soil, morning mist, and afternoon sun creates beans with exceptional floral complexity and a tea-like body that has won three Cup of Excellence awards.',
        processingConnection: 'Maria personally oversees each fermentation, adjusting times based on daily temperature readings and years of intuition passed down through generations.',
    },
    sidra: {
        id: 'carlos-mendez',
        name: 'Carlos Mendez',
        farmName: 'Finca El Paraiso',
        elevation: '1,920m',
        region: 'Huila, Colombia',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        quote: '"Sidra is wild by nature. My job is not to tame it, but to guide its intensity into something extraordinary."',
        story: 'Carlos discovered an abandoned plot of rare Sidra trees in 2015 and spent five years rehabilitating them. His scientific approach — combining traditional methods with modern fermentation monitoring — has made El Paraiso a destination for roasters seeking complex, fruit-forward lots.',
        whySpecial: 'The Sidra variety at El Paraiso produces exceptionally dense cherries with natural wine-like characteristics. Carlos has developed a signature extended fermentation protocol that amplifies tropical notes without losing structural integrity.',
        processingConnection: 'His precision fermentation tanks allow real-time pH and temperature monitoring, ensuring each lot reaches its full potential while maintaining the Sidra variety distinctive intensity.',
    },
    'gesha-sidra': {
        id: 'huila-collective',
        name: 'Huila Producer Collective',
        farmName: 'Multiple Farms',
        elevation: '1,800-1,950m',
        region: 'Huila, Colombia',
        photoUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop',
        quote: '"When we blend our harvests, we blend our families stories. The result is something none of us could create alone."',
        story: 'This cooperative of 12 family farms in the Huila highlands shares knowledge, resources, and a commitment to excellence. By combining the best Geisha and Sidra lots from different microclimates, they create blends with remarkable depth and consistency.',
        whySpecial: 'The collective selection process involves blind cupping sessions where producers vote on which lots complement each other. This collaborative approach captures the terroir diversity of the entire region in a single cup.',
        processingConnection: 'A shared processing facility allows standardized fermentation protocols while preserving each farm unique contribution. The blend is assembled only after individual lots are processed to their optimal profiles.',
    },
};

export const ProducerCard: React.FC<ProducerCardProps> = ({ producer }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="producer-card">
            <div className="producer-header">
                <div className="producer-photo-container">
                    <img
                        src={producer.photoUrl}
                        alt={producer.name}
                        className="producer-photo"
                    />
                </div>
                <div className="producer-info">
                    <h3 className="producer-name">{producer.name}</h3>
                    <p className="producer-farm">{producer.farmName}</p>
                    <div className="producer-meta">
                        <span className="producer-meta-item">
                            <Mountain size={12} />
                            {producer.elevation}
                        </span>
                        <span className="producer-meta-item">
                            <MapPin size={12} />
                            {producer.region}
                        </span>
                    </div>
                </div>
            </div>

            <blockquote className="producer-quote">
                {producer.quote}
            </blockquote>

            <button
                className={`producer-expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span>Learn more about {producer.name.split(' ')[0]}</span>
                <ChevronDown size={16} className={isExpanded ? 'rotate' : ''} />
            </button>

            {isExpanded && (
                <div className="producer-expanded">
                    <div className="producer-section">
                        <h4 className="producer-section-title">The Story</h4>
                        <p className="producer-section-text">{producer.story}</p>
                    </div>

                    <div className="producer-section">
                        <h4 className="producer-section-title">Why This Coffee is Special</h4>
                        <p className="producer-section-text">{producer.whySpecial}</p>
                    </div>

                    <div className="producer-section">
                        <h4 className="producer-section-title">Processing Connection</h4>
                        <p className="producer-section-text">{producer.processingConnection}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
