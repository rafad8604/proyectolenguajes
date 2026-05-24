interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 dark:border-neutral-700 dark:bg-neutral-900/50">
      <p className="text-xs font-medium uppercase tracking-widest text-amber-600 dark:text-amber-400">
        Próximamente
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
