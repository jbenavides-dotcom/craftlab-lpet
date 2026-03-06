import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Stepper } from '../components/ui/Stepper';
import './Selectors.css';

export const DateSelector: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<string | null>(localStorage.getItem('fb_date'));

    const dates = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];

    const handleSave = () => {
        if (selectedDate) {
            localStorage.setItem('fb_date', selectedDate);
            navigate('/forward-booking/route');
        }
    };

    return (
        <div className="selector-container">
            <header className="selector-header">
                <div style={{ width: 24 }}></div> {/* Spacer */}
                <Stepper currentStep="date" />
                <button className="close-btn" onClick={() => navigate('/forward-booking/route')}>
                    <X size={24} />
                </button>
            </header>

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
                    Save & Return
                </Button>
            </div>
        </div>
    );
};
