import { supabase } from './supabase';

// Legacy localStorage key (pre-rename)
const LEGACY_LS_KEY = 'education_completed';
const LS_KEY = 'craftlab_unlocked';

export const checkCraftLabUnlocked = async (): Promise<boolean> => {
    // 1. Fast localStorage check (covers offline + already-cached)
    if (localStorage.getItem(LS_KEY) === 'true') return true;

    // 2. Retrocompat: migrate legacy key on first check
    if (localStorage.getItem(LEGACY_LS_KEY) === 'true') {
        localStorage.setItem(LS_KEY, 'true');
        localStorage.removeItem(LEGACY_LS_KEY);
        return true;
    }

    // 3. Source of truth: Supabase user_progress table
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('user_progress')
        .select('craftlab_unlocked')
        .eq('user_id', user.id)
        .single();

    if (error || !data) return false;

    const unlocked: boolean = data.craftlab_unlocked ?? false;

    // Warm localStorage for instant subsequent reads
    if (unlocked) localStorage.setItem(LS_KEY, 'true');

    return unlocked;
};

// Alias retrocompat
export const checkEducationCompletion = checkCraftLabUnlocked;

export const unlockCraftLab = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // No auth session → al menos cachear local
        localStorage.setItem(LS_KEY, 'true');
        return;
    }

    const { error } = await supabase
        .from('user_progress')
        .update({
            craftlab_unlocked: true,
            quiz_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error unlocking CraftLab in DB:', error);
    }

    localStorage.setItem(LS_KEY, 'true');
    localStorage.removeItem(LEGACY_LS_KEY);
};

// Alias retrocompat
export const markEducationAsCompleted = unlockCraftLab;

// Helper: lee los puntos del usuario actual
export const getUserPoints = async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data } = await supabase
        .from('user_progress')
        .select('points')
        .eq('user_id', user.id)
        .single();

    return data?.points ?? 0;
};
