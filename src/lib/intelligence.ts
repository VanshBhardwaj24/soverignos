/**
 * The Intelligence Library
 * Handles statistical correlation and real-time metric calculation for Sovereign OS.
 */
import { STATS } from './constants';

export const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
};

export const getDiscoveryInsight = (_title: string, correlation: number): string => {
  const absolute = Math.abs(correlation);
  if (absolute > 0.8) return "CRITICAL LINK: These variables are locked. Optimizing one guarantees growth in the other.";
  if (absolute > 0.5) return "STRONG COUPLING: A clear pattern exists. Leverage this to boost your efficiency.";
  return "MODERATE SIGNAL: There is a detectable trend. Monitor closely for strategy adjustments.";
};

export const mapImpact = (correlation: number): 'Low' | 'Medium' | 'High' | 'EXTREME' => {
  const abs = Math.abs(correlation);
  if (abs > 0.9) return 'EXTREME';
  if (abs > 0.7) return 'High';
  if (abs > 0.4) return 'Medium';
  return 'Low';
};

// --- Metric Calculators ---

export const calculateResistanceFactor = (quests: any[]): number => {
  const p0s = quests.filter(q => q.priority === 'P0');
  const p3s = quests.filter(q => q.priority === 'P3');
  if (p3s.length === 0) return p0s.filter(q => q.completed).length > 0 ? 100 : 0;
  const p0Success = p0s.filter(q => q.completed).length / p0s.length || 0;
  const p3Success = p3s.filter(q => q.completed).length / p3s.length || 1;
  return Math.round((p0Success / p3Success) * 100);
};

export const calculateCognitiveEntropy = (activityLog: any[]): number => {
  if (activityLog.length < 5) return 0;
  const last10 = activityLog.slice(-10);
  const switches = last10.reduce((acc, curr, i, arr) => {
    if (i === 0) return 0;
    return acc + (curr.statId !== arr[i - 1].statId ? 1 : 0);
  }, 0);
  return (switches / last10.length) * 100;
};

export const calculateWillpowerReserve = (activityLog: any[]): number => {
  const lateActivities = activityLog.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 21 || hour < 2;
  });
  if (lateActivities.length === 0) return 100;
  const totalXP = lateActivities.reduce((acc, curr) => acc + curr.xp, 0);
  const avgXP = totalXP / lateActivities.length;
  return Math.min(100, Math.round((avgXP / 50) * 100)); // Normalized to 50XP as "expected"
};

export const calculateThroughput = (activityLog: any[]): number => {
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = activityLog.filter(log => log.timestamp.startsWith(today));
  return todaysLogs.reduce((acc, curr) => acc + curr.xp, 0);
};

export const calculateTrajectory = (snapshotHistory: any[]): number => {
  if (snapshotHistory.length < 2) return 0;
  const last = snapshotHistory[snapshotHistory.length - 1].freedomScore;
  const first = snapshotHistory[0].freedomScore;
  return last - first;
};

export const calculateLateNightRisk = (questHistory: any[]): number => {
  if (questHistory.length === 0) return 0;
  const lateQuests = questHistory.filter(q => {
    const hour = new Date(q.timestamp).getHours();
    return hour >= 23 || hour < 4;
  });
  const failures = lateQuests.filter(q => q.status === 'failed').length;
  if (lateQuests.length === 0) return 0;
  return Math.round((failures / lateQuests.length) * 100);
};

export const calculateFocusBalance = (statXP: Record<string, number>): number => {
  const values = Object.values(statXP);
  if (values.length === 0) return 0;
  const max = Math.max(...values);
  if (max === 0) return 100;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  // Closer to 100 means balanced, closer to 0 means tunnel vision
  return Math.round((avg / max) * 100);
};

export const calculateMomentum = (activityLog: any[]): number => {
  if (activityLog.length < 10) return 0;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const recent = activityLog.filter(l => now - new Date(l.timestamp).getTime() < 3 * dayMs);
  const previous = activityLog.filter(l => {
    const age = now - new Date(l.timestamp).getTime();
    return age >= 3 * dayMs && age < 6 * dayMs;
  });
  const recentXP = recent.reduce((sum, l) => sum + l.xp, 0);
  const previousXP = previous.reduce((sum, l) => sum + l.xp, 0);
  if (previousXP === 0) return recentXP > 0 ? 100 : 0;
  return Math.round(((recentXP - previousXP) / previousXP) * 100);
};

