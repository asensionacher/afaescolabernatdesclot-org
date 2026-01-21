# Guía de Configuración de Sanity

## Paso 1: Crear un Proyecto en Sanity

1. Ve a https://www.sanity.io/
2. Regístrate o inicia sesión
3. Haz clic en "Create new project"
4. Dale un nombre a tu proyecto (ej: "AMPA Bernat Desclot")
5. Selecciona el plan gratuito
6. Anota tu **Project ID**

## Paso 2: Crear un Dataset

1. En tu proyecto de Sanity, ve a "Datasets"
2. Crea un nuevo dataset llamado "production"
3. Configura el acceso como "Public" (para lectura pública)

## Paso 3: Obtener un Token de API

1. Ve a "Settings" → "API"
2. Haz clic en "Add API token"
3. Dale un nombre (ej: "Web Token")
4. Selecciona permisos "Editor" o "Admin"
5. Copia el token generado

## Paso 4: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-21
SANITY_API_TOKEN=tu_token_aqui
```

## Paso 5: Configurar CORS

Para que el Studio funcione correctamente:

1. Ve a "Settings" → "API" → "CORS Origins"
2. Añade estos orígenes:
   - `http://localhost:3000` (para desarrollo local)
   - `https://tu-dominio.vercel.app` (para producción)
3. Marca "Allow credentials"

## Paso 6: Desplegar los Schemas

Después de instalar las dependencias con `npm install`, ejecuta:

```bash
npm run dev
```

Luego accede a `http://localhost:3000/studio` y el schema se desplegará automáticamente.

## Paso 7: Crear tu Primer Evento

1. Accede a `/studio` en tu navegador
2. Inicia sesión con tu cuenta de Sanity
3. Haz clic en "Events"
4. Haz clic en el botón "+" para crear un nuevo evento
5. Rellena los campos en los 5 idiomas:
   - **Title**: Título del evento en cada idioma
   - **Slug**: Se genera automáticamente desde el título en catalán
   - **Main Image**: Imagen principal del evento
   - **Published at**: Fecha de publicación
   - **Excerpt**: Resumen breve del evento
   - **Body**: Contenido completo con editor de texto enriquecido
6. Haz clic en "Publish"

## Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. En la configuración del proyecto, añade las mismas variables de entorno de `.env.local`
3. Asegúrate de añadir el dominio de Vercel a CORS en Sanity
4. Despliega

## Consejos

- El idioma por defecto es el catalán (ca)
- Asegúrate de rellenar al menos el título y el body en catalán para cada evento
- Las imágenes se optimizan automáticamente
- Los eventos se ordenan por fecha de publicación (más recientes primero)

## Solución de Problemas

### "Project ID not found"
- Verifica que hayas copiado correctamente el Project ID de Sanity
- Asegúrate de que las variables de entorno estén bien configuradas

### "CORS Error"
- Añade tu dominio a CORS Origins en la configuración de Sanity
- No olvides marcar "Allow credentials"

### "Unauthorized"
- Verifica que el token de API sea válido
- Asegúrate de que el token tenga permisos suficientes (Editor o Admin)
