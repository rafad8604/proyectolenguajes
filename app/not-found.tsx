import Link from 'next/link';

export default function NotFound() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">
        404 — Página no encontrada
      </h1>
      <p className="mb-6 text-neutral-600 dark:text-neutral-400">
        La página que buscas no existe o aún no está disponible.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
