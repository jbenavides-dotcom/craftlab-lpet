import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './FinalSteps.css';

export const Success: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="fb-final-container" style={{ backgroundColor: 'var(--color-white)' }}>
            <main className="success-main">
                <div className="success-icon-wrapper">
                    <Check size={48} strokeWidth={3} />
                </div>
                <h1 className="success-title">You've completed<br />your order!</h1>
                <p className="success-text">Your Forward Booking reservation has been confirmed.</p>

                <Button
                    variant="primary"
                    size="full"
                    onClick={() => navigate('/orders')}
                    className="mt-md"
                >
                    Go to Orders
                </Button>
            </main>
        </div>
    );
};
