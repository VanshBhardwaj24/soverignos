import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailySentence {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
}

export interface EnergyLog {
  date: string; // YYYY-MM-DD
  level: 1 | 2 | 3 | 4 | 5;
}

export interface AntiWishlistItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface ConsequenceChain {
  statId: string;
  steps: string[];
}

export interface SalaryClockConfig {
  graduationDate: string;       // ISO date string
  hourlyOpportunityCost: number; // in INR
  stopped: boolean;
  stoppedAt?: string;           // ISO date string when first offer received
}

export interface WeeklyContract {
  id: string;
  weekOf: string;
  name: string;
  commitments: string[];
  signed: boolean;
  signedAt?: string;
  reviewedAt?: string;
  adherenceScore?: number; // 0-100 % reviewed manually
}

export interface FrictionAudit {
  id: string;
  date: string;
  hardestTask: string;
  firstAction: string;
  under2Min: boolean;
  microQuestCreated?: boolean;
}

export interface MirrorScore {
  id: string;
  weekOf: string;
  perceivedProductivity: number; // 1-10
  actualXP: number;
  normalizedActual: number; // 1-10
  delusionGap: number;
}

export interface WeeklyQuestionEntry {
  id: string;
  date: string;
  question: string;
  answer: string;
}

export interface Decision {
  id: string;
  date: string;
  decision: string;
  reasoning: string;
  expectedOutcome: string;
  confidence: number; // 1-10
  followUpDate: string; // 3 months later
  actualOutcome?: string;
  reviewed?: boolean;
}

export interface RegretLogEntry {
  id: string;
  statId: string;
  skippedDate: string;
  regretted?: boolean; // filled next day
}

export interface ParallelLifeConfig {
  startDate: string;
  dailyTargets: Record<string, number>; // metric -> target per day
}

export interface DependencyItem {
  id: string;
  area: string;
  target: string;
  status: 'unchanged' | 'improved' | 'resolved';
}

export interface DependencyAudit {
  id: string;
  date: string;
  dependencies: DependencyItem[];
  progressNotes: string;
}

export interface DeadManConfig {
  enabled: boolean;
  contactEmail: string;
  contactName: string;
  hoursBeforeTrigger: number;
  lastCheckIn: string; // ISO string
}

export interface StreakInsurance {
  usesThisMonth: number;
  lastUsedDate?: string;
  lastUsedMonth?: number; // 0-11
  lastUsedYear?: number;
}

export interface FutureLetter {
  id: string;
  writtenAt: string;
  content: string;
  deliverAt: string;
  trigger?: 'job_offer';
  delivered: boolean;
  type: '3months' | '1year' | 'job_offer';
}

