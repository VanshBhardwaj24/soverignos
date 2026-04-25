import { useSovereignStore } from '../store/sovereign';

export function useIntelligenceMatrix() {
  const store = useSovereignStore();

  return {
    causalityDiscoveries: store.causalityDiscoveries,
    surveillanceMetrics: store.surveillanceMetrics,
    intelligenceLogs: store.intelligenceLogs,
    projections: store.projections,
    runCausalityAnalysis: store.runCausalityAnalysis,
    updateSurveillance: store.updateSurveillance,
  };
}
