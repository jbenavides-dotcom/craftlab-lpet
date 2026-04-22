import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import './Selectors.css';

export function ReviewConfirm() {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!agreed || submitting) return;
        setSubmitting(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('Session expired. Please sign in again.');
            setSubmitting(false);
            navigate('/login');
            return;
        }

        const { error: insertError } = await supabase.from('fb_orders').insert({
            user_id: user.id,
            harvest_date:    localStorage.getItem('fb_date')    || null,
            variety:         localStorage.getItem('fb_variety') || null,
            flavor_profile:  localStorage.getItem('fb_flavor')  || null,
            process:         localStorage.getItem('fb_process') || null,
            bag_size:        35,
            quantity:        1,
            agreed_to_terms: true,
            status:          'pending',
            points_earned:   5000,
        });

        if (insertError) {
            console.error('Error creating FB order:', insertError);
            setError('Could not place order. Try again.');
            setSubmitting(false);
            return;
        }

        // Limpiar las keys de localStorage del flujo FB
        ['fb_date', 'fb_variety', 'fb_flavor', 'fb_process', 'fb_started'].forEach(k => localStorage.removeItem(k));

        navigate('/forward-booking/success');
    };

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
                <span className="ds-header-title">Review &amp; confirm</span>
                <div className="ds-header-spacer" aria-hidden="true" />
            </header>

            <main className="ds-main fs-main-compact">
                <h1 className="ds-title fs-title-compact">Your order summary</h1>

                {/* Order summary card */}
                <div className="rc-summary-card">
                    <div className="rc-summary-row">
                        <span className="rc-summary-label">Harvest</span>
                        <span className="rc-summary-value">{localStorage.getItem('fb_date') || '—'}</span>
                    </div>
                    <div className="rc-summary-row">
                        <span className="rc-summary-label">Variety</span>
                        <span className="rc-summary-value">{localStorage.getItem('fb_variety') || '—'}</span>
                    </div>
                    <div className="rc-summary-row">
                        <span className="rc-summary-label">Flavor</span>
                        <span className="rc-summary-value">{localStorage.getItem('fb_flavor') || '—'}</span>
                    </div>
                    <div className="rc-summary-row">
                        <span className="rc-summary-label">Process</span>
                        <span className="rc-summary-value">{localStorage.getItem('fb_process') || '—'}</span>
                    </div>
                    <div className="rc-divider" />
                    <div className="rc-summary-row">
                        <span className="rc-summary-label">Bag size</span>
                        <span className="rc-summary-value">35 kg</span>
                    </div>
                    <div className="rc-summary-row">
                        <span className="rc-summary-label">Quantity</span>
                        <span className="rc-summary-value">12 bags</span>
                    </div>
                    <div className="rc-summary-row">
                        <span className="rc-summary-label">Total weight</span>
                        <span className="rc-summary-value">420 kg</span>
                    </div>
                </div>

                {/* Agreement section */}
                <h3 className="rc-legal-title">Forward Booking Agreement</h3>
                <p className="rc-legal-body">
                    Neighbors &amp; Crops coffees are exclusive to Forward Booking, limited to 500 bags/year.
                    Your reservation commits you to purchase upon completion of harvesting and processing.
                    Shipment timing may vary slightly with natural fermentation conditions.
                </p>

                {/* Custom checkbox */}
                <label className="rc-checkbox">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span className={`rc-checkbox-box${agreed ? ' checked' : ''}`}>
                        {agreed && <Check size={14} strokeWidth={3} color="#ffffff" />}
                    </span>
                    <span className="rc-checkbox-label">
                        I have read and agree to the exclusivity and terms.
                    </span>
                </label>
            </main>

            <div className="ds-footer">
                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        marginBottom: '12px',
                    }}>{error}</div>
                )}
                <Button
                    variant="primary"
                    size="full"
                    disabled={!agreed || submitting}
                    isLoading={submitting}
                    onClick={handleConfirm}
                >
                    Confirm and Place Order
                </Button>
            </div>
        </div>
    );
}
