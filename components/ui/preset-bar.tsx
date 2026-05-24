'use client';

interface PresetBarProps {
  label?: string;
  presets: ReadonlyArray<{ id: string; label: string }>;
  onSelect: (id: string) => void;
}

/** Barra de ejemplos precargados reutilizable. */
export function PresetBar({
  label = 'Ejemplos',
  presets,
  onSelect,
}: PresetBarProps) {
  if (presets.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={label}
    >
      <span className="text-xs text-neutral-500">{label}:</span>
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset.id)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-600 dark:hover:bg-neutral-800"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
