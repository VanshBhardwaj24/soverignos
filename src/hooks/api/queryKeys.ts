export const queryKeys = {
  all: ['api'] as const,
  quests: (userId: string) => [...queryKeys.all, 'quests', userId] as const,
  transactions: (userId: string) => [...queryKeys.all, 'transactions', userId] as const,
  financialGoals: (userId: string) => [...queryKeys.all, 'financialGoals', userId] as const,
  jobApplications: (userId: string) => [...queryKeys.all, 'jobApplications', userId] as const,
  portfolios: (userId: string) => [...queryKeys.all, 'portfolios', userId] as const,
  journalEntries: (userId: string) => [...queryKeys.all, 'journalEntries', userId] as const,
  goals: (userId: string) => [...queryKeys.all, 'goals', userId] as const,
  userStats: (userId: string) => [...queryKeys.all, 'userStats', userId] as const,
  brandAccounts: (userId: string) => [...queryKeys.all, 'brandAccounts', userId] as const,
  contentPieces: (userId: string) => [...queryKeys.all, 'contentPieces', userId] as const,
};
