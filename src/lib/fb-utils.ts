import type { NavigateFunction } from 'react-router-dom';

export type FBStep = 'date' | 'variety' | 'flavor' | 'process';

export const FB_STEPS: FBStep[] = ['date', 'variety', 'flavor', 'process'];

export const getNextFBStep = (currentStep: FBStep): FBStep | 'quantity' => {
    const currentIndex = FB_STEPS.indexOf(currentStep);

    // Simple cycle: go through them in order, skipping ones that are already in localStorage?
    // User said "go through all 4 steps always".

    // Find next incomplete step
    for (let i = 1; i < FB_STEPS.length; i++) {
        const nextIndex = (currentIndex + i) % FB_STEPS.length;
        const nextStep = FB_STEPS[nextIndex];
        if (!localStorage.getItem(`fb_${nextStep}`)) {
            return nextStep;
        }
    }

    // If all 4 core steps are done, go to quantity
    return 'quantity';
};

export const navigateNextFBStep = (currentStep: FBStep, navigate: NavigateFunction) => {
    const next = getNextFBStep(currentStep);
    if (next === 'quantity') {
        navigate('/forward-booking/quantity');
    } else {
        navigate(`/forward-booking/${next}`);
    }
};

export const isFBStarted = () => {
    return localStorage.getItem('fb_started') === 'true';
};

export const startFB = (firstStep: FBStep, navigate: NavigateFunction) => {
    localStorage.setItem('fb_started', 'true');
    navigate(`/forward-booking/${firstStep}`);
};
