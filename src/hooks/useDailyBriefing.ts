import { useEffect, useState } from 'react';
import { useSovereignStore } from '../store/sovereign';

export const useDailyBriefing = () => {
  const { 
    briefingSeenDates, 
    summarySeenDates, 
    dailyQuests,
    setBriefingSeen,
    setSummarySeen
  } = useSovereignStore();

  const [modalMode, setModalMode] = useState<'morning' | 'evening' | null>(null);

  useEffect(() => {
    const checkBriefing = () => {
      const now = new Date();
      const hour = now.getHours();
      const dateString = now.toISOString().split('T')[0];

      // Morning Briefing: After 7 AM, if not seen today
      if (hour >= 7 && hour < 21) {
        if (!briefingSeenDates.includes(dateString)) {
          setModalMode('morning');
        }
      }

      // Evening Summary: After 9 PM, if briefing exists for today and not seen summary
      if (hour >= 21 || hour < 4) { // 9 PM to 4 AM
        const hasBriefingToday = dailyQuests.some(q => q.dailyBriefingDate === dateString);
        if (hasBriefingToday && !summarySeenDates.includes(dateString)) {
          setModalMode('evening');
        }
      }
    };

    checkBriefing();
    const interval = setInterval(checkBriefing, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [briefingSeenDates, summarySeenDates, dailyQuests]);

  const closeBriefing = () => {
    const dateString = new Date().toISOString().split('T')[0];
    if (modalMode === 'morning') setBriefingSeen(dateString);
    if (modalMode === 'evening') setSummarySeen(dateString);
    setModalMode(null);
  };

  return {
    modalMode,
    closeBriefing,
    date: new Date().toISOString().split('T')[0]
  };
};
