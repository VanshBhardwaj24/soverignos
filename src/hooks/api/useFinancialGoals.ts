import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { FinancialGoal } from '../../store/sovereign';

export const useFinancialGoals = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.financialGoals(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data.map((g: any) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        category: g.category,
        deadline: g.deadline,
        status: g.status
      })) as FinancialGoal[];
    },
  });
};
