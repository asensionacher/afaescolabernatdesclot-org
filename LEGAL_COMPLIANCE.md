# Cumplimiento Legal y Privacidad

## Resumen

Este proyecto ha sido diseñado desde el principio con el cumplimiento legal y la privacidad de los usuarios como prioridad. Cumple con las normativas europeas y españolas de protección de datos.

## Normativas que se cumplen

### ✅ RGPD (Reglamento General de Protección de Datos)
- Consentimiento explícito para cookies analíticas
- Transparencia en el tratamiento de datos
- Derecho de acceso, rectificación y supresión
- Información clara sobre el responsable del tratamiento

### ✅ LSSI (Ley de Servicios de la Sociedad de la Información)
- Aviso legal completo
- Información sobre el titular del sitio web
- Política de privacidad accesible

### ✅ LOPDGDD (Ley Orgánica de Protección de Datos)
- Adaptación española del RGPD
- Información sobre derechos del usuario
- Base legal para el tratamiento de datos

## Características implementadas

### 1. Banner de Consentimiento de Cookies

**Ubicación**: Aparece en la primera visita al sitio web

**Características**:
- Permite aceptar todas las cookies
- Permite rechazar cookies no esenciales
- Opción de personalizar preferencias
- Información clara sobre tipos de cookies
- Persistencia de preferencias en localStorage

**Tipos de cookies explicadas**:
- **Necesarias**: Imprescindibles para el funcionamiento (siempre activas)
- **Analíticas**: Google Analytics (requieren consentimiento)

### 2. Páginas Legales

#### Política de Privacidad (`/privacy`)
Incluye:
- Identificación del responsable
- Tipos de datos recopilados (si los hay)
- Finalidad del tratamiento
- Información sobre cookies
- Derechos del usuario (ARCO + limitación + portabilidad + oposición)
- Disponible en 5 idiomas

#### Aviso Legal (`/legal`)
Incluye:
- Titular del sitio web
- Objeto del sitio
- Limitación de responsabilidad
- Propiedad intelectual e industrial
- Información sobre código abierto
- Disponible en 5 idiomas

#### Política de Cookies (`/cookies-policy`)
Incluye:
- Explicación de qué son las cookies
- Tipos de cookies utilizadas
- Finalidad de cada tipo
- Cómo gestionar las preferencias
- Enlace a configuración de cookies
- Disponible en 5 idiomas

### 3. Google Analytics Conforme a GDPR

**Características de privacidad**:
- Solo se carga si el usuario da su consentimiento
- Anonimización de IP activada por defecto
- No se envían datos si el usuario rechaza cookies
- Los usuarios pueden cambiar sus preferencias en cualquier momento

**Implementación técnica**:
```javascript
// Solo se inicializa con consentimiento
const consent = localStorage.getItem('cookie-consent');
if (consent === 'accepted' || consent === 'analytics') {
  // Cargar Google Analytics
}
```

### 4. Gestión de Preferencias

**Ubicación**: Footer de todas las páginas

**Funcionalidad**:
- Botón "Configurar cookies" visible en todo momento
- Al hacer clic, se limpia el consentimiento y aparece el banner
- Permite cambiar las preferencias en cualquier momento

### 5. Transparencia de Código Abierto

**Footer destacado**:
- Mención clara de que el código es 100% open source
- Enlace directo al repositorio de GitHub
- Licencia MIT para el código
- Separación entre código (MIT) y contenido (copyright)

## Datos que NO recopilamos

Este sitio web **NO** recopila:
- ❌ Nombres de usuarios
- ❌ Direcciones de correo electrónico
- ❌ Números de teléfono
- ❌ Información de pago
- ❌ Datos de menores sin consentimiento parental
- ❌ Datos sensibles (salud, religión, orientación sexual, etc.)

## Datos que SÍ puede recopilar Google Analytics (con consentimiento)

Si el usuario acepta cookies analíticas:
- ✅ Páginas visitadas (URLs)
- ✅ Tiempo de permanencia
- ✅ Ubicación geográfica aproximada (ciudad/país)
- ✅ Tipo de dispositivo y navegador
- ✅ Fuente de tráfico
- ✅ IP anonimizada

