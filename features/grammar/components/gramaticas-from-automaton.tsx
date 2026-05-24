'use client';

import Link from 'next/link';
import { GrammarViewer } from 'features/grammar/components/GrammarViewer';
import { useAutomatonStore } from 'features/automata/store/automaton-store';
import { NFA_EPSILON, NFA_ENDS_WITH_A, DFA_ENDS_WITH_AB } from 'features/automata/examples/presets';

export function GramaticasFromAutomatonPage() {
  const automaton = useAutomatonStore((s) => s.automaton);
  const loadAutomaton = useAutomatonStore((s) => s.loadAutomaton);

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        La gramática se genera a partir del autómata en memoria. Puedes editarlo
        en el{' '}
        <Link href="/automatas" className="text-blue-600 underline dark:text-blue-400">
          constructor de autómatas
        </Link>{' '}
        o cargar un ejemplo:
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => loadAutomaton(structuredClone(DFA_ENDS_WITH_AB))}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-600"
        >
          AFD: termina en ab
        </button>
        <button
          type="button"
          onClick={() => loadAutomaton(structuredClone(NFA_EPSILON))}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-600"
        >
          AFND: con ε
        </button>
        <button
          type="button"
          onClick={() => loadAutomaton(structuredClone(NFA_ENDS_WITH_A))}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-600"
        >
          AFND: termina en a
        </button>
      </div>
      <GrammarViewer automaton={automaton} />
    </div>
  );
}
