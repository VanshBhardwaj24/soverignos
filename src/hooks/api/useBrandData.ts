import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { SocialAccount, ContentPiece } from '../../store/sovereign';

export const useBrandAccounts = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.brandAccounts(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_accounts')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data.map((a: any) => ({
        id: a.id,
        handle: a.handle,
        platform: a.platform,
        avatarUrl: a.avatar_url,
        metrics: a.metrics || {}
      })) as SocialAccount[];
    },
  });
};

export const useContentPieces = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.contentPieces(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pieces')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data.map((p: any) => ({
        id: p.id,
        accountId: p.account_id,
        title: p.title,
        status: p.status,
        platform: p.platform,
        scheduledDate: p.scheduled_date,
        postedAt: p.posted_at,
        isRepeating: p.is_repeating || false,
        repeatConfig: p.repeat_config || {},
        reminderEnabled: p.reminder_enabled || false,
        reminderOffset: p.reminder_offset || 60,
        notes: p.notes,
        assets: p.assets || []
      })) as ContentPiece[];
    },
  });
};
