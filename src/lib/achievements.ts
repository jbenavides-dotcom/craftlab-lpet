import type { Achievement, AchievementId } from '../components/ui/AchievementBadge';

// Re-export types for convenience
export type { Achievement, AchievementId };

const STORAGE_KEY = 'craftlab_achievements';
const PROFILES_KEY = 'craftlab_profiles_tried';

// Achievement definitions
export const ACHIEVEMENTS: Record<AchievementId, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
    'first-steps': {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Completed the coffee education module',
        icon: 'book',
    },
    'coffee-scientist': {
        id: 'coffee-scientist',
        title: 'Coffee Scientist',
        description: 'Configured your first custom lot',
        icon: 'coffee',
    },
    'flavor-explorer': {
        id: 'flavor-explorer',
        title: 'Flavor Explorer',
        description: 'Tried all three macro profiles',
        icon: 'palette',
    },
    'precision-master': {
        id: 'precision-master',
        title: 'Precision Master',
        description: 'Used advanced parameters in configuration',
        icon: 'settings',
    },
};

interface AchievementState {
    unlocked: boolean;
    unlockedAt?: string;
}

type AchievementsStorage = Record<AchievementId, AchievementState>;

// Get all achievements with their unlock status
export const getAchievements = (): Achievement[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storage: AchievementsStorage = stored ? JSON.parse(stored) : {};

    return Object.values(ACHIEVEMENTS).map(achievement => ({
        ...achievement,
        unlocked: storage[achievement.id]?.unlocked || false,
        unlockedAt: storage[achievement.id]?.unlockedAt,
    }));
};

// Get a single achievement
export const getAchievement = (id: AchievementId): Achievement => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storage: AchievementsStorage = stored ? JSON.parse(stored) : {};
    const achievement = ACHIEVEMENTS[id];

    return {
        ...achievement,
        unlocked: storage[id]?.unlocked || false,
        unlockedAt: storage[id]?.unlockedAt,
    };
};

// Unlock an achievement - returns true if newly unlocked
export const unlockAchievement = (id: AchievementId): boolean => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storage: AchievementsStorage = stored ? JSON.parse(stored) : {};

    // Already unlocked
    if (storage[id]?.unlocked) {
        return false;
    }

    // Unlock it
    storage[id] = {
        unlocked: true,
        unlockedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    return true;
};

// Check if an achievement is unlocked
export const isAchievementUnlocked = (id: AchievementId): boolean => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const storage: AchievementsStorage = JSON.parse(stored);
    return storage[id]?.unlocked || false;
};

// Track macro profile usage for Flavor Explorer achievement
export const trackMacroProfile = (profile: string): AchievementId | null => {
    const stored = localStorage.getItem(PROFILES_KEY);
    const profiles: string[] = stored ? JSON.parse(stored) : [];

    if (!profiles.includes(profile)) {
        profiles.push(profile);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }

    // Check if all 3 profiles tried
    const allProfiles = ['fermented', 'bright', 'classic'];
    const hasAllProfiles = allProfiles.every(p => profiles.includes(p));

    if (hasAllProfiles) {
        const newlyUnlocked = unlockAchievement('flavor-explorer');
        return newlyUnlocked ? 'flavor-explorer' : null;
    }

    return null;
};

// Get unlocked achievements count
export const getUnlockedCount = (): number => {
    const achievements = getAchievements();
    return achievements.filter(a => a.unlocked).length;
};

// Check and unlock achievements based on current state
// Returns array of newly unlocked achievement IDs
export const checkAndUnlockAchievements = (context: {
    educationCompleted?: boolean;
    configSubmitted?: boolean;
    usedAdvancedParams?: boolean;
    macroProfile?: string;
}): AchievementId[] => {
    const newlyUnlocked: AchievementId[] = [];

    // First Steps - completed education
    if (context.educationCompleted) {
        if (unlockAchievement('first-steps')) {
            newlyUnlocked.push('first-steps');
        }
    }

    // Coffee Scientist - configured first lot
    if (context.configSubmitted) {
        if (unlockAchievement('coffee-scientist')) {
            newlyUnlocked.push('coffee-scientist');
        }
    }

    // Precision Master - used advanced parameters
    if (context.usedAdvancedParams) {
        if (unlockAchievement('precision-master')) {
            newlyUnlocked.push('precision-master');
        }
    }

    // Flavor Explorer - track macro profile
    if (context.macroProfile) {
        const flavorExplorerUnlocked = trackMacroProfile(context.macroProfile);
        if (flavorExplorerUnlocked) {
            newlyUnlocked.push(flavorExplorerUnlocked);
        }
    }

    return newlyUnlocked;
};
