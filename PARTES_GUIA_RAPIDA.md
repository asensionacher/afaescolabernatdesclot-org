# Guía Rápida - Sistema de Partes de Reunión

## ⚡ Inicio Rápido

### 1️⃣ Configurar la contraseña

Añade a tu archivo `.env.local`:

```env
PARTES_PASSWORD=tu_contraseña_segura
```

### 2️⃣ Iniciar el servidor

```bash
pnpm dev
```

### 3️⃣ Acceder al sistema

Navega a: `http://localhost:3000/partes`

Introduce la contraseña configurada.

## 🎯 Uso

### Crear un nuevo parte

1. Click en **"+ Nuevo Parte"**
2. Rellena el formulario:
   - Título, ubicación, fecha, hora, lugar
   - Añade asistentes (puedes añadir múltiples)
   - Información de convocatoria (opcional)
   - Mensaje de bienvenida (opcional)
   - Temas de disfressa (opcional)
   - Contenido de la reunión (obligatorio)
   - Marca si hubo preguntas
   - Datos del firmante
3. Click en **"Crear parte"**

### Editar un parte borrador

1. Localiza el parte en la lista
2. Click en **"✏️ Editar"**
3. Modifica los campos necesarios
4. Click en **"Guardar cambios"**

### Cerrar un parte

1. Click en **"🔒 Cerrar"** en el parte deseado
2. Confirma la acción
3. ⚠️ **Importante**: Una vez cerrado, NO se puede editar

### Eliminar un parte borrador

1. Click en **"🗑️ Eliminar"**
2. Confirma la acción
3. ⚠️ Solo se pueden eliminar partes en estado "borrador"

### Descargar PDF

1. Click en **"📄 Descargar PDF"**
2. Se genera y descarga automáticamente

## 📊 Estados de un parte

- **📝 Borrador**: Editable y eliminable
- **✅ Cerrado**: Solo lectura, NO eliminable

## 🔐 Seguridad

- La sesión dura 24 horas
- Para cerrar sesión, click en **"Cerrar Sesión"**
- Los partes cerrados están protegidos contra eliminación

## 🆘 Problemas comunes

### No puedo acceder
- Verifica que `PARTES_PASSWORD` esté en `.env.local`
- Reinicia el servidor: `Ctrl+C` y luego `pnpm dev`

### Error al guardar
- Verifica que todos los campos obligatorios (marcados con *) estén rellenados
- Verifica que `SANITY_API_TOKEN` esté configurado

### PDF no se descarga
- Verifica que el parte tenga todos los datos necesarios
- Comprueba la consola del navegador (F12)

## 📱 Vista previa en móvil

Para probar en móvil en tu red local:

1. Obtén tu IP local: `ifconfig` (Mac/Linux) o `ipconfig` (Windows)
2. Accede desde el móvil a: `http://TU_IP:3000/partes`

## 🚀 Despliegue en producción

1. Configura `PARTES_PASSWORD` en Vercel
2. Haz push al repositorio
3. Vercel desplegará automáticamente
4. Accede a: `https://tu-dominio.com/partes`

## 📞 Soporte

Si encuentras algún problema, revisa:
- Consola del navegador (F12 → Console)
- Terminal donde corre el servidor
- Archivo `PARTES_README.md` para documentación completa
