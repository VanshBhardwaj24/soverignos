import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { queryKeys } from './queryKeys';
import type { JobApp } from '../../store/sovereign';

export const useJobApplications = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.jobApplications(userId!),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId!);

      if (error) throw error;

      return data as JobApp[];
    },
  });
};
