# AGENTS.md - AFA Bernat Desclot (web de formularios)

## Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript 5 (strict)
- **Base de datos**: PostgreSQL + Prisma 6
- **Auth**: JWT (jose) en cookie HttpOnly + bcryptjs
- **Mutaciones**: Server Actions (`'use server'`), no API REST
- **i18n**: detección por cookie/navegador, 2 idiomas (`ca`, `es`), sin prefijo de URL
- **Estilos**: CSS Modules (mobile-first), sin Tailwind
- **PDF**: jsPDF · **Correo**: nodemailer
- **Paquetes**: pnpm · **Despliegue**: Vercel

## Comandos

```bash
pnpm dev          # desarrollo en :3000
pnpm build        # prisma generate + next build (incluye typecheck y lint)
pnpm start        # producción
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit

pnpm db:migrate   # migraciones en desarrollo
pnpm db:deploy    # migraciones en producción
pnpm db:seed      # admin/admin + curso 2026/2027
pnpm db:studio    # Prisma Studio

pnpm exec tsx scripts/test-flow.ts          # prueba de lógica de negocio
pnpm exec tsx scripts/cleanup-test-data.ts  # limpia datos de prueba
pnpm exec tsx scripts/reset-admin-password.ts [usuario] [contraseña]
```

Postgres local: `docker compose up -d db` (usuario/contraseña/DB = `afa`/`afa`/`afa`).
Web completa en Docker: `docker compose up -d --build` (servicios `db`, `migrate` y `web`).

## Estructura

```
src/
  app/
    layout.tsx, page.tsx, globals.css, not-found.tsx, robots.ts, sitemap.ts
    login/                       Login
    el-meu-compte/               Cuenta del miembro
    formularis/[slug]/           Formulario público
    admin/                       Panel (layout con requireAdmin)
      membres/, membres/nou/, membres/[id]/
      anys-escolars/, anys-escolars/[id]/
      formularis/, formularis/nou/, formularis/[id]/
      respostes/, respostes/[id]/
      configuracio/
      actions/                   Server Actions (members, school-years, forms, submissions, settings)
    actions/                     Server Actions públicas (auth, submissions)
    api/submissions/[id]/pdf/    Descarga PDF (admin o propietario)
    api/uploads/[id]/            Descarga de adjuntos
  components/                    Componentes (Header, Footer, FormCard, FormFiller, admin/*)
  i18n/
    config.ts                    LOCALES, detectLocale (sin dependencias de servidor)
    messages.ts                  Diccionarios ca/es (tipados: es debe cumplir el tipo de ca)
  lib/
    db.ts, auth.ts, i18n.ts, translator.ts
    forms.ts                     Tipos de campos, orden del listado, precios en céntimos
    pricing.ts                   resolvePrice: miembro vs no miembro
    school-year.ts               Curso actual, cuotas
    settings.ts, crypto.ts       SMTP cifrado (AES-256-GCM)
    email.ts, pdf.ts, uploads.ts
prisma/
  schema.prisma, migrations/, seed.ts
scripts/                         Utilidades de mantenimiento y pruebas
```

## Reglas del proyecto

### TypeScript

- Modo estricto. **Nunca** uses `any` (usa `unknown`).
- `interface` para objetos, tipos explícitos en funciones exportadas.
- Alias `@/` para `src/`. Nunca imports relativos `../`.

### Orden de imports

1. React / Next.js
2. Librerías de terceros
3. Alias internos `@/`
4. Imports relativos
5. CSS Modules (siempre al final)

### Componentes

- **Server Components por defecto**. Añade `'use client'` sólo si hay hooks o handlers.
- Los formularios interactivos usan `useActionState` + `useFormStatus`.
- Las Server Actions se pasan a los client components **como props** (`action={serverAction}`).
- CSS Modules: un `.module.css` por componente.

### i18n

- **Nunca** escribas texto visible directamente: usa `getT()` (`src/lib/translator.ts`)
  y las claves de `src/i18n/messages.ts`.
- Las claves nuevas deben añadirse **a los dos idiomas** (ca y es); `es` está tipado
  contra `ca`, así que TypeScript avisa si falta alguna.
- `src/i18n/config.ts` no importa nada de Next.js: es seguro para client components.

### Reglas de negocio

- Los importes se guardan **en céntimos** (`eurosToCents` / `centsToEuros`).
- Precio de miembro = usuario con sesión **y** cuota `PAID`/`EXEMPT` del curso
  (`resolvePrice` en `src/lib/pricing.ts`).
- Sólo el `ADMIN` crea miembros; el resto de acciones de admin comprueban el rol en el
  servidor (`requireAdmin`).
- Denegar una respuesta **siempre** exige motivo (validación en cliente y en servidor).
- Un formulario sólo aparece en la portada si es del **curso actual** y está `PUBLISHED`.
- Caducados (`closesAt` < hoy) van al final y en gris (`sortFormsForListing`).

### Prisma

- Después de cambiar `schema.prisma`: `pnpm db:migrate` (y `pnpm db:generate`).
- Los campos `Json` necesitan cast a `Prisma.InputJsonValue`.
- Los campos `Bytes` (PDF, adjuntos) reciben `new Uint8Array(buffer)`.

### Git

Commits en formato convencional: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`.

## Errores frecuentes

1. Olvidar `'use client'` en un componente con hooks.
2. `await` en `params` de Next 15 (`params: Promise<{...}>`).
3. Olvidar una clave en `messages.ts` (rompe el typecheck).
4. Importar `next/headers` en un client component (rompe el build) → usar `@/i18n/config`.
5. **React no envía el `value` del botón pulsado**: usa una Server Action por botón
   (ver `acceptSubmissionAction` / `denySubmissionAction`).
6. IDs de formulario duplicados en la misma página (rompe los `<label for>`).
