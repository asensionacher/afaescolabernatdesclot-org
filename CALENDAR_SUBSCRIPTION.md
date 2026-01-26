# Suscripción al Calendario de Eventos - AFA Bernat Desclot

## ¿Qué es una suscripción a calendario?

A diferencia de descargar un archivo `.ics` estático, **suscribirse a un calendario** permite que los eventos se **actualicen automáticamente** cuando añades, editas o eliminas eventos en Sanity CMS.

## Cómo funciona

### Para los usuarios:
1. Al hacer clic en "Subscriu-te al calendari" (o su equivalente en otro idioma)
2. Se abre su aplicación de calendario predeterminada (Google Calendar, Apple Calendar, Outlook, etc.)
3. Se les pide confirmar la suscripción al calendario
4. Una vez confirmado, los eventos aparecen en su calendario
5. **Los eventos se actualizan automáticamente** cada X horas (según la configuración de su app de calendario)

### Para los administradores:
1. Añades/editas/eliminas eventos en Sanity CMS como siempre
2. Los cambios se publican automáticamente
3. Los usuarios suscritos verán los cambios en su calendario sin hacer nada

## Características implementadas

### 1. Multiidioma
- Cada idioma tiene su propia URL de suscripción
- Los eventos se muestran en el idioma seleccionado
- URLs generadas automáticamente:
  - `/api/calendar.ics?locale=ca` - Catalán
  - `/api/calendar.ics?locale=es` - Español
  - `/api/calendar.ics?locale=en` - Inglés
  - `/api/calendar.ics?locale=ar` - Árabe
  - `/api/calendar.ics?locale=ur` - Urdu

### 2. Auto-actualización
- Cache de 1 hora (`revalidate = 3600`)
- Protocolo `webcal://` para suscripción automática
- Los eventos se sincronizan según la configuración del calendario del usuario

### 3. Fallback de contenido
- Si un evento no tiene traducción en el idioma solicitado:
  1. Intenta con el idioma solicitado
  2. Fallback a catalán (idioma principal)
  3. Fallback a español
  4. Fallback a inglés
  5. Fallback a "Event" (por defecto)

### 4. Metadatos del calendario
- Nombre del calendario traducido según idioma
- Descripción traducida
- Zona horaria: Europe/Madrid
- Todos los eventos como eventos de día completo (sin horas)

## Cómo probar localmente

### Opción 1: Usando Google Calendar
1. Inicia el servidor: `pnpm dev`
2. Abre Google Calendar
3. En "Otros calendarios", haz clic en "+" → "Desde URL"
4. Pega la URL: `http://localhost:3000/api/calendar.ics?locale=ca`
5. Los eventos deberían aparecer en tu calendario

### Opción 2: Usando Apple Calendar
1. Inicia el servidor: `pnpm dev`
2. Abre Apple Calendar
3. Archivo → Nueva suscripción a calendario
4. Pega la URL: `webcal://localhost:3000/api/calendar.ics?locale=ca`
5. Configura la frecuencia de actualización

### Opción 3: Descarga directa (para probar el archivo)
1. Abre en navegador: `http://localhost:3000/api/calendar.ics?locale=ca`
2. Se descargará un archivo `.ics` que puedes abrir con cualquier app de calendario

## Cómo funciona en producción

### URL del botón de suscripción
```typescript
webcal://{dominio}/api/calendar.ics?locale={idioma-actual}
```

Ejemplo en producción:
```
webcal://afaescolabernatdesclot.org/api/calendar.ics?locale=ca
```

### Protocolo webcal://
- Automáticamente abre la aplicación de calendario del usuario
- Compatible con:
  - ✅ Google Calendar
  - ✅ Apple Calendar (macOS, iOS)
  - ✅ Microsoft Outlook
  - ✅ Mozilla Thunderbird
  - ✅ Otras apps compatibles con iCal

## Gestión de eventos

### Añadir un nuevo evento
1. Ve a Sanity Studio (`/studio`)
2. Crea un nuevo evento
3. Rellena todos los campos traducidos
4. Publica el evento
5. **Los usuarios suscritos verán el evento en máximo 1-24h** (según su app)

### Editar un evento existente
1. Ve a Sanity Studio
2. Edita el evento
3. Publica los cambios
4. **Los cambios se sincronizarán automáticamente**

### Eliminar un evento
1. Ve a Sanity Studio
2. Despublica o elimina el evento
3. **El evento desaparecerá de los calendarios suscritos**

## Ventajas de la suscripción vs descarga

| Aspecto | Descarga (.ics) | Suscripción (webcal) |
|---------|----------------|---------------------|
| Actualización | Manual | Automática |
| Eventos nuevos | No aparecen | Aparecen automáticamente |
| Eventos editados | No se actualizan | Se actualizan |
| Eventos eliminados | Siguen apareciendo | Desaparecen |
| Acción del usuario | Descargar cada vez | Una sola vez |
| Experiencia | Pobre | Excelente |

## Estructura técnica

### API Route: `/src/app/api/calendar.ics/route.ts`
- Obtiene eventos de Sanity
- Filtra por idioma según parámetro `locale`
- Genera formato iCal estándar
- Incluye:
  - Título del evento
  - Descripción
  - Fecha (día completo)
  - URL externa (si existe)
  - Ubicación: Escola Bernat Desclot, Barcelona
  - UID único por evento

### Formato iCal generado
```ical
BEGIN:VCALENDAR
VERSION:2.0
X-WR-CALNAME:AFA Bernat Desclot - Esdeveniments
X-WR-TIMEZONE:Europe/Madrid
BEGIN:VEVENT
UID:evento-id@dominio
DTSTART;VALUE=DATE:20260201
DTEND;VALUE=DATE:20260202
SUMMARY:Títol de l'esdeveniment
DESCRIPTION:Descripció de l'esdeveniment
LOCATION:Escola Bernat Desclot, Barcelona
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
```

## Troubleshooting

### Los eventos no se actualizan
- **Google Calendar**: Sincroniza cada 24 horas (no configurable)
- **Apple Calendar**: Configurable (cada 15min, 1h, 1 día, etc.)
- **Solución**: Forzar sincronización manual o esperar

### El botón no abre el calendario
- Verifica que la URL use `webcal://` y no `http://`
- Algunos navegadores bloquean el protocolo webcal
- Solución alternativa: Copiar URL manualmente en la app de calendario

### Eventos duplicados
- Puede ocurrir si se suscribe múltiples veces
- Solución: Eliminar suscripciones antiguas del calendario

### Eventos en idioma incorrecto
- Verifica que el parámetro `locale` sea correcto
- Verifica que los eventos tengan traducciones en Sanity
- El sistema hace fallback a catalán automáticamente

## Recursos adicionales

- [iCalendar RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545)
- [Google Calendar Subscriptions](https://support.google.com/calendar/answer/37100)
- [Apple Calendar Subscriptions](https://support.apple.com/guide/calendar/subscribe-to-calendars-icl1022/mac)
