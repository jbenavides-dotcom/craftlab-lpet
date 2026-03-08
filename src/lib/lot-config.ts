import { supabase } from './supabase';

// Types
export interface LotConfiguration {
    id?: string;
    user_id?: string;
    status: 'draft' | 'submitted' | 'processing' | 'completed';
    macro: string | null;
    flavor: string | null;
    variety: string | null;
    quantity: string | null;
    category: string | null;
    process: string | null;
    stabilization: number | null;
    cherry_ferm: number | null;
    mucilage_ferm: number | null;
    solar_dry: number | null;
    mech_dry: number | null;
    created_at?: string;
    updated_at?: string;
    submitted_at?: string | null;
}

// Default empty configuration
export const emptyConfig: Omit<LotConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
    status: 'draft',
    macro: null,
    flavor: null,
    variety: null,
    quantity: null,
    category: null,
    process: null,
    stabilization: null,
    cherry_ferm: null,
    mucilage_ferm: null,
    solar_dry: null,
    mech_dry: null,
    submitted_at: null,
};

/**
 * Load user's draft configuration (if exists)
 */
export const loadDraftConfig = async (): Promise<LotConfiguration | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('lot_configurations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;
    return data as LotConfiguration;
};

/**
 * Save or update draft configuration
 */
export const saveDraftConfig = async (config: Partial<LotConfiguration>): Promise<LotConfiguration | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if draft exists
    const existing = await loadDraftConfig();

    if (existing) {
        // Update existing draft
        const { data, error } = await supabase
            .from('lot_configurations')
            .update({
                ...config,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating draft:', error);
            return null;
        }
        return data as LotConfiguration;
    } else {
        // Create new draft
        const { data, error } = await supabase
            .from('lot_configurations')
            .insert({
                user_id: user.id,
                status: 'draft',
                ...config,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating draft:', error);
            return null;
        }
        return data as LotConfiguration;
    }
};

/**
 * Submit configuration (change status from draft to submitted)
 */
export const submitConfig = async (): Promise<LotConfiguration | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const existing = await loadDraftConfig();
    if (!existing) return null;

    const { data, error } = await supabase
        .from('lot_configurations')
        .update({
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

    if (error) {
        console.error('Error submitting config:', error);
        return null;
    }
    return data as LotConfiguration;
};

/**
 * Delete draft configuration
 */
export const deleteDraftConfig = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('lot_configurations')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'draft');

    if (error) {
        console.error('Error deleting draft:', error);
        return false;
    }
    return true;
};

/**
 * Get all user's configurations (history)
 */
export const getUserConfigs = async (): Promise<LotConfiguration[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('lot_configurations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading configs:', error);
        return [];
    }
    return data as LotConfiguration[];
};
