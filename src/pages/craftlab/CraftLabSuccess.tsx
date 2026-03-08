import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import './CraftLabSuccess.css';

export const CraftLabSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const config = location.state?.config;

    return (
        <div className="cl-success-container">
            <div className="cl-success-content">
                <CheckCircle size={64} className="cl-success-icon" />
                <h1>Configuration Submitted!</h1>
                <p>Your custom coffee lot has been configured successfully.</p>

                {config && (
                    <div className="cl-success-summary">
                        <h3>Your Selection</h3>
                        <div className="cl-success-details">
                            {config.macro && <p><strong>Profile:</strong> {config.macro}</p>}
                            {config.flavor && <p><strong>Flavor:</strong> {config.flavor}</p>}
                            {config.variety && <p><strong>Variety:</strong> {config.variety}</p>}
                            {config.quantity && <p><strong>Quantity:</strong> {config.quantity}</p>}
                            {config.process && <p><strong>Process:</strong> {config.process}</p>}
                        </div>
                    </div>
                )}

                <p className="cl-success-note">
                    Our team will review your configuration and begin processing your lot.
                    You'll receive updates as your coffee progresses through each stage.
                </p>

                <div className="cl-success-actions">
                    <Button variant="primary" size="full" onClick={() => navigate('/home')}>
                        Back to Home
                    </Button>
                    <Button variant="outline" size="full" onClick={() => navigate('/orders')}>
                        View My Orders
                    </Button>
                </div>
            </div>
        </div>
    );
};
