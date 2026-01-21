# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.0.0] - 2025-01-21

### Añadido ✨

#### Funcionalidades principales
- Sitio web completo con Next.js 15 y App Router
- Sanity Studio integrado en `/studio` para gestión de contenidos
- Sistema de internacionalización (i18n) con 5 idiomas:
  - Catalán (idioma por defecto)
  - Español
  - Inglés
  - Árabe de Marruecos (con soporte RTL)
  - Urdu (con soporte RTL)

#### Páginas
- Página principal (Home) con información del AMPA
- Página de servicios detallados
- Blog de eventos y noticias
- Página de detalle de eventos individuales
- Página de contacto con horarios
- Política de Privacidad
- Aviso Legal
- Política de Cookies

#### Componentes
- Navegación responsive con selector de idioma
- Footer con enlaces legales y mención open source
- Banner de consentimiento de cookies (GDPR compliant)
- Integración de Google Analytics con consentimiento
- Sistema de gestión de preferencias de cookies

#### Características técnicas
- Schemas de Sanity multiidioma para eventos
- Tipos personalizados: localeString, localeText, localeBlockContent
- Optimización de imágenes con next/image
- Soporte para Portable Text (contenido enriquecido)
- Sistema de slugs automáticos

#### Cumplimiento legal
- Banner de cookies conforme a GDPR/LSSI/LOPDGDD
- Páginas legales completas en 5 idiomas
- Google Analytics con gestión de consentimiento
- Documentación completa sobre cumplimiento legal
- Licencia MIT para el código

#### Documentación
- README.md completo con instrucciones de instalación
- SANITY_SETUP.md: Guía de configuración de Sanity
- GOOGLE_ANALYTICS_SETUP.md: Guía de configuración de GA
- LEGAL_COMPLIANCE.md: Información sobre cumplimiento legal
- GUIA_AMPA.md: Guía simplificada para usuarios no técnicos
- LICENSE: Licencia MIT

#### Configuración
- Variables de entorno documentadas (.env.local.example)
- Configuración optimizada para Vercel (vercel.json)
- Configuración de TypeScript
- Configuración de Next.js con next-intl

#### Estilos
- CSS Modules para todos los componentes
- Diseño responsive mobile-first
- Gradientes y efectos visuales modernos
- Soporte para direcciones RTL (árabe y urdu)
- Tema coherente con colores del AMPA

### Características open source 🌟
- Código 100% público y reutilizable
- Licencia MIT para el código fuente
- Documentación exhaustiva
- Preparado para que otras AMPAs lo usen

## Estadísticas del proyecto

- **Total de archivos**: 48 archivos principales
- **Idiomas soportados**: 5
- **Páginas creadas**: 8 rutas principales + studio
- **Componentes**: 4 componentes reutilizables
- **Schemas de Sanity**: 4 tipos de contenido
- **Archivos de traducción**: 5 (uno por idioma)
- **Archivos de documentación**: 6

## Próximas versiones (Roadmap sugerido)

### [1.1.0] - Futuro
- [ ] Formulario de contacto
- [ ] Newsletter por email
- [ ] Galería de fotos
- [ ] Calendario de eventos
- [ ] Sistema de búsqueda

### [1.2.0] - Futuro
- [ ] Área privada para socios
- [ ] Descarga de documentos
- [ ] Integración con redes sociales
- [ ] Sistema de comentarios

### [1.3.0] - Futuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Accesibilidad mejorada (WCAG 2.1)

## Contribuciones

Este proyecto es open source. Las contribuciones son bienvenidas:
- Mejoras de código
- Nuevas traducciones
- Correcciones de bugs
- Nuevas funcionalidades
- Mejoras de documentación

## Créditos

- **Framework**: Next.js 15
- **CMS**: Sanity.io
- **Internacionalización**: next-intl
- **Hosting**: Vercel
- **Iconos**: Emojis Unicode
- **Diseño**: Custom

## Licencia

MIT License - Ver archivo LICENSE para más detalles

---

Mantenido con ❤️ por AMPA Escola Bernat Desclot
