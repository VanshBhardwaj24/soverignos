export interface StatDefinition {
  id: string;
  name: string;
  colorVar: string;
}

export const STATS: Record<string, StatDefinition> = {
  code:    { id: 'code',    name: 'CODE',    colorVar: 'var(--stat-code)'    },
  wealth:  { id: 'wealth',  name: 'WEALTH',  colorVar: 'var(--stat-wealth)'  },
  body:    { id: 'body',    name: 'BODY',    colorVar: 'var(--stat-body)'    },
  mind:    { id: 'mind',    name: 'MIND',    colorVar: 'var(--stat-mind)'    },
  brand:   { id: 'brand',   name: 'BRAND',   colorVar: 'var(--stat-brand)'   },
  network: { id: 'network', name: 'NETWORK', colorVar: 'var(--stat-network)' },
  spirit:  { id: 'spirit',  name: 'SPIRIT',  colorVar: 'var(--stat-spirit)'  },
  sovereignty: { id: 'sovereignty', name: 'SOVEREIGNTY', colorVar: 'var(--stat-brand)' },
};

export const STAT_SYNERGIES = [
  { stats: ['code', 'wealth'], name: 'Algo-Trader', bonus: 'WEALTH XP +10%', minLevel: 10 },
  { stats: ['body', 'mind'], name: 'Zen Warrior', bonus: 'GOD MODE +15% XP', minLevel: 10 },
  { stats: ['brand', 'network'], name: 'Social Gravity', bonus: 'GOLD EARNED +20%', minLevel: 15 },
  { stats: ['code', 'mind'], name: 'Neural Architect', bonus: 'QUEST XP +10%', minLevel: 20 },
];

export const PRESTIGE_XP_MULTIPLIER = 1.5; // Each prestige level adds 50% XP gain

export const XP_TABLE: Record<string, number> = {
  leetcode_easy:      20,
  leetcode_medium:    40,
  leetcode_hard:      80,
  github_commit:      30,
  job_application:    25,
  open_source_pr:     60,
  gym_session:        40,
  sleep_logged:       15,
  tweet_posted:       20,
  linkedin_post:      35,
  cold_outreach:      20,
  forex_win:          50,
  philosophy_reading: 25,
  journaling:         20,
};

export interface Recipe {
  id: string;
  name: string;
  desc: string;
  cost: number;
  ingredients: Record<string, number>;
  resultItem: string;
}

export const CRAFTING_RECIPES: Recipe[] = [
  { 
    id: 'deep_work_focus', 
    name: 'Neural Focus Lens', 
    desc: 'Stat mastery shard. God Mode +15% XP gain.', 
    cost: 500, 
    ingredients: { neural_shard: 5 },
    resultItem: 'focus_lens'
  },
  { 
    id: 'wealth_magnet', 
    name: 'Sovereign Sigil', 
    desc: 'Wealth generation passive. +10% Gold from quests.', 
    cost: 1000, 
    ingredients: { boss_soul: 1, neural_shard: 3 },
    resultItem: 'sovereign_sigil'
  },
];

// F8: Quest Difficulty Multipliers
export const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  easy:      0.7,
  medium:    1.0,
  hard:      1.5,
  legendary: 2.5,
};

export const DIFFICULTY_GOLD: Record<string, number> = {
  easy:      0.3,
  medium:    0.5,
  hard:      0.8,
  legendary: 1.5,
};

// F3: Skill Perks per stat — real effects baked into logActivity
export interface SkillPerk {
  level: number;
  name: string;
  desc: string;
  xpBonus?: number;        // multiplier bonus (0.05 = +5%)
  globalEffect?: string;   // label text for UI
}

