import React from 'react';
import { Calendar, Leaf, Coffee, TestTube2 } from 'lucide-react';
import './Stepper.css';

interface StepperProps {
    currentStep: 'process' | 'date' | 'variety' | 'flavor';
}

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    return (
        <div className="fb-stepper">
            <div className={`step-item ${currentStep === 'process' ? 'active' : ''}`}>
                <TestTube2 size={24} />
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${currentStep === 'date' ? 'active' : ''}`}>
                <Calendar size={24} />
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${currentStep === 'variety' ? 'active' : ''}`}>
                <Leaf size={24} />
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${currentStep === 'flavor' ? 'active' : ''}`}>
                <Coffee size={24} />
            </div>
        </div>
    );
};
