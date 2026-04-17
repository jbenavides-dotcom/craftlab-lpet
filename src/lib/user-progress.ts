import { supabase } from './supabase';

// Legacy localStorage key used before this rename — kept for migration fallback
const LEGACY_LS_KEY = 'education_completed';
const LS_KEY = 'craftlab_unlocked';

export const checkCraftLabUnlocked = async (): Promise<boolean> => {
    // 1. Fast localStorage check (covers offline + already-migrated users)
    if (localStorage.getItem(LS_KEY) === 'true') return true;

    // 2. Retrocompat: migrate legacy key on first check
    if (localStorage.getItem(LEGACY_LS_KEY) === 'true') {
        localStorage.setItem(LS_KEY, 'true');
        localStorage.removeItem(LEGACY_LS_KEY);
        return true;
    }

    // 3. Source of truth: Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // TODO: rename column in Supabase to craftlab_unlocked
    const { data, error } = await supabase
        .from('user_progress')
        .select('education_completed')
        .eq('user_id', user.id)
        .single();

    if (error || !data) return false;

    const unlocked: boolean = data.education_completed ?? false;

    // Warm localStorage so next call is instant
    if (unlocked) localStorage.setItem(LS_KEY, 'true');

    return unlocked;
};

// Keep old name as alias so any future callers don't silently break
export const checkEducationCompletion = checkCraftLabUnlocked;

export const unlockCraftLab = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: rename column in Supabase to craftlab_unlocked
    const { error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: user.id,
            education_completed: true, // column name in DB — rename when migration runs
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error unlocking CraftLab:', error);
    } else {
        localStorage.setItem(LS_KEY, 'true');
        // Clean up legacy key if present
        localStorage.removeItem(LEGACY_LS_KEY);
    }
};

// Keep old name as alias
export const markEducationAsCompleted = unlockCraftLab;
