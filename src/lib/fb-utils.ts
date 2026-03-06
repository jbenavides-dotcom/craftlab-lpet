import type { NavigateFunction } from 'react-router-dom';

export type FBStep = 'date' | 'variety' | 'flavor' | 'process';

export const FB_STEPS: FBStep[] = ['date', 'variety', 'flavor', 'process'];

export const getStepsSequence = (): FBStep[] => {
    const startStep = localStorage.getItem('fb_start_step') as FBStep;
    if (!startStep) return FB_STEPS;

    const sequence: FBStep[] = [startStep];
    const others = FB_STEPS.filter(s => s !== startStep);
    return [...sequence, ...others];
};

export const getNextFBStep = (currentStep: FBStep): FBStep | 'quantity' => {
    const sequence = getStepsSequence();
    const currentIndex = sequence.indexOf(currentStep);

    // Simple cycle: go through them in order, skipping ones that are already in localStorage?
    // User said "go through all 4 steps always".

    // Find next incomplete step in the dynamic sequence
    for (let i = 1; i < sequence.length; i++) {
        const nextIndex = (currentIndex + i) % sequence.length;
        const nextStep = sequence[nextIndex];
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
    localStorage.setItem('fb_start_step', firstStep);
    navigate(`/forward-booking/${firstStep}`);
};
