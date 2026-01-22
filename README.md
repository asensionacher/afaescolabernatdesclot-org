# AFA Escola Bernat Desclot

Web oficial de la Asociación de Familias de Alumnos de la Escuela Bernat Desclot.

## ✨ 100% Open Source

Este proyecto es totalmente de código abierto y está disponible para que cualquier AFA o asociación similar pueda utilizarlo, modificarlo y adaptarlo a sus necesidades.

## Características

- ✅ Next.js 15 con App Router
- ✅ Sanity Studio integrado para gestión de contenido
- ✅ Multiidioma: Catalán, Español, Inglés, Árabe, Urdu
- ✅ Blog de eventos con imágenes
- ✅ Google Analytics integrado con consentimiento de cookies
- ✅ Banner de cookies conforme a GDPR
- ✅ Páginas legales: Política de Privacidad, Aviso Legal, Política de Cookies
- ✅ Responsive design
- ✅ Optimizado para Vercel

## Configuración Inicial

### 1. Instalar dependencias

Este proyecto usa **pnpm** como gestor de paquetes:

```bash
# Instalar pnpm (si no lo tienes)
npm install -g pnpm

# Instalar dependencias
pnpm install
```

### 2. Configurar Sanity

1. Crea un proyecto en [sanity.io](https://www.sanity.io/)
2. Copia el archivo `.env.local.example` a `.env.local`
3. Añade tus credenciales de Sanity:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-21
SANITY_API_TOKEN=tu_token
```

### 3. Configurar Google Analytics (Opcional)

Si deseas utilizar Google Analytics:

1. Crea una propiedad en [Google Analytics](https://analytics.google.com/)
2. Obtén tu ID de medición (formato: G-XXXXXXXXXX)
3. Añade la variable de entorno:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Nota**: La integración de Google Analytics está diseñada para ser conforme a GDPR:
- Solo se activa después de que el usuario acepte las cookies analíticas
- Los usuarios pueden rechazar o personalizar las cookies
- Las preferencias se guardan en localStorage

### 4. Configurar URL base

Para producción, añade tu dominio:

```env
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

### 5. Ejecutar en desarrollo

```bash
pnpm run dev
```

La aplicación estará disponible en:
- Web principal: http://localhost:3000
- Sanity Studio: http://localhost:3000/studio

## Estructura del Proyecto

```
├── src/
│   ├── app/
│   │   ├── [locale]/          # Páginas con soporte multiidioma
│   │   │   ├── page.tsx       # Página principal
│   │   │   ├── services/      # Página de servicios
│   │   │   ├── blog/          # Blog de eventos
│   │   │   ├── contact/       # Página de contacto
│   │   │   ├── privacy/       # Política de privacidad
│   │   │   ├── legal/         # Aviso legal
│   │   │   └── cookies-policy/ # Política de cookies
│   │   └── studio/            # Sanity Studio
│   ├── components/            # Componentes reutilizables
│   │   ├── Navigation.tsx     # Navegación principal
│   │   ├── Footer.tsx         # Pie de página con enlaces legales
│   │   ├── CookieBanner.tsx   # Banner de consentimiento de cookies
│   │   └── GoogleAnalytics.tsx # Integración de Google Analytics
│   ├── i18n/                  # Configuración de internacionalización
│   └── sanity/                # Configuración de Sanity
├── messages/                   # Archivos de traducción (5 idiomas)
├── schemas/                    # Schemas de Sanity
├── sanity.config.ts           # Configuración de Sanity Studio
└── next.config.ts             # Configuración de Next.js
```

## Idiomas Soportados

- 🇪🇸 Catalán (ca) - Idioma por defecto
- 🇪🇸 Español (es)
- 🇬🇧 Inglés (en)
- 🇲🇦 Árabe de Marruecos (ar)
- 🇵🇰 Urdu (ur)

## Cumplimiento Legal

### GDPR y Cookies

El proyecto incluye:

1. **Banner de Cookies**: Aparece en la primera visita y permite:
   - Aceptar todas las cookies
   - Rechazar cookies no esenciales
   - Personalizar preferencias

2. **Páginas Legales**: 
   - Política de Privacidad
   - Aviso Legal
   - Política de Cookies

3. **Gestión de Consentimiento**:
   - Las preferencias se guardan en localStorage
   - Los usuarios pueden cambiar sus preferencias desde el footer
   - Google Analytics solo se activa con consentimiento

### Personalización

Para adaptar las páginas legales a tu asociación:

1. Edita los archivos de traducción en `messages/`
2. Actualiza las secciones de `privacy`, `legal` y `cookiesPolicy`
3. Modifica el componente `Footer.tsx` si deseas cambiar el enlace al repositorio

## Despliegue en Vercel

### Opción 1: Despliegue desde GitHub (Recomendado)

1. **Sube tu código a GitHub** (si aún no lo has hecho):
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Conecta con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Click en "New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente:
     - Framework: Next.js
     - Package Manager: pnpm (gracias a `pnpm-lock.yaml`)
     - Build Command: `pnpm run build`
     - Output Directory: `.next`

3. **Configurar variables de entorno**:
   
   En la sección "Environment Variables" de Vercel, añade (IMPORTANTE):
   
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-01-21
   SANITY_API_TOKEN=tu_token_aqui
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
   ```
   
   **Nota**: Actualiza `NEXT_PUBLIC_BASE_URL` con tu URL real de Vercel después del primer despliegue.

4. **Desplegar**:
   - Click en "Deploy"
   - Vercel compilará y desplegará tu proyecto
   - Obtendrás una URL como: `https://tu-proyecto.vercel.app`

5. **Actualizar URL base** (después del primer despliegue):
   - Ve a Settings → Environment Variables
   - Actualiza `NEXT_PUBLIC_BASE_URL` con tu URL de Vercel
   - Redeploy el proyecto

### Opción 2: Despliegue desde CLI

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login en Vercel
vercel login

# Desplegar (en modo preview)
vercel

# Desplegar a producción
vercel --prod
```

### Dominio personalizado

Si tienes un dominio propio:

1. Ve a tu proyecto en Vercel → Settings → Domains
2. Añade tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel
4. Actualiza `NEXT_PUBLIC_BASE_URL` con tu dominio personalizado

### Optimizaciones de Vercel

El proyecto ya está optimizado para Vercel con:
- ✅ `vercel.json` configurado para pnpm
- ✅ Build caching automático
- ✅ Edge functions para mejor rendimiento
- ✅ Sitemap.xml dinámico
- ✅ robots.txt configurado
- ✅ Open Graph meta tags para redes sociales
- ✅ Headers de seguridad

### Monitorización y Logs

Una vez desplegado en Vercel, puedes:
- Ver logs en tiempo real en el dashboard
- Configurar notificaciones de despliegue
- Ver métricas de rendimiento
- Configurar alertas de errores

## Uso del CMS (Sanity Studio)

1. Accede a `/studio` en tu navegación
2. Inicia sesión con tu cuenta de Sanity
3. Crea nuevos eventos con contenido en los 5 idiomas
4. Los cambios se reflejarán automáticamente en la web

## Enlaces

- Blog de la escuela: https://agora.xtec.cat/ceip-bernatdesclot/
- Kampi ki Pugui: Actividades extraescolares

## Contribuir

Este es un proyecto open source. Si deseas contribuir:

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

El código fuente está disponible bajo licencia MIT - siéntete libre de usarlo para tu propia AFA o asociación.

El contenido específico de AFA Escola Bernat Desclot está protegido por derechos de autor © 2025 AFA Escola Bernat Desclot.

## Soporte

Si tienes preguntas o necesitas ayuda para configurar este proyecto para tu AFA, abre un issue en GitHub.
