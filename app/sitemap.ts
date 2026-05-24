export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ??
  'https://proyectolenguajes.vercel.app';

export default function sitemap() {
  const routes = [
    '',
    '/automatas',
    '/automatas/conversion',
    '/turing',
    '/gramaticas',
    '/thompson',
    '/lema-bombeo',
    '/jflap',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));
}