export const SKILL_PERKS: Record<string, SkillPerk[]> = {
  code: [
    { level: 5,  name: 'Trainee',     desc: 'Consistency forged. Base CODE XP rate +5%.', xpBonus: 0.05 },
    { level: 10, name: 'Adept',       desc: 'Flow state unlocked. God Mode grants 1.2x XP.', xpBonus: 0.12 },
    { level: 25, name: 'Sovereign',   desc: 'Elite status. Code XP +25%.', xpBonus: 0.25 },
    { level: 50, name: 'Grandmaster', desc: 'Stat mastery. Global Freedom Score weight increased.', xpBonus: 0.5 },
  ],
  wealth: [
    { level: 5,  name: 'Analyst',     desc: 'Market awareness. WEALTH XP +5%.',  xpBonus: 0.05 },
    { level: 10, name: 'Trader',      desc: 'Daily win rate improved. WEALTH XP +12%.', xpBonus: 0.12 },
    { level: 25, name: 'Capitalist',  desc: 'Income stacks. WEALTH XP +25%.', xpBonus: 0.25 },
    { level: 50, name: 'Tycoon',      desc: 'Full financial sovereignty. WEALTH XP +50%.', xpBonus: 0.5 },
  ],
  body: [
    { level: 5,  name: 'Athlete',      desc: 'Conditioning optimized. BODY XP +5%.', xpBonus: 0.05 },
    { level: 10, name: 'Warrior',      desc: 'Resilience unlocked. BODY XP +12%.', xpBonus: 0.12 },
    { level: 25, name: 'Bio-Optimizer',desc: 'Peak performance state. BODY XP +25%.', xpBonus: 0.25 },
    { level: 50, name: 'Apex',         desc: 'Physical sovereignty achieved.', xpBonus: 0.5 },
  ],
  mind: [
    { level: 5,  name: 'Thinker',    desc: 'Mental acuity sharpened. MIND XP +5%.', xpBonus: 0.05 },
    { level: 10, name: 'Strategist', desc: 'Deeper pattern recognition. MIND XP +12%.', xpBonus: 0.12 },
    { level: 25, name: 'Stoic Sage', desc: 'Unshakable focus. MIND XP +25%.', xpBonus: 0.25 },
    { level: 50, name: 'Oracle',     desc: 'Full mental sovereignty.', xpBonus: 0.5 },
  ],
  brand: [
    { level: 5,  name: 'Creator',     desc: 'Content velocity increased. BRAND XP +5%.', xpBonus: 0.05 },
    { level: 10, name: 'Influencer',  desc: 'Audience compounds. BRAND XP +12%.', xpBonus: 0.12 },
    { level: 25, name: 'Viral Cat.',  desc: 'Viral loops activated. BRAND XP +25%.', xpBonus: 0.25 },
    { level: 50, name: 'Icon',        desc: 'Brand sovereignty achieved.', xpBonus: 0.5 },
  ],
  network: [
    { level: 5,  name: 'Connector',   desc: 'Outreach efficiency +5%.', xpBonus: 0.05 },
    { level: 10, name: 'Networker',   desc: 'Relationship leverage active. NETWORK XP +12%.', xpBonus: 0.12 },
    { level: 25, name: 'Nexus',       desc: 'Network flywheel spinning. NETWORK XP +25%.', xpBonus: 0.25 },
    { level: 50, name: 'Sovereign',   desc: 'Network gravity achieved.', xpBonus: 0.5 },
  ],
};

// F13: System Ranks based on Freedom Score
export const SYSTEM_RANKS = [
  { min: 0,    name: 'Rookie Initiate',  color: '#888888', tier: 0 },
  { min: 5,    name: 'Junior Operative', color: '#22d3ee', tier: 1 },
  { min: 15,   name: 'Senior Analyst',   color: '#3b82f6', tier: 2 },
  { min: 30,   name: 'Field Commander',  color: '#8b5cf6', tier: 3 },
  { min: 50,   name: 'Master Adaptor',   color: '#f59e0b', tier: 4 },
  { min: 70,   name: 'Elite Sovereign',  color: '#ef4444', tier: 5 },
  { min: 90,   name: 'APEX SOVEREIGN',   color: '#ffffff', tier: 6 },
];

export function getRank(freedomScore: number) {
  return [...SYSTEM_RANKS].reverse().find(r => freedomScore >= r.min) || SYSTEM_RANKS[0];
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function computeFreedomScore(stats: Record<string, number>): number {
  const weights: Record<string, number> = {
    code:    0.22,
    wealth:  0.22,
    body:    0.15,
    mind:    0.12,
    brand:   0.12,
    network: 0.12,
    spirit:  0.15,
  };
  return Object.entries(weights).reduce((score, [stat, weight]) => {
    const level = stats[stat] || 0;
    const normalizedLevel = Math.min(level / 50, 1) * 100;
    return score + normalizedLevel * weight;
  }, 0);
}

export function computeSovereignty(stats: Record<string, number>, globalStreak: number, accountabilityScore: number): number {
  const avgLevel = Object.values(stats).reduce((a, b) => a + b, 0) / Object.keys(STATS).length;
  const streakBonus = Math.min(globalStreak / 30, 1) * 20; // Max 20 points for 30 day streak
  const accountabilityPart = (accountabilityScore / 100) * 30; // Max 30 points
  const levelPart = (avgLevel / 50) * 50; // Max 50 points
  
  return Math.min(100, streakBonus + accountabilityPart + levelPart);
}

// F30: Punitive Protocol Tasks
export interface PunitiveTask {
  id: string;
  type: 'physical' | 'financial' | 'mental';
  title: string;
  description: string;
  penalty?: number;
}

export const PUNISHMENT_POOL: PunitiveTask[] = [
  { id: 'p1', type: 'physical', title: 'Tactical Conditioning', description: 'Perform 50 explosive pushups to reinforce neural pathways.' },
  { id: 'p2', type: 'physical', title: 'Cold Exposure', description: 'Immediate 3-minute cold immersion (full submergence).' },
  { id: 'p3', type: 'physical', title: 'Metabolic Reset', description: 'Perform 30 burpees with maximal intensity.' },
  { id: 'p4', type: 'mental', title: 'Neural Realignment', description: '15 minutes of silent, unmoving meditation. Focus on protocol adherence.' },
  { id: 'p5', type: 'financial', title: 'Wealth Sanction', description: 'System-wide gold deduction for operational negligence.', penalty: 100 },
  { id: 'p6', type: 'mental', title: 'Manual Transcription', description: 'Write "I will not fail the protocol" 20 times in the Mind Vault.' },
];
