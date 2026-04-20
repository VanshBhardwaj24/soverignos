import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { xpForLevel, computeFreedomScore, computeSovereignty, SKILL_PERKS, DIFFICULTY_MULTIPLIERS } from '../lib/constants';
import { toast } from 'sonner';

export interface Quest {
  id: string;
  title: string;
  xpReward: number;
  statId: string;
  completed: boolean;
  failed?: boolean;
  type: 'daily' | 'weekly' | 'boss' | 'raid';
  streak: number;
  lastCompletedAt?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'legendary';
  expiresAt?: string;
  subtasks?: { id: string; text: string; completed: boolean }[];
  isTimed?: boolean;
  timeLeft?: number; // in seconds
  dueDate?: string; // ISO 8601
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  tags?: string[];
  postponeCount?: number;
  postponeHistory?: { date: string; reason: string; penaltyApplied: number }[];
  reminded?: boolean;
}

export interface JobApp {
  id: string;
  company: string;
  role: string;
  status: 'RESEARCHING' | 'APPLIED' | 'INTERVIEWING' | 'PENDING OFFER' | 'ACCEPTED' | 'REJECTED';
  date: string;
  notes?: string;
  requiredSkills?: string[];
  followUpDate?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  category: string;
  sector: string;
  poolId: 'business' | 'trading' | 'personal' | 'investment';
  metadata?: Record<string, any>;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  status: 'active' | 'completed';
  deadline?: string;
  category?: string;
  icon?: string;
}

export interface Trip {
  id: string;
  name: string;
  goalId?: string;
  checklist?: { id: string, text: string, completed: boolean }[];
}

export interface Portfolio {
  id: string;
  name: string;
  type: 'trading' | 'business' | 'savings' | 'investing';
  balance: number;
  currency: string;
  metadata: Record<string, any>;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  folder: string;
  date: string;
  tags?: string[];
  isArchived?: boolean;
}

export interface RecurringTx {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  status: 'NOW' | 'RECENT' | 'OLD';
  iconType: 'time' | 'milestone' | 'alert' | 'xp' | 'rank';
  read: boolean;
  createdAt?: string;
}

export interface ActivityLogEntry {
  id: string;
  statId: string;
  xp: number;
  questId?: string;
  timestamp: string;
  multiplier: number;
  metadata?: Record<string, any>;
}

export interface Venture {
  id: string;
  name: string;
  type: 'aiaa' | 'aiwa' | 'trademin' | 'lab';
  revenue: number;
  expenses: number;
  description: string;
  status: 'active' | 'paused' | 'completed';
  date: string;
}

export interface KnowledgeCard {
  id: string;
  question: string;
  answer: string;
  folder: string;
  mastered: boolean;
  date: string;
}

export interface MoodEntry {
  id: string;
  mood: number;
  intensity: number;
  notes?: string;
  gratitude?: string[];
  date: string;
}

export interface StatSnapshot {
  date: string;
  statLevels: Record<string, number>;
  freedomScore: number;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  affinity: 'cold' | 'warm' | 'strategic' | 'elite';
  lastContact: string;
  notes: string;
}

export interface Punishment {
  id: string;
  type: 'physical' | 'financial' | 'mental' | 'debuff';
  title: string;
  description: string;
  penalty?: number;
  status: 'active' | 'cleared' | 'failed';
  date: string;
  questId?: string;
}

interface SovereignStore {
  user: User | null;
  setUser: (user: User | null) => void;
  syncFromCloud: () => Promise<void>;

  statLevels: Record<string, number>;
  statXP: Record<string, number>;
  statTodayXP: Record<string, number>;
  gold: number;
  inventory: string[];
  resources: Record<string, number>;
  freedomScore: number;
  sovereignty: number;
  prestige: Record<string, number>;
  streaks: Record<string, { current: number; longest: number }>;
  globalStreak: { current: number; longest: number };
  unlockedSkills: string[];
  integrity: number;
  consecutiveDaysFailed: number;

  dailyQuests: Quest[];
  notifications: Notification[];
  notificationsOpen: boolean;
  jobApplications: JobApp[];
  transactions: Transaction[];
  journalEntries: JournalEntry[];
  activityLog: ActivityLogEntry[];
  ventures: Venture[];
  knowledgeCards: KnowledgeCard[];
  moodHistory: MoodEntry[];
  snapshotHistory: StatSnapshot[];
  nexusContacts: Contact[];
  punishments: Punishment[];
  accountabilityScore: number;
  financialGoals: FinancialGoal[];
  portfolios: Portfolio[];
  budgetCap: number;
  recurringTransactions: RecurringTx[];

  // Actions
  takeSnapshot: () => void;
  addContact: (c: Omit<Contact, 'id'>) => void;
  logOutreach: (id: string) => void;
  lastDailyReset: string;
  lastWeeklyReset: string;
  dailyGoalXP: number;
  onboardingComplete: boolean;
  sidebarCollapsed: boolean;

  selectedStat: string | null;
  lastLeveledStat: { statId: string; oldLevel: number; newLevel: number } | null;
  setLastLeveledStat: (stat: { statId: string; oldLevel: number; newLevel: number } | null) => void;
  logModalOpen: boolean;
  questModalOpen: boolean;
  setQuestModalOpen: (open: boolean) => void;
  targetQuestId: string | null;
  setTargetQuestId: (id: string | null) => void;
  theme: 'dark' | 'light';

  logActivity: (statId: string, xp: number, questId?: string, metadata?: Record<string, any>) => Promise<void>;
  completeQuest: (questId: string, skipLog?: boolean) => Promise<void>;
  failQuest: (questId: string) => Promise<void>;
  addQuest: (quest: Omit<Quest, 'id' | 'completed' | 'streak'>) => Promise<void>;
  resetDailyQuests: () => Promise<void>;
  resetWeeklyQuests: () => Promise<void>;
  setLogModalOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSelectedStat: (statId: string | null) => void;
  recomputeFreedom: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setDailyGoalXP: (xp: number) => void;
  setOnboardingComplete: () => void;
  logout: () => Promise<void>;
  clearPunishment: (id: string) => Promise<void>;

  toggleNotifications: (open?: boolean) => void;
  addNotification: (n: Omit<Notification, 'id' | 'read'>) => void;
  clearNotifications: () => void;