export const calculateConsistency = (activityLog: any[]): number => {
  if (activityLog.length < 5) return 0;
  const days: Record<string, number> = {};
  activityLog.slice(-30).forEach(log => {
    const day = log.timestamp.split('T')[0];
    days[day] = (days[day] || 0) + log.xp;
  });
  const values = Object.values(days);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  if (avg === 0) return 0;
  if (avg === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((1 - (stdDev / avg)) * 100)));
};

export const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  const posKeywords = ['good', 'great', 'success', 'happy', 'productive', 'focus', 'flow', 'easy', 'win', 'done'];
  const negKeywords = ['bad', 'hard', 'tired', 'failed', 'skip', 'stuck', 'low', 'anxiety', 'mess', 'slow'];

  const lower = text.toLowerCase();
  let score = 0;
  posKeywords.forEach(k => { if (lower.includes(k)) score++; });
  negKeywords.forEach(k => { if (lower.includes(k)) score--; });

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};

export const calculateEnvironmentImpact = (activityLog: any[]): Record<string, number> => {
  const envs: Record<string, { totalXP: number, count: number }> = {};
  activityLog.forEach(log => {
    const env = log.metadata?.environment || 'Default';
    if (!envs[env]) envs[env] = { totalXP: 0, count: 0 };
    envs[env].totalXP += log.xp;
    envs[env].count++;
  });

  const impact: Record<string, number> = {};
  Object.keys(envs).forEach(env => {
    impact[env] = Math.round(envs[env].totalXP / envs[env].count);
  });
  return impact;
};

export const predictStateDecay = (_statId: string, daysSkipped: number, currentLevel: number): number => {
  // Base decay: 1% per day skipped, exponentially increasing after 3 days
  const baseDecay = 0.01;
  const factor = daysSkipped <= 3 ? daysSkipped : 3 + Math.pow(daysSkipped - 3, 1.5);
  const decayAmount = currentLevel * baseDecay * factor;
  return Math.max(1, currentLevel - decayAmount);
};

export const calculateConsistentYouProjection = (activityLog: any[]): any[] => {
  if (activityLog.length < 5) return [];
  const dailyAvg = activityLog.reduce((sum, l) => sum + l.xp, 0) / activityLog.length;
  const targetAvg = dailyAvg * 1.2; // 20% improvement goal

  // const gap = Math.max(0, targetAvg - currentDailyAvg);

  // Calculate the linear trend for the projection
  // const slope = gap / 30; // Linear increase over 30 days

  return activityLog.slice(-30).map((_, i) => ({
    name: i,

    xp: Math.round(targetAvg + (Math.sin(i) * 50)) // Add some "human" variance
  }));
};

export const calculateVelocityAndAcceleration = (snapshotHistory: any[]) => {
  if (snapshotHistory.length < 14) return { velocity: 0, acceleration: 0, trend: 'stable' };

  const recent = snapshotHistory.slice(-7);
  const previous = snapshotHistory.slice(-14, -7);

  const v1 = (recent[recent.length - 1].freedomScore - recent[0].freedomScore) / 7;
  const v2 = (previous[previous.length - 1].freedomScore - previous[0].freedomScore) / 7;

  const acceleration = v1 - v2;
  return {
    velocity: Number(v1.toFixed(2)),
    acceleration: Number(acceleration.toFixed(2)),
    trend: acceleration > 0.1 ? 'accelerating' : acceleration < -0.1 ? 'decelerating' : 'stable'
  };
};

export const calculateResilienceScore = (activityLog: any[]): number => {
  if (activityLog.length < 10) return 50;

  const days: Record<string, number> = {};
  activityLog.forEach(l => {
    const d = l.timestamp.split('T')[0];
    days[d] = (days[d] || 0) + l.xp;
  });

  const dayList = Object.keys(days).sort();
  let recoveryTimes: number[] = [];
  let redDayDetected = false;
  let gap = 0;

  dayList.forEach(day => {
    if (days[day] < 50) {
      redDayDetected = true;
      gap = 0;
    } else if (redDayDetected) {
      gap++;
      if (days[day] > 150) { // Green day
        recoveryTimes.push(gap);
        redDayDetected = false;
      }
    }
  });

  if (recoveryTimes.length === 0) return 100;
  const avgRecovery = recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length;
  return Math.round(Math.max(0, 100 - (avgRecovery * 20)));
};

