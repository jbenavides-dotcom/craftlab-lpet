import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './Selectors.css';

export function Success() {
    const navigate = useNavigate();

    useEffect(() => {
        Object.keys(localStorage)
            .filter(k => k.startsWith('fb_'))
            .forEach(k => localStorage.removeItem(k));
    }, []);

    return (
        <div className="selector-container" style={{ background: '#ffffff' }}>
            <main className="ss-main">
                <div className="ss-check-wrap">
                    <Check size={52} strokeWidth={3} color="#ffffff" />
                </div>

                <h1 className="ss-title">Order confirmed</h1>

                <p className="ss-subtitle">
                    Your Forward Booking reservation is being prepared.<br />
                    We'll keep you posted on every stage.
                </p>

                <div className="ss-points-badge">
                    <Star size={16} strokeWidth={2} fill="#854d0e" color="#854d0e" />
                    <span>+5,000 points earned</span>
                </div>
            </main>

            <div className="ss-footer">
                <Button
                    variant="primary"
                    size="full"
                    onClick={() => navigate('/orders')}
                >
                    Go to Orders
                </Button>
                <Button
                    variant="ghost"
                    size="full"
                    onClick={() => navigate('/home')}
                >
                    Return Home
                </Button>
            </div>
        </div>
    );
}
