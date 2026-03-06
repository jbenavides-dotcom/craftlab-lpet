import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './FinalSteps.css';

export const QuantitySelector: React.FC = () => {
    const navigate = useNavigate();
    const [bagSize, setBagSize] = useState<35 | 70>(35);
    const [quantity, setQuantity] = useState(1);

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

    const totalWeight = bagSize * quantity;

    return (
        <div className="fb-final-container">
            <header className="fb-final-header">
                <div style={{ width: 24 }}></div> {/* Spacer */}
                <span className="fb-final-title">Quantity & Packaging</span>
                <button className="close-btn" onClick={() => navigate('/forward-booking/route')}>
                    <X size={24} />
                </button>
            </header>

            <main className="fb-final-main">
                {/* Dynamic choice summary mock */}
                <div className="summary-bar">
                    <div className="summary-item">Jan-Mar</div>
                    <div className="summary-item">Geisha</div>
                    <div className="summary-item">Fruity</div>
                    <div className="summary-item">Natural</div>
                </div>

                <section className="quantity-section">
                    <h2>Select Bag Size</h2>
                    <div className="bag-size-toggle">
                        <button
                            className={`bag-btn ${bagSize === 35 ? 'active' : ''}`}
                            onClick={() => setBagSize(35)}
                        >
                            35 kg
                        </button>
                        <button
                            className={`bag-btn ${bagSize === 70 ? 'active' : ''}`}
                            onClick={() => setBagSize(70)}
                        >
                            70 kg
                        </button>
                    </div>

                    <h2>Number of Bags</h2>
                    <div className="counter-container">
                        <button className="counter-btn" onClick={handleDecrement}>
                            <Minus size={24} />
                        </button>
                        <span className="counter-value">{quantity}</span>
                        <button className="counter-btn" onClick={handleIncrement}>
                            <Plus size={24} />
                        </button>
                    </div>

                    <div className="total-weight-display">
                        Total Weight: <strong>{totalWeight} kg</strong>
                    </div>
                </section>
            </main>

            <div className="fb-final-footer">
                <Button
                    variant="secondary"
                    size="full"
                    onClick={() => navigate('/forward-booking/review')}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};
