import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Leaf, Coffee, TestTube2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import './ForwardBookingRoute.css';

export const ForwardBookingRoute: React.FC = () => {
    const navigate = useNavigate();

    // Load progress from localStorage
    const [progress] = React.useState({
        date: localStorage.getItem('fb_date'),
        variety: localStorage.getItem('fb_variety'),
        flavor: localStorage.getItem('fb_flavor'),
        process: localStorage.getItem('fb_process')
    });

    const allCompleted = progress.date && progress.variety && progress.flavor && progress.process;

    return (
        <div className="fb-route-container">
            {/* Header */}
            <header className="fb-header">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    <ChevronLeft size={24} />
                </button>
                <span className="fb-header-logo">Forward Booking</span>
                <div style={{ width: 24 }}></div> {/* Spacer for center alignment */}
            </header>

            {/* Main Content */}
            <main className="fb-route-main">
                <h1 className="fb-route-title">¿Where do you want to start?</h1>

                <div className="fb-route-grid">
                    {/* Date Card */}
                    <button
                        className={`route-card ${progress.date ? 'completed' : ''}`}
                        onClick={() => navigate('/forward-booking/date')}
                    >
                        <Calendar size={48} className="route-icon" />
                        <span>Date</span>
                        {progress.date && <div className="completed-check">✓</div>}
                    </button>

                    {/* Variety Card */}
                    <button
                        className={`route-card ${progress.variety ? 'completed' : ''}`}
                        onClick={() => navigate('/forward-booking/variety')}
                    >
                        <Leaf size={48} className="route-icon" />
                        <span>Variety</span>
                        {progress.variety && <div className="completed-check">✓</div>}
                    </button>

                    {/* Flavor Card */}
                    <button
                        className={`route-card ${progress.flavor ? 'completed' : ''}`}
                        onClick={() => navigate('/forward-booking/flavor')}
                    >
                        <Coffee size={48} className="route-icon" />
                        <span>Flavor Profile</span>
                        {progress.flavor && <div className="completed-check">✓</div>}
                    </button>

                    {/* Process Card */}
                    <button
                        className={`route-card ${progress.process ? 'completed' : ''}`}
                        onClick={() => navigate('/forward-booking/process')}
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
