# Laboratorio de Lenguajes Formales

Aplicación web educativa en español para construir, simular y analizar modelos de teoría de lenguajes formales. Proyecto final académico: todo el procesamiento ocurre en el navegador, **sin base de datos**.

## Funcionalidades implementadas

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Autómatas finitos** | `/automatas` | Editor gráfico (React Flow) de AFD y AFND, tabla δ, definición formal, validación, simulación paso a paso, gramática regular equivalente, import/export JFLAP |
| **AFND → AFD** | `/automatas/conversion` | Construcción por subconjuntos con pasos explicados, tabla de conversión, simulación del AFD |
| **Máquinas de Turing** | `/turing` | MT de 1 o 2 bandas, tabla de transiciones, simulación con cinta(s) y pausa |
| **Gramáticas** | `/gramaticas` | Editor de producciones, clasificación Chomsky (tipos 0–3), gramática regular desde autómata |
| **Thompson** | `/thompson` | Regex → AFND (tokenización, postfix, pasos Thompson), simulación, conversión a AFD, export JFLAP |
| **Lema de bombeo** | `/lema-bombeo` | Asistente guiado: p, w, xyz, xy^i z, exportación de resultado |
| **JFLAP** | `/jflap` | Importar y exportar archivos `.jff` (autómatas y Turing) |

Página **Acerca del proyecto** (`/acerca`): objetivos, conceptos, módulos y limitaciones.

## Requisitos

- **Node.js** 18 o superior
- **[pnpm](https://pnpm.io/)** (recomendado) o npm

## Instalación

```bash
git clone <url-del-repositorio>
cd proyectolenguajes
pnpm install
```

## Desarrollo local

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Producción

```bash
pnpm build
pnpm start
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub (o GitLab/Bitbucket).
2. En [Vercel](https://vercel.com), **Add New Project** e importa el repositorio.
3. Framework: **Next.js** (detectado automáticamente).
4. Comando de build: `pnpm build` (o `next build`).
5. Directorio de salida: por defecto (`.next`).
6. Opcional: variable de entorno `NEXT_PUBLIC_BASE_URL` con la URL de producción (para sitemap y metadatos).

No se requieren variables de base de datos ni servicios externos.

## Ejemplos precargados

- **Autómatas**: AFD termina en `ab`, AFND con ε, AFND termina en `a`
- **Conversión / simulación**: mismos AFND desde la barra de ejemplos
- **Turing**: MT termina en `1`, MT acepta solo ε
- **Thompson**: `(a|b)*abb`, `a+b`, clases `[ab]*`, etc.
- **Gramáticas**: regular, libre de contexto, sensible al contexto, irrestricta
- **Lema de bombeo**: `a^n b^n`, palíndromos

## Estructura del repositorio

```
app/           # Rutas Next.js (App Router)
components/    # UI compartida (layout, conceptos, tarjetas)
features/      # Módulos por dominio (automata, turing, grammar, …)
lib/core/      # Algoritmos puros (sin React)
lib/jflap/     # Parser y exportador .jff
types/         # Modelos TypeScript
```

## Limitaciones conocidas

- **Sin persistencia**: al recargar la página se pierde el trabajo no exportado.
- **Gramáticas**: la clasificación de Chomsky es por *forma* de las producciones, no decide la clase del lenguaje en todos los casos.
- **Lema de bombeo**: no verifica automáticamente si xy^i z ∈ L; esa conclusión es manual.
- **JFLAP**: soporte principal para autómatas finitos y Turing de 1 banda; 2 bandas según el archivo importado. Las posiciones de **estados** se exportan en formato estándar; la curvatura de **transiciones** y la posición de **etiquetas** se conservan al reimportar en esta app mediante la extensión `pl:visual` (JFLAP oficial puede no mostrarlas).
- **Turing**: editor con diagrama gráfico y tabla de transiciones.
- **Rendimiento**: autómatas o tablas de conversión muy grandes pueden volverse lentos.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · React Flow · fast-xml-parser

## Licencia

Proyecto académico — consulta el repositorio para detalles de autoría.
