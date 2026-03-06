import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Beaker, Thermometer, Wind, Play } from 'lucide-react';
import './CraftLabBasicEducation.css';

interface StorySlide {
    id: number;
    title: string;
    text: string;
    icon: React.ReactNode;
    color: string;
}

const slides: StorySlide[] = [
    {
        id: 1,
        title: "The Magic of Fermentation",
        text: "Fermentation isn't just a step in coffee processing; it's where the raw potential of the bean is unlocked and shaped.",
        icon: <Beaker size={80} />,
        color: "var(--color-pink-bg)"
    },
    {
        id: 2,
        title: "Metabolic Routes",
        text: "Temperature and Brix (sugar content) act as the steering wheel. Warmer temps speed up the process, bringing out intense fruit notes.",
        icon: <Thermometer size={80} />,
        color: "#fdf0d5" // Warm ochre tint
    },
    {
        id: 3,
        title: "Oxygen Matters",
        text: "An open tank (Aerobic) yields clean, smooth notes. A closed tank (Anaerobic) creates pressure and intense, boozy, tropical flavors.",
        icon: <Wind size={80} />,
        color: "#e0f2fe" // Light blue tint
    },
    {
        id: 4,
        title: "Seeing it in Action",
        text: "At our farm, cherries are floated, sorted, and placed into dedicated tanks where the magic begins. (Imagine a 15s video here).",
        icon: <Play size={80} />,
        color: "#f3e8ff" // Pale purple
    },
    {
        id: 5,
        title: "You are the Creator",
        text: "Now that you understand the basics, you are ready to manipulate these variables in CraftLab.",
        icon: <Beaker size={80} color="var(--color-pink-hot)" />,
        color: "var(--color-gray-light)"
    }
];

// Duration for auto-advance per slide (in ms)
const SLIDE_DURATION = 8000;

export const CraftLabBasicEducation: React.FC = () => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0); // 0 to 100 for current slide
    const navigate = useNavigate();

    // Progress bar animation loop
    useEffect(() => {
        let animationFrameId: number;
        const startTime = Date.now();

        const animateProgress = () => {
            const elapsed = Date.now() - startTime;
            const percentage = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
            setProgress(percentage);

            if (percentage < 100) {
                animationFrameId = requestAnimationFrame(animateProgress);
            } else {
                handleNext();
            }
        };

        animationFrameId = requestAnimationFrame(animateProgress);
        return () => cancelAnimationFrame(animationFrameId);
    }, [currentSlideIndex]);

    const handleNext = () => {
        if (currentSlideIndex < slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
            setProgress(0);
        } else {
            // Done with stories -> go to quiz
            navigate('/craftlab/education/quiz');
        }
    };

    const handlePrev = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
            setProgress(0);
        }
    };

    const currentSlide = slides[currentSlideIndex];

    return (
        <div className="education-stories-container" style={{ backgroundColor: currentSlide.color }}>

            {/* Progress Bars */}
            <div className="stories-progress-container">
                {slides.map((slide, index) => (
                    <div key={slide.id} className="story-progress-segment">
                        <div
                            className={`story-progress-fill ${index < currentSlideIndex ? 'completed' : ''}`}
                            style={{ width: index === currentSlideIndex ? `${progress}%` : undefined }}
                        />
                    </div>
                ))}
            </div>

            <button className="story-close" onClick={() => navigate('/home')}>
                <X size={28} />
            </button>

            {/* Invisible Tap Zones */}
            <div className="story-tap-zones">
                <div className="tap-zone-left" onClick={handlePrev}></div>
                <div className="tap-zone-right" onClick={handleNext}></div>
            </div>

            {/* Content */}
            <div className="story-content">
                <div className="story-visual">
                    {currentSlide.icon}
                </div>
                <h2 className="story-title">{currentSlide.title}</h2>
                <p className="story-text">{currentSlide.text}</p>
            </div>

        </div>
    );
};
