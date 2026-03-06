import React from 'react';
import { Calendar, Leaf, Coffee, TestTube2 } from 'lucide-react';
import './Stepper.css';

import { getStepsSequence } from '../../lib/fb-utils';
import type { FBStep } from '../../lib/fb-utils';

interface StepperProps {
    currentStep: FBStep;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    const sequence = getStepsSequence();

    const getIcon = (step: FBStep) => {
        switch (step) {
            case 'process': return <TestTube2 size={24} />;
            case 'date': return <Calendar size={24} />;
            case 'variety': return <Leaf size={24} />;
            case 'flavor': return <Coffee size={24} />;
        }
    };

    return (
        <div className="fb-stepper">
            {sequence.map((step, index) => (
                <React.Fragment key={step}>
                    <div className={`step-item ${currentStep === step ? 'active' : ''}`}>
                        {getIcon(step)}
                    </div>
                    {index < sequence.length - 1 && <div className="step-line"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};
