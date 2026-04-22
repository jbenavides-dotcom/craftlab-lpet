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
    hideHeader?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
    label,
    min,
    max,
    step = 1,
    value,
    onChange,
    unit = '',
    hideHeader = false
}) => {
    // Use min as fallback if null
    const displayValue = value !== null ? value : min;

    return (
        <div className="slider-container">
            {!hideHeader && (
                <div className="slider-header">
                    <span className="slider-label">{label}</span>
                    <span className="slider-value">{displayValue}{unit}</span>
                </div>
            )}

            <input
                type="range"
                className="slider-input"
                min={min}
                max={max}
                step={step}
                value={displayValue}
                onChange={(e) => onChange(Number(e.target.value))}
                aria-label={label}
            />

            <div className="slider-marks">
                <span className="slider-mark">{min}{unit}</span>
                <span className="slider-mark">{max}{unit}</span>
            </div>
        </div>
    );
};
