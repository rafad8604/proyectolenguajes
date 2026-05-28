import Link from 'next/link';
import { footerLinks, mainModules } from 'lib/config/navigation';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 dark:border-neutral-800 pt-6 pb-8 text-sm text-neutral-500 dark:text-neutral-400">
      <p>
        Proyecto final del curso lenguajes de programación de la Universidad de los llanos — herramienta educativa para AFD,
        AFND, máquinas de Turing, gramáticas, Thompson y lema de bombeo.
      </p>

      <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Enlaces del sitio">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-neutral-900 dark:hover:text-neutral-200 focus-visible:underline"
          >
            {link.label}
          </Link>
        ))}
        {mainModules.slice(0, 4).map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="hover:text-neutral-900 dark:hover:text-neutral-200 focus-visible:underline"
          >
            {m.label}
          </Link>
        ))}
      </nav>

      <p className="mt-4">
        © {new Date().getFullYear()} — Autores: Brian R. Duran, Jhorman A. Carrillo.
      </p>
    </footer>
  );
}
