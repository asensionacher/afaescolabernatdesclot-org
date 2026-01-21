# Guía Rápida para el AMPA

Esta es una guía simplificada para que los miembros del AMPA puedan gestionar la web sin conocimientos técnicos avanzados.

## 🎯 Lo más importante

### Acceso al CMS (Sistema de gestión de contenidos)

**URL del Studio**: `https://tu-dominio.vercel.app/studio`

Desde aquí puedes:
- ✅ Publicar noticias y eventos
- ✅ Subir fotos
- ✅ Editar contenidos en los 5 idiomas
- ✅ Todo sin tocar código

### Idiomas disponibles

La web está traducida a:
- 🇪🇸 Catalán (principal)
- 🇪🇸 Español
- 🇬🇧 Inglés
- 🇲🇦 Árabe de Marruecos
- 🇵🇰 Urdu

## 📝 Cómo publicar un evento o noticia

### 1. Acceder al Studio
- Ve a `https://tu-dominio.vercel.app/studio`
- Inicia sesión con tu cuenta de Sanity

### 2. Crear un nuevo evento
1. Haz clic en "Events" en el menú lateral
2. Haz clic en el botón "+" (Crear nuevo)
3. Rellena los campos:

#### Campos obligatorios:
- **Title**: Título en los 5 idiomas
  - Mínimo: rellena en catalán
  - Recomendado: rellena todos los idiomas
- **Slug**: Se genera automáticamente del título en catalán
  - Haz clic en "Generate" junto al campo
- **Published at**: Fecha de publicación
  - Selecciona la fecha y hora

#### Campos opcionales:
- **Main Image**: Foto principal del evento
  - Arrastra y suelta una imagen
  - Formatos aceptados: JPG, PNG
- **Excerpt**: Resumen breve
  - Aparece en la lista de eventos
- **Body**: Contenido completo
  - Editor de texto enriquecido
  - Puedes añadir títulos, listas, negritas, etc.

### 3. Publicar
1. Haz clic en "Publish" en la esquina superior derecha
2. Confirma la publicación
3. ¡Listo! El evento aparecerá automáticamente en la web

## 🖼️ Consejos para las imágenes

### Tamaño recomendado
- Ancho: mínimo 1200px
- Alto: mínimo 800px
- Relación: 3:2 (horizontal)

### Formato
- JPG para fotos
- PNG si tiene transparencias

