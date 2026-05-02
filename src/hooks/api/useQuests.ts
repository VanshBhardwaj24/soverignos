import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { Quest } from '../../store/sovereign';

export const useQuests = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.quests(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data.map((q: any) => {
        // Target 23:59:59 IST (= 18:29:59 UTC) of the current IST date
        const getISTMidnight = () => {
          const now = new Date();
          const istOffset = 5.5 * 60 * 60 * 1000;
          const istNow = new Date(now.getTime() + istOffset);
          const y = istNow.getUTCFullYear();
          const m = istNow.getUTCMonth();
          const d = istNow.getUTCDate();
          let target = new Date(Date.UTC(y, m, d, 18, 29, 59, 999));
          if (target <= now) target = new Date(Date.UTC(y, m, d + 1, 18, 29, 59, 999));
          return target.toISOString();
        };

        return {
          id: q.id,
          title: q.title,
          xpReward: q.xp_reward,
          statId: q.stat_id,
          completed: q.completed,
          failed: q.failed,
          type: q.type,
          streak: q.streak || 0,
          difficulty: q.difficulty || 'medium',
          lastCompletedAt: q.last_completed_at,
          expiresAt: q.expires_at || getISTMidnight(),
          priority: q.priority || 'P2',
          dueDate: q.due_date,
          repeating: q.repeating !== null ? q.repeating : true,
          archived: q.archived || false,
          subtasksEnabled: q.subtasks_enabled || false,
          subtasks: q.subtasks || [],
          notes: q.notes || '',
          postponeCount: q.postpone_count || 0,
          postponeHistory: q.postpone_history || [],
          pinned: q.pinned || false
        } as Quest;
      });
    },
  });
};