  addJobApp: (app: Omit<JobApp, 'id'>) => Promise<void>;
  updateJobStatus: (id: string, status: JobApp['status']) => Promise<void>;
  updateJobApp: (id: string, data: Partial<JobApp>) => Promise<void>;
  deleteJobApp: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'currentAmount' | 'status'>) => Promise<void>;
  allocateToGoal: (goalId: string, amount: number) => Promise<void>;
  updateGoalStatus: (id: string, status: FinancialGoal['status']) => Promise<void>;
  addPortfolio: (portfolio: Omit<Portfolio, 'id'>) => Promise<void>;
  updatePortfolioBalance: (id: string, amount: number) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  updateJournalEntry: (id: string, entry: Partial<Omit<JournalEntry, 'id'>>) => Promise<void>;
  buyItem: (itemId: string, cost: number) => Promise<void>;

  addVenture: (v: Omit<Venture, 'id' | 'date'>) => void;
  addKnowledgeCard: (card: Omit<KnowledgeCard, 'id' | 'date' | 'mastered'>) => void;
  toggleCardMastered: (id: string) => void;
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  bulkCompleteQuests: (ids: string[]) => Promise<void>;
  bulkDeleteQuests: (ids: string[]) => Promise<void>;
  updateQuestNotes: (id: string, notes: string, subtasks: Quest['subtasks']) => Promise<void>;
  updateQuest: (id: string, data: Partial<Omit<Quest, 'id'>>) => Promise<void>;
  postponeQuest: (id: string, newDate: string, reason: string) => Promise<void>;

  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  addRecurringTx: (tx: Omit<RecurringTx, 'id'>) => Promise<void>;
  removeRecurringTx: (id: string) => Promise<void>;

  addVentureRevenue: (id: string, amount: number, memo: string) => Promise<void>;
  updateVenture: (id: string, data: Partial<Venture>) => Promise<void>;

  archiveJournalEntry: (id: string) => Promise<void>;
  unarchiveJournalEntry: (id: string) => Promise<void>;

  toggleTripChecklist: (tripId: string, itemId: string) => void;
  addTripChecklistItem: (tripId: string, text: string) => void;

  prestigeStat: (statId: string) => Promise<void>;
  collectResource: (name: string, amount: number) => void;
  craftItem: (recipeId: string) => Promise<void>;
  reviewKnowledgeCard: (id: string, quality: number) => void;
  tickQuests: () => void;
}

