import React from 'react';
import './Slider.css';

interface SliderProps {
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number | null;
    onChange: (value: number) => void;
    unit?: string;
}

export const Slider: React.FC<SliderProps> = ({
    label,
    min,
    max,
    step = 1,
    value,
    onChange,
    unit = ''
}) => {
    // Use min as fallback if null
    const displayValue = value !== null ? value : min;
    const sliderId = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="slider-container">
            <div className="slider-header">
                <label htmlFor={sliderId} className="slider-label">{label}</label>
                <span className="slider-value" aria-live="polite">{displayValue}{unit}</span>
            </div>

            <input
                type="range"
                id={sliderId}
                className="slider-input"
                min={min}
                max={max}
                step={step}
                value={displayValue}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={displayValue}
                aria-valuetext={`${displayValue}${unit}`}
            />

            <div className="slider-marks" aria-hidden="true">
                <span className="slider-mark">{min}{unit}</span>
                <span className="slider-mark">{max}{unit}</span>
            </div>
        </div>
    );
};
