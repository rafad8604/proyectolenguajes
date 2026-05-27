'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Automaton } from 'types/automaton';
import { NfaToDfaPanel } from 'features/automata/components/nfa-to-dfa-panel';
import { useConversionStore } from 'features/automata/store/conversion-store';
import { readThompsonNfaForConversion } from 'lib/thompson/conversion-handoff';

export function ThompsonConversionView() {
  const [sourceNfa, setSourceNfa] = useState<Automaton | null>(null);
  const [loaded, setLoaded] = useState(false);
  const resetConversion = useConversionStore((s) => s.reset);

  useEffect(() => {
    resetConversion();
    const nfa = readThompsonNfaForConversion();
    setSourceNfa(nfa);
    setLoaded(true);
  }, [resetConversion]);

  if (!loaded) {
    return (
      <p className="text-sm text-neutral-500">Cargando conversión detallada…</p>
    );
  }

  if (!sourceNfa) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <p>No hay un AFND de Thompson disponible para convertir.</p>
        <p className="mt-2">
          Construye un AFND en{' '}
          <Link href="/thompson" className="font-medium underline">
            Thompson
          </Link>{' '}
          y vuelve a abrir la conversión detallada.
        </p>
      </div>
    );
  }

  return (
    <NfaToDfaPanel
      sourceNfa={sourceNfa}
      autoConvert
      showPresets={false}
      showEditorLink={false}
      backHref="/thompson"
      backLabel="← Volver a Thompson"
    />
  );
}
