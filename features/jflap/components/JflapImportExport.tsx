'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  parseJff,
  exportToJff,
  defaultJffFilename,
  type JffExportTarget,
} from 'lib/jflap';
import { downloadTextFile } from 'lib/utils/download';
import { useAutomatonStore } from 'features/automata/store/automaton-store';
import { useTuringStore } from 'features/turing/store/turing-store';
import { cn } from 'lib/utils/cn';

export type JflapMode = 'auto' | 'automaton' | 'turing';

interface JflapImportExportProps {
  /** Qué modelo exportar cuando mode no es auto. */
  mode?: JflapMode;
  className?: string;
  /** Si true, redirige tras importar al módulo correspondiente. */
  redirectOnImport?: boolean;
}

export function JflapImportExport({
  mode = 'auto',
  className,
  redirectOnImport = true,
}: JflapImportExportProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const automaton = useAutomatonStore((s) => s.automaton);
  const loadAutomaton = useAutomatonStore((s) => s.loadAutomaton);
  const machine = useTuringStore((s) => s.machine);
  const loadMachine = useTuringStore((s) => s.loadMachine);

  const handleImportClick = () => {
    setError(null);
    setSuccessMsg(null);
    setWarnings([]);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.jff')) {
      setError('El archivo debe tener extensión .jff');
      return;
    }

    let text: string;
    try {
      text = await file.text();
    } catch {
      setError('No se pudo leer el archivo.');
      return;
    }

    const result = parseJff(text, file.name);
    if (!result.ok) {
      setError(result.error);
      setWarnings(result.warnings);
      return;
    }

    setWarnings(result.warnings);

    if (result.kind === 'automaton' && result.automaton) {
      if (mode === 'turing') {
        setError('El archivo es un autómata finito, no una máquina de Turing.');
        return;
      }
      loadAutomaton(result.automaton);
      setSuccessMsg(
        `Autómata «${result.automaton.name}» importado (${result.automaton.type.toUpperCase()}).`
      );
      if (redirectOnImport) router.push('/automatas');
    } else if (result.kind === 'turing' && result.turingMachine) {
      if (mode === 'automaton') {
        setError('El archivo es una máquina de Turing, no un autómata finito.');
        return;
      }
      loadMachine(result.turingMachine);
      setSuccessMsg(
        `Máquina de Turing «${result.turingMachine.name}» importada (${result.turingMachine.tapeCount} banda(s)).`
      );
      if (redirectOnImport) router.push('/turing');
    }
  };

  const buildExportTarget = (): JffExportTarget | null => {
    if (mode === 'automaton') {
      if (automaton.states.length === 0) return null;
      return { kind: 'automaton', automaton };
    }
    if (mode === 'turing') {
      if (machine.states.length === 0) return null;
      return { kind: 'turing', turingMachine: machine };
    }
    // auto: prefer automaton if has states, else turing
    if (automaton.states.length > 0) {
      return { kind: 'automaton', automaton };
    }
    if (machine.states.length > 0) {
      return { kind: 'turing', turingMachine: machine };
    }
    return null;
  };

  const handleExport = () => {
    setError(null);
    setSuccessMsg(null);
    setWarnings([]);

    const target = buildExportTarget();
    if (!target) {
      setError('No hay modelo en memoria para exportar.');
      return;
    }

    try {
      const xml = exportToJff(target);
      const filename = defaultJffFilename(target);
      downloadTextFile(xml, filename);
      setSuccessMsg(`Archivo ${filename} descargado.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al exportar el archivo.'
      );
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jff,application/xml,text/xml"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Importar JFLAP
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
        >
          Exportar JFLAP
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        Formatos soportados: AFD, AFND (con ε), máquina de Turing (1 banda; 2 bandas
        si el .jff incluye múltiples read/write/move por transición).
      </p>
      <p className="text-xs text-neutral-500">
        Posiciones de estados se conservan en JFLAP estándar. Curvatura de flechas y
        posición de etiquetas se guardan en extensión <code className="font-mono">pl:visual</code>{' '}
        (y opcionalmente en <code className="font-mono">&lt;control&gt;</code>); JFLAP
        oficial puede ignorar esa geometría al abrir el archivo.
      </p>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {successMsg && (
        <p className="text-sm text-green-700 dark:text-green-400">{successMsg}</p>
      )}
      {warnings.length > 0 && (
        <ul className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {warnings.map((w, i) => (
            <li key={i}>• {w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
