import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { Goal } from '../../store/sovereign';

export const useGoals = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.goals(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data.map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        type: g.type,
        status: g.status,
        progress: g.progress,
        deadline: g.deadline,
        xpReward: g.xp_reward,
        gcReward: g.gc_reward,
        tags: g.tags || [],
        statId: g.stat_id,
        isAutoTracked: g.is_auto_tracked,
        templateId: g.template_id,
        targetValue: g.target_value,
        createdAt: g.created_at
      })) as Goal[];
    },
  });
};
