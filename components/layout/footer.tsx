export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-6 pb-8 text-sm text-neutral-500 dark:text-neutral-400">
      <p>
        Laboratorio de Lenguajes Formales — herramienta educativa para AFD,
        AFND, máquinas de Turing, gramáticas y más.
      </p>
      <p className="mt-2">
        © {new Date().getFullYear()} — Proyecto académico
      </p>
    </footer>
  );
}
