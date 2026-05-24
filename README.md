# Laboratorio de Lenguajes Formales

Aplicación web educativa en español para construir, simular y analizar modelos de teoría de lenguajes formales.

## Módulos (en desarrollo)

- **Autómatas finitos** — AFD, AFND, conversión y simulación
- **Máquinas de Turing** — 1 y 2 bandas
- **Gramáticas** — Jerarquía de Chomsky
- **Thompson** — Expresiones regulares → AFND
- **Lema de bombeo** — Asistente guiado
- **JFLAP** — Importar / exportar archivos `.jff`

## Requisitos

- Node.js 18+
- [pnpm](https://pnpm.io/)

## Desarrollo local

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Producción

```bash
pnpm build
pnpm start
```

## Despliegue

Compatible con [Vercel](https://vercel.com). Conecta el repositorio y despliega con el comando de build por defecto (`next build`).

## Estructura

```
app/           # Rutas y páginas Next.js
components/    # UI reutilizable
features/      # Lógica por módulo (automata, turing, grammar, etc.)
lib/           # Algoritmos (core), JFLAP y utilidades
types/         # Modelos TypeScript compartidos
```