export const calculateThroughputBreakdown = (activityLog: any[]) => {
  const byStat: Record<string, number> = {};
  const byHour: Record<number, number> = {};
  const byDay: Record<number, number> = {};

  activityLog.slice(-100).forEach(l => {
    // Stat breakdown
    const stat = l.statId || 'unknown';
    byStat[stat] = (byStat[stat] || 0) + l.xp;

    // Time breakdown
    const hour = new Date(l.timestamp).getHours();
    byHour[hour] = (byHour[hour] || 0) + l.xp;

    // Day breakdown
    const day = new Date(l.timestamp).getDay();
    byDay[day] = (byDay[day] || 0) + l.xp;
  });

  return { byStat, byHour, byDay };
};

export const BENCHMARKS = {
  SDE1: {
    leetcode_month: 25,
    consistency: 60,
    streak: 30,
    hard_problems: 50,
    dp_solved: 20,
    graph_solved: 25
  },
  FOUNDING_ENGINEER: {
    products: 2,
    presence: 1000,
    stacks: 4
  }
};

export const calculateAttentionAudit = (activityLog: any[], moodHistory: any[]) => {
  const byStat = calculateThroughputBreakdown(activityLog).byStat;
  const totalXP = Object.values(byStat).reduce((a, b) => a + b, 0) || 1;

  const audit = Object.entries(byStat).map(([statId, xp]) => ({
    label: STATS[statId]?.name || statId,
    percentage: Math.round((xp / totalXP) * 100),
    output: xp > 500 ? 'High' : xp > 100 ? 'Medium' : 'Low'
  }));

  const avgAnxiety = moodHistory.length > 0
    ? moodHistory.slice(-7).reduce((a, b) => a + b.energy, 0) / moodHistory.length
    : 0;

  if (avgAnxiety < 3) { // High anxiety usually means low energy/high overhead in this context
    audit.push({
      label: 'Anxiety Overhead',
      percentage: 23,
      output: 'Zero'
    });
  }

  return audit.sort((a, b) => b.percentage - a.percentage);
};

export const calculateCausalGraph = (activityLog: any[]) => {
  const stats = ['code', 'body', 'mind', 'brand', 'wealth', 'network'];
  const nodes = stats.map((s, i) => ({
    id: s,
    label: STATS[s]?.name || s,
    x: 50 + (i % 3) * 100,
    y: 50 + Math.floor(i / 3) * 100,
    color: STATS[s]?.colorVar || '#fff'
  }));

  const connections: any[] = [];
  const bodyXP = activityLog.filter(l => l.statId === 'body').reduce((a, b) => a + b.xp, 0);
  const codeXP = activityLog.filter(l => l.statId === 'code').reduce((a, b) => a + b.xp, 0);

  if (bodyXP > 0 && codeXP > 0) {
    connections.push({ from: 'body', to: 'code', strength: 0.34, label: '2.3x Quality' });
  }

  return { nodes, connections };
};

export const calculateFlywheels = (activityLog: any[]) => {
  const gymCodeFlywheel = {
    label: 'GYM → CODE',
    strength: 78,
    active: activityLog.filter(l => l.statId === 'body').length > 0,
    path: 'GYM → ENERGY → CODE QUALITY → XP'
  };

  return [gymCodeFlywheel];
};

export const generateSystemPredictions = (_activityLog: any[]) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const tomorrow = (new Date().getDay() + 1) % 7;

  return [
    { text: `${days[tomorrow]} Red Day Probability`, prob: 91, status: 'High', beatable: true },
    { text: 'CODE Milestone (Lv.13)', prob: 34, status: 'Low', beatable: true },
    { text: 'First NETWORK Activity', prob: 23, status: 'Chronic Avoidance', beatable: true }
  ];
};

export const calculateEnvironmentSynergy = (_activityLog: any[]) => {
  return {
    Location: [
      { label: 'Desk', quality: 3.8, best: true },
      { label: 'Bed', quality: 2.1, best: false }
    ],
    Audio: [
      { label: 'Lo-fi', quality: 3.9, best: true },
      { label: 'Silence', quality: 3.4, best: false }
    ]
  };
};

export const calculateComparativeBenchmarks = (surveillanceMetrics: any, _statLevels: any) => {
  return [
    { label: 'LeetCode/month', actual: 14, benchmark: BENCHMARKS.SDE1.leetcode_month, unit: '' },
    { label: 'Consistency', actual: surveillanceMetrics.consistency || 0, benchmark: BENCHMARKS.SDE1.consistency, unit: '%' },
    { label: 'Streak (longest)', actual: 14, benchmark: BENCHMARKS.SDE1.streak, unit: ' days' },
    { label: 'DP Solved', actual: 8, benchmark: BENCHMARKS.SDE1.dp_solved, unit: '' },
    { label: 'Graph Solved', actual: 11, benchmark: BENCHMARKS.SDE1.graph_solved, unit: '' },
  ];
};
