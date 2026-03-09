import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    variant?: 'text' | 'card' | 'circle' | 'configurator-option';
    width?: string | number;
    height?: string | number;
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1,
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        const styles: React.CSSProperties = {};

        if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
        if (height) styles.height = typeof height === 'number' ? `${height}px` : height;

        return styles;
    };

    const skeletonElement = (key?: number) => (
        <div
            key={key}
            className={`skeleton skeleton-${variant} ${className}`}
            style={getVariantStyles()}
            aria-hidden="true"
        />
    );

    if (count > 1) {
        return (
            <>
                {Array.from({ length: count }, (_, i) => skeletonElement(i))}
            </>
        );
    }

    return skeletonElement();
};

// Pre-composed skeleton for configurator sections
interface ConfiguratorSkeletonProps {
    optionCount?: number;
}

export const ConfiguratorSectionSkeleton: React.FC<ConfiguratorSkeletonProps> = ({
    optionCount = 3
}) => {
    return (
        <div className="skeleton-section">
            {/* Step label */}
            <Skeleton variant="text" width={60} height={12} className="skeleton-step-label" />
            {/* Section title */}
            <Skeleton variant="text" width="70%" height={28} className="skeleton-title" />
            {/* Section description */}
            <Skeleton variant="text" width="90%" height={16} className="skeleton-desc" />
            {/* Options list */}
            <div className="skeleton-options-list">
                <Skeleton variant="configurator-option" count={optionCount} />
            </div>
        </div>
    );
};

// Full configurator loading skeleton
export const ConfiguratorLoadingSkeleton: React.FC = () => {
    return (
        <div className="skeleton-configurator-layout">
            {/* Visual panel skeleton */}
            <div className="skeleton-visual-panel">
                <Skeleton variant="card" width="100%" height="100%" />
                <div className="skeleton-visual-tag">
                    <Skeleton variant="text" width={120} height={20} />
                </div>
            </div>

            {/* Controls panel skeleton */}
            <div className="skeleton-controls-panel">
                <ConfiguratorSectionSkeleton optionCount={3} />
            </div>
        </div>
    );
};
