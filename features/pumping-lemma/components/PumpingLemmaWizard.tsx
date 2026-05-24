'use client';

import { useMemo, useState } from 'react';
import {
  analyzePumpingLemma,
  parsePumpIndices,
} from 'lib/core/pumping/buildPumpedString';
import { downloadTextFile } from 'lib/utils/download';
import { cn } from 'lib/utils/cn';

const EXAMPLES = [
  {
    label: 'a^n b^n (clásico)',
    language: 'L = { a^n b^n | n ≥ 0 }',
    p: 3,
    w: 'aaabbb',
    x: 'aa',
    y: 'a',
    z: 'bbb',
    indices: '0, 1, 2, 3',
  },
  {
    label: 'Palíndromos sobre {a,b}',
    language: 'L = { w ∈ {a,b}* | w es palíndromo }',
    p: 4,
    w: 'abba',
    x: 'a',
    y: 'bb',
    z: 'a',
    indices: '0, 1, 2',
  },
];

export function PumpingLemmaWizard() {
  const [language, setLanguage] = useState(EXAMPLES[0]!.language);
  const [pText, setPText] = useState(String(EXAMPLES[0]!.p));
  const [w, setW] = useState(EXAMPLES[0]!.w);
  const [x, setX] = useState(EXAMPLES[0]!.x);
  const [y, setY] = useState(EXAMPLES[0]!.y);
  const [z, setZ] = useState(EXAMPLES[0]!.z);
  const [indicesText, setIndicesText] = useState(EXAMPLES[0]!.indices);
  const [copied, setCopied] = useState(false);

  const p = Number(pText);
  const pValid = Number.isInteger(p) && p > 0;

  const { indices, error: indicesError } = useMemo(
    () => parsePumpIndices(indicesText),
    [indicesText]
  );

  const result = useMemo(() => {
    if (!pValid || indicesError) return null;
    return analyzePumpingLemma({
      languageDescription: language,
      pumpingLength: p,
      w,
      x,
      y,
      z,
      pumpIndices: indices,
    });
  }, [language, p, pValid, w, x, y, z, indices, indicesError]);

  const displayError = !pValid
    ? 'p debe ser un entero positivo.'
    : indicesError ?? null;

  const loadExample = (ex: (typeof EXAMPLES)[0]) => {
    setLanguage(ex.language);
    setPText(String(ex.p));
    setW(ex.w);
    setX(ex.x);
    setY(ex.y);
    setZ(ex.z);
    setIndicesText(ex.indices);
  };

  const handleCopy = async () => {
    if (!result?.exportText) return;
    await navigator.clipboard.writeText(result.exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportText = () => {
    if (!result?.exportText) return;
    downloadTextFile(result.exportText, 'lema-bombeo.txt', 'text/plain;charset=utf-8');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Uso del lema de bombeo</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Sirve normalmente para demostrar que un lenguaje <strong>no es regular</strong>,
            no para probar que sí lo es.
          </li>
          <li>
            La herramienta verifica pasos mecánicos (|w|≥p, |xy|≤p, |y|&gt;0, xyz, xy^i z);
            tú debes argumentar si alguna cadena bombeada sale de L.
          </li>
          <li>No afirma automáticamente el resultado para todos los lenguajes.</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="self-center text-xs text-neutral-500">Ejemplos:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => loadExample(ex)}
            className="rounded border px-2 py-1 text-xs dark:border-neutral-600"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block text-sm lg:col-span-2">
          <span className="font-medium">Lenguaje L</span>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            placeholder="L = { a^n b^n | n ≥ 0 }"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Longitud de bombeo p</span>
          <input
            type="number"
            min={1}
            value={pText}
            onChange={(e) => setPText(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
          {!pValid && (
            <span className="mt-1 block text-xs text-red-600">p debe ser un entero positivo.</span>
          )}
        </label>

        <label className="block text-sm">
          <span className="font-medium">Cadena w</span>
          <input
            type="text"
            value={w}
            onChange={(e) => setW(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
          <span className="mt-1 block text-xs text-neutral-500">|w| = {w.length}</span>
        </label>
      </div>

      <fieldset className="rounded-lg border p-4 dark:border-neutral-700">
        <legend className="px-1 text-sm font-semibold">División w = xyz</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="font-medium">x</span>
            <input
              type="text"
              value={x}
              onChange={(e) => setX(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="mt-1 block text-xs text-neutral-500">|x| = {x.length}</span>
          </label>
          <label className="block text-sm">
            <span className="font-medium">y</span>
            <input
              type="text"
              value={y}
              onChange={(e) => setY(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="mt-1 block text-xs text-neutral-500">|y| = {y.length}</span>
          </label>
          <label className="block text-sm">
            <span className="font-medium">z</span>
            <input
              type="text"
              value={z}
              onChange={(e) => setZ(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span className="mt-1 block text-xs text-neutral-500">|z| = {z.length}</span>
          </label>
        </div>
        <p className="mt-3 font-mono text-sm text-neutral-600 dark:text-neutral-400">
          x + y + z = «{x + y + z}»{' '}
          {x + y + z === w ? (
            <span className="text-emerald-600 dark:text-emerald-400">(coincide con w)</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">(≠ w)</span>
          )}
        </p>
      </fieldset>

      <label className="block text-sm">
        <span className="font-medium">Valores de bombeo i</span>
        <input
          type="text"
          value={indicesText}
          onChange={(e) => setIndicesText(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
          placeholder="0, 1, 2, 3 o 0..5"
        />
        <span className="mt-1 block text-xs text-neutral-500">
          Separados por coma o espacio; rango con 0..3.
        </span>
      </label>

      {displayError && (
        <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
      )}

      {result && pValid && (
        <>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
            >
              {copied ? '¡Copiado!' : 'Copiar resultado'}
            </button>
            <button
              type="button"
              onClick={handleExportText}
              className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
            >
              Exportar .txt
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-md border px-4 py-2 text-sm dark:border-neutral-600"
            >
              Imprimir / guardar PDF
            </button>
          </div>

          <div className="space-y-4 print:block">
            <section className="rounded-lg border p-4 dark:border-neutral-700">
              <h3 className="text-sm font-semibold">Pasos guiados</h3>
              <ol className="mt-4 space-y-4">
                {result.steps.map((s, idx) => (
                  <li
                    key={s.id}
                    className={cn(
                      'rounded-lg border p-4',
                      s.passed
                        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                        : 'border-neutral-200 dark:border-neutral-700'
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-neutral-500">
                        Paso {idx + 1}
                      </span>
                      <span className="text-sm font-semibold">{s.title}</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          s.passed
                            ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100'
                            : 'bg-neutral-200 dark:bg-neutral-800'
                        )}
                      >
                        {s.passed ? 'Cumple' : 'No cumple'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                      {s.explanation}
                    </p>
                    <p className="mt-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                      {s.detail}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-lg border p-4 dark:border-neutral-700">
              <h3 className="text-sm font-semibold">Cadenas bombeadas xy^i z</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[280px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-neutral-500 dark:border-neutral-700">
                      <th className="py-2 pr-4">i</th>
                      <th className="py-2 pr-4">xy^i z</th>
                      <th className="py-2">|·|</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {result.pumpedStrings.map((row) => (
                      <tr
                        key={row.i}
                        className="border-b border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="py-2 pr-4">{row.i}</td>
                        <td className="py-2 pr-4 break-all">{row.value || 'ε'}</td>
                        <td className="py-2">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                Comprueba manualmente si algún i produce una cadena fuera de L para cerrar
                la demostración de no regularidad.
              </p>
            </section>

            <section className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <h3 className="text-sm font-semibold">Resumen</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {result.summary.map((line, i) => (
                  <li key={i}>• {line}</li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
