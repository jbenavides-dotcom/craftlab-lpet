import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Leaf, Coffee, TestTube2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { startFB } from '../lib/fb-utils';
import type { FBStep } from '../lib/fb-utils';
import './ForwardBookingRoute.css';

export const ForwardBookingRoute: React.FC = () => {
    const navigate = useNavigate();
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);

    // Load progress from localStorage
    const [progress] = React.useState({
        date: localStorage.getItem('fb_date'),
        variety: localStorage.getItem('fb_variety'),
        flavor: localStorage.getItem('fb_flavor'),
        process: localStorage.getItem('fb_process')
    });

    const isStarted = localStorage.getItem('fb_started') === 'true';

    React.useEffect(() => {
        // If already started and not all completed, go to the next incomplete step automatically
        // but only if we are specifically on this /route page.
        // Actually, the user says "it doesn't appear until another order".
        if (isStarted && !allCompleted) {
            // Find first incomplete
            const firstIncomplete = (['date', 'variety', 'flavor', 'process'] as FBStep[]).find(s => !localStorage.getItem(`fb_${s}`));
            if (firstIncomplete) {
                navigate(`/forward-booking/${firstIncomplete}`);
            }
        }
    }, [isStarted]);

    const allCompleted = progress.date && progress.variety && progress.flavor && progress.process;

    return (
        <div className="fb-route-container">
            {/* Header */}
            <header className="fb-header">
                <button className="back-btn" onClick={() => setShowExitConfirm(true)}>
                    <ChevronLeft size={24} />
                </button>
                <span className="fb-header-logo">Forward Booking</span>
                <div style={{ width: 24 }}></div>
            </header>

            <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '15px', color: 'var(--color-navy)' }}>Exit Forward Booking?</h2>
                    <p style={{ marginBottom: '25px', color: 'var(--color-gray-dark)' }}>
                        Your progress will be saved, but you will leave the booking process.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="outline" size="full" onClick={() => setShowExitConfirm(false)}>Cancel</Button>
                        <Button variant="secondary" size="full" onClick={() => navigate('/home')}>Exit</Button>
                    </div>
                </div>
            </Modal>

            {/* Main Content */}
            <main className="fb-route-main">
                <h1 className="fb-route-title">¿Where do you want to start?</h1>

                <div className="fb-route-grid">
                    {/* Date Card */}
                    <button
                        className={`route-card ${progress.date ? 'completed' : ''}`}
                        onClick={() => startFB('date', navigate)}
                    >
                        <Calendar size={48} className="route-icon" />
                        <span>Date</span>
                        {progress.date && <div className="completed-check">✓</div>}
                    </button>

                    {/* Variety Card */}
                    <button
                        className={`route-card ${progress.variety ? 'completed' : ''}`}
                        onClick={() => startFB('variety', navigate)}
                    >
                        <Leaf size={48} className="route-icon" />
                        <span>Variety</span>
                        {progress.variety && <div className="completed-check">✓</div>}
                    </button>

                    {/* Flavor Card */}
                    <button
                        className={`route-card ${progress.flavor ? 'completed' : ''}`}
                        onClick={() => startFB('flavor', navigate)}
                    >
                        <Coffee size={48} className="route-icon" />
                        <span>Flavor Profile</span>
                        {progress.flavor && <div className="completed-check">✓</div>}
                    </button>

                    {/* Process Card */}
                    <button
                        className={`route-card ${progress.process ? 'completed' : ''}`}
                        onClick={() => startFB('process', navigate)}
                    >
                        <TestTube2 size={48} className="route-icon" />
                        <span>Process</span>
                        {progress.process && <div className="completed-check">✓</div>}
                    </button>
                </div>
            </main>

            {/* Footer CTA */}
            <div className="fb-route-footer">
                <Button
                    variant="secondary"
                    size="full"
                    onClick={() => navigate('/forward-booking/quantity')}
                    disabled={!allCompleted}
                >
                    {allCompleted ? 'Continue' : 'Complete all steps'}
                </Button>
            </div>
        </div>
    );
};
