import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import { useSovereignStore } from '../../store/sovereign';

export const useUserStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.userStats(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', userId!)
        .single();

      if (error) throw error;

      // Sync into Zustand store to maintain derived computations (Freedom Score, etc.)
      const store = useSovereignStore.getState();
      
      useSovereignStore.setState({
        gold: data.gold || 0,
        accountabilityScore: data.accountability_score ?? store.accountabilityScore,
        integrity: data.accountability_score ?? store.integrity,
        punishments: data.punishments ?? store.punishments,
        inventory: data.inventory || [],
        statLevels: {
          code: data.code_level || 1, wealth: data.wealth_level || 1, body: data.body_level || 1,
          mind: data.mind_level || 1, brand: data.brand_level || 1, network: data.network_level || 1,
          spirit: data.spirit_level || 1, create: data.create_level || 1
        },
        globalStreak: {
          current: data.global_streak_current || 0,
          longest: data.global_streak_longest || 0
        },
        statXP: {
          code: data.code_xp || 0, wealth: data.wealth_xp || 0, body: data.body_xp || 0,
          mind: data.mind_xp || 0, brand: data.brand_xp || 0, network: data.network_xp || 0,
          spirit: data.spirit_xp || 0, create: data.create_xp || 0
        },
        alias: data.alias || store.alias,
        username: data.username || store.username,
        joinedAt: data.joined_at || store.joinedAt,
        bio: data.bio || store.bio,
        foundingStatement: data.founding_statement || store.foundingStatement,
        foundingStatementDate: data.founding_statement_date || store.foundingStatementDate,
        wishlist: data.wishlist || [],
        activeLoadout: data.active_loadout || [],
        itemCooldowns: data.item_cooldowns || {},
        lastDailyReset: data.last_daily_reset || store.lastDailyReset,
        lastWeeklyReset: data.last_weekly_reset || store.lastWeeklyReset
      });
      
      // Recompute derived metrics
      useSovereignStore.getState().recomputeFreedom();

      return data;
    },
  });
};
