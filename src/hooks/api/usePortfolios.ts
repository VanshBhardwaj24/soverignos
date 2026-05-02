import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { Portfolio } from '../../store/sovereign';

export const usePortfolios = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.portfolios(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        balance: p.balance,
        currency: p.currency,
        metadata: p.metadata || {}
      })) as Portfolio[];
    },
  });
};
