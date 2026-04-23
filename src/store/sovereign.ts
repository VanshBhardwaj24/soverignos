import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  xpForLevel,
  computeFreedomScore,
  computeSovereignty,
  SKILL_PERKS,
  DIFFICULTY_MULTIPLIERS,
} from '../lib/constants';
import type { PunitiveChoice, ShopItem } from '../lib/constants';
import { toast } from 'sonner';
import {
  calculateCorrelation,
  getDiscoveryInsight,
  mapImpact,
  calculateResistanceFactor,
  calculateCognitiveEntropy,
  calculateWillpowerReserve,
  calculateThroughput,
  calculateFocusBalance,
  calculateMomentum,
  calculateConsistency,
  analyzeSentiment,
  calculateEnvironmentImpact,
  calculateConsistentYouProjection,
  calculateVelocityAndAcceleration,
  calculateResilienceScore,
  calculateThroughputBreakdown,
  calculateAttentionAudit,
  calculateCausalGraph,
  calculateFlywheels,
  generateSystemPredictions,
  calculateEnvironmentSynergy,
  calculateComparativeBenchmarks
} from '../lib/intelligence';
import { usePsychStore } from './sovereign-psych';

export interface Quest {
  id: string;
  title: string;
  xpReward: number;
  statId: string;
  completed: boolean;
  failed?: boolean;
  protected?: boolean;
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
  archived?: boolean;
  repeating?: boolean;
  currentPhase?: number;
  totalPhases?: number;
  notes?: string;
  dailyBriefingId?: string;
  dailyBriefingDate?: string;
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
  effort?: 'low' | 'high';
  appliedAt?: string;
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
  status: 'NOW' | 'RECENT' | 'OLD' | 'URGENT';
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
  stat?: string;
  metadata?: Record<string, any>;
}

export interface Venture {
  id: string;
  name: string;
  type: 'SAAS' | 'E-COMM' | 'CONTENT' | 'SERVICE' | 'TRADING';
  status: 'active' | 'passive' | 'ideation' | 'paused';
  revenue: number;
  expenses: number;
  description?: string;
  date: string;
  history?: { date: string, amount: number, memo: string }[];
}

export interface LifeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'past' | 'future';
  category: 'career' | 'personal' | 'financial' | 'travel';
}

export interface DelusionEntry {
  week: string;
  perceivedRating: number;
  actualRating: number;
}

export interface HistoricalQuest {
  id: string;
  title: string;
  statId: string;
  status: 'completed' | 'failed';
  timestamp: string;
  xpReward: number;
  difficulty?: string;
  excuse?: string;
}

export interface StreakCemeteryEntry {
  id: string;
  statId: string;
  days: number;
  diedAt: string;
  cause: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  context: string;
  status: 'dream' | 'planned' | 'visited';
  unlockRequirement: string;
}

export interface FreedomMilestone {
  id: string;
  label: string;
  timeframe: string;
  dependencyStatus: string;
  isUnlocked: boolean;
}

export interface IntegrationStatus {
  github: { connected: boolean, lastSync: string, commitsWeek: number };
  leetcode: { connected: boolean, lastSync: string, solvedTotal: number, easy: number, medium: number, hard: number };
  twitter: { connected: boolean, followers: number, postsMonth: number };
  trademind: { connected: boolean, lastSync: string, winRate: number };
}

export interface StatDossiers {
  code: {
    leetCode: { easy: number, medium: number, hard: number, avgTimeMedium: number, mastered: string[], weak: string[] };
    github: { longestStreak: number, currentStreak: number, prsMerged: number, commits: number };
    jobApps: { sent: number, responseRate: number };
  };
  wealth: {
    trading: { accountPhase: string; primaryPairs: string[]; drawdown: number; drawdownLimit: number };
    income: { activeStreams: number; targetIncome: number };
  };
  body: {
    gym: { sessionsMonth: number, targetSessions: number, longestStreak: number };
    sleep: { avgHours: number, targetHours: number, currentStreak: number, bestStreak: number };
    restDays: number;
  };
  brand: {
    twitter: { engagementRate: number; articlesPublished: number; lastPostDate: string };
    linkedin: { connections: number };
    githubStars: number;
  };
  network: {
    coldOutreach: { sent: number, responseRate: number };
    warmConnections: number;
    referrals: { asked: number, received: number };
    staleContactsCount: number;
  };
}

export interface KnowledgeCard {
  id: string;
  question: string;
  answer: string;
  folder: string;
  mastered: boolean;
  date: string;
  interval?: number;
  easiness?: number;
  consecutiveSuccess?: number;
  nextReview?: string;
}

export interface MoodEntry {
  id: string;
  mood: number;
  energy: number;
  intensity: number;
  sleep?: number;
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
  type: 'physical' | 'financial' | 'mental' | 'debuff' | 'consequential';
  title: string;
  description: string;
  penalty?: number;
  status: 'active' | 'cleared' | 'failed' | 'awaiting_selection';
  date: string;
  questId?: string;
  statId?: string;
  options?: PunitiveChoice[];
}

export interface CausalityDiscovery {
  id: string;
  title: string;
  description: string;
  correlationStrength: number; // 0 to 1
  impactLevel: 'Low' | 'Medium' | 'High' | 'EXTREME';
  variables: [string, string];
  trend: 'up' | 'down' | 'stable';
  insight: string;
  dataPoints: { x: any, y: any }[];
  updatedAt: string;
  status?: 'hypothesis' | 'verified';
}

export interface IntelligenceLog {
  timestamp: string;
  event: string;
  impact: number;
}

export interface Loan {
  id: string;
  itemId: string;
  itemName: string;
  borrowedAmount: number;
  interestRate: number;
  totalRepay: number;
  amountRepaid: number;
  startDate: string;
  durationMonths: number;
  deadline: string;
  repaymentType: 'all_earnings' | 'monthly_target';
  associatedStat: string;
  status: 'active' | 'grace_period' | 'late' | 'repaid' | 'defaulted';
  lastRepaymentDate?: string;
}

interface SovereignStore {
  user: User | null;
  setUser: (user: User | null) => void;
  syncFromCloud: () => Promise<void>;

  statLevels: Record<string, number>;
  statXP: Record<string, number>;
  statTodayXP: Record<string, number>;
  resources: Record<string, number>;
  freedomScore: number;
  sovereignty: number;
  prestige: Record<string, number>;
  streaks: Record<string, { current: number; longest: number }>;
  globalStreak: { current: number; longest: number };
  unlockedSkills: string[];
  integrity: number;
  consecutiveDaysFailed: number;
  violationStreaks: Record<string, number>;

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
  alias: string;
  username: string;
  joinedAt: string;
  bio: string;
  foundingStatement: string;
  foundingStatementDate: string | null;
  graduationDate: string | null;
  lifeEvents: LifeEvent[];
  delusionHistory: DelusionEntry[];
  streakCemetery: StreakCemeteryEntry[];
  antiWishlist: string[];
  obituaryTest: string;
  destinationBoard: Destination[];
  freedomRoadmap: FreedomMilestone[];
  integrationStatus: IntegrationStatus;
  dossiers: StatDossiers;
  questHistory: HistoricalQuest[];

  causalityDiscoveries: CausalityDiscovery[];
  surveillanceMetrics: any;
  intelligenceLogs: IntelligenceLog[];
  projections: { name: number, xp: number }[];

  // F27: Marketplace & Economy
  inventory: string[];
  wishlist: string[];
  customRewards: ShopItem[];
  activeLoadout: {
    itemId: string;
    deployedAt: string;
    expiresAt: string;
    currentROI: number;
  }[];
  itemCooldowns: Record<string, string>; // itemId -> ISO Timestamp
  gold: number;
  activeLoans: Loan[];

  // New behavioral guardrails state
  sessionStartTime: string;
  restModeActive: boolean;
  notificationPreferences: { critical: boolean; informational: boolean; celebratory: boolean };
  weekScore: number;

  getActiveMultiplierBreakdown: (statId: string) => { sources: { name: string; value: number }[]; total: number };
  getDailyXPDiminishingFactor: () => number;
  toggleRestMode: () => void;

  // Actions
  briefingSeenDates: string[]; // Morning
  summarySeenDates: string[];  // Evening
  briefingTemplates: {
    id: string;
    title: string;
    tasks: { title: string; statId: string; xpReward: number; priority: 'P0' | 'P1' | 'P2' | 'P3' }[];
  }[];

  // Actions
  setBriefingSeen: (date: string) => void;
  setSummarySeen: (date: string) => void;
  applyDailyTemplate: (templateId: string) => void;
  finalizeDailyBriefing: (date: string) => { success: boolean; xpReward: number };
  saveTemplates: (templates: any[]) => void;

  takeSnapshot: () => void;
  addContact: (c: Omit<Contact, 'id'>) => void;
  logOutreach: (id: string) => void;
  acceptPunishmentOption: (punishmentId: string, optionId: string) => Promise<void>;
  lastDailyReset: string;
  lastWeeklyReset: string;
  dailyGoalXP: number;
  onboardingComplete: boolean;
  sidebarCollapsed: boolean;

  selectedStat: string | null;
  lastLeveledStat: { statId: string; oldLevel: number; newLevel: number } | null;
  setLastLeveledStat: (stat: { statId: string; oldLevel: number; newLevel: number } | null) => void;
  logModalOpen: boolean;
  preselectedStat: string | null;
  preselectedActivity: string | null;
  questModalOpen: boolean;
  setQuestModalOpen: (open: boolean) => void;
  proofModalOpen: boolean;
  setProofModalOpen: (open: boolean) => void;
  pendingActivity: { statId: string; xp: number; questId?: string; metadata?: Record<string, any> } | null;
  setPendingActivity: (data: { statId: string; xp: number; questId?: string; metadata?: Record<string, any> } | null) => void;
  targetQuestId: string | null;
  setTargetQuestId: (id: string | null) => void;
  theme: 'dark' | 'light';

