import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSovereignStore } from './sovereign';

interface CadenceState {
  lastTick: string;
  isProcessingReset: boolean;
  
  // Logic
  checkCadence: () => Promise<void>;
}

export const useCadenceStore = create<CadenceState>()(
  persist(
    (set, get) => ({
      lastTick: new Date().toISOString(),
      isProcessingReset: false,

      checkCadence: async () => {
        const { isProcessingReset } = get();
        if (isProcessingReset) return;

        const now = new Date();
        const sovereign = useSovereignStore.getState();
        
        // 1. Check Daily Reset (Protocol Midnight IST Standard)
        // Standardize to YYYY-MM-DD in Asia/Kolkata
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric', month: '2-digit', day: '2-digit'
        });
        const todayStr = formatter.format(now);
        
        if (sovereign.lastDailyReset !== todayStr) {
          set({ isProcessingReset: true });
          try {
            console.log(`[CADENCE] Triggering daily reset for ${todayStr}`);
            await sovereign.resetDailyQuests();
          } finally {
            set({ isProcessingReset: false });
          }
        }

        // 2. Check Individual Mission Expiries
        // All expiries are stored as UTC ISO strings. We compare absolute timestamps.
        const nowMs = now.getTime();
        const quests = sovereign.dailyQuests;

        for (const quest of quests) {
          if (quest.completed || quest.failed) continue;
          
          const deadline = quest.dueDate || quest.expiresAt;
          if (!deadline) continue;

          const deadlineMs = new Date(deadline).getTime();
          
          if (deadlineMs <= nowMs) {
            console.log(`[CADENCE] Auto-failing expired mission: ${quest.title}`);
            await sovereign.failQuest(quest.id);
          }
        }

        set({ lastTick: now.toISOString() });
      }
    }),
    {
      name: 'sovereign-cadence',
    }
  )
);
