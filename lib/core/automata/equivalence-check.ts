import type { Automaton } from 'types/automaton';
import { buildSimulationTrace, type SimulationOutcome } from './simulation';

export interface EquivalenceSampleResult {
  input: string;
  nfaOutcome: SimulationOutcome;
  dfaOutcome: SimulationOutcome;
  match: boolean;
}

export interface EquivalenceCheckResult {
  allMatch: boolean;
  samples: EquivalenceSampleResult[];
  mismatches: EquivalenceSampleResult[];
}

/** Comprueba equivalencia funcional en un conjunto finito de cadenas. */
export function checkEquivalenceOnSamples(
  nfa: Automaton,
  dfa: Automaton,
  samples: string[]
): EquivalenceCheckResult {
  const results: EquivalenceSampleResult[] = samples.map((input) => {
    const nfaOutcome = buildSimulationTrace(nfa, input).finalOutcome;
    const dfaOutcome = buildSimulationTrace(dfa, input).finalOutcome;
    return {
      input,
      nfaOutcome,
      dfaOutcome,
      match: nfaOutcome === dfaOutcome,
    };
  });

  const mismatches = results.filter((r) => !r.match);

  return {
    allMatch: mismatches.length === 0,
    samples: results,
    mismatches,
  };
}