export interface ContextPhoto {
  id: string;
  date: string; // YYYY-MM-DD Monday
  dataUrl: string; // base64
  note?: string;
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface PsychStore {
  // Onboarding
  psychOnboardingComplete: boolean;
  setPsychOnboardingComplete: (v: boolean) => void;

  // One Honest Sentence
  dailySentences: DailySentence[];
  addDailySentence: (text: string) => void;

  // Energy Logging
  energyLogs: EnergyLog[];
  logEnergy: (level: 1 | 2 | 3 | 4 | 5) => void;
  getTodayEnergy: () => EnergyLog | undefined;

  // Anti-Wishlist
  antiWishlist: AntiWishlistItem[];
  antiWishlistLocked: boolean;
  antiWishlistLockedAt?: string;
  addAntiWishlistItem: (text: string) => void;
  removeAntiWishlistItem: (id: string) => void;
  lockAntiWishlist: () => void;

  // Consequence Chains
  consequenceChains: Record<string, string[]>; // statId -> steps
  setConsequenceChain: (statId: string, steps: string[]) => void;
  getDefaultChain: (statId: string) => string[];

  // Salary Clock
  salaryClockConfig: SalaryClockConfig;
  configureSalaryClock: (config: Partial<SalaryClockConfig>) => void;
  stopSalaryClock: () => void;

  // Weekly Contracts
  weeklyContracts: WeeklyContract[];
  createContract: (weekOf: string, name: string, commitments: string[]) => void;
  signContract: (id: string) => void;
  reviewContract: (id: string, score: number) => void;

  // Friction Audits
  frictionAudits: FrictionAudit[];
  addFrictionAudit: (audit: Omit<FrictionAudit, 'id'>) => void;

  // Mirror Scores
  mirrorScores: MirrorScore[];
  addMirrorScore: (weekOf: string, perceived: number, actualXP: number, goalXP: number) => void;

  // Weekly Questions
  weeklyQuestions: WeeklyQuestionEntry[];
  addWeeklyAnswer: (question: string, answer: string) => void;

  // Decision Journal
  decisions: Decision[];
  addDecision: (d: Omit<Decision, 'id' | 'followUpDate'>) => void;
  reviewDecision: (id: string, actualOutcome: string) => void;

  // Regret Log
  regretLog: RegretLogEntry[];
  logSkip: (statId: string) => void;
  logRegret: (id: string, regretted: boolean) => void;
  getRegretProbability: (statId: string) => number;

  // Parallel Life
  parallelLifeConfig: ParallelLifeConfig;
  setParallelLifeConfig: (config: ParallelLifeConfig) => void;

  // Dependency Mirror
  dependencyItems: DependencyItem[];
  dependencyAudits: DependencyAudit[];
  setDependencyItems: (items: DependencyItem[]) => void;
  addDependencyAudit: (audit: Omit<DependencyAudit, 'id'>) => void;
  updateDependencyStatus: (id: string, status: DependencyItem['status']) => void;

  // Dead Man's Switch
  deadManConfig: DeadManConfig;
  configureDeadMan: (config: Partial<DeadManConfig>) => void;
  checkInDeadMan: () => void;

  // Streak Insurance
  streakInsurance: StreakInsurance;
  useStreakInsurance: () => boolean;
  addStreakInsurance: () => void;
  resetInsuranceIfNewMonth: () => void;

  // Future Letters
  futureLetters: FutureLetter[];
  addFutureLetter: (content: string, deliverAt: string, type: FutureLetter['type'], trigger?: 'job_offer') => void;
  markLetterDelivered: (id: string) => void;
  checkLetterDelivery: (jobApplications: { status: string }[]) => FutureLetter[];

  // Context Photos
  contextPhotos: ContextPhoto[];
  addContextPhoto: (dataUrl: string, note?: string) => void;

  // Embargo (CREATE stat zero 3+ days)
  embargoActive: boolean;
  embargoStartDate?: string;
  checkEmbargo: (createXPHistory: Record<string, number>) => void;
  clearEmbargo: () => void;
}

// ─── Default consequence chains ───────────────────────────────────────────────

const DEFAULT_CHAINS: Record<string, string[]> = {
  code: [
    'Skip LeetCode today',
    'DSA concepts stay weak',
    'Next interview question stumps you',
    'Job search extends by months',
    'Financial independence delayed',
    'Still dependent on family',
    'Still in the same city, same constraints',
  ],
  wealth: [
    'Skip backtesting today',
    'Edge degrades without data',
    'Next trade is based on gut not system',
    'Drawdown hits, confidence collapses',
    'Trading income stays at zero',
    'TradeMind launch delayed',
    'Freedom through capital stays a dream',
  ],
  body: [
    'Skip gym today',
    'Physical energy drops noticeably',
    "Mental output follows — it's linked",
    'Lethargy compounds over weeks',
    'You show up to interviews at 60% energy',
    'Discipline in one area bleeds into all areas',
    'The version of you that wins is built in the gym',
  ],
  mind: [
    'Skip deep reading/thinking today',
    'Mental models stay shallow',
    'Decision quality degrades over weeks',
    'You mistake noise for signal in key moments',
    'Strategic clarity never fully arrives',
    'The edge you needed was a book you skipped',
  ],
  brand: [
    'Skip posting today',
    'Audience growth stays flat',
    'No one knows TradeMind exists',
    'Launch day: crickets',
    'Cold outreach fails because nobody knows your name',
    'Network contacts dont remember you',
    'You apply cold, they hire warm referrals',
  ],
  network: [
    'Skip outreach today',
    'Relationships atrophy without maintenance',
    'The job opening goes to someone who stayed in touch',
    'Referral pipeline stays empty',
    'Every application is cold — 12% response rate',
    'Hiring managers dont know your name',
    'Freedom through people stays locked',
  ],
  create: [
    'Skip creating today',
    'Creative output stays at zero',
    'Social presence stays invisible',
    'No evidence of your work exists publicly',
    'TradeMind has no public story',
    'You consume instead of produce',
    'Someone else ships what you were thinking about',
  ],
  spirit: [
    'Skip reflection today',
    'Emotional clarity degrades',
    'Anxiety about the future builds',
    'Decision-making becomes reactive not intentional',
    'You lose the thread of why you started',
    'Burnout comes without warning because you ignored the signals',
  ],
};

// ─── Store Implementation ─────────────────────────────────────────────────────

export const usePsychStore = create<PsychStore>()(
  persist(
    (set, get) => ({
      psychOnboardingComplete: false,
      setPsychOnboardingComplete: (v) => set({ psychOnboardingComplete: v }),

      // ── One Honest Sentence ──────────────────────────────────────────────
      dailySentences: [],
      addDailySentence: (text) => {
        const today = new Date().toISOString().split('T')[0];
        const existing = get().dailySentences.find(s => s.date === today);
        if (existing) return; // one per day
        set(state => ({
          dailySentences: [
            { id: crypto.randomUUID(), date: today, text },
            ...state.dailySentences,
          ].slice(0, 365),
        }));
      },

      // ── Energy Logging ───────────────────────────────────────────────────
      energyLogs: [],
      logEnergy: (level) => {
        const today = new Date().toISOString().split('T')[0];
        set(state => {
          const filtered = state.energyLogs.filter(e => e.date !== today);
          return { energyLogs: [{ date: today, level }, ...filtered].slice(0, 365) };
        });
      },
      getTodayEnergy: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().energyLogs.find(e => e.date === today);
      },

      // ── Anti-Wishlist ─────────────────────────────────────────────────────
      antiWishlist: [],
      antiWishlistLocked: false,
      addAntiWishlistItem: (text) => {
        if (get().antiWishlistLocked) return;
        set(state => ({
          antiWishlist: [
            ...state.antiWishlist,
            { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() },
          ],
        }));
      },
      removeAntiWishlistItem: (id) => {
        if (get().antiWishlistLocked) return;
        set(state => ({ antiWishlist: state.antiWishlist.filter(i => i.id !== id) }));
      },
      lockAntiWishlist: () => set({ antiWishlistLocked: true, antiWishlistLockedAt: new Date().toISOString() }),

      // ── Consequence Chains ────────────────────────────────────────────────
      consequenceChains: DEFAULT_CHAINS,
      setConsequenceChain: (statId, steps) =>
        set(state => ({ consequenceChains: { ...state.consequenceChains, [statId]: steps } })),
      getDefaultChain: (statId) => DEFAULT_CHAINS[statId] || DEFAULT_CHAINS['code'],

      // ── Salary Clock ─────────────────────────────────────────────────────
      salaryClockConfig: {
        graduationDate: new Date(Date.now() - 90 * 24 * 3600000).toISOString().split('T')[0],
        hourlyOpportunityCost: 300,
        stopped: false,
      },
      configureSalaryClock: (config) =>
        set(state => ({ salaryClockConfig: { ...state.salaryClockConfig, ...config } })),
      stopSalaryClock: () =>
        set(state => ({ salaryClockConfig: { ...state.salaryClockConfig, stopped: true, stoppedAt: new Date().toISOString() } })),

      // ── Weekly Contracts ──────────────────────────────────────────────────
      weeklyContracts: [],
      createContract: (weekOf, name, commitments) =>
        set(state => ({
          weeklyContracts: [
            { id: crypto.randomUUID(), weekOf, name, commitments, signed: false },
            ...state.weeklyContracts,
          ].slice(0, 52),
        })),
      signContract: (id) =>
        set(state => ({
          weeklyContracts: state.weeklyContracts.map(c =>
            c.id === id ? { ...c, signed: true, signedAt: new Date().toISOString() } : c
          ),
        })),
      reviewContract: (id, score) =>
        set(state => ({
          weeklyContracts: state.weeklyContracts.map(c =>
            c.id === id ? { ...c, reviewedAt: new Date().toISOString(), adherenceScore: score } : c
          ),
        })),

      // ── Friction Audits ───────────────────────────────────────────────────
      frictionAudits: [],
      addFrictionAudit: (audit) =>
        set(state => ({
          frictionAudits: [
            { ...audit, id: crypto.randomUUID() },
            ...state.frictionAudits,
          ].slice(0, 52),
        })),

      // ── Mirror Scores ─────────────────────────────────────────────────────
      mirrorScores: [],
      addMirrorScore: (weekOf, perceived, actualXP, goalXP) => {
        const normalizedActual = Math.min(10, Math.round((actualXP / (goalXP * 7)) * 10));
        const delusionGap = perceived - normalizedActual;
        set(state => ({
          mirrorScores: [
            { id: crypto.randomUUID(), weekOf, perceivedProductivity: perceived, actualXP, normalizedActual, delusionGap },
            ...state.mirrorScores,
          ].slice(0, 52),
        }));
      },

      // ── Weekly Questions ──────────────────────────────────────────────────
      weeklyQuestions: [],
      addWeeklyAnswer: (question, answer) =>
        set(state => ({
          weeklyQuestions: [
            { id: crypto.randomUUID(), date: new Date().toISOString(), question, answer },
            ...state.weeklyQuestions,
          ].slice(0, 52),
        })),

      // ── Decision Journal ──────────────────────────────────────────────────
      decisions: [],
      addDecision: (d) => {
        const followUpDate = new Date();
        followUpDate.setMonth(followUpDate.getMonth() + 3);
        set(state => ({
          decisions: [
            { ...d, id: crypto.randomUUID(), followUpDate: followUpDate.toISOString() },
            ...state.decisions,
          ],
        }));
      },
      reviewDecision: (id, actualOutcome) =>
        set(state => ({
          decisions: state.decisions.map(d =>
            d.id === id ? { ...d, actualOutcome, reviewed: true } : d
          ),
        })),

      // ── Regret Log ────────────────────────────────────────────────────────
      regretLog: [],
      logSkip: (statId) =>
        set(state => ({
          regretLog: [
            { id: crypto.randomUUID(), statId, skippedDate: new Date().toISOString().split('T')[0] },
            ...state.regretLog,
          ].slice(0, 500),
        })),
      logRegret: (id, regretted) =>
        set(state => ({
          regretLog: state.regretLog.map(r => r.id === id ? { ...r, regretted } : r),
        })),
      getRegretProbability: (statId) => {
        const logs = get().regretLog.filter(r => r.statId === statId && r.regretted !== undefined);
        if (logs.length < 5) return 87; // default high
        const regrettedCount = logs.filter(r => r.regretted).length;
        return Math.round((regrettedCount / logs.length) * 100);
      },

      // ── Parallel Life ─────────────────────────────────────────────────────
      parallelLifeConfig: {
        startDate: new Date().toISOString().split('T')[0],
        dailyTargets: {
          leetcode: 1,
          applications: 0.7,
          tweets: 0.6,
          gym: 0.57,
          commits: 1,
          outreach: 0.7,
        },
      },
      setParallelLifeConfig: (config) => set({ parallelLifeConfig: config }),

      // ── Dependency Mirror ──────────────────────────────────────────────────
      dependencyItems: [],
      dependencyAudits: [],
      setDependencyItems: (items) => set({ dependencyItems: items }),
      addDependencyAudit: (audit) =>
        set(state => ({
          dependencyAudits: [
            { ...audit, id: crypto.randomUUID() },
            ...state.dependencyAudits,
          ].slice(0, 24),
        })),
      updateDependencyStatus: (id, status) =>
        set(state => ({
          dependencyItems: state.dependencyItems.map(d =>
            d.id === id ? { ...d, status } : d
          ),
        })),

      // ── Dead Man's Switch ─────────────────────────────────────────────────
      deadManConfig: {
        enabled: false,
        contactEmail: '',
        contactName: '',
        hoursBeforeTrigger: 48,
        lastCheckIn: new Date().toISOString(),
      },
      configureDeadMan: (config) =>
        set(state => ({ deadManConfig: { ...state.deadManConfig, ...config } })),
      checkInDeadMan: () =>
        set(state => ({ deadManConfig: { ...state.deadManConfig, lastCheckIn: new Date().toISOString() } })),

      // ── Streak Insurance ──────────────────────────────────────────────────
      streakInsurance: { usesThisMonth: 0 },
      useStreakInsurance: () => {
        const { streakInsurance } = get();
        const now = new Date();

        let currentUses = streakInsurance.usesThisMonth;

        // Reset if new month
        if (
          streakInsurance.lastUsedMonth !== undefined &&
          (streakInsurance.lastUsedMonth !== now.getMonth() || streakInsurance.lastUsedYear !== now.getFullYear())
        ) {
          currentUses = 0;
        }

        if (currentUses >= 4) return false;

        // Check not used today
        const today = now.toISOString().split('T')[0];
        if (streakInsurance.lastUsedDate === today) return false;

        set({
          streakInsurance: {
            usesThisMonth: currentUses + 1,
            lastUsedDate: today,
            lastUsedMonth: now.getMonth(),
            lastUsedYear: now.getFullYear(),
          },
        });
        return true;
      },
      addStreakInsurance: () => {
        set(state => ({
          streakInsurance: {
            ...state.streakInsurance,
            usesThisMonth: Math.max(0, (state.streakInsurance.usesThisMonth || 0) - 1)
          }
        }));
      },
      resetInsuranceIfNewMonth: () => {
        const { streakInsurance } = get();
        const now = new Date();
        if (
          streakInsurance.lastUsedMonth !== undefined &&
          (streakInsurance.lastUsedMonth !== now.getMonth() || streakInsurance.lastUsedYear !== now.getFullYear())
        ) {
          set({ streakInsurance: { usesThisMonth: 0 } });
        }
      },

      // ── Future Letters ────────────────────────────────────────────────────
      futureLetters: [],
      addFutureLetter: (content, deliverAt, type, trigger) =>
        set(state => ({
          futureLetters: [
            ...state.futureLetters,
            { id: crypto.randomUUID(), writtenAt: new Date().toISOString(), content, deliverAt, type, trigger, delivered: false },
          ],
        })),
      markLetterDelivered: (id) =>
        set(state => ({
          futureLetters: state.futureLetters.map(l => l.id === id ? { ...l, delivered: true } : l),
        })),
      checkLetterDelivery: (jobApplications) => {
        const now = new Date();
        const triggered: FutureLetter[] = [];
        get().futureLetters.filter(l => !l.delivered).forEach(letter => {
          const shouldDeliver =
            (letter.trigger === 'job_offer' && jobApplications.some(j => j.status === 'ACCEPTED' || j.status === 'PENDING OFFER')) ||
            (!letter.trigger && new Date(letter.deliverAt) <= now);
          if (shouldDeliver) triggered.push(letter);
        });
        return triggered;
      },

      // ── Context Photos ────────────────────────────────────────────────────
      contextPhotos: [],
      addContextPhoto: (dataUrl, note) =>
        set(state => ({
          contextPhotos: [
            { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], dataUrl, note },
            ...state.contextPhotos,
          ].slice(0, 52),
        })),

      // ── Embargo ───────────────────────────────────────────────────────────
      embargoActive: false,
      checkEmbargo: (createXPHistory) => {
        // createXPHistory: { 'YYYY-MM-DD': xp }
        const days: string[] = [];
        for (let i = 1; i <= 3; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
        }
        const allZero = days.every(d => (createXPHistory[d] ?? 0) === 0);
        if (allZero && !get().embargoActive) {
          set({ embargoActive: true, embargoStartDate: new Date().toISOString() });
        }
      },
      clearEmbargo: () => set({ embargoActive: false, embargoStartDate: undefined }),
    }),
    {
      name: 'sovereign-psych-store',
    }
  )
);
