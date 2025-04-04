import { supabase } from './supabase';
import { auth } from './firebase';
import { PostgrestError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export interface Release {
  id: string;
  user_id: string;
  name: string;
  artist: string;
  type: 'Single' | 'EP' | 'Album';
  label: string;
  release_date: string;
  artwork_url?: string;
  created_at?: string;
}

export async function getReleases(): Promise<Release[]> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .eq('user_id', user.uid)
      .order('release_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching releases:', error);
    toast.error('Failed to load releases');
    return [];
  }
}

export async function createRelease(release: Omit<Release, 'id' | 'user_id' | 'created_at'>): Promise<Release | null> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('releases')
      .insert([
        {
          ...release,
          user_id: user.uid
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating release:', error);
    toast.error('Failed to create release');
    return null;
  }
}

export async function updateRelease(id: string, release: Partial<Release>): Promise<Release | null> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('releases')
      .update(release)
      .eq('id', id)
      .eq('user_id', user.uid)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating release:', error);
    toast.error('Failed to update release');
    return null;
  }
}

export async function deleteRelease(id: string): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('releases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.uid);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting release:', error);
    toast.error('Failed to delete release');
    return false;
  }
}

export function handleSupabaseError(error: PostgrestError) {
  console.error('Supabase error:', error);
  
  switch (error.code) {
    case '42501':
      return 'Permission denied. Please check your access rights.';
    case '23505':
      return 'This record already exists.';
    case '23503':
      return 'This operation would violate referential integrity.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}