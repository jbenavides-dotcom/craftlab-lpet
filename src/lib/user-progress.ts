import { supabase } from './supabase';

export const checkEducationCompletion = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('user_progress')
        .select('education_completed')
        .eq('user_id', user.id)
        .single();

    if (error || !data) return false;
    return data.education_completed;
};

export const markEducationAsCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: user.id,
            education_completed: true,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error marking education as completed:', error);
    } else {
        localStorage.setItem('craftlab_unlocked', 'true');
    }
};
