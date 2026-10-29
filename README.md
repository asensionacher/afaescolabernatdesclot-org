# AFA Escola Bernat Desclot — Web de formularios e inscripciones

Web de la AFA (Associació de Famílies d'Alumnes) de l'Escola Bernat Desclot para que las
familias se apunten a las actividades, excursiones y cuotas mediante **formularios
dinámicos** creados desde el panel de administración.

No es una web informativa: es la herramienta de inscripción de la AFA.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** estricto
- **PostgreSQL** + **Prisma 6** (base de datos)
- **Server Actions** para toda la mutación de datos (sin API REST salvo descargas)
- **Sesión con JWT** (`jose`) en cookie `HttpOnly` + **bcrypt** para contraseñas
- **i18n** detectado por navegador/cookie (català / español), **sin prefijo de URL**
- **CSS Modules** (mobile-first), sin Tailwind
- **jsPDF** para el PDF de las respuestas aceptadas
- **nodemailer** para los correos (SMTP configurable desde el panel)
- **pnpm** · Docker (Postgres local) · Despliegue en Vercel

## Puesta en marcha

### Opción A: todo con Docker (recomendada)

```bash
cp .env.example .env
# Genera los secretos y pégalos en .env:
#   openssl rand -hex 32   -> JWT_SECRET
#   openssl rand -hex 32   -> CREDENTIALS_ENCRYPTION_KEY

docker compose up -d --build
```

Se levantan tres servicios:

| Servicio  | Qué hace                                                                  |
| --------- | ------------------------------------------------------------------------- |
| `db`      | PostgreSQL 16 con volumen persistente (`afa-pgdata`).                      |
| `migrate` | Aplica las migraciones (`pnpm db:deploy`) y crea los datos iniciales.     |
| `web`     | La web en `http://localhost:3000` (cambia el puerto con `WEB_PORT`).      |

El servicio `migrate` se ejecuta una sola vez y la web espera a que termine bien,
así que `docker compose up -d --build` deja todo listo: base de datos migrada,
administrador `admin`/`admin` y curso `2026/2027` creado.

```bash
docker compose logs -f web     # ver el log
docker compose ps              # ver el estado
docker compose restart web     # reiniciar la web
docker compose down            # parar (conserva los datos)
docker compose down -v         # parar y borrar también la base de datos
```

Si no creas un `.env`, `docker compose` usa valores de ejemplo **solo para desarrollo**
(y avisa por consola). Antes de publicar la web, cambia `JWT_SECRET` y
`CREDENTIALS_ENCRYPTION_KEY` por valores reales.

### Opción B: desarrollo local

```bash
pnpm install

# 1. Base de datos local
docker compose up -d db

# 2. Variables de entorno
cp .env.example .env
# Genera los secretos:
#   openssl rand -hex 32   -> JWT_SECRET
#   openssl rand -hex 32   -> CREDENTIALS_ENCRYPTION_KEY

# 3. Esquema + datos iniciales
pnpm db:migrate
pnpm db:seed

# 4. Arrancar
pnpm dev
```

La web queda en `http://localhost:3000` y el panel en `http://localhost:3000/admin`.

### Credenciales iniciales

| Usuario  | Contraseña | Correo                        |
| -------- | ---------- | ----------------------------- |
| `admin`  | `admin`    | afaescolabernatdesclot@gmail.com |

Se pueden cambiar desde **Configuración → Credenciales del administrador**. A partir de
ahí la contraseña nueva debe tener **mínimo 8 caracteres** (el seed inicial es la
excepción). También se pueden restablecer por consola:

```bash
pnpm exec tsx scripts/reset-admin-password.ts [usuario] [contraseña]
```

## Modelo de datos

| Modelo           | Para qué sirve                                                        |
| ---------------- | --------------------------------------------------------------------- |
| `User`           | Miembros del AFA. Solo el admin los crea (usuario + contraseña).       |
| `SchoolYear`     | Curso escolar (`2026/2027`). Solo uno marcado como `isCurrent`.       |
| `Membership`     | Cuota AFA de un miembro en un curso: `PENDING` / `PAID` / `EXEMPT`.    |
| `Form`           | Formulario: campos, precios, visibilidad, publicación, caducidad.     |
| `Submission`     | Respuesta enviada por una familia, con su estado de revisión.         |
| `Upload`         | Ficheros adjuntos (justificantes). Máximo 8 MB.                        |
| `Setting`        | Configuración de la web (SMTP, etc.), con la contraseña cifrada.       |

### Precios

Cada formulario tiene dos precios (guardados en céntimos):

- `memberPrice`: para miembros **con la cuota del curso pagada** (o exenta). Normalmente `0 €`.
- `nonMemberPrice`: para el resto de casos — usuario no registrado, registrado **sin**
  cuota pagada del curso en cuestión.

La resolución vive en `src/lib/pricing.ts` (`resolvePrice`).

### Listado público

`src/app/page.tsx` muestra **solo los formularios del curso escolar actual**:

1. Los **anclados** (`pinned`) primero.
2. Después, **de más nuevo a más antiguo** según `publishedAt`.
3. Los **caducados** (`closesAt` < hoy) se van **al final y en gris**.

### Ciclo de revisión de una respuesta

1. La familia envía el formulario → correo **recibido**.
2. El admin **acepta** → se genera el **PDF** con todos los datos + correo **aceptado**
   (con el PDF adjunto).
3. El admin **deniega** → el **motivo es obligatorio** + correo **denegado**.
   Una respuesta denegada se puede **aceptar más tarde** manualmente.

## Rutas

```
/                       Portada con el listado de formularios del curso actual
/login                  Inicio de sesión
/formularis/[slug]      Rellenar un formulario
/el-meu-compte          Cuenta del miembro (perfil, cuota, contraseña, sus envíos)

/admin                  Panel
/admin/membres          Miembros (alta, cuota, activar/desactivar)
/admin/anys-escolars    Cursos escolares
/admin/formularis       Formularios (constructor de campos)
/admin/respostes        Revisión de respuestas
/admin/configuracio     SMTP + credenciales del administrador

/api/submissions/[id]/pdf   Descarga del PDF (admin o propietario)
/api/uploads/[id]           Descarga de adjuntos (admin o propietario)
```

## Correo

Por defecto el remitente es `afaescolabernatdesclot@gmail.com`. El SMTP se configura en
**Configuración → Correo electrónico**: host, puerto, usuario, contraseña (se guarda
cifrada con AES-256-GCM usando `CREDENTIALS_ENCRYPTION_KEY`), SSL/TLS y remitente.
Mientras no haya SMTP configurado, los correos se registran en el log del servidor y la
web sigue funcionando.

## Scripts

```bash
pnpm dev            # servidor de desarrollo
pnpm build          # prisma generate + next build
pnpm start          # producción
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit

pnpm db:migrate     # crear/aplicar migraciones
pnpm db:deploy      # aplicar migraciones (producción)
pnpm db:seed        # admin + curso 2026/2027
pnpm db:studio      # Prisma Studio

pnpm exec tsx scripts/test-flow.ts          # prueba de la lógica de negocio
pnpm exec tsx scripts/cleanup-test-data.ts  # borra los datos de prueba
pnpm exec tsx scripts/reset-admin-password.ts
```

## Despliegue

### Con Docker (VPS, NAS, servidor propio)

```bash
cp .env.example .env      # con secretos reales
docker compose up -d --build
```

Coloca un proxy inverso (nginx, Caddy, Traefik) delante del puerto 3000 para HTTPS.

### En Vercel

1. Crea una base de datos PostgreSQL (Neon, Vercel Postgres o Supabase) y copia la
   `DATABASE_URL` en las variables de entorno de Vercel.
2. Añade `JWT_SECRET`, `CREDENTIALS_ENCRYPTION_KEY` y `NEXT_PUBLIC_BASE_URL`.
3. `pnpm db:deploy` para aplicar las migraciones y `pnpm db:seed` para crear el admin.
4. `vercel.json` ya define `pnpm install` / `pnpm run build` / `pnpm run start`.

## Seguridad

- Contraseñas con bcrypt (10 rondas); nunca se guardan en claro.
- Cookie de sesión `HttpOnly`, `SameSite=Lax`, `Secure` en producción, JWT HS256 de 7 días.
- Limitación de intentos de login (5 por 15 minutos y por cliente).
- Todas las acciones de administración comprueban el rol `ADMIN` en el servidor.
- Los ficheros subidos se sirven sólo al admin o al propietario de la respuesta.
- Los `id` de los formularios son *slugs* y los de las respuestas son *cuid* (no enumerables).
