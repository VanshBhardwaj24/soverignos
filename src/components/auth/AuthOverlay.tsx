import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useSovereignStore } from '../../store/sovereign';
import { AuthPage } from './AuthPage';

export const AuthOverlay = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser } = useSovereignStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex items-center justify-center">
         <Loader2 size={32} className="animate-spin text-[var(--stat-code)] opacity-50" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return <AuthPage />;
}
