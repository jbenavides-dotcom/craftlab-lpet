import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './Selectors.css';

export function QuantitySelector() {
    const navigate = useNavigate();
    const [bagSize, setBagSize] = useState<35 | 70>(35);
    const [quantity, setQuantity] = useState(1);

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

    const totalWeight = bagSize * quantity;

    const summaryChips = [
        localStorage.getItem('fb_date') || '—',
        localStorage.getItem('fb_variety') || '—',
        localStorage.getItem('fb_flavor') || '—',
        localStorage.getItem('fb_process') || '—',
    ];

    return (
        <div className="selector-container">
            <header className="ds-header">
                <button
                    className="ds-header-close"
                    onClick={() => navigate('/forward-booking/route')}
                    aria-label="Back to selector"
                >
                    <X size={20} />
                </button>
                <span className="ds-header-title">Quantity &amp; packaging</span>
                <div className="ds-header-spacer" aria-hidden="true" />
            </header>

            <main className="ds-main fs-main-compact">
                {/* Summary chips */}
                <div className="qs-summary">
                    {summaryChips.map((val, i) => (
                        <span key={i} className="qs-summary-chip">{val}</span>
                    ))}
                </div>

                {/* Bag size toggle */}
                <section className="qs-section">
                    <h2 className="qs-section-title">Bag size</h2>
                    <div className="qs-bag-toggle">
                        <button
                            className={`qs-bag-btn${bagSize === 35 ? ' active' : ''}`}
                            onClick={() => setBagSize(35)}
                            aria-pressed={bagSize === 35}
                        >
                            35 kg
                        </button>
                        <button
                            className={`qs-bag-btn${bagSize === 70 ? ' active' : ''}`}
                            onClick={() => setBagSize(70)}
                            aria-pressed={bagSize === 70}
                        >
                            70 kg
                        </button>
                    </div>
                </section>

                {/* Quantity counter */}
                <section className="qs-section">
                    <h2 className="qs-section-title">Number of bags</h2>
                    <div className="qs-counter">
                        <button
                            className="qs-counter-btn"
                            onClick={handleDecrement}
                            disabled={quantity === 1}
                            aria-label="Decrease quantity"
                        >
                            <Minus size={22} />
                        </button>
                        <span className="qs-counter-value">{quantity}</span>
                        <button
                            className="qs-counter-btn"
                            onClick={handleIncrement}
                            aria-label="Increase quantity"
                        >
                            <Plus size={22} />
                        </button>
                    </div>
                </section>

                {/* Total weight card */}
                <div className="qs-total-card">
                    <span className="qs-total-label">Total weight</span>
                    <span className="qs-total-value">{totalWeight} kg</span>
                </div>
            </main>

            <div className="ds-footer">
                <Button
                    variant="primary"
                    size="full"
                    onClick={() => navigate('/forward-booking/review')}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
