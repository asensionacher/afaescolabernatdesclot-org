# Sistema de Partes de Reunión - AFA Escola Bernat Desclot

Sistema protegido por contraseña para gestionar partes de reuniones de la asociación de familias.

## 📋 Características

- ✅ Autenticación con contraseña mediante variables de entorno
- ✅ Crear nuevos partes de reunión
- ✅ Editar partes en estado "borrador"
- ✅ Cerrar partes (cambia estado a "cerrado" y no se puede editar)
- ✅ Eliminar partes en estado "borrador"
- ✅ Descargar PDF con la estructura oficial del documento
- ✅ Listado completo de todos los partes
- ✅ Sesión persistente con cookies (24 horas)

## 🚀 Acceso

La aplicación está disponible en: `/partes`

Al acceder por primera vez, se solicitará la contraseña configurada en las variables de entorno.

## 🔐 Configuración

### Variables de entorno requeridas

Añade esta variable a tu archivo `.env.local`:

```env
PARTES_PASSWORD=tu_contraseña_segura_aqui
```

**Importante**: Usa una contraseña fuerte y no la compartas públicamente.

## 📝 Estructura de un Parte

Cada parte de reunión incluye:

### Información básica
- **Título de la reunión**: Ej: "REUNIÓ PROPOSTES I VOTACIÓ DISFRESSA"
- **Ubicación**: Ej: "RUA CARNAVAL 2026"
- **Fecha de la reunión**: Fecha completa
- **Hora**: Ej: "16:45"
- **Lugar**: Ej: "biblioteca de l'Escola Bernat Desclot"

### Asistentes
Tabla con múltiples asistentes:
- Nombre del alumno/a
- Curso
- Nombre del asistente

### Contenido
- **Información de convocatoria**: Texto sobre la convocatoria previa
- **Mensaje de bienvenida**: Mensaje inicial (se muestra en cursiva en el PDF)
- **Temas de disfressa**: Lista de temas valorados
- **Desarrollo de la reunión**: Contenido principal del parte
- **¿Hubo preguntas?**: Checkbox para indicar si hubo preguntas

### Firma
- **Nombre del firmante**: Ej: "Elena Gómez"
- **Rol del firmante**: Ej: "Vicepresidenta AMPA"

## 🎯 Flujo de trabajo

1. **Acceder** a `/partes` con la contraseña
2. **Crear** un nuevo parte con el botón "+ Nuevo Parte"
3. **Rellenar** todos los campos del formulario
4. **Guardar** el parte (estado: borrador)
5. **Editar** si es necesario (solo borradores)
6. **Cerrar** el parte cuando esté finalizado (no se podrá editar después)
7. **Descargar** el PDF en cualquier momento

## 🗑️ Eliminación

- Solo se pueden **eliminar partes en estado "borrador"**
- Los partes **cerrados NO se pueden eliminar** (protección de datos)
- Al eliminar, se pide confirmación

## 📄 Generación de PDF

El PDF generado sigue exactamente la estructura del documento oficial:

1. **Encabezado**: "AMPA ESCOLA BERNAT DESCLOT" + Título + Ubicación
2. **Fecha**: Fecha formateada en catalán
3. **Tabla de asistentes**: Con bordes y 3 columnas
4. **Convocatoria**: Texto de convocatoria previa
5. **Mensaje de bienvenida**: En cursiva
6. **Temas**: Lista con viñetas
7. **Contenido**: Desarrollo de la reunión
8. **Preguntas**: Texto según si hubo o no preguntas
9. **Firma**: Nombre y rol del firmante

## 🔒 Seguridad

- Autenticación mediante contraseña en variable de entorno
- Sesión con cookie HTTP-only (24h de duración)
- Solo usuarios autenticados pueden acceder a las API routes
- Validación en servidor para todas las operaciones

## 🛠️ Sanity CMS

Los partes se almacenan en Sanity con el schema `meetingReport`:

### Estados posibles
- `draft`: Borrador (editable y eliminable)
- `closed`: Cerrado (solo lectura)

### Campos principales
- `title`, `location`, `meetingDate`, `meetingTime`, `meetingPlace`
- `attendees[]`: Array de objetos con `studentName`, `course`, `attendantName`
- `convocationInfo`, `welcomeMessage`, `topics[]`, `content`
- `questions` (boolean)
- `signerName`, `signerRole`
- `status`, `createdAt`, `closedAt`

## 📱 Responsive

La interfaz es completamente responsive y funciona en:
- Ordenadores de escritorio
- Tablets
- Móviles

## 🎨 Estilos

Usa CSS Modules con variables CSS del proyecto principal:
- `--color-primary`: Color principal
- `--color-text`: Color del texto
- `--color-background`: Color de fondo
- `--color-border`: Color de bordes
- `--transition`: Transición estándar

## 🐛 Solución de problemas

### No puedo acceder
- Verifica que `PARTES_PASSWORD` esté configurado en `.env.local`
- Reinicia el servidor de desarrollo después de cambiar variables de entorno

### Error al crear/editar
- Verifica que `SANITY_API_TOKEN` tenga permisos de escritura
- Comprueba la consola del navegador para ver errores específicos

### PDF no se genera
- Verifica que `jsPDF` esté instalado correctamente
- Comprueba que todos los campos requeridos estén rellenados

## 📦 Dependencias utilizadas

- `jspdf`: Generación de PDFs
- `next-sanity`: Cliente de Sanity para Next.js
- `next`: Framework React

## 🔄 Actualizar el schema

Si modificas el schema en `schemas/meetingReport.ts`, ejecuta:

```bash
pnpm dev
```

El Studio de Sanity detectará automáticamente los cambios.