### Peso
- Máximo 2MB por imagen
- Si es más grande, comprímela en [TinyPNG](https://tinypng.com/)

## ✍️ Escribir en múltiples idiomas

### Opción 1: Manual (recomendada)
Si tienes miembros del AMPA que hablan los idiomas:
1. Escribe primero en catalán
2. Pide a alguien que traduzca a español
3. Usa Google Translate para inglés, árabe y urdu como base
4. Si es posible, pide a familias nativas que revisen

### Opción 2: Solo catalán (mínimo)
Si solo puedes en catalán:
1. Rellena solo el campo en catalán
2. La web mostrará el contenido en catalán para los otros idiomas
3. Poco a poco puedes ir añadiendo traducciones

### Opción 3: Herramientas de traducción
- [DeepL](https://www.deepl.com/translator): Excelente para ES/EN
- [Google Translate](https://translate.google.com/): Para árabe y urdu

## 📊 Google Analytics (Estadísticas)

Si habéis configurado Google Analytics, podéis ver:

### Cómo acceder
1. Ve a [analytics.google.com](https://analytics.google.com/)
2. Inicia sesión con la cuenta del AMPA
3. Selecciona la propiedad "Web AMPA Bernat Desclot"

### Datos útiles
- **Usuarios**: Cuánta gente visita la web
- **Páginas populares**: Qué contenido interesa más
- **Ubicación**: De dónde vienen los visitantes
- **Dispositivos**: Móvil vs ordenador

### Interpretación básica
- Si muchos visitantes vienen del móvil → el diseño responsive es importante ✅
- Si una página tiene muchas visitas → ese contenido interesa
- Si el tiempo de permanencia es bajo → quizá el contenido no es claro

## 🔧 Tareas de mantenimiento

### Semanalmente
- Revisar si hay eventos próximos que publicar
- Responder comentarios (si se añaden en el futuro)

### Mensualmente
- Revisar estadísticas de Google Analytics
- Actualizar información de horarios si cambian
- Archivar eventos pasados (opcional)

### Anualmente
- Revisar y actualizar la información del AMPA
- Actualizar el horario de atención
- Revisar las páginas legales por si cambia algo

## ❓ Problemas comunes

### "No puedo acceder al Studio"
- Verifica que estás usando la URL correcta: `/studio`
- Asegúrate de tener permisos en Sanity
- Limpia caché del navegador (Ctrl+Shift+R)

### "La imagen no se sube"
- Comprueba que no supera 2MB
- Comprueba que es JPG o PNG
- Intenta con otra imagen para descartar problemas

### "Los cambios no aparecen en la web"
- Espera 1-2 minutos (el CDN necesita actualizarse)
- Refresca la página con Ctrl+F5
- Verifica que hayas publicado (botón "Publish")

### "He borrado algo por error"
- No te preocupes, Sanity guarda un historial
- En el Studio, ve al documento → History
- Puedes restaurar versiones anteriores

## 📞 Contacto técnico

### Para problemas con:

#### Sanity (CMS)
- Web: https://www.sanity.io/help
- Documentación: https://www.sanity.io/docs

#### Google Analytics
- Centro de ayuda: https://support.google.com/analytics

#### Vercel (Hosting)
- Web: https://vercel.com/support
- Documentación: https://vercel.com/docs

#### Código (errores técnicos)
- Repositorio GitHub: [tu-repositorio]
- Abre un "Issue" describiendo el problema

## 💡 Ideas para contenido

### Eventos regulares
- 🎃 Castañada y Halloween (Octubre)
- 🎄 Navidad y Reyes Magos (Diciembre)
- 🎭 Carnaval (Febrero/Marzo)
- 📚 Sant Jordi (Abril)
- 🎉 Fiesta de final de curso (Junio)

### Noticias regulares
- Inicio de curso
- Información sobre servicios (acogida, comedor, etc.)
- Convocatorias de reuniones
- Información sobre actividades extraescolares
- Proyectos solidarios

### Consejos
- Publica con 1-2 semanas de antelación
- Usa fotos de eventos anteriores
- Sé breve pero informativo
- Añade fecha, hora y lugar siempre

## ✨ Características especiales

### La web es Open Source
- El código está disponible en GitHub
- Otras AMPAs pueden usarlo gratis
- Es un proyecto comunitario

### Privacidad y cookies
- La web cumple con GDPR
- Los usuarios pueden rechazar cookies
- Solo usamos Google Analytics (opcional)

### Multiidioma real
- No es traducción automática
- Tú controlas qué se muestra en cada idioma
- Respeto por todas las familias

## 🎓 Formación

Si necesitas formación para usar el Studio:

### Recursos
1. **Video oficial de Sanity**: [Getting Started](https://www.sanity.io/docs/getting-started)
2. **Tutorial interactivo**: Disponible en el Studio
3. **Documentación**: Traducida en este repositorio

### Reunión de formación
Se recomienda organizar una sesión de 30 minutos donde:
1. Un miembro técnico explica el Studio
2. Se publica un evento de prueba juntos
3. Se resuelven dudas

---

**¿Necesitas más ayuda?**

Contacta con el equipo técnico del AMPA o consulta los documentos más detallados:
- `README.md`: Guía técnica completa
- `SANITY_SETUP.md`: Configuración de Sanity
- `GOOGLE_ANALYTICS_SETUP.md`: Configuración de Analytics
- `LEGAL_COMPLIANCE.md`: Información sobre cumplimiento legal
