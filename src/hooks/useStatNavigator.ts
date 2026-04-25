import { useSovereignStore } from '../store/sovereign';

export function useStatNavigator() {
  const store = useSovereignStore();

  return {
    statLevels: store.statLevels,
    statXP: store.statXP,
    statTodayXP: store.statTodayXP,
    freedomScore: store.freedomScore,
    sovereignty: store.sovereignty,
    prestige: store.prestige,
    streaks: store.streaks,
    globalStreak: store.globalStreak,
    unlockedSkills: store.unlockedSkills,
    dossiers: store.dossiers,
    logActivity: store.logActivity,
    setSelectedStat: store.setSelectedStat,
    prestigeStat: store.prestigeStat,
  };
}
