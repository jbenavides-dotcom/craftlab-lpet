import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './FinalSteps.css';

export const ReviewConfirm: React.FC = () => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="fb-final-container">
            <header className="fb-final-header">
                <div style={{ width: 24 }}></div>
                <span className="fb-final-title">Review Terms</span>
                <button className="close-btn" onClick={() => navigate('/forward-booking/route')}>
                    <X size={24} />
                </button>
            </header>

            <main className="fb-final-main">
                <div className="legal-text-box">
                    <h2>Forward Booking Agreement</h2>
                    <p>
                        By securing your coffee in advance, you guarantee the highest quality selection
                        and directly support the smallholder farmers of our <strong>Neighbors & Crops</strong> program.
                    </p>
                    <p>
                        Production is strictly limited to <strong>500 bags of 35 kg</strong> per year.
                        Your reservation is a commitment to purchase the selected lot upon completion of the
                        harvesting and processing stages.
                    </p>
                    <p>
                        You agree to the processing times which can vary slightly due to natural fermentation
                        and drying conditions. Final shipment details will be coordinated once the lot is ready.
                    </p>
                </div>

                <label className="agreement-checkbox">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span>I have read and agree to the exclusivity and terms of Forward Booking.</span>
                </label>
            </main>

            <div className="fb-final-footer">
                <Button
                    variant="primary"
                    size="full"
                    disabled={!agreed}
                    onClick={() => navigate('/forward-booking/success')}
                >
                    Confirm and Place Order
                </Button>
            </div>
        </div>
    );
};
