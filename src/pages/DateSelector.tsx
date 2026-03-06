import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Stepper } from '../components/ui/Stepper';
import { Modal } from '../components/ui/Modal';
import { navigateNextFBStep } from '../lib/fb-utils';
import './Selectors.css';

export const DateSelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<string | null>(localStorage.getItem('fb_date'));
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const dates = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];

    const handleSave = () => {
        if (selectedDate) {
            localStorage.setItem('fb_date', selectedDate);
            navigateNextFBStep('date', navigate);
        }
    };

    return (
        <div className="selector-container">
            <header className="selector-header">
                <div className="header-left-actions">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <img
                        src="https://res.cloudinary.com/dtkwqoadf/image/upload/v1735702592/logo_horizontal_ss9bvn.png"
                        alt="Logo"
                        className="brand-logo-small"
                    />
                </div>

                <Stepper currentStep="date" />

                <button className="close-btn" onClick={() => setShowExitConfirm(true)}>
                    <X size={24} />
                </button>
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

            <main className="selector-main">
                <h1 className="selector-title">Select Harvest Date</h1>

                <div className="date-grid">
                    {dates.map((date) => (
                        <button
                            key={date}
                            className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                            onClick={() => setSelectedDate(date)}
                        >
                            {date}
                        </button>
                    ))}
                </div>

                <button
                    className={`earliest-btn ${selectedDate === 'earliest' ? 'active' : ''}`}
                    onClick={() => setSelectedDate('earliest')}
                >
                    Earliest Availability
                </button>
            </main>

            <div className="selector-footer">
                <Button
                    variant="secondary"
                    size="full"
                    disabled={!selectedDate}
                    onClick={handleSave}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};