export const useSovereignStore = create<SovereignStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        set({ user });
        if (user) get().syncFromCloud();
      },

      syncFromCloud: async () => {
        const { user } = get();
        if (!user) return;

        const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id);
        if (txs) {
          set({
            transactions: txs.map(tx => ({
              id: tx.id,
              amount: tx.amount,
              type: tx.type,
              description: tx.description,
              date: tx.date || tx.created_at,
              category: tx.category || 'General',
              sector: tx.sector || 'Personal',
              poolId: tx.pool_id || 'personal',
              metadata: tx.metadata || {}
            }))
          });
        }

        const { data: goals } = await supabase.from('financial_goals').select('*').eq('user_id', user.id);
        if (goals) {
          set({
            financialGoals: goals.map(g => ({
              id: g.id,
              name: g.name,
              targetAmount: g.target_amount,
              currentAmount: g.current_amount,
              category: g.category,
              deadline: g.deadline,
              status: g.status
            }))
          });
        }

        const { data: portfolios } = await supabase.from('portfolios').select('*').eq('user_id', user.id);
        if (portfolios) {
          set({
            portfolios: portfolios.map(p => ({
              id: p.id,
              name: p.name,
              type: p.type,
              balance: p.balance,
              currency: p.currency,
              metadata: p.metadata || {}
            }))
          });
        }

        const { data: jobs } = await supabase.from('job_applications').select('*').eq('user_id', user.id);
        if (jobs) set({ jobApplications: jobs });

        const { data: journals } = await supabase.from('journal_entries').select('*').eq('user_id', user.id).order('date', { ascending: false });
        if (journals) set({ journalEntries: journals });

        const { data: quests, error: qError } = await supabase.from('quests').select('*').eq('user_id', user.id);
        if (qError) {
          console.error('[SYNC_ERROR] Quests:', qError);
          get().addNotification({ title: 'SYNC WARNING', description: 'Failed to fetch mission protocols. Using local state.', status: 'URGENT', iconType: 'alert' });
        } else if (quests) {
          set({
            dailyQuests: quests.map(q => ({
              id: q.id,
              title: q.title,
              xpReward: q.xp_reward,
              statId: q.stat_id,
              completed: q.completed,
              failed: q.failed,
              type: q.type,
              streak: q.streak || 0,
              difficulty: q.difficulty || 'medium',
              lastCompletedAt: q.last_completed_at,
              expiresAt: q.expires_at,
              priority: q.priority || 'P2',
              dueDate: q.due_date,
              repeating: q.repeating !== null ? q.repeating : true,
              archived: q.archived || false,
              postponeCount: q.postpone_count || 0,
              postponeHistory: q.postpone_history || [],
            }))
          });
        }

        const { data: stats } = await supabase.from('user_stats').select('*').eq('id', user.id).single();
        if (stats) {
          set({
            gold: stats.gold || 0,
            inventory: stats.inventory || [],
            statLevels: {
              code: stats.code_level, wealth: stats.wealth_level, body: stats.body_level,
              mind: stats.mind_level, brand: stats.brand_level, network: stats.network_level,
              spirit: stats.spirit_level || 1
            },
            statXP: {
              code: stats.code_xp, wealth: stats.wealth_xp, body: stats.body_xp,
              mind: stats.mind_xp, brand: stats.brand_xp, network: stats.network_xp,
              spirit: stats.spirit_xp || 0
            }
          });
          get().recomputeFreedom();
        }

        // Check if daily reset is needed
        get().resetDailyQuests();
      },

      statLevels: { code: 1, wealth: 1, body: 1, mind: 1, brand: 1, network: 1, spirit: 1 },
      statXP: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, spirit: 0 },
      statTodayXP: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, spirit: 0 },
      gold: 0,
      inventory: [],
      resources: {},
      freedomScore: 0,
      sovereignty: 0,
      prestige: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0 },
      unlockedSkills: [],
      integrity: 100,
      consecutiveDaysFailed: 0,
      streaks: {
        code: { current: 0, longest: 0 },
        wealth: { current: 0, longest: 0 },
        body: { current: 0, longest: 0 },
        mind: { current: 0, longest: 0 },
        brand: { current: 0, longest: 0 },
        network: { current: 0, longest: 0 },
        spirit: { current: 0, longest: 0 }
      },
      globalStreak: { current: 0, longest: 0 },

      dailyQuests: [
        { id: 'q1', title: 'Complete 2 Leetcode Hards', xpReward: 50, statId: 'code', completed: false, type: 'daily', streak: 0, difficulty: 'hard', priority: 'P1' },
        { id: 'q2', title: 'Backtest XAU/USD Strategy', xpReward: 40, statId: 'wealth', completed: false, type: 'daily', streak: 0, difficulty: 'medium', priority: 'P1' },
        { id: 'q3', title: 'Gym Session (60 min)', xpReward: 40, statId: 'body', completed: false, type: 'daily', streak: 0, difficulty: 'medium', priority: 'P2' },
        { id: 'boss_1', title: 'DEFEAT: Market Volatility', xpReward: 500, statId: 'wealth', completed: false, type: 'boss', streak: 0, difficulty: 'legendary', priority: 'P0' },
      ],

      notifications: [],
      notificationsOpen: false,

      jobApplications: [],
      transactions: [],
      journalEntries: [],
      activityLog: [],
      ventures: [],
      knowledgeCards: [],
      moodHistory: [],
      snapshotHistory: [],
      nexusContacts: [],
      punishments: [],
      accountabilityScore: 100,
      financialGoals: [],
      portfolios: [
        { id: 'p1', name: 'MAIN CRYPTO WALLET', type: 'investing', balance: 0, currency: 'USD', metadata: {} },
        { id: 'p2', name: 'TRADING DESK', type: 'trading', balance: 0, currency: 'USD', metadata: { winRate: 0.65 } }
      ],
      budgetCap: 2000,
      recurringTransactions: [],
      lastDailyReset: new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
      lastWeeklyReset: (() => {
        const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const day = istNow.getDay();
        const diff = istNow.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(istNow.setDate(diff));
        return `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
      })(),
      dailyGoalXP: 200,
      onboardingComplete: false,
      sidebarCollapsed: false,

      selectedStat: null,
      lastLeveledStat: null,
      setLastLeveledStat: (stat) => set({ lastLeveledStat: stat }),
      logModalOpen: false,
      questModalOpen: false,
      setQuestModalOpen: (open) => set({ questModalOpen: open }),
      targetQuestId: null,
      setTargetQuestId: (id) => set({ targetQuestId: id }),
      theme: 'dark',

      // F1: Daily Reset
      resetDailyQuests: async () => {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric', month: '2-digit', day: '2-digit'
        });
        const today = formatter.format(new Date());
        const { lastDailyReset, dailyQuests, accountabilityScore } = get();

        // Trigger weekly reset check
        get().resetWeeklyQuests();

        if (lastDailyReset === today) return;

        // F11: Process recurring transactions
        const { recurringTransactions } = get();
        for (const rtx of recurringTransactions) {
          // Simplified logic: add transaction on daily reset if frequency matches
          // For now, let's just add all 'daily' ones. 
          // 'weekly'/'monthly' would need more date checking logic.
          if (rtx.frequency === 'daily') {
            await get().addTransaction({
              amount: rtx.amount,
              description: `[RECURRING] ${rtx.description}`,
              type: rtx.type,
              date: new Date().toISOString(),
              category: rtx.category,
              sector: 'Automated',
              poolId: 'personal'
            });
          }
        }

        // F1: Calculate Global Streak before resetting
        const completedYesterday = dailyQuests.filter(q => q.type === 'daily' && q.completed).length;
        const totalDaily = dailyQuests.filter(q => q.type === 'daily').length;

        set(state => {
          const newGlobalStreak = completedYesterday > 0
            ? {
              current: state.globalStreak.current + 1,
              longest: Math.max(state.globalStreak.longest, state.globalStreak.current + 1)
            }
            : { current: 0, longest: state.globalStreak.longest };

          return {
            globalStreak: newGlobalStreak,
            statTodayXP: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, spirit: 0 },
            lastDailyReset: today
          };
        });

        // Detect missed daily quests and generate punishments
        const missedQuests = dailyQuests.filter(q => q.type === 'daily' && !q.completed);
        let newScore = accountabilityScore;
        const newPunishments: Punishment[] = [];

        if (missedQuests.length > 0) {
          const { PUNISHMENT_POOL } = await import('../lib/constants');

          // F41: Escalation Protocol
          const newConsecutiveFailures = get().consecutiveDaysFailed + 1;
          set({ consecutiveDaysFailed: newConsecutiveFailures });

          missedQuests.forEach(quest => {
            // Deduct score for missed protocol - Escalates with consecutive failures
            const basePenalty = 5;
            const escalationFactor = Math.min(2, 1 + (newConsecutiveFailures * 0.2));
            newScore = Math.max(0, newScore - (basePenalty * escalationFactor));

            // Generate a random punishment
            const poolTask = PUNISHMENT_POOL[Math.floor(Math.random() * PUNISHMENT_POOL.length)];
            const punishmentId = Math.random().toString(36).substr(2, 9);

            newPunishments.push({
              id: punishmentId,
              type: poolTask.type as 'physical' | 'financial' | 'mental',
              title: `VIOLATION: ${quest.title}${newConsecutiveFailures > 1 ? ` (ESC-${newConsecutiveFailures})` : ''}`,
              description: poolTask.description,
              penalty: poolTask.penalty,
              status: 'active' as const,
              date: new Date().toISOString(),
              questId: quest.id
            });

            // F31: Immediate Gold and XP sanctions for every missed mission
            // Sanctions escalate with consecutive failures
            const goldPenalty = Math.floor((quest.xpReward / 4) * escalationFactor);
            const xpPenalty = Math.floor((quest.xpReward / 4) * escalationFactor);

            set(state => {
              const currentXP = state.statXP[quest.statId] || 0;
              const newXP = Math.max(0, currentXP - xpPenalty);

              // Recalculate level after XP loss
              let level = 1;
              while (xpForLevel(level) <= newXP) { level++; }
              level = Math.max(1, level - 1);

              return {
                gold: Math.max(0, state.gold - goldPenalty - (poolTask.type === 'financial' ? poolTask.penalty || 0 : 0)),
                statXP: { ...state.statXP, [quest.statId]: newXP },
                statLevels: { ...state.statLevels, [quest.statId]: level }
              };
            });

            // F41: High-tier Escalation - Reality Wipe (Random Level Reset)
            if (newConsecutiveFailures >= 7) {
              const stats = Object.keys(get().statLevels);
              const targetStat = stats[Math.floor(Math.random() * stats.length)];
              set(state => ({
                statLevels: { ...state.statLevels, [targetStat]: 1 },
                statXP: { ...state.statXP, [targetStat]: 0 }
              }));
              get().addNotification({
                title: 'CRITICAL FAILURE: REALITY WIPE',
                description: `Sustained protocol deviation detected. ${targetStat.toUpperCase()} level localized to baseline.`,
                status: 'NOW',
                iconType: 'alert'
              });
            }
          });
        } else {
          // Reset consecutive failures on successful day
          set({ consecutiveDaysFailed: 0 });
        }

        // Archive completion stats for yesterday
        const completedYesterdayCount = dailyQuests.filter(q => q.type === 'daily' && q.completed).length;
        const totalDailyCount = dailyQuests.filter(q => q.type === 'daily').length;

        // Take a snapshot of current stats
        get().takeSnapshot();

        // Calculate next reset time (IST Midnight)
        const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const istMidnight = new Date(istNow);
        istMidnight.setHours(23, 59, 59, 999);
        const expiresAt = istMidnight.toISOString();

        // Reset daily quests (not weekly/boss)
        set(state => ({
          lastDailyReset: today,
          accountabilityScore: newScore,
          punishments: [...newPunishments, ...state.punishments].slice(0, 100),
          statTodayXP: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, spirit: 0 },
          dailyQuests: state.dailyQuests.map(q => {
            // Only reset recurring missions
            if (q.repeating && (q.type === 'daily' || (q.type === 'raid' && q.completed))) {
              return {
                ...q,
                completed: false,
                failed: false,
                currentPhase: q.type === 'raid' ? 1 : undefined,
                expiresAt: expiresAt
              };
            }
            // Archive completed one-offs
            if (!q.repeating && q.completed) {
              return { ...q, archived: true };
            }
            return q;
          })
        }));

        get().addNotification({
          title: 'NEW DAY INITIALIZED',
          description: missedQuests.length > 0
            ? `Yesterday: ${completedYesterdayCount}/${totalDailyCount} cleared. ${missedQuests.length} VIOLATIONS LOGGED.`
            : `Yesterday: ${completedYesterdayCount}/${totalDailyCount} cleared. Protocol efficiency maintained.`,
          status: 'NOW',
          iconType: missedQuests.length > 0 ? 'alert' : 'time'
        });
      },

      // F1b: Weekly Reset
      resetWeeklyQuests: async () => {
        const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const day = istNow.getDay();
        const diff = istNow.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(istNow);
        monday.setDate(diff);
        const currentWeekString = `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;

        const { lastWeeklyReset } = get();
        if (lastWeeklyReset === currentWeekString) return;

        set(state => ({
          lastWeeklyReset: currentWeekString,
          dailyQuests: state.dailyQuests.map(q =>
            q.type === 'weekly' ? {
              ...q,
              completed: false,
              failed: false,
            } : q
          )
        }));

        get().addNotification({
          title: 'NEW WEEK INITIALIZED',
          description: `Operational protocols reset. A new cycle begins.`,
          status: 'NOW',
          iconType: 'milestone'
        });
      },

      // F2 + F3: logActivity with real multipliers and perk effects
      logActivity: async (statId, xp, questId?, metadata?) => {
        const { inventory, user, statLevels, prestige } = get();

        // F2: Real XP multiplier from inventory
        let multiplier = 1;
        if (inventory.includes('energy_drink')) multiplier *= 2;
        if (inventory.includes('dev_desk') && statId === 'code') multiplier *= 1.1;

        // F3: Skill perk XP bonus based on level
        const level = statLevels[statId] || 1;
        const perk = SKILL_PERKS[statId]?.find(p => level >= p.level);
        if (perk?.xpBonus) multiplier *= (1 + perk.xpBonus);

        // Prestige Multiplier
        const statPrestige = prestige[statId] || 0;
        if (statPrestige > 0) {
          const { PRESTIGE_XP_MULTIPLIER } = await import('../lib/constants');
          multiplier *= Math.pow(PRESTIGE_XP_MULTIPLIER, statPrestige);
        }

        // F40: Compound Streak Multiplier
        const { globalStreak } = get();
        if (globalStreak.current > 0) {
          // 30 day streak gives approx 2x multiplier: 1 + (30/30) = 2
          const streakMultiplier = 1 + (globalStreak.current / 30);
          multiplier *= streakMultiplier;
        }

        // Synergy Bonuses
        const { STAT_SYNERGIES } = await import('../lib/constants');
        STAT_SYNERGIES.forEach(synergy => {
          if (synergy.stats.includes(statId)) {
            const allMet = synergy.stats.every(s => (statLevels[s] || 0) >= synergy.minLevel);
            if (allMet) {
              // Hardcoded check for bonus type for now
              if (synergy.name === 'Algo-Trader' && statId === 'wealth') multiplier *= 1.1;
              if (synergy.name === 'Neural Architect') multiplier *= 1.1;
            }
          }
        });

        const boostedXP = Math.floor(xp * multiplier);

        // F5: Activity Log
        const logEntry: ActivityLogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          statId,
          xp: boostedXP,
          questId,
          timestamp: new Date().toISOString(),
          multiplier,
          metadata
        };

        const finalStatUpdate: Record<string, string | number> = {
          [`${statId}_level`]: 1,
          [`${statId}_xp`]: 0,
          updated_at: new Date().toISOString()
        };

        set((state) => {
          const newXP = (state.statXP[statId] || 0) + boostedXP;
          const newTodayXP = (state.statTodayXP[statId] || 0) + boostedXP;

          let level = 1;
          while (xpForLevel(level) <= newXP) { level++; }
          level = level - 1;

          const oldLevel = state.statLevels[statId] || 1;
          if (level > oldLevel) {
            set({ lastLeveledStat: { statId, oldLevel, newLevel: level } });
          }

          finalStatUpdate[`${statId}_level`] = level;
          finalStatUpdate[`${statId}_xp`] = newXP;

          return {
            statXP: { ...state.statXP, [statId]: newXP },
            statTodayXP: { ...state.statTodayXP, [statId]: newTodayXP },
            statLevels: { ...state.statLevels, [statId]: level },
            activityLog: [logEntry, ...state.activityLog].slice(0, 500)
          };
        });

        if (user) {
          await supabase.from('user_stats').update(finalStatUpdate).eq('id', user.id);
        }

        // F27: XP gain notification
        get().addNotification({
          title: `+${boostedXP} ${statId.toUpperCase()} XP`,
          description: multiplier > 1 ? `${(multiplier).toFixed(1)}x multiplier active` : 'Activity logged.',
          status: 'NOW',
          iconType: 'xp'
        });

        const { targetQuestId } = get();
        if (targetQuestId) {
          await get().completeQuest(targetQuestId, true);
          set({ targetQuestId: null });
        }

        get().recomputeFreedom();
      },

      recomputeFreedom: () => {
        const { statLevels, globalStreak, accountabilityScore } = get();

        const freedom = computeFreedomScore(statLevels);

        // F36: Integrity Calculation
        // integrity = (accountability * 0.4) + (streakVitality * 0.3) + (statBalance * 0.3)
        const totalLevels = Object.values(statLevels).reduce((a, b) => a + b, 0);
        let statIntegrity = 100;
        if (totalLevels > 0) {
          const avg = totalLevels / Object.keys(statLevels).length;
          const variance = Object.values(statLevels).reduce((acc, lvl) => acc + Math.abs(lvl - avg), 0) / totalLevels;
          statIntegrity = Math.max(0, 100 - (variance * 200)); // Penalyze variance
        }

        const streakVitality = Math.min(globalStreak.current / 30, 1) * 100;
        const integrity = (accountabilityScore * 0.4) + (streakVitality * 0.3) + (statIntegrity * 0.3);

        set({
          freedomScore: Number(freedom.toFixed(1)),
          integrity: Number(integrity.toFixed(1)),
          sovereignty: computeSovereignty(statLevels, globalStreak.current, accountabilityScore)
        });
      },

      prestigeStat: async (statId) => {
        const { statLevels, prestige, user } = get();
        if ((statLevels[statId] || 0) < 50) return; // Must be level 50

        set(state => ({
          prestige: { ...state.prestige, [statId]: (state.prestige[statId] || 0) + 1 },
          statXP: { ...state.statXP, [statId]: 0 },
          statLevels: { ...state.statLevels, [statId]: 1 },
          statTodayXP: { ...state.statTodayXP, [statId]: 0 }
        }));

        if (user) {
          // Update DB with reset stats and incremented prestige
          await supabase.from('user_stats').update({
            [`${statId}_xp`]: 0,
            [`${statId}_level`]: 1,
            prestige: get().prestige
          }).eq('id', user.id);
        }

        get().addNotification({
          title: `REALITY WARP: ${statId.toUpperCase()}`,
          description: `Stat reset to level 1. Permanent XP multiplier applied.`,
          status: 'NOW',
          iconType: 'rank'
        });
      },

      collectResource: (name, amount) => {
        set(state => ({
          resources: { ...state.resources, [name]: (state.resources[name] || 0) + amount }
        }));
      },

      craftItem: async (recipeId) => {
        const { gold, resources, inventory, user } = get();
        const { CRAFTING_RECIPES } = await import('../lib/constants');
        const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);

        if (!recipe) return;

        // Check requirements
        if (gold < recipe.cost) return;
        for (const [ing, count] of Object.entries(recipe.ingredients)) {
          if ((resources[ing] || 0) < count) return;
        }

        // Consume
        const newResources = { ...resources };
        for (const [ing, count] of Object.entries(recipe.ingredients)) {
          newResources[ing] -= count;
        }

        set(state => ({
          gold: state.gold - recipe.cost,
          resources: newResources,
          inventory: [...state.inventory, recipe.resultItem]
        }));

        if (user) {
          await supabase.from('user_stats').update({
            gold: get().gold,
            inventory: get().inventory,
            // Assuming we might want to store resources in DB too later
            metadata: { ...user.user_metadata, resources: get().resources }
          }).eq('id', user.id);
        }

        get().addNotification({
          title: 'FORGE SUCCESS',
          description: `Acquired: ${recipe.name}`,
          status: 'NOW',
          iconType: 'milestone'
        });
      },

      reviewKnowledgeCard: (id, quality) => {
        set(state => ({
          knowledgeCards: state.knowledgeCards.map(card => {
            if (card.id !== id) return card;

            let { interval = 0, easiness = 2.5, consecutiveSuccess = 0 } = card;

            if (quality >= 3) {
              if (consecutiveSuccess === 0) interval = 1;
              else if (consecutiveSuccess === 1) interval = 6;
              else interval = Math.round(interval * easiness);

              consecutiveSuccess += 1;
              easiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
            } else {
              consecutiveSuccess = 0;
              interval = 1;
            }

            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + interval);

            return {
              ...card,
              interval,
              easiness,
              consecutiveSuccess,
              nextReview: nextReview.toISOString()
            };
          })
        }));
      },

      completeQuest: async (questId, skipLog = false) => {
        const questToComplete = get().dailyQuests.find(q => q.id === questId);
        if (!questToComplete || questToComplete.completed) return;

        const now = new Date();

        // F7: Streak bonus calculation
        let newStreak = (questToComplete.streak || 0) + 1;
        let streakBonus = 1;
        if (newStreak >= 14) streakBonus = 1.5;
        else if (newStreak >= 7) streakBonus = 1.3;
        else if (newStreak >= 3) streakBonus = 1.15;

        // F8: Difficulty multiplier
        const diffMult = DIFFICULTY_MULTIPLIERS[questToComplete.difficulty || 'medium'] || 1;
        const finalXP = Math.floor(questToComplete.xpReward * diffMult * streakBonus);
        const goldEarned = Math.floor(finalXP / 2);

        set((state) => ({
          dailyQuests: state.dailyQuests.map(q => q.id === questId ? {
            ...q,
            completed: true,
            streak: newStreak,
            lastCompletedAt: now.toISOString()
          } : q),
          gold: state.gold + goldEarned
        }));

        const { user } = get();
        if (user) {
          const { error: upsertError } = await supabase.from('quests').upsert({
            id: questId,
            user_id: user.id,
            title: questToComplete.title,
            xp_reward: questToComplete.xpReward,
            stat_id: questToComplete.statId,
            type: questToComplete.type,
            difficulty: questToComplete.difficulty || 'medium',
            completed: true,
            streak: newStreak,
            last_completed_at: now.toISOString(),
            created_at: new Date().toISOString()
          });
          
          if (upsertError) {
            console.error('[DB_ERROR] completeQuest:', upsertError);
            get().addNotification({ title: 'PERSISTENCE FAILED', description: 'Failed to save mission completion to cloud.', status: 'URGENT', iconType: 'alert' });
          }
          await supabase.from('user_stats').update({ gold: get().gold }).eq('id', user.id);
        }

        if (!skipLog) {
          await get().logActivity(questToComplete.statId, finalXP, questId);
        }

        get().addNotification({
          title: 'PROTOCOL COMPLETE',
          description: `"${questToComplete.title}" — +${goldEarned} GC earned${newStreak >= 3 ? ` | 🔥 ${newStreak} streak` : ''}`,
          status: 'NOW',
          iconType: 'milestone'
        });

        // F9: Boss/Raid encounter rewards
        if (questToComplete.type === 'boss' || questToComplete.type === 'raid') {
          // If it's a raid and not the last phase, just increment phase and don't mark completed
          if (questToComplete.type === 'raid' && (questToComplete.currentPhase || 1) < (questToComplete.totalPhases || 1)) {
            set(state => ({
              dailyQuests: state.dailyQuests.map(q => q.id === questId ? {
                ...q,
                completed: false,
                currentPhase: (q.currentPhase || 1) + 1
              } : q)
            }));

            get().addNotification({
              title: `RAID PHASE CLEARED`,
              description: `Objective progressed to Phase ${(questToComplete.currentPhase || 1) + 1}.`,
              status: 'NOW',
              iconType: 'time'
            });
            return;
          }

          // Otherwise, it's a boss or the final raid phase
          await get().addJournalEntry({
            title: `ARCHIVE: ${questToComplete.title} DEFEATED`,
            content: `Operational success confirmed.\n\nThe ${questToComplete.type} "${questToComplete.title}" has been neutralized. Intelligence confirms significant capability gain in the ${questToComplete.statId} sector.\n\nStreak: ${newStreak} consecutive completions. Gold earned: ${goldEarned} GC.`,
            folder: 'Philosophy',
            date: new Date().toISOString()
          });

          // Raids and Bosses drop resources
          const resourceName = questToComplete.type === 'boss' ? 'boss_soul' : 'neural_shard';
          get().collectResource(resourceName, 1);

          get().addNotification({
            title: questToComplete.type === 'boss' ? '⚔️ BOSS DEFEATED' : '🌩️ RAID CONCLUDED',
            description: `Lore fragment archived. ${resourceName} collected.`,
            status: 'NOW',
            iconType: 'rank'
          });
          window.dispatchEvent(new CustomEvent('sovereign:boss-complete', { detail: questToComplete }));
        }
      },

      failQuest: async (questId) => {
        const questToFail = get().dailyQuests.find(q => q.id === questId);
        if (!questToFail || questToFail.completed || questToFail.failed) return;

        const { PUNISHMENT_POOL } = await import('../lib/constants');
        const poolTask = PUNISHMENT_POOL[Math.floor(Math.random() * PUNISHMENT_POOL.length)];
        const punishmentId = Math.random().toString(36).substr(2, 9);

        set((state) => {
          // F41: Priority-weighted Accountability loss
          // P0 = 6 points, P1 = 4 points, P2 = 2 points, P3 = 1 point
          const priorityWeights = { P0: 3, P1: 2, P2: 1, P3: 0.5 };
          const penaltyWeight = priorityWeights[questToFail.priority] || 1;
          const scoreLoss = 2 * penaltyWeight;

          return {
            dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, failed: true, streak: 0 } : q),
            gold: Math.max(0, state.gold - (Math.floor(questToFail.xpReward / 4) * penaltyWeight) - (poolTask.type === 'financial' ? poolTask.penalty || 0 : 0)),
            accountabilityScore: Math.max(0, state.accountabilityScore - scoreLoss),
            punishments: [{
              id: punishmentId,
              type: poolTask.type as 'physical' | 'financial' | 'mental',
              title: `FAILURE [${questToFail.priority}]: ${questToFail.title}`,
              description: poolTask.description,
              penalty: poolTask.penalty,
              status: 'active' as const,
              date: new Date().toISOString(),
              questId: questId
            }, ...state.punishments].slice(0, 100)
          };
        });

        const { user } = get();
        if (user) {
          const { error: upsertError } = await supabase.from('quests').upsert({
            id: questId,
            user_id: user.id,
            title: questToFail.title,
            xp_reward: questToFail.xpReward,
            stat_id: questToFail.statId,
            type: questToFail.type,
            failed: true,
            streak: 0,
            created_at: new Date().toISOString()
          });
          
          if (upsertError) {
            console.error('[DB_ERROR] failQuest:', upsertError);
            get().addNotification({ title: 'PERSISTENCE FAILED', description: 'Failed to sync failure state to cloud.', status: 'URGENT', iconType: 'alert' });
          }
          await supabase.from('user_stats').update({ gold: get().gold }).eq('id', user.id);
        }

        get().addNotification({
          title: 'PROTOCOL FAILED',
          description: `"${questToFail.title}" — punishment logged & score reduced.`,
          status: 'NOW',
          iconType: 'alert'
        });
        window.dispatchEvent(new Event('sovereign:punishment'));
      },

      postponeQuest: async (id, newDate, reason) => {
        const quest = get().dailyQuests.find(q => q.id === id);
        if (!quest) return;

        const count = quest.postponeCount || 0;
        
        // 4th strike = Terminal Failure
        if (quest.type === 'boss' && count >= 3) {
          await get().failQuest(id);
          return;
        }

        // Weekly is 1-time only
        if (quest.type === 'weekly' && count >= 1) {
          await get().failQuest(id);
          return;
        }

        let goldPenalty = 0;
        let accountabilityPenalty = 0;

        if (quest.type === 'weekly') {
          // Weekly postponement has immediate half-penalty
          const priorityWeights = { P0: 3, P1: 2, P2: 1, P3: 0.5 };
          const penaltyWeight = priorityWeights[quest.priority] || 1;
          goldPenalty = Math.floor(quest.xpReward / 8 * penaltyWeight); // Half of standard fail (which is /4)
          accountabilityPenalty = penaltyWeight; // Half of standard fail (which is 2 * weight)
        } else if (quest.type === 'boss') {
          // Boss has tiered gold penalty: 10, 20, 40%
          const tiers = [0.1, 0.2, 0.4];
          const tierMult = tiers[count] || 0.4;
          goldPenalty = Math.floor(quest.xpReward * tierMult);
          accountabilityPenalty = 0.5; // Small constant accountability loss for boss delay
        }

        const historyItem = {
          date: new Date().toISOString(),
          reason,
          penaltyApplied: goldPenalty
        };

        set(state => ({
          gold: Math.max(0, state.gold - goldPenalty),
          accountabilityScore: Math.max(0, state.accountabilityScore - accountabilityPenalty),
          dailyQuests: state.dailyQuests.map(q => q.id === id ? {
            ...q,
            dueDate: newDate,
            postponeCount: count + 1,
            postponeHistory: [...(q.postponeHistory || []), historyItem]
          } : q)
        }));

        const { user } = get();
        if (user) {
          const { error: updateError } = await supabase.from('quests').update({
            due_date: newDate,
            postpone_count: count + 1,
            postpone_history: get().dailyQuests.find(q => q.id === id)?.postponeHistory
          }).eq('id', id);

          if (updateError) {
            console.error('[DB_ERROR] postponeQuest:', updateError);
            get().addNotification({ title: 'RESCHEDULE SYNC FAILED', description: 'Changes saved locally but cloud update failed.', status: 'URGENT', iconType: 'alert' });
          }

          await supabase.from('user_stats').update({ 
            gold: get().gold,
            accountability_score: get().accountabilityScore 
          }).eq('id', user.id);
        }

        get().addNotification({
          title: 'PROTOCOL RESCHEDULED',
          description: `Strike ${count + 1} logged. -${goldPenalty} GC penalty applied.`,
          status: 'NOW',
          iconType: 'time'
        });
      },

      clearPunishment: async (id) => {
        set(state => ({
          punishments: state.punishments.map(p => p.id === id ? { ...p, status: 'cleared' } : p),
          accountabilityScore: Math.min(100, state.accountabilityScore + 1)
        }));
        get().addNotification({
          title: 'PENALTY CLEARED',
          description: 'Accountability score restored (+1). Integrity maintained.',
          status: 'NOW',
          iconType: 'milestone'
        });
      },

      addQuest: async (quest) => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newQuest: Quest = {
          ...quest,
          id: newId,
          completed: false,
          streak: 0,
          priority: quest.priority || 'P2',
          repeating: quest.repeating !== undefined ? quest.repeating : true,
          postponeCount: 0,
          postponeHistory: []
        };

        set((state) => ({ dailyQuests: [...state.dailyQuests, newQuest] }));

        const { user } = get();
        if (user) {
          const { error: insertError } = await supabase.from('quests').insert([{
            id: newId,
            user_id: user.id,
            title: quest.title,
            xp_reward: quest.xpReward,
            stat_id: quest.statId,
            type: quest.type,
            difficulty: quest.difficulty || 'medium',
            priority: quest.priority || 'P2',
            due_date: quest.dueDate || null, // Sanitize empty string to null
            completed: false,
            streak: 0,
            repeating: quest.repeating !== undefined ? quest.repeating : true,
            postpone_count: 0,
            postpone_history: [],
            created_at: new Date().toISOString()
          }]);

          if (insertError) {
            console.error('[DB_ERROR] addQuest:', insertError);
            get().addNotification({ 
              title: 'PERSISTENCE FAILURE', 
              description: 'Mission not saved to cloud. Check database schema or connection.', 
              status: 'URGENT', 
              iconType: 'alert' 
            });
          }
        }
      },

      // F17: Job Hunt XP Bridge (called from updateJobStatus)
      updateJobStatus: async (id, status) => {
        set((state) => ({ jobApplications: state.jobApplications.map(job => job.id === id ? { ...job, status } : job) }));
        const { user } = get();
        if (user) await supabase.from('job_applications').update({ status }).eq('id', id).eq('user_id', user.id);

        // Auto-XP on status changes
        if (status === 'interviewing') {
          await get().logActivity('network', 25);
          get().addNotification({ title: 'INTERVIEW SECURED', description: '+25 NETWORK XP credited.', status: 'NOW', iconType: 'milestone' });
        }
        if (status === 'PENDING OFFER') {
          await get().logActivity('brand', 50);
          get().addNotification({ title: 'OFFER INCOMING', description: '+50 BRAND XP credited. Elite status.', status: 'NOW', iconType: 'rank' });
        }
      },

      // F12: Take stat snapshot for historical comparison
      takeSnapshot: () => {
        const { statLevels, freedomScore, snapshotHistory } = get();
        const snapshot: StatSnapshot = {
          date: new Date().toISOString(),
          statLevels: { ...statLevels },
          freedomScore
        };
        set({ snapshotHistory: [snapshot, ...snapshotHistory].slice(0, 90) });
      },

      // F15: Synergy-aware freedom computation
      recomputeFreedom: () => {
        const { statLevels } = get();
        let score = computeFreedomScore(statLevels);

        // Synergy bonus: if no stat is >40% of the total level sum
        const totalLevels = Object.values(statLevels).reduce((a, b) => a + b, 0);
        if (totalLevels > 0) {
          const maxStat = Math.max(...Object.values(statLevels));
          const synergyRatio = maxStat / totalLevels;
          if (synergyRatio < 0.4) score *= 1.08; // 8% synergy bonus
        }

        set({ freedomScore: Number(score.toFixed(1)) });
      },

      setLogModalOpen: (open) => set({ logModalOpen: open }),
      setTheme: (theme) => set({ theme }),
      setSelectedStat: (statId) => set({ selectedStat: statId }),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setDailyGoalXP: (xp) => set({ dailyGoalXP: xp }),
      setOnboardingComplete: () => set({ onboardingComplete: true }),

      toggleNotifications: (open) => set((state) => ({ notificationsOpen: open ?? !state.notificationsOpen })),
      addNotification: (n) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          notifications: [{ ...n, id, read: false, createdAt: new Date().toISOString() }, ...state.notifications].slice(0, 50)
        }));

        // Automated Sonner Toast (Pure TS compatible)
        toast(n.title, {
          description: n.description,
          duration: 4000,
        });
      },
      clearNotifications: () => set({ notifications: [] }),

      addContact: (c) => set((state) => ({
        nexusContacts: [...state.nexusContacts, { ...c, id: Math.random().toString(36).substr(2, 9) }]
      })),

      logOutreach: (id) => {
        const { nexusContacts, logActivity } = get();
        const contact = nexusContacts.find(c => c.id === id);
        if (!contact) return;

        set({
          nexusContacts: nexusContacts.map(c => c.id === id ? { ...c, lastContact: new Date().toISOString() } : c)
        });

        logActivity('network', 15, `Outreach: ${contact.name}`);
      },

      addJobApp: async (app) => {
        const { user } = get();
        const newId = Math.random().toString(36).substr(2, 9);
        const newApp = { ...app, id: newId };
        
        set((state) => ({ 
          jobApplications: [...state.jobApplications, newApp] 
        }));

        if (user) {
          try {
            const { error } = await supabase.from('job_applications').insert([{ id: newId, user_id: user.id, ...app }]);
            if (error) throw error;
          } catch (err) {
            console.error('[DB_ERROR] addJobApp:', err);
            get().addNotification({ 
              title: 'SYNC ERROR', 
              description: 'Failed to save target to cloud. Local state preserved.', 
              status: 'URGENT', 
              iconType: 'alert' 
            });
          }
        }
      },

      updateJobApp: async (id, data) => {
        const { user, jobApplications } = get();
        const updatedApps = jobApplications.map(job => job.id === id ? { ...job, ...data } : job);
        
        set({ jobApplications: updatedApps });

        if (user) {
          try {
            const { error } = await supabase.from('job_applications').update(data).eq('id', id).eq('user_id', user.id);
            if (error) throw error;
          } catch (err) {
            console.error('[DB_ERROR] updateJobApp:', err);
            get().addNotification({ 
              title: 'SYNC ERROR', 
              description: 'Target update failed in cloud.', 
              status: 'URGENT', 
              iconType: 'alert' 
            });
          }
        }
      },

      deleteJobApp: async (id) => {
        const { user, jobApplications } = get();
        set({ jobApplications: jobApplications.filter(j => j.id !== id) });

        if (user) {
          try {
            const { error } = await supabase.from('job_applications').delete().eq('id', id).eq('user_id', user.id);
            if (error) throw error;
          } catch (err) {
            console.error('[DB_ERROR] deleteJobApp:', err);
            get().addNotification({ 
              title: 'SYNC ERROR', 
              description: 'Failed to remove target from cloud.', 
              status: 'URGENT', 
              iconType: 'alert' 
            });
          }
        }

        get().addNotification({ 
          title: 'TARGET NEUTRALIZED', 
          description: 'Job application removed from engine.', 
          status: 'NOW', 
          iconType: 'milestone' 
        });
      },

      addTransaction: async (tx) => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newTx: Transaction = { ...tx, id: newId };
        set((state) => ({ transactions: [newTx, ...state.transactions] }));
        const { user } = get();

        if (user) {
          console.log('SYNCING_TRANSACTION:', { id: newId, pool_id: tx.poolId });
          const { error } = await supabase.from('transactions').insert([{
            id: newId,
            user_id: user.id,
            amount: Number(tx.amount),
            type: tx.type,
            description: tx.description,
            date: tx.date,
            category: tx.category || 'General',
            sector: tx.sector || 'Personal',
            pool_id: tx.poolId,
            metadata: tx.metadata || {}
          }]);

          if (error) {
            console.error('SUPABASE_TRANSACTION_ERROR:', error);
          }
        }

        // Auto-log Wealth XP for income
        if (tx.type === 'income') await get().logActivity('wealth', Math.min(50, Math.floor(tx.amount / 100)));
      },

      addFinancialGoal: async (goal) => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newGoal: FinancialGoal = { ...goal, id: newId, currentAmount: 0, status: 'active' };
        set((state) => ({ financialGoals: [newGoal, ...state.financialGoals] }));
        const { user } = get();
        if (user) {
          await supabase.from('financial_goals').insert([{
            id: newId,
            user_id: user.id,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: 0,
            category: goal.category,
            status: 'active'
          }]);
        }
      },

      allocateToGoal: async (goalId, amount) => {
        const { user, financialGoals } = get();
        const goal = financialGoals.find(g => g.id === goalId);
        if (!goal) return;

        const newAmount = goal.currentAmount + amount;
        const newStatus = newAmount >= goal.targetAmount ? 'completed' : goal.status;

        set((state) => ({
          financialGoals: state.financialGoals.map(g =>
            g.id === goalId ? { ...g, currentAmount: newAmount, status: newStatus } : g
          )
        }));

        if (user) {
          await supabase.from('financial_goals')
            .update({ current_amount: newAmount, status: newStatus })
            .eq('id', goalId);
        }
      },

      updateGoalStatus: async (id, status) => {
        const { user } = get();
        set((state) => ({
          financialGoals: state.financialGoals.map(g => g.id === id ? { ...g, status } : g)
        }));
        if (user) await supabase.from('financial_goals').update({ status }).eq('id', id);
      },

      addPortfolio: async (portfolio) => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newP = { ...portfolio, id: newId };
        set((state) => ({ portfolios: [newP, ...state.portfolios] }));
        const { user } = get();
        if (user) await supabase.from('portfolios').insert([{ user_id: user.id, ...newP }]);
      },

      updatePortfolioBalance: async (id, amount) => {
        const { user, portfolios } = get();
        const p = portfolios.find(x => x.id === id);
        if (!p) return;
        const newBalance = p.balance + amount;
        set((state) => ({
          portfolios: state.portfolios.map(p => p.id === id ? { ...p, balance: newBalance } : p)
        }));
        if (user) await supabase.from('portfolios').update({ balance: newBalance }).eq('id', id);
      },

      addJournalEntry: async (entry) => {
        const newId = Math.random().toString(36).substr(2, 9);
        set((state) => ({ journalEntries: [{ ...entry, id: newId }, ...state.journalEntries] }));
        const { user } = get();
        if (user) await supabase.from('journal_entries').insert([{ id: newId, user_id: user.id, ...entry }]);
      },

      updateJournalEntry: async (id, entry) => {
        set((state) => ({
          journalEntries: state.journalEntries.map(e => e.id === id ? { ...e, ...entry } : e)
        }));
        const { user } = get();
        if (user) await supabase.from('journal_entries').update(entry).eq('id', id).eq('user_id', user.id);
        // F21: Mind XP on journal save
        await get().logActivity('mind', 20);
      },

      buyItem: async (itemId, cost) => {
        const { gold, inventory, user } = get();
        if (gold < cost) return;

        const newInventory = [...inventory, itemId];
        set({ gold: gold - cost, inventory: newInventory });

        if (user) {
          await supabase.from('user_stats').update({ gold: get().gold, inventory: newInventory }).eq('id', user.id);
        }

        get().addNotification({
          title: 'ITEM ACQUIRED',
          description: `${itemId.replace(/_/g, ' ').toUpperCase()} deployed to inventory.`,
          status: 'NOW',
          iconType: 'milestone'
        });
      },

      addVenture: (v) => {
        const newId = Math.random().toString(36).substr(2, 9);
        set(state => ({
          ventures: [{ ...v, id: newId, date: new Date().toISOString() }, ...state.ventures]
        }));
        // F16: Auto-log Wealth XP for venture activity
        get().logActivity('wealth', 30);
      },

      addKnowledgeCard: (card) => {
        const newId = Math.random().toString(36).substr(2, 9);
        set(state => ({
          knowledgeCards: [{ ...card, id: newId, date: new Date().toISOString(), mastered: false }, ...state.knowledgeCards]
        }));
        get().logActivity('mind', 15);
      },

      toggleCardMastered: (id) => {
        set(state => ({
          knowledgeCards: state.knowledgeCards.map(c => c.id === id ? { ...c, mastered: !c.mastered } : c)
        }));
      },

      bulkCompleteQuests: async (ids) => {
        for (const id of ids) {
          await get().completeQuest(id);
        }
      },

      bulkDeleteQuests: async (ids) => {
        set(state => ({
          dailyQuests: state.dailyQuests.filter(q => !ids.includes(q.id))
        }));
      },

      updateQuestNotes: async (id, notes, subtasks) => {
        set(state => ({
          dailyQuests: state.dailyQuests.map(q =>
            q.id === id ? { ...q, notes, subtasks } : q
          )
        }));
      },

      updateQuest: async (id, data) => {
        set(state => ({
          dailyQuests: state.dailyQuests.map(q => q.id === id ? { ...q, ...data } : q)
        }));

        const { user } = get();
        if (user) {
          // Map camelCase to snake_case for Supabase
          const updateData: any = {};
          if (data.title !== undefined) updateData.title = data.title;
          if (data.xpReward !== undefined) updateData.xp_reward = data.xpReward;
          if (data.statId !== undefined) updateData.stat_id = data.statId;
          if (data.type !== undefined) updateData.type = data.type;
          if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
          if (data.priority !== undefined) updateData.priority = data.priority;
          if (data.dueDate !== undefined) updateData.due_date = data.dueDate || null; // Sanitize
          if (data.repeating !== undefined) updateData.repeating = data.repeating;
          if (data.archived !== undefined) updateData.archived = data.archived;
          if (data.completed !== undefined) updateData.completed = data.completed;
          if (data.failed !== undefined) updateData.failed = data.failed;

          const { error: updateError } = await supabase.from('quests').update(updateData).eq('id', id);
          
          if (updateError) {
            console.error('[DB_ERROR] updateQuest:', updateError);
            get().addNotification({ 
              title: 'SYNC FAILURE', 
              description: 'Failed to update mission in cloud. Data mismatch detected.', 
              status: 'URGENT', 
              iconType: 'alert' 
            });
          }
        }
      },

      deleteTransaction: async (id) => {
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id)
        }));
      },

      updateTransaction: async (id, tx) => {
        set(state => ({
          transactions: state.transactions.map(t => t.id === id ? { ...t, ...tx } : t)
        }));
      },

      addRecurringTx: async (tx) => {
        const id = Math.random().toString(36).substr(2, 9);
        set(state => ({
          recurringTransactions: [...state.recurringTransactions, { ...tx, id }]
        }));
      },

      removeRecurringTx: (id) => {
        set(state => ({
          recurringTransactions: state.recurringTransactions.filter(r => r.id !== id)
        }));
      },

      addVentureRevenue: async (id, amount, memo) => {
        const { ventures, addTransaction } = get();
        const venture = ventures.find(v => v.id === id);
        if (!venture) return;

        set(state => ({
          ventures: state.ventures.map(v =>
            v.id === id ? { ...v, revenue: v.revenue + amount } : v
          )
        }));

        await addTransaction({
          amount,
          description: `[REVENUE: ${venture.name}] ${memo}`,
          type: 'income',
          category: 'Venture Revenue',
          sector: venture.type.toUpperCase(),
          poolId: 'business',
          date: new Date().toISOString()
        });
      },

      updateVenture: async (id, data) => {
        set(state => ({
          ventures: state.ventures.map(v => v.id === id ? { ...v, ...data } : v)
        }));
      },

      addMoodEntry: (entry) => {
        const newId = Math.random().toString(36).substr(2, 9);
        set(state => ({
          moodHistory: [...state.moodHistory, {
            ...entry,
            id: newId,
            intensity: entry.intensity || 5,
            date: new Date().toISOString()
          }].slice(0, 90)
        }));
      },

      archiveJournalEntry: async (id) => {
        set(state => ({
          journalEntries: state.journalEntries.map(e =>
            e.id === id ? { ...e, isArchived: true } : e
          )
        }));
      },

      unarchiveJournalEntry: async (id) => {
        set(state => ({
          journalEntries: state.journalEntries.map(e =>
            e.id === id ? { ...e, isArchived: false } : e
          )
        }));
      },

      toggleTripChecklist: (tripId, itemId) => {
        // Implementation for trip checklist
      },

      addTripChecklistItem: (tripId, text) => {
        // Implementation for trip checklist
      },

      tickQuests: () => {
        const { dailyQuests, failQuest } = get();
        let changed = false;
        const nextQuests = dailyQuests.map(q => {
          const now = new Date().getTime();
          const hasDeadline = q.dueDate ? new Date(q.dueDate).getTime() : (q.expiresAt ? new Date(q.expiresAt).getTime() : null);
          const isOverdue = hasDeadline && !q.completed && !q.failed && hasDeadline <= now;

          if (isOverdue) {
            changed = true;
            setTimeout(() => failQuest(q.id), 0);

            // If it's a one-off that failed, we might want to archive it or just leave it failed
            if (!q.repeating) {
              return { ...q, failed: true, archived: true };
            }
            return { ...q, failed: true };
          }

          // Daily Reminder (< 1h)
          if (!q.completed && !q.failed && !q.reminded && hasDeadline) {
            const timeLeft = hasDeadline - now;
            if (timeLeft > 0 && timeLeft < 3600000) { // < 1 hour
              changed = true;
              setTimeout(() => {
                get().addNotification({
                  title: 'PROTOCOL EXPIRING',
                  description: `"${q.title}" expires in < 60m. Strict 24h limit applies.`,
                  status: 'URGENT',
                  iconType: 'alert'
                });
              }, 0);
              return { ...q, reminded: true };
            }
          }

          if (!q.completed && !q.failed && q.isTimed && q.timeLeft && q.timeLeft > 0) {
            changed = true;
            const newTime = q.timeLeft - 1;
            if (newTime <= 0) {
              setTimeout(() => failQuest(q.id), 0);
              return { ...q, timeLeft: 0, failed: true };
            }
            return { ...q, timeLeft: newTime };
          }
          return q;
        });

        if (changed) set({ dailyQuests: nextQuests });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, jobApplications: [], transactions: [], journalEntries: [] });
      }
    }),
    {
      name: 'sovereign-os-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        dailyGoalXP: state.dailyGoalXP,
        onboardingComplete: state.onboardingComplete,
        snapshotHistory: state.snapshotHistory,
        activityLog: state.activityLog,
        dailyQuests: state.dailyQuests,
        moodHistory: state.moodHistory,
        lastDailyReset: state.lastDailyReset,
        lastWeeklyReset: state.lastWeeklyReset,
        knowledgeCards: state.knowledgeCards,
        ventures: state.ventures,
        punishments: state.punishments,
        accountabilityScore: state.accountabilityScore,
      })
    }
  )
);