  logActivity: (statId: string, xp: number, questId?: string, metadata?: Record<string, any>) => Promise<void>;
  completeQuest: (questId: string, skipLog?: boolean) => Promise<void>;
  failQuest: (questId: string) => Promise<void>;
  addQuest: (quest: Omit<Quest, 'id' | 'completed' | 'streak'>) => Promise<string>;
  protectQuest: (questId: string) => Promise<void>;
  resetDailyQuests: () => Promise<void>;
  resetWeeklyQuests: () => Promise<void>;
  archiveQuest: (id: string) => Promise<void>;
  restoreQuest: (id: string) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  setLogModalOpen: (open: boolean, statId?: string, activityId?: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSelectedStat: (statId: string | null) => void;
  recomputeFreedom: () => void;
  setBudgetCap: (cap: number) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setDailyGoalXP: (xp: number) => void;
  setOnboardingComplete: () => void;
  logout: () => Promise<void>;
  clearPunishment: (id: string) => Promise<void>;
  updateProfile: (data: Partial<{ alias: string, username: string, bio: string }>) => Promise<void>;
  setFoundingStatement: (statement: string) => Promise<{ success: boolean; error?: string }>;
  updateDossier: (statId: keyof StatDossiers, data: any) => void;
  addLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  buryStreak: (statId: string, days: number, cause: string) => void;
  backfillQuestHistory: () => void;
  updateVisionBoard: (data: Partial<{ antiWishlist: string[], obituaryTest: string }>) => void;
  updateGraduationDate: (date: string) => void;

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
  buyItem: (itemId: string, cost: number) => Promise<{ success: boolean; error?: string }>;
  deployItem: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  toggleWishlist: (itemId: string) => void;
  addReward: (reward: Omit<ShopItem, 'id'>) => Promise<void>;
  updateReward: (id: string, reward: Partial<ShopItem>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  requestLoan: (itemId: string, durationMonths: number, repaymentType: 'all_earnings' | 'monthly_target') => Promise<{ success: boolean; error?: string }>;
  checkLoanStatus: () => Promise<void>;

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
  checkMissionExpiries: () => Promise<void>;
  tickQuests: () => void;
  runCausalityAnalysis: (isManual?: boolean) => void;
  updateSurveillance: () => void;
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
            dailyQuests: quests.map(q => {
              // Default to IST midnight today if no deadline exists in DB
              const getISTMidnight = () => {
                const now = new Date();
                const istOffset = 5.5 * 60 * 60 * 1000;
                const istTime = new Date(now.getTime() + istOffset);
                istTime.setUTCHours(23, 59, 59, 999);
                return new Date(istTime.getTime() - istOffset).toISOString();
              };

              return {
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
                expiresAt: q.expires_at || getISTMidnight(),
                priority: q.priority || 'P2',
                dueDate: q.due_date,
                repeating: q.repeating !== null ? q.repeating : true,
                archived: q.archived || false,
                postponeCount: q.postpone_count || 0,
                postponeHistory: q.postpone_history || []
              };
            })
          });
        }

        const { data: stats } = await supabase.from('user_stats').select('*').eq('id', user.id).single();
        if (stats) {
          set({
            gold: stats.gold || 0,
            accountabilityScore: stats.accountability_score ?? get().accountabilityScore,
            integrity: stats.accountability_score ?? get().integrity,
            punishments: stats.punishments ?? get().punishments,
            inventory: stats.inventory || [],
            statLevels: {
              code: stats.code_level, wealth: stats.wealth_level, body: stats.body_level,
              mind: stats.mind_level, brand: stats.brand_level, network: stats.network_level,
              spirit: stats.spirit_level || 1, create: stats.create_level || 1
            },
            globalStreak: {
              current: stats.global_streak_current || 0,
              longest: stats.global_streak_longest || 0
            },
            statXP: {
              code: stats.code_xp, wealth: stats.wealth_xp, body: stats.body_xp,
              mind: stats.mind_xp, brand: stats.brand_xp, network: stats.network_xp,
              spirit: stats.spirit_xp || 0, create: stats.create_xp || 0
            },
            alias: stats.alias || get().alias,
            username: stats.username || user.email?.split('@')[0] || get().username,
            joinedAt: stats.joined_at || user.created_at || get().joinedAt,
            bio: stats.bio || get().bio,
            foundingStatement: stats.founding_statement || get().foundingStatement,
            foundingStatementDate: stats.founding_statement_date || get().foundingStatementDate,
            wishlist: stats.wishlist || [],
            activeLoadout: stats.active_loadout || [],
            itemCooldowns: stats.item_cooldowns || {},
            lastDailyReset: stats.last_daily_reset || get().lastDailyReset,
            lastWeeklyReset: stats.last_weekly_reset || get().lastWeeklyReset
          });
          get().recomputeFreedom();
        }

        const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const year = istNow.getFullYear();
        const month = String(istNow.getMonth() + 1).padStart(2, '0');
        const day = String(istNow.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`; // ISO format: 2026-04-22

        // Check if daily reset is needed
        // Use DB value as source of truth - if DB has today's date, skip reset
        const lastResetFromDB = stats?.last_daily_reset;
        if (!lastResetFromDB || lastResetFromDB !== today) {
          console.log(`[RESET] DB marker: "${lastResetFromDB}" vs today: "${today}"`);
          await get().resetDailyQuests();
        }

        // F-HIST: One-time backfill of quest history
        get().backfillQuestHistory();

        // Initialize intelligence engine
        get().updateSurveillance();
        get().runCausalityAnalysis();

        // Initialize cadence monitor
        get().checkMissionExpiries();
        setInterval(() => {
          get().checkMissionExpiries();
          get().updateSurveillance();
        }, 60000);
      },

      statLevels: { code: 1, wealth: 1, body: 1, mind: 1, brand: 1, network: 1, spirit: 1, create: 1 },
      statXP: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, spirit: 0, create: 0 },
      statTodayXP: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, spirit: 0, create: 0 },
      gold: 0,
      inventory: [],
      wishlist: [],
      customRewards: [],
      activeLoadout: [],
      itemCooldowns: {},
      activeLoans: [],
      resources: {},
      freedomScore: 0,
      sovereignty: 0,
      prestige: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, create: 0 },
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
      violationStreaks: {},

      sessionStartTime: new Date().toISOString(),
      restModeActive: false,
      notificationPreferences: { critical: true, informational: true, celebratory: true },
      weekScore: 0,

      dailyQuests: [
        { id: 'q1', title: 'Complete 2 Leetcode Hards', xpReward: 50, statId: 'code', completed: false, type: 'daily', streak: 0, difficulty: 'hard', priority: 'P1' },
        { id: 'q2', title: 'Backtest XAU/USD Strategy', xpReward: 40, statId: 'wealth', completed: false, type: 'daily', streak: 0, difficulty: 'medium', priority: 'P1' },
        { id: 'q3', title: 'Gym Session (60 min)', xpReward: 40, statId: 'body', completed: false, type: 'daily', streak: 0, difficulty: 'medium', priority: 'P2' },
        { id: 'q4', title: 'Meditate (20 min)', xpReward: 20, statId: 'mind', completed: false, type: 'daily', streak: 0, difficulty: 'easy', priority: 'P3' },
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
      alias: 'Sovereign Agent',
      username: 'agent_alpha',
      joinedAt: new Date().toISOString(),
      bio: 'Building towards success.',
      foundingStatement: '',
      foundingStatementDate: null,
      graduationDate: null,
      lifeEvents: [],
      delusionHistory: [],
      streakCemetery: [],
      antiWishlist: [],
      obituaryTest: '',
      destinationBoard: [
        { id: '1', name: 'Bali', country: 'Indonesia', context: 'First solo international', status: 'dream', unlockRequirement: 'First job offer' },
        { id: '2', name: 'Tokyo', country: 'Japan', context: 'When I have real money', status: 'dream', unlockRequirement: 'Net worth > $50k' },
        { id: '3', name: 'Goa', country: 'India', context: 'Next 6 months', status: 'planned', unlockRequirement: 'Clear Phase 2' },
      ],
      freedomRoadmap: [
        { id: '1', label: 'Graduated', timeframe: 'NOW', dependencyStatus: 'COMPLETED', isUnlocked: true },
        { id: '2', label: 'First Job', timeframe: '3 Months', dependencyStatus: 'In Progress', isUnlocked: false },
        { id: '3', label: 'TradeMind Profit', timeframe: '8 Months', dependencyStatus: 'Pending', isUnlocked: false },
        { id: '4', label: 'Financial Independence', timeframe: '18 Months', dependencyStatus: 'Pending', isUnlocked: false },
      ],
      integrationStatus: {
        github: { connected: false, lastSync: '', commitsWeek: 0 },
        leetcode: { connected: false, lastSync: '', solvedTotal: 0, easy: 0, medium: 0, hard: 0 },
        twitter: { connected: false, followers: 0, postsMonth: 0 },
        trademind: { connected: false, lastSync: '', winRate: 0 }
      },
      questHistory: [],
      dossiers: {
        code: {
          leetCode: { easy: 0, medium: 0, hard: 0, avgTimeMedium: 0, mastered: [], weak: [] },
          github: { longestStreak: 0, currentStreak: 0, prsMerged: 0, commits: 0 },
          jobApps: { sent: 0, responseRate: 0 }
        },
        wealth: {
          trading: { accountPhase: 'PHASE 1', primaryPairs: [], drawdown: 0, drawdownLimit: 4 },
          income: { activeStreams: 0, targetIncome: 0 }
        },
        body: {
          gym: { sessionsMonth: 0, targetSessions: 30, longestStreak: 0 },
          sleep: { avgHours: 0, targetHours: 8, currentStreak: 0, bestStreak: 0 },
          restDays: 0
        },
        brand: {
          twitter: { engagementRate: 0, articlesPublished: 0, lastPostDate: '' },
          linkedin: { connections: 0 },
          githubStars: 0
        },
        network: {
          coldOutreach: { sent: 0, responseRate: 0 },
          warmConnections: 0,
          referrals: { asked: 0, received: 0 },
          staleContactsCount: 0
        }
      },
      causalityDiscoveries: [],
      surveillanceMetrics: {
        resistanceFactor: 100,
        cognitiveEntropy: 0,
        willpowerReserve: 100,
        throughput: 0,
        focusBalance: 100,
        consistency: 0,
        momentum: 0,
        resilienceScore: 100,
        breakdown: { byStat: {}, byHour: {}, byDay: {} },
        trajectoryData: { velocity: 0, acceleration: 0, trend: 'stable' }
      },
      intelligenceLogs: [],
      projections: [],
      lastDailyReset: '', // Don't pre-set to today - let DB determine if reset is needed
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
      preselectedStat: null,
      preselectedActivity: null,
      questModalOpen: false,
      setQuestModalOpen: (open) => set({ questModalOpen: open }),
      proofModalOpen: false,
      setProofModalOpen: (open) => set({ proofModalOpen: open }),
      pendingActivity: null,
      setPendingActivity: (data) => set({ pendingActivity: data }),
      targetQuestId: null,
      setTargetQuestId: (id) => set({ targetQuestId: id }),
      theme: 'dark',

      // Daily Briefing State
      briefingSeenDates: [],
      summarySeenDates: [],
      briefingTemplates: [
        {
          id: 'sovereign_prime',
          title: 'Sovereign Prime',
          tasks: [
            { title: 'Coding & Strategic Learning (4h)', statId: 'code', xpReward: 100, priority: 'P0' },
            { title: 'High-Intensity Training (Gym)', statId: 'body', xpReward: 50, priority: 'P1' },
            { title: 'Hydration Cycle (4L Water)', statId: 'spirit', xpReward: 20, priority: 'P2' },
            { title: 'Operational Expansion (10 Job Apps)', statId: 'network', xpReward: 80, priority: 'P1' },
            { title: 'Personal Brand (Tweet/X)', statId: 'brand', xpReward: 30, priority: 'P2' },
            { title: 'Deep Work Session (2h)', statId: 'mind', xpReward: 60, priority: 'P1' },
            { title: 'Intellectual Synthesis (Reading)', statId: 'mind', xpReward: 40, priority: 'P2' }
          ]
        },
        {
          id: 'monk_mode',
          title: 'Monk Mode',
          tasks: [
            { title: 'Deep Learning (4h)', statId: 'mind', xpReward: 120, priority: 'P0' },
            { title: 'Body Conditioning', statId: 'body', xpReward: 60, priority: 'P1' },
            { title: 'Clean Diet & 4L Water', statId: 'spirit', xpReward: 40, priority: 'P1' },
            { title: 'Portfolio Build', statId: 'code', xpReward: 80, priority: 'P1' },
            { title: 'Market Analysis', statId: 'wealth', xpReward: 50, priority: 'P2' }
          ]
        }
      ],

      setBriefingSeen: (date) => set(state => ({
        briefingSeenDates: state.briefingSeenDates.includes(date)
          ? state.briefingSeenDates
          : [...state.briefingSeenDates, date]
      })),

      setSummarySeen: (date) => set(state => ({
        summarySeenDates: state.summarySeenDates.includes(date)
          ? state.summarySeenDates
          : [...state.summarySeenDates, date]
      })),

      applyDailyTemplate: (templateId) => {
        const { briefingTemplates, addQuest } = get();
        const template = briefingTemplates.find(t => t.id === templateId);
        if (!template) return;

        const dateString = new Date().toISOString().split('T')[0];

        template.tasks.forEach(task => {
          addQuest({
            title: task.title,
            statId: task.statId,
            xpReward: task.xpReward,
            priority: task.priority,
            type: 'daily',
            repeating: false,
            dailyBriefingId: template.id,
            dailyBriefingDate: dateString
          });
        });

        toast.success(`TEMPLATE APPLIED: ${template.title}`, {
          description: `${template.tasks.length} protocols initialized for ${dateString}.`
        });
      },

      finalizeDailyBriefing: (date) => {
        const { dailyQuests, logActivity } = get();
        const dayQuests = dailyQuests.filter(q => q.dailyBriefingDate === date);
        if (dayQuests.length === 0) return { success: false, xpReward: 0 };

        const allCompleted = dayQuests.every(q => q.completed);
        const reward = allCompleted ? 15 : 0; // Small bonus

        if (allCompleted) {
          logActivity('mind', 10, undefined, { type: 'daily_briefing_bonus', date });
          logActivity('spirit', 5, undefined, { type: 'daily_briefing_bonus', date });
          toast.success('DAILY OBJECTIVES COMPLETED', {
            description: 'System integrity remains at 100%. Small XP bonus awarded.'
          });
        }

        return { success: allCompleted, xpReward: reward };
      },

      saveTemplates: (templates) => set({ briefingTemplates: templates }),

      getActiveMultiplierBreakdown: (statId) => {
        if (!statId) return { sources: [], total: 1 };
        try {
          const { statLevels, prestige, globalStreak } = get();
          const sources = [];
          let total = 1;

          const level = statLevels[statId] || 1;
          const perk = SKILL_PERKS[statId]?.find(p => level >= p.level);
          if (perk?.xpBonus) {
            sources.push({ name: perk.name, value: 1 + perk.xpBonus });
            total *= (1 + perk.xpBonus);
          }
          const statPrestige = prestige[statId] || 0;
          if (statPrestige > 0) {
            const pMultiplier = Math.pow(1.5, statPrestige);
            sources.push({ name: `Prestige ${statPrestige}`, value: pMultiplier });
            total *= pMultiplier;
          }
          if (globalStreak && globalStreak.current > 0) {
            const sMultiplier = 1 + (globalStreak.current / 30);
            sources.push({ name: 'Streak Bonus', value: sMultiplier });
            total *= sMultiplier;
          }
          return { sources, total };
        } catch (e) {
          console.error('[Sovereign] Error getting multiplier breakdown:', e);
          return { sources: [], total: 1 };
        }
      },

      getDailyXPDiminishingFactor: () => {
        try {
          const { statTodayXP, selectedStat } = get();
          if (!selectedStat) return 1.0;
          const currentXP = statTodayXP[selectedStat] || 0;
          if (currentXP > 1000) return 0.5;
          if (currentXP > 500) return 0.8;
          return 1.0;
        } catch (e) {
          console.error('[Sovereign] Error getting diminishing factor:', e);
          return 1.0;
        }
      },

      toggleRestMode: () => set(state => ({ restModeActive: !state.restModeActive })),

      // F1: Daily Reset
      resetDailyQuests: async () => {
        const istNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const year = istNow.getFullYear();
        const month = String(istNow.getMonth() + 1).padStart(2, '0');
        const day = String(istNow.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`; // ISO format: 2026-04-22
        const { lastDailyReset } = get();

        // Trigger weekly reset check
        get().resetWeeklyQuests();

        if (lastDailyReset === today) {
          console.log('[RESET] Already reset today:', today);
          return;
        }
        console.log('[RESET] Starting daily reset for', today);

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

        // Pull all needed state fresh
        const {
          dailyQuests,
          accountabilityScore,
          gold,
          statXP,
          statLevels,
          globalStreak,
          consecutiveDaysFailed,
          violationStreaks,
          punishments
        } = get();

        // 1. Calculate Global Streak (respects Streak Insurance protection)
        const dailyQuestsFlat = dailyQuests.filter(q => q.type === 'daily');
        const completedYesterday = dailyQuestsFlat.filter(q => q.completed).length;
        const failedUnprotected = dailyQuestsFlat.filter(q => q.failed && !q.protected).length;
        const totalDailyCount = dailyQuestsFlat.length;

        const newGlobalStreak = (completedYesterday > 0 && failedUnprotected === 0)
          ? {
            current: globalStreak.current + 1,
            longest: Math.max(globalStreak.longest, globalStreak.current + 1)
          }
          : (failedUnprotected > 0 || (totalDailyCount > 0 && completedYesterday === 0))
            ? { current: 0, longest: globalStreak.longest }
            : globalStreak;

        // 2. Handle Missed Quests & Domain-Specific Punishments
        const { DOMAIN_PUNISHMENT_MATRIX } = await import('../lib/constants');

        // 2a. Log quest state breakdown (for debugging reset issues)
        const completedCount = dailyQuestsFlat.filter(q => q.completed).length;
        const failedCount = dailyQuestsFlat.filter(q => q.failed).length;
        const incompleteCount = dailyQuestsFlat.filter(q => !q.completed && !q.failed).length;
        console.log(`[RESET] Yesterday's quest states: Total=${dailyQuestsFlat.length}, Completed=${completedCount}, Failed=${failedCount}, Incomplete=${incompleteCount}`);

        // 2b. Fix: explicitly include both incomplete AND failed quests
        const missedQuests = dailyQuests.filter(q => q.type === 'daily' && !q.protected && (!q.completed || q.failed));

        let workingScore = accountabilityScore;
        let workingGold = gold;
        const workingStatXP = { ...statXP };
        const workingStatLevels = { ...statLevels };
        const workingViolationStreaks = { ...violationStreaks };
        const newPunishmentsList: Punishment[] = [];
        let newConsecutiveFailures = consecutiveDaysFailed;

        if (missedQuests.length > 0) {
          newConsecutiveFailures += 1;
          const escalationFactor = Math.min(2, 1 + (newConsecutiveFailures * 0.2));
          const missedByStat: Record<string, number> = {};

          let dailyAccountabilityLoss = 0;
          let dailyGoldLoss = 0;

          missedQuests.forEach(quest => {
            missedByStat[quest.statId] = (missedByStat[quest.statId] || 0) + 1;

            workingScore = Math.max(0, workingScore - (5 * escalationFactor));
            const penaltyAmount = Math.floor((quest.xpReward / 2) * escalationFactor);
            workingGold = Math.max(0, workingGold - penaltyAmount);

            const currentXP = workingStatXP[quest.statId] || 0;
            const newXP = Math.max(0, currentXP - penaltyAmount);
            workingStatXP[quest.statId] = newXP;

            let level = 1;
            while (xpForLevel(level) <= newXP) { level++; }
            workingStatLevels[quest.statId] = Math.max(1, level - 1);
          });

          // Process aggregated punishments per domain
          Object.entries(missedByStat).forEach(([statId]) => {
            workingViolationStreaks[statId] = (workingViolationStreaks[statId] || 0) + 1;

            const domainStreak = workingViolationStreaks[statId];
            let multiplier = 1;
            if (domainStreak >= 5) multiplier = 3;
            else if (domainStreak >= 3) multiplier = 2;

            // Trigger Penalty Quest selection if repeated failure (streak >= 2)
            if (domainStreak >= 2) {
              const matrix = DOMAIN_PUNISHMENT_MATRIX[statId] || DOMAIN_PUNISHMENT_MATRIX.general;
              newPunishmentsList.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'consequential',
                title: `DOMAIN VIOLATION: ${statId.toUpperCase()}`,
                description: `Repeated failure detected in ${statId.toUpperCase()}. Choice required for resolution.`,
                status: 'awaiting_selection',
                date: new Date().toISOString(),
                statId,
                options: matrix,
                penalty: domainStreak * 5 * multiplier
              });
            }
          });
        } else {
          newConsecutiveFailures = 0;
          // Reset violation streaks for successfully executed domains
          dailyQuests.filter(q => q.completed).forEach(q => {
            workingViolationStreaks[q.statId] = 0;
          });

          // REHABILITATION: Bring any wiped stats (Level 0) back to Level 1 baseline
          Object.entries(workingStatLevels).forEach(([statId, level]) => {
            if (level === 0) {
              workingStatLevels[statId] = 1;
              workingStatXP[statId] = 0;
              get().addNotification({
                title: 'PROTOCOL REHABILITATION',
                description: `${statId.toUpperCase()} has been restored to baseline level 1. Begin rebuilding.`,
                status: 'NOW', iconType: 'milestone'
              });
            }
          });
        }

        // 3. Prepare quest reset + cloud sync payload (IST-anchored midnight)
        const now = new Date();

        // IST midnight = 23:59:59 IST = 18:29:59 UTC (IST is UTC+5:30, no DST)
        // We compute today's IST date and then find its UTC-equivalent midnight.
        const istYear = istNow.getFullYear();
        const istMonth = istNow.getMonth();
        const istDate = istNow.getDate();

        // IST midnight is 23:59:59.999 IST = 18:29:59.999 UTC on the SAME calendar date
        let istMidnight = new Date(Date.UTC(istYear, istMonth, istDate, 18, 29, 59, 999));

        // Safety: if this IST midnight has already passed (i.e. it's already past 23:59 IST),
        // target the next IST day's midnight instead.
        if (istMidnight <= now) {
          istMidnight = new Date(Date.UTC(istYear, istMonth, istDate + 1, 18, 29, 59, 999));
        }
        const defaultExpiry = istMidnight.toISOString();

        const questSyncPayload: any[] = [];

        const resetQuests = dailyQuests.map(q => {
          let shiftedExpiresAt = defaultExpiry;
          let shiftedDueDate = q.dueDate;

          if (q.dueDate) {
            const prevDue = new Date(q.dueDate);
            // Stable IST-aware Shifting: Keep the same IST hour/min, but on TODAY's IST date
            // prevDue UTC hours encoded IST time, so we preserve them directly.
            let shifted = new Date(Date.UTC(
              istNow.getFullYear(), istNow.getMonth(), istNow.getDate(),
              prevDue.getUTCHours(), prevDue.getUTCMinutes(), prevDue.getUTCSeconds()
            ));

            // If the shifted time has already passed TODAY in IST, push to tomorrow
            if (shifted < now) {
              shifted.setUTCDate(shifted.getUTCDate() + 1);
            }

            shiftedExpiresAt = shifted.toISOString();
            shiftedDueDate = shiftedExpiresAt;
          }

          if (q.repeating && (q.type === 'daily' || (q.type === 'raid' && q.completed))) {
            // Repeating quests reset to completed: false so they appear as fresh tasks next day.
            // Non-repeating quests are archived instead. This keeps habits visible on the board
            // but marks them as "done today" with visual cues (opacity-40, strikethrough).
            questSyncPayload.push({
              id: q.id,
              user_id: get().user?.id,
              title: q.title,
              xp_reward: q.xpReward,
              stat_id: q.statId,
              type: q.type,
              difficulty: q.difficulty || 'medium',
              priority: q.priority || 'P2',
              completed: false,
              failed: false,
              expires_at: shiftedExpiresAt,
              due_date: shiftedDueDate,
              streak: q.streak,
              repeating: true,
              archived: false
            });
            return {
              ...q,
              completed: false,
              failed: false,
              protected: false,
              currentPhase: q.type === 'raid' ? 1 : undefined,
              expiresAt: shiftedExpiresAt,
              dueDate: shiftedDueDate,
              subtasks: q.subtasks?.map(s => ({ ...s, completed: false }))
            };
          }
          if (!q.repeating) {
            const isFailed = q.failed || !q.completed;
            questSyncPayload.push({
              id: q.id,
              user_id: get().user?.id,
              title: q.title,
              xp_reward: q.xpReward,
              stat_id: q.statId,
              type: q.type,
              difficulty: q.difficulty || 'medium',
              priority: q.priority || 'P2',
              completed: q.completed,
              failed: isFailed,
              expires_at: q.expiresAt,
              due_date: q.dueDate,
              streak: q.streak,
              repeating: false,
              archived: true
            });
            return {
              ...q,
              archived: true,
              failed: isFailed,
              protected: false
            };
          }
          return { ...q, failed: false, protected: false };
        });

        // 4. RESET QUEST STATE FIRST (defer lastDailyReset until sync succeeds)
        set({
          globalStreak: newGlobalStreak,
          consecutiveDaysFailed: newConsecutiveFailures,
          violationStreaks: workingViolationStreaks,
          accountabilityScore: workingScore,
          gold: workingGold,
          statXP: workingStatXP,
          statLevels: workingStatLevels,
          statTodayXP: { code: 0, wealth: 0, body: 0, mind: 0, brand: 0, network: 0, spirit: 0, create: 0 },
          punishments: [...newPunishmentsList, ...punishments].slice(0, 100),
          dailyQuests: resetQuests
        });
        console.log('[RESET] State updated - repeating quests reset to completed: false');

        // 5. Side effects AFTER state is settled
        get().takeSnapshot();

        // F41: Check for Embargo (3 days of 0 CREATE XP)
        (async () => {
          const { checkEmbargo } = (await import('./sovereign-psych')).usePsychStore.getState();
          const createXPVal = workingStatXP.create || 0;
          checkEmbargo({ [today]: createXPVal });
        })();

        const { user } = get();
        if (user) {
          // F31: Bulk sync quest reset status to cloud
          if (questSyncPayload.length > 0) {
            // F31: Parallel update to avoid wiping metadata columns
            await Promise.all(questSyncPayload.map(p => {
              const { id, user_id, ...updateData } = p;
              return supabase.from('quests').update(updateData).eq('id', id);
            }));
          }

          // F31: Update stats and reset timestamp in cloud with RETRY LOGIC
          const { statXP, statLevels, gold, accountabilityScore, punishments, globalStreak } = get();

          // Set lastDailyReset LOCALLY FIRST to prevent infinite reset loop on page refresh.
          // Even if cloud sync fails, we don't want the reset to run again on next load.
          set({ lastDailyReset: today });

          let syncSuccess = false;
          let syncAttempt = 0;
          const maxAttempts = 3;

          while (!syncSuccess && syncAttempt < maxAttempts) {
            try {
              syncAttempt++;
              console.log(`[RESET] Syncing to Supabase (attempt ${syncAttempt}/${maxAttempts})...`);

              const updatePayload: any = {
                gold,
                accountability_score: accountabilityScore,
                punishments,
                global_streak_current: globalStreak.current,
                global_streak_longest: globalStreak.longest,
                last_daily_reset: today, // Persist reset date to cloud
                // NOTE: last_weekly_reset is NOT synced — column does not exist in user_stats schema
              };
              Object.keys(statXP).forEach(stat => {
                updatePayload[`${stat}_xp`] = statXP[stat];
                updatePayload[`${stat}_level`] = statLevels[stat];
              });

              const { error: statsError } = await supabase.from('user_stats').update(updatePayload).eq('id', user.id);
              if (statsError) throw statsError;

              syncSuccess = true;
              console.log('[RESET] Supabase sync succeeded!');

            } catch (err) {
              console.error(`[SYNC_ERROR] User Stats Reset (attempt ${syncAttempt}):`, err);

              if (syncAttempt < maxAttempts) {
                const backoffMs = Math.pow(2, syncAttempt - 1) * 100; // 100ms, 200ms, 400ms
                console.log(`[RESET] Retrying in ${backoffMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
              }
            }
          }

          if (!syncSuccess) {
            console.warn('[RESET] Cloud sync failed after 3 attempts. Reset is committed locally and will re-sync on next successful load.');
          }
        }

        const completedYesterdayCount = completedYesterday;
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

        const { user } = get();
        if (user) {
          await supabase.from('user_stats').update({
            last_weekly_reset: currentWeekString
          }).eq('id', user.id);
        }
      },

      // F42: Real-time Cadence Monitor - Background Expiry Check
      checkMissionExpiries: async () => {
        const { dailyQuests, user, failQuest } = get();

        // F27: GC Lending Status Audit
        await get().checkLoanStatus();

        if (!user) return;

        const now = new Date();
        const expiredQuests = dailyQuests.filter(q =>
          q.dueDate &&
          !q.completed &&
          !q.failed &&
          !q.archived &&
          new Date(q.dueDate) < now
        );

        if (expiredQuests.length > 0) {
          for (const quest of expiredQuests) {
            try {
              await failQuest(quest.id);

              if (quest.repeating) {
                get().addNotification({
                  title: 'TIME ELAPSED',
                  description: `"${quest.title}" window closed. This mission returns tomorrow. You lost some accountability, but your overall progress remains intact.`,
                  status: 'URGENT',
                  iconType: 'time'
                });
              } else {
                get().addNotification({
                  title: 'OBJECTIVE LOST',
                  description: `"${quest.title}" cadence deadline passed. Statistics localized downwards.`,
                  status: 'URGENT',
                  iconType: 'alert'
                });
              }
            } catch (err) {
              console.error(`[CADENCE] Error failing quest ${quest.id}:`, err);
            }
          }
        }
      },

      // F2 + F3: logActivity with real multipliers and perk effects
      logActivity: async (statId, xp, questId?, metadata?) => {
        const { inventory, user, statLevels, prestige, activeLoadout } = get();
        const { SHOP_ITEMS } = await import('../lib/constants');

        // 1. Calculate Base Multipliers (Legacy + Percs)
        let multiplier = 1;

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
          const streakMultiplier = 1 + (globalStreak.current / 30);
          multiplier *= streakMultiplier;
        }

        // 2. Active Booster Engine (Stacking Rules)
        const currentActiveItems = activeLoadout
          .filter(l => new Date(l.expiresAt) > new Date())
          .map(l => SHOP_ITEMS.find(i => i.id === l.itemId))
          .filter(Boolean);

        const multipliers = currentActiveItems
          .filter(i => i!.multiplier && (!i!.stat || i!.stat === statId))
          .map(i => i!.multiplier || 1.0);

        if (multipliers.length > 0) {
          const maxMult = Math.max(...multipliers);
          const maxCount = multipliers.filter(m => m === maxMult).length;

          let boosterMultiplier = maxMult;
          // Rule: If multiple max boosters are active, add 50% of the effect of the second one
          if (maxCount > 1) {
            boosterMultiplier += (maxMult - 1) * 0.5;
          }

          multiplier *= boosterMultiplier;
        }

        // PERMANENT EQUIPMENT
        inventory.forEach(itemId => {
          const item = SHOP_ITEMS.find(i => i.id === itemId);
          if (item?.type === 'permanent' && item.multiplier && (!item.stat || item.stat === statId)) {
            multiplier *= item.multiplier;
          }
        });

        // Synergy Bonuses
        const { STAT_SYNERGIES } = await import('../lib/constants');
        STAT_SYNERGIES.forEach(synergy => {
          if (synergy.stats.includes(statId)) {
            const allMet = synergy.stats.every(s => (statLevels[s] || 0) >= synergy.minLevel);
            if (allMet) {
              if (synergy.name === 'Algo-Trader' && statId === 'wealth') multiplier *= 1.1;
              if (synergy.name === 'Neural Architect') multiplier *= 1.1;
            }
          }
        });

        // Metadata Multipliers (Proof)
        if (metadata?.achievement) multiplier *= (parseInt(metadata.achievement) / 100);
        if (metadata?.speed) {
          const speedBonuses: Record<string, number> = { 'on-time': 1.0, '1h-early': 1.1, '4h-early': 1.25, '8h-early': 1.5 };
          multiplier *= (speedBonuses[metadata.speed] || 1.0);
        }

        if (metadata?.quality) {
          const qVal = parseInt(metadata.quality);
          if (qVal >= 1 && qVal <= 5) multiplier *= Math.max(0, 1 - ((5 - qVal) * 0.15));
        }

        // Final Yield Calculation
        const boostedXP = Math.max(0, Math.floor(xp * multiplier));
        const bonusXP = boostedXP - xp; // Simple ROI tracking

        // Update Loadout ROI
        if (bonusXP > 0) {
          set(state => ({
            activeLoadout: state.activeLoadout.map(l => {
              const item = SHOP_ITEMS.find(i => i.id === l.itemId);
              if (item?.multiplier && (!item.stat || item.stat === statId)) {
                return { ...l, currentROI: l.currentROI + bonusXP };
              }
              return l;
            })
          }));
        }


        // F5: Activity Log
        const logEntry: ActivityLogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          statId,
          xp: boostedXP,
          questId,
          timestamp: new Date().toISOString(),
          multiplier,
          metadata: {
            ...metadata,
            rawXP: xp,
            finalMultiplier: multiplier
          }
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
          level = Math.max(1, level - 1);

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
          try {
            // Persist Stat update
            const { error: statsError } = await supabase.from('user_stats').update(finalStatUpdate).eq('id', user.id);
            if (statsError) throw statsError;

            // Persist Activity Log to new dedicated table
            const { error: logError } = await supabase.from('activity_log').insert([{
              user_id: user.id,
              stat_id: statId,
              xp: boostedXP,
              quest_id: questId || null,
              multiplier: multiplier,
              metadata: logEntry.metadata
            }]);
            if (logError) console.warn('[DB_SYNC] activity_log insert failed (table might not exist yet):', logError.message);
          } catch (err) {
            console.error('[DB_ERROR] logActivity sync:', err);
          }
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

        let freedom = computeFreedomScore(statLevels);

        // F15: Synergy bonus: if no stat is >40% of the total level sum
        const totalLevels = Object.values(statLevels).reduce((a, b) => a + b, 0);
        if (totalLevels > 0) {
          const maxStat = Math.max(...Object.values(statLevels));
          const synergyRatio = maxStat / totalLevels;
          if (synergyRatio < 0.4) freedom *= 1.08; // 8% synergy bonus
        }

        // F36: Integrity Calculation
        const streakVitality = Math.min(globalStreak.current / 30, 1) * 100;

        let statIntegrity = 100;
        if (totalLevels > 0) {
          const avg = totalLevels / Object.keys(statLevels).length;
          const variance = Object.values(statLevels).reduce((acc, lvl) => acc + Math.abs(lvl - avg), 0) / totalLevels;
          statIntegrity = Math.max(0, 100 - (variance * 200));
        }

        const integrity = (accountabilityScore * 0.4) + (streakVitality * 0.3) + (statIntegrity * 0.3);

        set({
          freedomScore: Number(freedom.toFixed(1)),
          integrity: Number(integrity.toFixed(1)),
          sovereignty: computeSovereignty(statLevels, globalStreak.current, accountabilityScore)
        });
      },

      prestigeStat: async (statId) => {
        const { statLevels, user } = get();
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
        const { gold, resources, user } = get();
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

        set((state) => {
          const updatedQuests = state.dailyQuests.map(q => q.id === questId ? {
            ...q,
            completed: true,
            streak: newStreak,
            lastCompletedAt: now.toISOString()
          } : q);

          // If this was a penalty quest, clear the associated punishment
          let updatedPunishments = state.punishments;
          let integrityBonus = 0;
          if ((questToComplete as any).isPenalty) {
            updatedPunishments = state.punishments.map(p =>
              p.questId === questId ? { ...p, status: 'cleared' as const } : p
            );
            integrityBonus = 1; // Increased bonus for resolving violations
          }

          return {
            dailyQuests: updatedQuests,
            gold: state.gold + (state.activeLoans.length > 0 ? 0 : goldEarned),
            punishments: updatedPunishments,
            integrity: Math.min(100, state.integrity + integrityBonus),
            accountabilityScore: Math.min(100, state.accountabilityScore + integrityBonus)
          };
        });

        // Handle Loan Repayment
        const { activeLoans } = get();
        if (activeLoans.length > 0) {
          const updatedLoans = [...activeLoans];
          let remainingGold = goldEarned;

          for (let i = 0; i < updatedLoans.length; i++) {
            if (remainingGold <= 0) break;
            const loan = updatedLoans[i];
            if (loan.status === 'repaid' || loan.status === 'defaulted') continue;

            const needed = loan.totalRepay - loan.amountRepaid;
            const repayment = Math.min(remainingGold, needed);

            updatedLoans[i] = {
              ...loan,
              amountRepaid: loan.amountRepaid + repayment,
              lastRepaymentDate: now.toISOString(),
              status: (loan.amountRepaid + repayment >= loan.totalRepay) ? 'repaid' : loan.status
            };

            remainingGold -= repayment;

            if (updatedLoans[i].status === 'repaid') {
              get().addNotification({
                title: 'DEBT CLEARED',
                description: `Loan for ${loan.itemName} has been fully settled. Trust restored.`,
                status: 'NOW',
                iconType: 'milestone'
              });
            }
          }
          set({ activeLoans: updatedLoans });
        }

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
          await supabase.from('user_stats').update({
            gold: get().gold,
            accountability_score: get().accountabilityScore,
            punishments: get().punishments
          }).eq('id', user.id);
        }

        // F-HIST: Log to Quest History
        const historyEntry: HistoricalQuest = {
          id: Math.random().toString(36).substr(2, 9),
          title: questToComplete.title,
          statId: questToComplete.statId,
          status: 'completed',
          timestamp: now.toISOString(),
          xpReward: finalXP,
          difficulty: questToComplete.difficulty
        };
        set(state => ({ questHistory: [historyEntry, ...state.questHistory].slice(0, 1000) }));

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

        // Repeating quests remain completed for the rest of the day to show progress.
        // They will be reset to 'uncompleted' by the nightly reset protocol (resetDailyQuests).
        console.log(`[REPEATER] "${questToComplete.title}" completed. Scheduled for nightly protocol reset.`);
      },

      failQuest: async (questId) => {
        const questToFail = get().dailyQuests.find(q => q.id === questId);
        if (!questToFail || questToFail.completed || questToFail.failed) return;

        const { DOMAIN_PUNISHMENT_MATRIX, SHOP_ITEMS } = await import('../lib/constants');
        const punishmentId = Math.random().toString(36).substr(2, 9);
        const { user, violationStreaks, statXP, inventory } = get();

        // 1. Penalty Calculation & Item Mitigations
        let penaltyReduction = 1.0; // 1.0 = no reduction
        inventory.forEach(itemId => {
          const item = SHOP_ITEMS.find(i => i.id === itemId);
          if (item?.penaltyReduction) {
            penaltyReduction *= (1 - item.penaltyReduction);
          }
        });

        // 2. Penalty Scaling
        let penaltyMultiplier = 1;
        let integrityLoss = 5;

        // Apply Mitigations
        integrityLoss = Math.floor(integrityLoss * penaltyReduction);
        let xpPenalty = Math.floor(questToFail.xpReward * 0.5 * penaltyMultiplier * penaltyReduction);
        const newViolationStreaks = { ...violationStreaks };
        newViolationStreaks[questToFail.statId] = (newViolationStreaks[questToFail.statId] || 0) + 1;

        const priorityWeights = { P0: 3, P1: 2, P2: 1, P3: 0.5 };
        const penaltyWeight = (priorityWeights[questToFail.priority] || 1) * penaltyMultiplier;
        const scoreLoss = 2 * penaltyWeight;

        xpPenalty = Math.floor((questToFail.xpReward / 2) * penaltyWeight);
        const currentStatXP = statXP[questToFail.statId] || 0;
        const newXP = Math.max(0, currentStatXP - xpPenalty);

        let finalLevel = 1;
        while (xpForLevel(finalLevel) <= newXP) { finalLevel++; }
        finalLevel = Math.max(1, finalLevel - 1);

        const statLevelToSet = finalLevel;

        const isRepeated = newViolationStreaks[questToFail.statId] >= 2;
        let newPunishment: Punishment;

        if (isRepeated) {
          const matrix = DOMAIN_PUNISHMENT_MATRIX[questToFail.statId] || DOMAIN_PUNISHMENT_MATRIX.general;
          newPunishment = {
            id: punishmentId,
            type: 'consequential',
            title: `DOMAIN VIOLATION: ${questToFail.statId.toUpperCase()}`,
            description: `Repeated failure detected. Choice required for protocol resolution.`,
            status: 'awaiting_selection',
            date: new Date().toISOString(),
            statId: questToFail.statId,
            options: matrix,
            penalty: (newViolationStreaks[questToFail.statId] || 1) * 5
          };
        } else {
          newPunishment = {
            id: punishmentId,
            type: 'mental',
            title: `FAILURE [${questToFail.priority}]: ${questToFail.title}`,
            description: `Violation logged. Accountability degraded. Recovery mandate pending repeated breach.`,
            status: 'active' as const,
            date: new Date().toISOString(),
            questId: questId
          };
        }

        set((state) => ({
          dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, failed: true, streak: 0 } : q),
          gold: Math.max(0, state.gold - (Math.floor(questToFail.xpReward / 2) * penaltyWeight)),
          accountabilityScore: Math.max(0, state.accountabilityScore - scoreLoss),
          integrity: Math.max(0, state.integrity - integrityLoss),
          statXP: { ...state.statXP, [questToFail.statId]: newXP },
          statLevels: { ...state.statLevels, [questToFail.statId]: statLevelToSet },
          violationStreaks: newViolationStreaks,
          punishments: [newPunishment, ...state.punishments].slice(0, 100)
        }));

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

          try {
            const { error: statsError } = await supabase.from('user_stats').update({
              gold: get().gold,
              accountability_score: get().accountabilityScore,
              punishments: get().punishments,
              [`${questToFail.statId}_xp`]: get().statXP[questToFail.statId],
              [`${questToFail.statId}_level`]: get().statLevels[questToFail.statId]
            }).eq('id', user.id);

            if (statsError) throw statsError;
          } catch (err: any) {
            console.error('[DB_ERROR] failQuest user_stats sync:', err);
            if (err?.message?.includes('punishments')) {
              console.warn('The "punishments" column is missing from user_stats. Persisting locally as fallback.');
            } else {
              get().addNotification({ title: 'SYNC WARNING', description: 'Failed to sync stat penalty to cloud.', status: 'URGENT', iconType: 'alert' });
            }
          }
        }

        // F-HIST: Log to Quest History
        const historyEntry: HistoricalQuest = {
          id: Math.random().toString(36).substr(2, 9),
          title: questToFail.title,
          statId: questToFail.statId,
          status: 'failed',
          timestamp: new Date().toISOString(),
          xpReward: 0,
          difficulty: questToFail.difficulty,
          excuse: 'TIME_EXPIRED'
        };
        set(state => ({ questHistory: [historyEntry, ...state.questHistory].slice(0, 1000) }));

        get().addNotification({
          title: 'PROTOCOL FAILED',
          description: `-${xpPenalty} ${questToFail.statId.toUpperCase()} XP. "${questToFail.title}" — punishment logged & score reduced.`,
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
        return newId;
      },

      protectQuest: async (questId: string) => {
        set(state => ({
          dailyQuests: state.dailyQuests.map(q => q.id === questId ? { ...q, protected: true } : q)
        }));
        const { user } = get();
        if (user) {
          await supabase.from('quests').update({ protected: true }).eq('id', questId);
        }
        get().addNotification({
          title: 'STREAK PROTECTED',
          description: 'Insurance protocol active for this quest.',
          status: 'NOW',
          iconType: 'time'
        });
      },

      // F17: Job Hunt XP Bridge (called from updateJobStatus)
      updateJobStatus: async (id, status) => {
        set((state) => ({ jobApplications: state.jobApplications.map(job => job.id === id ? { ...job, status } : job) }));
        const { user } = get();
        if (user) await supabase.from('job_applications').update({ status }).eq('id', id).eq('user_id', user.id);

        // Auto-XP on status changes
        if (status === 'INTERVIEWING' || (status as string) === 'interviewing') {
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


      setLogModalOpen: (open, statId, activityId) => set({
        logModalOpen: open,
        preselectedStat: statId || null,
        preselectedActivity: activityId || null
      }),
      setTheme: (theme) => set({ theme }),
      setSelectedStat: (statId) => set({ selectedStat: statId }),
      setBudgetCap: (budgetCap) => set({ budgetCap }),
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

      acceptPunishmentOption: async (punishmentId, optionId) => {
        const { punishments, addQuest } = get();
        const punishment = punishments.find(p => p.id === punishmentId);
        if (!punishment || !punishment.options) return;

        const choice = (punishment.options as any[]).find(o => o.id === optionId);
        if (!choice) return;

        // Convert the choice into a Quest
        const penaltyQuest: any = {
          title: `PENALTY: ${choice.title}`,
          description: choice.description,
          xpReward: choice.xpReward || 10,
          statId: punishment.statId || 'mind',
          type: 'daily',
          streak: 0,
          priority: 'P1',
          isPenalty: true,
          repeating: false, // Penalty quests are one-off
          notes: `Resolution protocol for: ${punishment.title}`
        };

        const questId = await addQuest(penaltyQuest);

        set(state => ({
          punishments: state.punishments.map(p =>
            p.id === punishmentId
              ? {
                ...p,
                status: 'active',
                questId: (questId as unknown as string),
                description: choice.description,
                title: `RESOLVING: ${choice.title}`
              }
              : p
          )
        }));

        const { user } = get();
        if (user) {
          await supabase.from('user_stats').update({
            punishments: get().punishments
          }).eq('id', user.id);
        }

        toast.success('PENAL PROTOCOL ACTIVATED', {
          description: 'Recovery quest injected into dashboard.'
        });
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
        const { gold, inventory, user, wishlist } = get();

        // Error Checking
        if (gold < cost) return { success: false, error: 'INSUFFICIENT_FUNDS' };
        if (inventory.includes(itemId)) {
          // Check if it's a permanent or consumable
          const { SHOP_ITEMS } = await import('../lib/constants');
          const item = SHOP_ITEMS.find(i => i.id === itemId);
          if (item?.type === 'permanent') return { success: false, error: 'ALREADY_OWNED' };
        }

        const newInventory = [...inventory, itemId];
        const newGold = gold - cost;
        const newWishlist = wishlist.filter(id => id !== itemId);

        set({ gold: newGold, inventory: newInventory, wishlist: newWishlist });

        if (user) {
          try {
            await supabase.from('user_stats').update({
              gold: newGold,
              inventory: newInventory,
              wishlist: newWishlist
            }).eq('id', user.id);
          } catch (e) {
            console.error('[SYNC_ERROR] buyItem:', e);
          }
        }

        get().addNotification({
          title: 'ASSET ACQUIRED',
          description: `${itemId.replace(/_/g, ' ').toUpperCase()} secured in inventory.`,
          status: 'NOW',
          iconType: 'milestone'
        });

        return { success: true };
      },

      deployItem: async (itemId) => {
        const { inventory, activeLoadout, itemCooldowns, user } = get();
        const { SHOP_ITEMS } = await import('../lib/constants');
        const item = SHOP_ITEMS.find(i => i.id === itemId);

        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        if (!inventory.includes(itemId)) return { success: false, error: 'NOT_IN_INVENTORY' };

        // Check Cooldown
        const cooldownUntil = itemCooldowns[itemId];
        if (cooldownUntil && new Date(cooldownUntil) > new Date()) {
          return { success: false, error: 'ON_COOLDOWN' };
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + (item.duration || 0) * 3600000);

        // Stacking Logic (Time)
        const existing = activeLoadout.find(l => l.itemId === itemId);
        let newLoadout;

        if (existing && item.type === 'consumable') {
          // Extend time
          const currentExpiry = new Date(existing.expiresAt);
          const newExpiry = new Date(currentExpiry.getTime() + (item.duration || 0) * 3600000);
          newLoadout = activeLoadout.map(l =>
            l.itemId === itemId ? { ...l, expiresAt: newExpiry.toISOString() } : l
          );
        } else {
          newLoadout = [...activeLoadout, {
            itemId,
            deployedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            currentROI: 0
          }];
        }

        // Set Cooldown
        const newCooldowns = { ...itemCooldowns };
        if (item.cooldown) {
          newCooldowns[itemId] = new Date(now.getTime() + item.cooldown * 3600000).toISOString();
        }

        // Consume if applicable
        let newInventory = inventory;
        if (item.type === 'consumable') {
          const idx = newInventory.indexOf(itemId);
          if (idx > -1) {
            newInventory = [...newInventory.slice(0, idx), ...newInventory.slice(idx + 1)];
          }
        }

        set({ activeLoadout: newLoadout, itemCooldowns: newCooldowns, inventory: newInventory });

        if (user) {
          await supabase.from('user_stats').update({
            active_loadout: newLoadout,
            item_cooldowns: newCooldowns,
            inventory: newInventory
          }).eq('id', user.id);
        }

        get().addNotification({
          title: 'ASSET DEPLOYED',
          description: `${item.name.toUpperCase()} protocol active.`,
          status: 'NOW',
          iconType: 'rank'
        });

        return { success: true };
      },

      toggleWishlist: (itemId) => {
        const { wishlist, user } = get();
        const newWishlist = wishlist.includes(itemId)
          ? wishlist.filter(id => id !== itemId)
          : [...wishlist, itemId];

        set({ wishlist: newWishlist });
        if (user) {
          supabase.from('user_stats').update({ wishlist: newWishlist }).eq('id', user.id);
        }
      },

      addReward: async (reward) => {
        const newId = `custom_reward_${Math.random().toString(36).substr(2, 9)}`;
        set(state => ({
          customRewards: [...state.customRewards, { ...reward, id: newId, isRealWorld: true }]
        }));
        toast.success('REWARD PROTOCOL INITIALIZED', {
          description: `${reward.name.toUpperCase()} added to marketplace.`
        });
      },

      updateReward: async (id, reward) => {
        set(state => ({
          customRewards: state.customRewards.map(r => r.id === id ? { ...r, ...reward } : r)
        }));
        toast.success('REWARD PROTOCOL UPDATED', {
          description: 'Protocol parameters recalibrated.'
        });
      },

      deleteReward: async (id) => {
        set(state => ({
          customRewards: state.customRewards.filter(r => r.id !== id)
        }));
        toast.info('REWARD PROTOCOL TERMINATED', {
          description: 'Target removed from exchange.'
        });
      },

      requestLoan: async (itemId, durationMonths, repaymentType) => {
        const { activeLoans, streaks, inventory, gold } = get();
        const { SHOP_ITEMS } = await import('../lib/constants');
        const item = SHOP_ITEMS.find(i => i.id === itemId);

        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        if (activeLoans.length >= 2) return { success: false, error: 'MAX_LOANS_REACHED' };
        if (inventory.includes(itemId)) return { success: false, error: 'ALREADY_OWNED' };

        const interestRate = 0.05;
        const totalRepay = Math.floor(item.cost * (1 + interestRate));
        const now = new Date();
        const deadline = new Date(now);
        deadline.setMonth(deadline.getMonth() + durationMonths);

        const newLoan: Loan = {
          id: Math.random().toString(36).substr(2, 9),
          itemId,
          itemName: item.name,
          borrowedAmount: item.cost,
          interestRate,
          totalRepay,
          amountRepaid: 0,
          startDate: now.toISOString(),
          durationMonths,
          deadline: deadline.toISOString(),
          repaymentType,
          associatedStat: (item.stat?.toLowerCase() || 'code'),
          status: 'active',
          monthlyTarget: Math.floor(totalRepay / durationMonths)
        };

        set(state => ({
          activeLoans: [...state.activeLoans, newLoan],
          inventory: [...state.inventory, itemId]
        }));

        get().addNotification({
          title: 'LOAN PROTOCOL INITIATED',
          description: `Borrowed ${item.cost} GC for ${item.name}. Repayment due in ${durationMonths} months.`,
          status: 'URGENT',
          iconType: 'time'
        });

        return { success: true };
      },

      checkLoanStatus: async () => {
        const { activeLoans, streaks, statLevels, integrity, user } = get();
        const now = new Date();
        let changed = false;
        const updatedLoans = activeLoans.map(loan => {
          if (loan.status === 'repaid' || loan.status === 'defaulted') return loan;

          const deadline = new Date(loan.deadline);
          const diffDays = Math.floor((now.getTime() - deadline.getTime()) / (1000 * 3600 * 24));

          if (diffDays > 0) {
            // Late State
            if (diffDays <= 2 && loan.status !== 'late') {
              changed = true;
              get().addNotification({
                title: 'LOAN OVERDUE',
                description: `Payment for ${loan.itemName} is late. 2-day penalty window active.`,
                status: 'URGENT',
                iconType: 'alert'
              });
              return { ...loan, status: 'late' as const };
            }

            // Grace Period / Default
            if (diffDays > 2 && diffDays <= 7) {
              const progress = loan.amountRepaid / loan.totalRepay;
              if (progress >= 0.8) {
                if (loan.status !== 'grace_period') {
                  changed = true;
                  get().addNotification({
                    title: 'GRACE PERIOD ACTIVATED',
                    description: `>80% repayment detected. 7-day window to clear ${loan.itemName} debt.`,
                    status: 'URGENT',
                    iconType: 'time'
                  });
                  return { ...loan, status: 'grace_period' as const };
                }
              } else {
                // < 80% and > 2 days late = Default warning or immediate default?
                // The user said: "after 2 days put lesser penalty depending on how much progress was done"
                // and "reset stat for which loan was taken"
              }
            }

            if (diffDays > 7) {
              // TERMINAL DEFAULT
              changed = true;
              const associatedStat = loan.associatedStat;

              set(state => ({
                statLevels: { ...state.statLevels, [associatedStat]: 1 },
                statXP: { ...state.statXP, [associatedStat]: 0 },
                integrity: Math.max(0, state.integrity - 20),
                inventory: state.inventory.filter(id => id !== loan.itemId),
                streaks: { ...state.streaks, [associatedStat]: { current: 0, longest: state.streaks[associatedStat].longest } }
              }));

              get().addNotification({
                title: 'PROTOCOL DEFAULT',
                description: `Loan for ${loan.itemName} failed. ${associatedStat.toUpperCase()} reset. Integrity compromised.`,
                status: 'URGENT',
                iconType: 'alert'
              });

              return { ...loan, status: 'defaulted' as const };
            }
          }
          return loan;
        });

        if (changed) {
          set({ activeLoans: updatedLoans });
          if (user) {
            // Sync to DB
            await supabase.from('user_stats').update({
              integrity: get().integrity,
              inventory: get().inventory,
              active_loans: get().activeLoans // Assuming we add this or store in metadata
            }).eq('id', user.id);
          }
        }
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

      removeRecurringTx: async (id) => {
        set(state => ({
          recurringTransactions: state.recurringTransactions.filter(r => r.id !== id)
        }));
      },

      deleteQuest: async (id) => {
        const { user } = get();
        set(state => ({
          dailyQuests: state.dailyQuests.filter(q => q.id !== id)
        }));
        if (user) {
          await supabase.from('quests').delete().eq('id', id).eq('user_id', user.id);
        }
      },

      archiveQuest: async (id) => {
        const { user } = get();
        set(state => ({
          dailyQuests: state.dailyQuests.map(q => q.id === id ? { ...q, archived: true } : q)
        }));
        if (user) {
          await supabase.from('quests').update({ archived: true }).eq('id', id).eq('user_id', user.id);
        }
      },

      restoreQuest: async (id) => {
        const { user } = get();
        set(state => ({
          dailyQuests: state.dailyQuests.map(q => q.id === id ? { ...q, archived: false, completed: false, failed: false } : q)
        }));
        if (user) {
          await supabase.from('quests').update({ archived: false, completed: false, failed: false }).eq('id', id).eq('user_id', user.id);
        }
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

      toggleTripChecklist: (_tripId, _itemId) => {
        // Implementation for trip checklist
      },

      addTripChecklistItem: (_tripId, _text) => {
        // Implementation for trip checklist
      },

      tickQuests: () => {
        const { dailyQuests, failQuest } = get();
        let changed = false;
        const nextQuests = dailyQuests.map(q => {
          const now = new Date().getTime();
          const hasDeadline = q.dueDate ? new Date(q.dueDate).getTime() : (q.expiresAt ? new Date(q.expiresAt).getTime() : null);

          // Note: Hard auto-expiry failure is now handled by CadenceStore for timezone stability.
          // This loop now handles transient UI states like reminders and sub-minute timers.

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
      },

      updateProfile: async (data) => {
        const { user } = get();
        set((state) => ({ ...state, ...data }));

        if (user) {
          const { error } = await supabase.from('user_stats').update(data).eq('id', user.id);
          if (error) {
            console.error('[PROFILE_ERROR] Update failed:', error);
            toast.error('DATABASE_SYNC_FAILURE', { description: 'Profile update failed in cloud.' });
          }
        }
      },

      setFoundingStatement: async (statement) => {
        const { user, foundingStatementDate } = get();

        // Check 90-day lock logic
        if (foundingStatementDate) {
          const lastDate = new Date(foundingStatementDate);
          const ninetyDaysLater = new Date(lastDate);
          ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);

          if (new Date() < ninetyDaysLater) {
            const diff = Math.ceil((ninetyDaysLater.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return {
              success: false,
              error: `PROTOCOL_LOCKED: Founding statement immutable for another ${diff} days.`
            };
          }
        }

        const now = new Date().toISOString();
        set({ foundingStatement: statement, foundingStatementDate: now });

        if (user) {
          const { error } = await supabase.from('user_stats').update({
            founding_statement: statement,
            founding_statement_date: now
          }).eq('id', user.id);

          if (error) {
            console.error('[FOUNDING_ERROR] Sync failed:', error);
            return { success: false, error: 'DATABASE_REJECTION: Failed to persist statement.' };
          }
        }

        return { success: true };
      },

      updateDossier: (statId, data) => {
        set((state) => ({
          dossiers: {
            ...state.dossiers,
            [statId]: { ...state.dossiers[statId], ...data }
          }
        }));
      },

      addLifeEvent: (event) => {
        set((state) => ({
          lifeEvents: [...state.lifeEvents, { ...event, id: crypto.randomUUID() }]
        }));
      },

      buryStreak: (statId, days, cause) => {
        set((state) => ({
          streakCemetery: [...state.streakCemetery, { id: crypto.randomUUID(), statId, days, diedAt: new Date().toISOString(), cause }]
        }));
      },

      updateVisionBoard: (data) => {
        set((state) => ({ ...state, ...data }));
      },

      updateGraduationDate: (date) => {
        set({ graduationDate: date });
      },

      backfillQuestHistory: () => {
        const { activityLog, streakCemetery, questHistory } = get();
        if (questHistory.length > 0) return; // Only backfill once

        const backfilled: HistoricalQuest[] = [];

        // Backfill from activityLog (successes)
        activityLog.forEach(log => {
          if (log.questId) {
            backfilled.push({
              id: log.id,
              title: log.metadata?.title || 'Unknown Objective',
              statId: log.statId,
              status: 'completed',
              timestamp: log.timestamp,
              xpReward: log.xp,
              difficulty: log.metadata?.difficulty
            });
          }
        });

        // Backfill from streakCemetery (failures)
        streakCemetery.forEach(death => {
          backfilled.push({
            id: death.id,
            title: death.cause || 'Unknown Failure',
            statId: death.statId,
            status: 'failed',
            timestamp: death.diedAt,
            xpReward: 0,
            excuse: death.cause
          });
        });

        set({ questHistory: backfilled.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) });
      },

      updateSurveillance: () => {
        const { activityLog, snapshotHistory, statXP, moodHistory } = get();
        const baseMetrics = {
          resistanceFactor: calculateResistanceFactor(get().dailyQuests),
          cognitiveEntropy: calculateCognitiveEntropy(activityLog),
          willpowerReserve: calculateWillpowerReserve(activityLog),
          throughput: calculateThroughput(activityLog),
          focusBalance: calculateFocusBalance(statXP),
          momentum: calculateMomentum(activityLog),
          consistency: calculateConsistency(activityLog),
          environmentImpact: calculateEnvironmentImpact(activityLog),
          resilienceScore: calculateResilienceScore(activityLog),
          breakdown: calculateThroughputBreakdown(activityLog),
          trajectoryData: calculateVelocityAndAcceleration(snapshotHistory)
        };

        const metrics = {
          ...baseMetrics,
          attentionAudit: calculateAttentionAudit(activityLog, moodHistory),
          causalGraph: calculateCausalGraph(activityLog),
          predictions: generateSystemPredictions(activityLog),
          flywheels: calculateFlywheels(activityLog),
          environmentSynergy: calculateEnvironmentSynergy(activityLog),
          benchmarks: calculateComparativeBenchmarks(baseMetrics, get().statLevels)
        };

        set({
          surveillanceMetrics: metrics,
          projections: calculateConsistentYouProjection(activityLog)
        });
      },

      runCausalityAnalysis: (isManual = false) => {
        const { moodHistory, activityLog } = get();
        const psych = usePsychStore.getState();
        const logs: IntelligenceLog[] = [];

        // 1. Initial Scan Log
        logs.push({
          timestamp: new Date().toISOString(),
          event: "Causality calibration sequence initiated. Scanning behavioral stream...",
          impact: 0
        });

        if (moodHistory.length < 5 || activityLog.length < 5) {
          if (isManual) {
            toast.info('INSUFFICIENT DATA', { description: 'Engine requires 5+ days of mood and activity logs.' });
          }
          return;
        }

        // 2. Sunday Collapse Detection
        const sundayXP = activityLog.filter(l => new Date(l.timestamp).getDay() === 0)
          .reduce((sum, l) => sum + l.xp, 0);
        if (sundayXP < 50) {
          logs.push({
            timestamp: new Date().toISOString(),
            event: "PATTERN: Sunday collapse detected — 0 XP logged. Consistent inactivity cycle identified.",
            impact: 45
          });
        }

        // 3. Sleep Debt Analysis
        const recentMood = moodHistory.slice(-3);
        const sleepDebt = recentMood.filter(m => (m.sleep || 0) < 6).length;
        if (sleepDebt >= 2) {
          logs.push({
            timestamp: new Date().toISOString(),
            event: `ALERT: CODE session quality below baseline (sleep debt detected: ${sleepDebt} days).`,
            impact: 60
          });
        }

        // 4. Energy vs Output
        const energyLevels = moodHistory.map(m => m.energy);
        const dailyXP = moodHistory.map(m => {
          const day = m.date.split('T')[0];
          return activityLog
            .filter(log => log.timestamp.startsWith(day))
            .reduce((sum, log) => sum + log.xp, 0);
        });

        const energyCorr = calculateCorrelation(energyLevels, dailyXP);
        if (Math.abs(energyCorr) > 0.4) {
          const discovery: CausalityDiscovery = {
            id: `energy_${Date.now()}`,
            title: energyCorr > 0 ? "ENERGY → OUTPUT SYNERGY" : "ENERGY → OUTPUT INVERSION",
            description: `Energy levels correlate ${Math.abs(energyCorr) > 0.7 ? 'strongly' : 'moderately'} with daily throughput.`,
            correlationStrength: Math.abs(energyCorr),
            impactLevel: mapImpact(energyCorr),
            variables: ['Energy', 'XP Output'],
            trend: energyCorr > 0 ? 'up' : 'down',
            insight: getDiscoveryInsight("Energy vs Output", energyCorr),
            dataPoints: energyLevels.map((e, i) => ({ x: e, y: dailyXP[i] })),
            updatedAt: new Date().toISOString(),
            status: moodHistory.length > 21 ? 'verified' : 'hypothesis'
          };

          logs.push({
            timestamp: new Date().toISOString(),
            event: `CAUSALITY: ${discovery.title} identified with ${(discovery.correlationStrength * 100).toFixed(0)}% confidence.`,
            impact: Math.round(discovery.correlationStrength * 100)
          });

          set(state => ({ causalityDiscoveries: [discovery, ...state.causalityDiscoveries.filter(d => d.title !== discovery.title)].slice(0, 10) }));
        }

        // 5. Sentiment vs Output
        if (psych.dailySentences.length >= 5) {
          const sentiments = psych.dailySentences.slice(-10).map(s => analyzeSentiment(s.text));
          const sentimentScores = sentiments.map(s => s === 'positive' ? 1 : s === 'negative' ? -1 : 0);
          const sentimentDailyXP = psych.dailySentences.slice(-10).map(s => {
            return activityLog
              .filter(log => log.timestamp.startsWith(s.date))
              .reduce((sum, log) => sum + log.xp, 0);
          });

          const sentCorr = calculateCorrelation(sentimentScores, sentimentDailyXP);
          if (Math.abs(sentCorr) > 0.4) {
            const discovery: CausalityDiscovery = {
              id: `sent_${Date.now()}`,
              title: sentCorr > 0 ? "MINDSET → EXECUTION" : "MINDSET → FRICTION",
              description: `Your "One Honest Sentence" sentiment correlates with your daily execution.`,
              correlationStrength: Math.abs(sentCorr),
              impactLevel: mapImpact(sentCorr),
              variables: ['Sentiment', 'Daily XP'],
              trend: sentCorr > 0 ? 'up' : 'down',
              insight: sentCorr > 0 ? "Positive framing leads to higher throughput. Maintain protocol." : "Negative sentiment detected as a leading indicator of friction.",
              dataPoints: sentimentScores.map((s, i) => ({ x: s, y: sentimentDailyXP[i] })),
              updatedAt: new Date().toISOString(),
              status: psych.dailySentences.length > 14 ? 'verified' : 'hypothesis'
            };

            logs.push({
              timestamp: new Date().toISOString(),
              event: `CAUSALITY: ${discovery.title} detected in mindset-execution loop.`,
              impact: Math.round(discovery.correlationStrength * 100)
            });

            set(state => ({ causalityDiscoveries: [discovery, ...state.causalityDiscoveries.filter(d => d.title !== discovery.title)].slice(0, 10) }));
          }
        }

        // Update logs in state
        set(state => ({ intelligenceLogs: [...logs, ...state.intelligenceLogs].slice(0, 100) }));
        if (isManual) {
          toast.info('CALIBRATION COMPLETE', { description: 'All causal variables synchronized.' });
        }
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
        // NOTE: lastDailyReset NOT persisted - only set after sync succeeds, prevents guard from blocking retries
        // NOTE: lastWeeklyReset NOT persisted - only set after sync succeeds
        knowledgeCards: state.knowledgeCards,
        ventures: state.ventures,
        punishments: state.punishments,
        accountabilityScore: state.accountabilityScore,
        // Added for persistent progress & briefing fix
        statLevels: state.statLevels,
        statXP: state.statXP,
        statTodayXP: state.statTodayXP,
        gold: state.gold,
        inventory: state.inventory,
        activeLoans: state.activeLoans,
        resources: state.resources,
        freedomScore: state.freedomScore,
        sovereignty: state.sovereignty,
        prestige: state.prestige,
        streaks: state.streaks,
        globalStreak: state.globalStreak,
        violationStreaks: state.violationStreaks,
        integrity: state.integrity,
        consecutiveDaysFailed: state.consecutiveDaysFailed,
        jobApplications: state.jobApplications,
        transactions: state.transactions,
        journalEntries: state.journalEntries,
        nexusContacts: state.nexusContacts,
        financialGoals: state.financialGoals,
        portfolios: state.portfolios,
        budgetCap: state.budgetCap,
        recurringTransactions: state.recurringTransactions,
        briefingSeenDates: state.briefingSeenDates,
        summarySeenDates: state.summarySeenDates,
        lastDailyReset: state.lastDailyReset,
        lastWeeklyReset: state.lastWeeklyReset,
        briefingTemplates: state.briefingTemplates,
        alias: state.alias,
        username: state.username,
        joinedAt: state.joinedAt,
        bio: state.bio,
        foundingStatement: state.foundingStatement,
        foundingStatementDate: state.foundingStatementDate,
        graduationDate: state.graduationDate,
        lifeEvents: state.lifeEvents,
        delusionHistory: state.delusionHistory,
        streakCemetery: state.streakCemetery,
        antiWishlist: state.antiWishlist,
        obituaryTest: state.obituaryTest,
        destinationBoard: state.destinationBoard,
        freedomRoadmap: state.freedomRoadmap,
        integrationStatus: state.integrationStatus,
        dossiers: state.dossiers,
        questHistory: state.questHistory,
        customRewards: state.customRewards,
        causalityDiscoveries: state.causalityDiscoveries,
        surveillanceMetrics: state.surveillanceMetrics,
        intelligenceLogs: state.intelligenceLogs,
        projections: state.projections
      })
    }
  )
);
