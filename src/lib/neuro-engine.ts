/**
 * Neuro-Engine logic for Sovereign OS.
 * Handles the simulation of neurochemical feedback loops.
 */

export interface NeuroState {
  dopamine: number;
  serotonin: number;
  endorphins: number;
  oxytocin: number;
}

export interface NeuroContext {
  willpower: number;      // 0-100
  entropy: number;        // 0-100 (context switching)
  focusBalance: number;   // 0-100
  resilience: number;     // 0-100
  consistency: number;    // 0-100
  integrity: number;      // 0-100
  accountability: number; // 0-100
  trajectory: number;     // Freedom score change
  isLateNight: boolean;
  flywheelActive: boolean;
  chainLength: number;    // Completed tasks in short window
}

export const INITIAL_NEURO_STATE: NeuroState = {
  dopamine: 50,
  serotonin: 50,
  endorphins: 30,
  oxytocin: 50,
};

/**
 * Calculates a variable XP yield based on psychological factors.
 * Leveraging Variable Ratio Reinforcement.
 */
export const calculateVariableYield = (
  baseXP: number,
  context: Partial<NeuroContext>
): { yield: number; isCritical: boolean; surgeType: 'surge' | 'momentum' | 'none' } => {
  const { willpower = 100, entropy = 0 } = context;

  // Base surge probability: 5%
  // Low willpower increases craving/surge chance (+up to 15%)
  // High entropy dampens surges (mental noise)
  const surgeProb = Math.max(0.01, (0.05 + (1 - willpower / 100) * 0.15) * (1 - entropy / 100));

  const roll = Math.random();

  if (roll < surgeProb) {
    return { yield: Math.floor(baseXP * 2.5), isCritical: true, surgeType: 'surge' };
  }

  if (roll < surgeProb + 0.10) {
    return { yield: Math.floor(baseXP * 1.5), isCritical: false, surgeType: 'momentum' };
  }

  return { yield: baseXP, isCritical: false, surgeType: 'none' };
};

/**
 * Calculates the delta shift for neurochemicals based on an action.
 */
export const calculateNeuroShift = (
  currentState: NeuroState,
  actionType: 'xp_gain' | 'quest_complete' | 'violation' | 'checkin',
  yieldAmount: number,
  context: NeuroContext
): Partial<NeuroState> => {
  const deltas: Partial<NeuroState> = {};

  switch (actionType) {
    case 'xp_gain':
      // Dopamine spike on reward
      // Dampened by entropy
      const dGain = Math.log10(yieldAmount + 1) * 15 * (1 - context.entropy / 200);
      deltas.dopamine = Math.min(100, currentState.dopamine + dGain);

      // Endorphins on chain length
      if (context.chainLength > 1) {
        const eGain = (context.chainLength * 5) * (context.resilience / 100);
        deltas.endorphins = Math.min(100, currentState.endorphins + (context.isLateNight ? eGain * 0.5 : eGain));
      }
      break;

    case 'quest_complete':
      // Serotonin boost on status achievement
      const sGain = 10 * (context.focusBalance / 100) * (1 + Math.max(0, context.trajectory / 10));
      deltas.serotonin = Math.min(100, currentState.serotonin + sGain);

      // Oxytocin on commitment
      const oGain = 8 * (context.integrity / 100) * (context.consistency / 100) * (context.flywheelActive ? 1.25 : 1);
      deltas.oxytocin = Math.min(100, currentState.oxytocin + oGain);
      break;

    case 'violation':
      // Massive Serotonin/Oxytocin crash
      deltas.serotonin = Math.max(0, currentState.serotonin - 20);
      deltas.oxytocin = Math.max(0, currentState.oxytocin - 15);
      deltas.dopamine = Math.max(0, currentState.dopamine - 10);
      break;

    case 'checkin':
      // Pure Oxytocin boost
      deltas.oxytocin = Math.min(100, currentState.oxytocin + 15);
      break;
  }

  return deltas;
};

/**
 * Calculates chemical decay over time (The Metabolic Tick).
 */
export const calculateDecay = (
  currentState: NeuroState,
  context: Partial<NeuroContext>
): NeuroState => {
  const { resilience = 50 } = context;

  // Base decay rates (half-life simulation)
  // High resilience slows down decay for Endorphins and Dopamine
  const dDecay = 0.98 + (resilience / 5000); // Decays to 0.98-1.0
  const sDecay = 0.99;
  const eDecay = 0.95 + (resilience / 5000); // Endorphins decay faster
  const oDecay = 0.995;

  return {
    dopamine: Math.max(10, currentState.dopamine * dDecay - 0.1),
    serotonin: Math.max(20, currentState.serotonin * sDecay - 0.05),
    endorphins: Math.max(0, currentState.endorphins * eDecay - 0.2),
    oxytocin: Math.max(20, currentState.oxytocin * oDecay - 0.02),
  };
};
