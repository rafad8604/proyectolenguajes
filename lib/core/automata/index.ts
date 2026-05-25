export { EPSILON_SYMBOL, EPSILON_INTERNAL } from './constants';
export type { FormalDefinition, ValidationIssue, ValidationResult } from './types';
export {
  createEmptyAutomaton,
  createState,
  createTransition,
  generateId,
  nextStateName,
} from './factory';
export { patchStatePosition, patchTransitionVisual } from './layout';
export { deriveAlphabet, syncAlphabet } from './alphabet';
export { buildFormalDefinition } from './formal';
export {
  validateAutomaton,
  validateInitialState,
  validateAcceptingStates,
  validateCompleteness,
  validateDeterministic,
} from './validate';
export { epsilonClosure, epsilonTransitionsUsed, sortStateIds } from './epsilon-closure';
export {
  buildSimulationTrace,
  getOutcomeLabel,
  getStepSymbolDisplay,
  MAX_SIMULATION_STEPS,
} from './simulation';
export {
  compareSimulations,
  formatVisitedStates,
} from './compare-simulations';
export type {
  SimulationComparison,
  StructuralSummary,
} from './compare-simulations';
export { checkEquivalenceOnSamples } from './equivalence-check';
export type {
  EquivalenceCheckResult,
  EquivalenceSampleResult,
} from './equivalence-check';
export type {
  SimulationOutcome,
  SimStep,
  SimStepKind,
  SimulationTrace,
} from './simulation';
export {
  buildVisualSnapshot,
  snapshotToGraphHighlight,
} from './visual-highlight';
export type { SimulationVisualSnapshot } from './visual-highlight';
export {
  convertNfaToDfa,
  formatSubsetLabel,
  subsetKey,
} from './nfa-to-dfa';
export type {
  ConversionTableRow,
  ConversionExplanationStep,
  NfaToDfaResult,
} from './nfa-to-dfa';
