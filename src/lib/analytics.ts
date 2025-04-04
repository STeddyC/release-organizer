import { supabase } from './supabase';
import { auth } from './firebase';
import toast from 'react-hot-toast';

export type AnalyticsEventType = 'view' | 'submission' | 'approval' | 'rejection';

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  release_id: string;
  type: AnalyticsEventType;
  created_at: string;
}

export async function trackEvent(releaseId: string, type: AnalyticsEventType): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('analytics')
      .insert([{
        user_id: user.uid,
        release_id: releaseId,
        type
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return false;
  }
}

export async function getAnalytics(startDate?: Date, endDate?: Date) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('analytics')
      .select(`
        *,
        releases (
          name,
          artist,
          type
        )
      `)
      .eq('user_id', user.uid);

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching analytics:', error);
    toast.error('Failed to load analytics');
    return [];
  }
}

export async function getSubscriptionTier(): Promise<'basic' | 'pro' | 'label'> {
  try {
    const user = auth.currentUser;
    if (!user) return 'basic';

    const { data, error } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.uid)
      .eq('active', true)
      .lte('current_period_start', new Date().toISOString())
      .gte('current_period_end', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data?.tier || 'basic';
  } catch (error) {
    console.error('Error fetching subscription tier:', error);
    return 'basic';
  }
}

export async function checkReleaseLimit(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const tier = await getSubscriptionTier();
    if (tier === 'pro' || tier === 'label') return true;

    // For basic tier, check monthly limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('releases')
      .select('id', { count: 'exact' })
      .eq('user_id', user.uid)
      .gte('created_at', startOfMonth.toISOString());

    if (error) throw error;
    return (count || 0) < 5;
  } catch (error) {
    console.error('Error checking release limit:', error);
    throw error;
  }
}

export async function checkArtistLimit(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const tier = await getSubscriptionTier();
    
    if (tier === 'label') return true;
    if (tier === 'pro') {
      // Get unique artists count
      const { data, error } = await supabase
        .from('releases')
        .select('artist')
        .eq('user_id', user.uid)
        .limit(6); // We only need to know if it exceeds 5

      if (error) throw error;
      
      const uniqueArtists = new Set(data?.map(r => r.artist.toLowerCase()));
      return uniqueArtists.size < 5;
    }
    
    // Basic tier - check if user already has any releases with different artists
    const { data, error } = await supabase
      .from('releases')
      .select('artist')
      .eq('user_id', user.uid)
      .limit(2); // We only need to know if there's more than 1

    if (error) throw error;
    
    const uniqueArtists = new Set(data?.map(r => r.artist.toLowerCase()));
    return uniqueArtists.size < 2;
  } catch (error) {
    console.error('Error checking artist limit:', error);
    throw error;
  }
}