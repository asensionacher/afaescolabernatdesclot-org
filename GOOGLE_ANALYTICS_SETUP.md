# Configuración de Google Analytics

## Paso 1: Crear una cuenta de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Empezar a medir"
4. Configura tu cuenta:
   - Nombre de la cuenta: "AMPA Bernat Desclot"
   - Configura las opciones de compartir datos según tus preferencias

## Paso 2: Crear una propiedad

1. Nombre de la propiedad: "Web AMPA Bernat Desclot"
2. Zona horaria: Europa/Madrid
3. Moneda: EUR
4. Haz clic en "Siguiente"

## Paso 3: Configurar el flujo de datos

1. Selecciona "Web"
2. URL del sitio web: Tu dominio de Vercel (ej: `https://ampa-bernat-desclot.vercel.app`)
3. Nombre del flujo: "Web principal"
4. Haz clic en "Crear flujo"

## Paso 4: Obtener el ID de medición

Después de crear el flujo, verás tu **ID de medición** (formato: `G-XXXXXXXXXX`). Copia este ID.

## Paso 5: Configurar variables de entorno

### Para desarrollo local:

Añade en tu archivo `.env.local`:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Para producción (Vercel):

1. Ve a tu proyecto en Vercel
2. Ve a Settings → Environment Variables
3. Añade una nueva variable:
   - Name: `NEXT_PUBLIC_GA_ID`
   - Value: `G-XXXXXXXXXX`
   - Environments: Production, Preview, Development
4. Haz clic en "Save"
5. Despliega de nuevo tu aplicación

## Paso 6: Configurar consentimiento de cookies (IMPORTANTE)

Para cumplir con GDPR, ya hemos implementado:

1. **Banner de cookies**: Aparece en la primera visita
2. **Gestión de consentimiento**: Google Analytics solo se carga si el usuario acepta
3. **Configuración de usuario**: Los usuarios pueden cambiar sus preferencias desde el footer

### Configurar el modo de consentimiento en Google Analytics

1. Ve a Admin → Flujo de datos → Tu flujo web
2. Haz clic en "Configuración adicional" → "Más opciones de etiquetado"
3. Activa "Ajustar el comportamiento del modo de consentimiento"
4. Configura:
   - **analytics_storage**: Esperando consentimiento
   - **ad_storage**: Esperando consentimiento

## Verificar que funciona

1. Despliega tu aplicación con la variable de entorno configurada
2. Visita tu sitio web
3. Acepta las cookies en el banner
4. Navega por algunas páginas
5. Espera 24-48 horas
6. Ve a Google Analytics → Informes → Tiempo real

Deberías ver tu visita registrada.

## Qué datos recopila Google Analytics

Con la configuración actual, Google Analytics recopila:

- **Páginas visitadas**: URLs de las páginas que visitan los usuarios
- **Duración de la sesión**: Cuánto tiempo pasan en el sitio
- **Fuentes de tráfico**: De dónde vienen los visitantes (búsqueda, redes sociales, etc.)
- **Ubicación geográfica**: País y ciudad (aproximada)
- **Dispositivo y navegador**: Tipo de dispositivo, sistema operativo, navegador
- **Eventos de navegación**: Clics, scroll, etc.

**Nota importante**: 
- No recopilamos datos personales identificables
- La IP se anonimiza automáticamente
- Los usuarios pueden rechazar el seguimiento en cualquier momento

## Informes útiles en Google Analytics

### 1. Audiencia
- Usuarios activos
- Datos demográficos
- Tecnología (dispositivos, navegadores)

### 2. Adquisición
- De dónde vienen tus visitantes
- Campañas de marketing

### 3. Comportamiento
- Páginas más visitadas
- Flujo de comportamiento

### 4. Conversiones (opcional)
- Puedes configurar eventos personalizados
- Por ejemplo: "Clic en contacto", "Visita al blog", etc.

## Configurar eventos personalizados (opcional)

Si deseas trackear eventos específicos, puedes añadir código como este en tus componentes:

```typescript
// En cualquier componente
const handleClick = () => {
  // Tu lógica aquí
  
  // Enviar evento a Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'click_contact', {
      event_category: 'engagement',
      event_label: 'Contact button',
    });
  }
};
```

## Desactivar Google Analytics

Si en algún momento deseas desactivar Google Analytics:

1. Elimina la variable de entorno `NEXT_PUBLIC_GA_ID`
2. Despliega de nuevo tu aplicación

El código está diseñado para no cargar Google Analytics si la variable no está presente.

## Privacidad y cumplimiento

Esta implementación cumple con:

- ✅ **GDPR** (Reglamento General de Protección de Datos)
- ✅ **LSSI** (Ley de Servicios de la Sociedad de la Información)
- ✅ **ePrivacy Directive** (Directiva de privacidad electrónica)

Los usuarios tienen control total sobre sus datos y pueden:
- Rechazar cookies analíticas
- Aceptar solo cookies necesarias
- Cambiar sus preferencias en cualquier momento

## Soporte

Si tienes problemas con la configuración de Google Analytics:

1. Verifica que el ID esté correctamente configurado
2. Comprueba que hayas aceptado las cookies en tu navegador
3. Revisa la consola del navegador para errores
4. Espera 24-48 horas para que aparezcan los datos en Google Analytics

Para más ayuda, consulta la [documentación oficial de Google Analytics](https://support.google.com/analytics).
