import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { JournalEntry } from '../../store/sovereign';

export const useJournalEntries = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.journalEntries(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId!)
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map(entry => ({
        ...entry,
        isArchived: entry.is_archived
      })) as JournalEntry[];
    },
  });
};
