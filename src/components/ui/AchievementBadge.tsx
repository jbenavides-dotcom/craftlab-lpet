import React from 'react';
import { Award, BookOpen, Coffee, Palette, Settings } from 'lucide-react';
import './AchievementBadge.css';

export type AchievementId = 'first-steps' | 'coffee-scientist' | 'flavor-explorer' | 'precision-master';

export interface Achievement {
    id: AchievementId;
    title: string;
    description: string;
    icon: 'award' | 'book' | 'coffee' | 'palette' | 'settings';
    unlocked: boolean;
    unlockedAt?: string;
}

interface AchievementBadgeProps {
    achievement: Achievement;
    size?: 'sm' | 'md' | 'lg';
    showAnimation?: boolean;
}

const ICONS = {
    award: Award,
    book: BookOpen,
    coffee: Coffee,
    palette: Palette,
    settings: Settings,
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    size = 'md',
    showAnimation = false,
}) => {
    const Icon = ICONS[achievement.icon];
    const iconSizes = { sm: 16, md: 20, lg: 28 };

    return (
        <div
            className={`achievement-badge achievement-${size} ${
                achievement.unlocked ? 'unlocked' : 'locked'
            } ${showAnimation && achievement.unlocked ? 'animate-unlock' : ''}`}
        >
            <div className="achievement-icon">
                <Icon size={iconSizes[size]} />
            </div>
            <div className="achievement-content">
                <h4 className="achievement-title">{achievement.title}</h4>
                <p className="achievement-desc">{achievement.description}</p>
            </div>
            {achievement.unlocked && showAnimation && (
                <div className="achievement-glow" />
            )}
        </div>
    );
};

// Compact inline badge for lists
interface BadgeInlineProps {
    achievement: Achievement;
}

export const AchievementBadgeInline: React.FC<BadgeInlineProps> = ({ achievement }) => {
    const Icon = ICONS[achievement.icon];

    return (
        <div className={`achievement-inline ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
            <div className="achievement-inline-icon">
                <Icon size={14} />
            </div>
            <span className="achievement-inline-title">{achievement.title}</span>
        </div>
    );
};