**Importante**: Ninguno de estos datos identifica personalmente al usuario.

## Derechos del usuario

Los usuarios tienen los siguientes derechos sobre sus datos:

1. **Acceso**: Derecho a saber qué datos tenemos
2. **Rectificación**: Derecho a corregir datos incorrectos
3. **Supresión**: Derecho al olvido
4. **Limitación**: Derecho a limitar el tratamiento
5. **Portabilidad**: Derecho a recibir sus datos
6. **Oposición**: Derecho a oponerse al tratamiento
7. **Retirada de consentimiento**: En cualquier momento

## Cómo ejercer los derechos

Para ejercer cualquiera de estos derechos:

1. **Para cookies**: Usa el botón "Configurar cookies" en el footer
2. **Para otros datos**: Contacta con el AMPA durante su horario de atención
3. **Reclamación**: Los usuarios pueden presentar reclamación ante la Agencia Española de Protección de Datos (AEPD)

## Checklist de cumplimiento

Antes de publicar tu sitio web, verifica:

- [ ] Variables de entorno configuradas (.env.local)
- [ ] Proyecto de Sanity creado y configurado
- [ ] Google Analytics configurado (si se desea usar)
- [ ] Banner de cookies funciona correctamente
- [ ] Todas las páginas legales son accesibles
- [ ] Los enlaces del footer funcionan
- [ ] El botón "Configurar cookies" abre el banner
- [ ] Las traducciones están correctas en todos los idiomas
- [ ] El código fuente está publicado en GitHub
- [ ] La licencia MIT está incluida en el repositorio
- [ ] Los datos de contacto del AMPA están actualizados

## Actualizar información legal

Si necesitas personalizar la información legal para tu AMPA:

### 1. Actualizar el responsable del tratamiento

Edita en cada archivo de traducción (`messages/*.json`):

```json
"privacy": {
  "dataControllerText": "TU AMPA - Dirección - Email - Teléfono"
}
```

### 2. Añadir datos de contacto

Actualiza el Footer y la página de contacto con:
- Dirección física
- Correo electrónico
- Teléfono de contacto
- Horario de atención

### 3. Actualizar enlace al repositorio

En `src/components/Footer.tsx`, cambia la URL del repositorio de GitHub:

```typescript
<a 
  href="https://github.com/tu-usuario/tu-repositorio" 
  target="_blank" 
  rel="noopener noreferrer"
>
  {t('sourceCode')} →
</a>
```

## Auditorías recomendadas

Para asegurar el cumplimiento continuo:

1. **Revisión anual**: Revisa las páginas legales al menos una vez al año
2. **Actualizaciones legales**: Estate atento a cambios en la legislación
3. **Logs de consentimiento**: Aunque no es obligatorio para sitios pequeños, considera mantener un registro de consentimientos
4. **Pruebas de cookies**: Verifica periódicamente que el banner funciona correctamente

## Recursos adicionales

- [Agencia Española de Protección de Datos (AEPD)](https://www.aepd.es/)
- [Guía RGPD para pequeñas empresas](https://www.aepd.es/es/areas-de-actuacion/reglamento-europeo-de-proteccion-de-datos/guias)
- [Cookie Consent Guide](https://gdpr.eu/cookies/)

## Soporte legal

**Importante**: Esta implementación proporciona las herramientas técnicas para el cumplimiento legal, pero:

- No constituye asesoramiento legal
- Cada organización debe revisar su situación particular
- Se recomienda consultar con un asesor legal si hay dudas
- Las leyes pueden cambiar, mantén la información actualizada

## Contacto

Para preguntas sobre el cumplimiento legal de este proyecto:
- Abre un issue en GitHub
- Consulta con un abogado especializado en protección de datos
- Contacta con la AEPD para dudas específicas

---

**Última actualización**: Enero 2025

Este documento será actualizado cuando cambien las normativas o se añadan nuevas funcionalidades.
