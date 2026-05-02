import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { Transaction } from '../../store/sovereign';

export const useTransactions = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.transactions(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data.map((tx: any) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        date: tx.date || tx.created_at,
        category: tx.category || 'General',
        sector: tx.sector || 'Personal',
        poolId: tx.pool_id || 'personal',
        metadata: tx.metadata || {}
      })) as Transaction[];
    },
  });
};
