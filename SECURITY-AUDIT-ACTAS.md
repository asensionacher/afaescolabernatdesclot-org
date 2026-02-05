# 🔒 Informe de Seguridad: Sistema de Autenticación /actas

**Fecha:** 6 de febrero de 2026  
**Sistema:** AMPA Bernat Desclot - Gestión de Actas  
**URL:** http://localhost:3000/actas (dev) / https://www.afaescolabernatdesclot.org/actas (prod)  
**Formato de contraseña:** `Word#-Word#-Word#-Word#` (ej: Premises2-Rebuttal3-Same7-Denote2)

---

## ✅ Estado Actual: FUNCIONAL pero VULNERABLE

### Aspectos Positivos Implementados

1. ✅ **Cookie HttpOnly**: Protege contra XSS
2. ✅ **Secure Flag**: Activado en producción (solo HTTPS)
3. ✅ **SameSite=Lax**: Protección básica contra CSRF
4. ✅ **No indexación**: `robots: { index: false, follow: false }`
5. ✅ **Server Actions**: Lógica de autenticación en el servidor
6. ✅ **Expiración de sesión**: 24 horas

---

## 🚨 Vulnerabilidades Críticas Detectadas

### 1. ⚠️ CRÍTICO: Contraseña en texto plano
**Archivo:** `src/lib/auth.ts:18`

```typescript
// ❌ VULNERABLE - Comparación directa sin hashing
return password === correctPassword
```

**Riesgo:**
- Si la base de datos o logs son comprometidos, la contraseña queda expuesta
- No hay protección criptográfica

**Impacto:** 🔴 ALTO

---

### 2. ⚠️ CRÍTICO: Sin Rate Limiting
**Prueba realizada:** 9 intentos en 1.52 segundos = **5.92 intentos/segundo**

**Riesgo:**
- Ataque de fuerza bruta sin restricciones
- Un atacante puede probar miles de contraseñas en minutos
- Con el formato conocido (4 palabras + números), espacio de búsqueda es reducido

**Impacto:** 🔴 ALTO

---

### 3. ⚠️ MEDIO: Cookie simple sin token único
**Valor actual:** `actas_auth=authenticated`

**Riesgo:**
- No hay token único por sesión
- Dificultad para invalidar sesiones específicas
- Sin información sobre el usuario o timestamp

**Impacto:** 🟡 MEDIO

---

### 4. ⚠️ MEDIO: Sin logging de intentos
**Ausencia de:** Registro de intentos fallidos, IPs, timestamps

**Riesgo:**
- Imposible detectar ataques en curso
- No hay auditoría de accesos
- Dificulta investigación de incidentes

**Impacto:** 🟡 MEDIO

---

### 5. ⚠️ BAJO: Sin protección CSRF adicional
**Actual:** Solo SameSite=lax

**Riesgo:**
- Protección básica, pero no completa
- Vulnerable a ataques GET-based CSRF en algunos navegadores antiguos

**Impacto:** 🟢 BAJO

---

## 🛠️ Plan de Mejoras Prioritarias

### Prioridad 1: Implementar bcrypt (CRÍTICO)
```bash
pnpm add bcrypt @types/bcrypt
```

**Cambios necesarios:**
1. Hash de contraseña al configurar (one-time)
2. Comparación con `bcrypt.compare()` en login
3. Almacenar hash en `.env.local` en lugar de texto plano

**Tiempo estimado:** 30 minutos  
**Archivos afectados:** `src/lib/auth.ts`

---

### Prioridad 2: Implementar Rate Limiting (CRÍTICO)
```bash
pnpm add @upstash/ratelimit @upstash/redis
# O alternativa más simple con memoria local para dev
```

**Configuración sugerida:**
- Máximo 5 intentos cada 15 minutos por IP
- Bloqueo temporal después de 10 intentos fallidos
- Mensaje de "demasiados intentos" al usuario

**Tiempo estimado:** 1 hora  
**Archivos afectados:** `src/lib/auth.ts`, nuevo `src/lib/ratelimit.ts`

---

### Prioridad 3: Logging de Auditoría (ALTO)
```bash
pnpm add winston
# O usar servicio como Logtail, Papertrail
```

**Información a registrar:**
- Intentos fallidos (timestamp, IP, contraseña intentada parcial)
- Logins exitosos (timestamp, IP, user-agent)
- Sesiones expiradas
- Logout manual

**Tiempo estimado:** 45 minutos  
**Archivos afectados:** `src/lib/auth.ts`, nuevo `src/lib/logger.ts`

---

### Prioridad 4: JWT o Token de Sesión Único (MEDIO)
```bash
pnpm add jose
# Jose es la librería JWT recomendada por Next.js
```

**Beneficios:**
- Token único por sesión
- Información embebida (timestamp, user)
- Posibilidad de renovación
- Invalidación selectiva

**Tiempo estimado:** 1.5 horas  
**Archivos afectados:** `src/lib/auth.ts`

---

### Prioridad 5: 2FA Opcional (BAJO - Futuro)
```bash
pnpm add @simplewebauthn/server @simplewebauthn/browser
# O alternativa: TOTP con speakeasy
```

**Opciones:**
- WebAuthn (huella digital, Face ID)
- TOTP (Google Authenticator)
- Email verification

**Tiempo estimado:** 3-4 horas  
**Archivos afectados:** Múltiples, nueva tabla en DB

---

## 🧪 Cómo Probar

### Prueba Manual en Navegador
1. Abre http://localhost:3000/actas
2. Abre DevTools (F12) → Application → Cookies
3. Prueba con contraseña incorrecta: debe mostrar "Contrasenya incorrecta"
4. Prueba con contraseña correcta: debe recargar y mostrar lista de actas
5. Verifica cookie `actas_auth` con flag HttpOnly

### Prueba Automática de Seguridad
```bash
node test-actas-security.js
```

### Prueba de Rate Limiting (después de implementar)
```bash
# Debería fallar después de 5 intentos
for i in {1..10}; do
  curl -X POST http://localhost:3000/actas \
    -d "password=wrong" \
    -H "Content-Type: application/x-www-form-urlencoded"
done
```

---

## 📊 Evaluación de Riesgo

| Vulnerabilidad | Severidad | Explotabilidad | Impacto | Prioridad |
|---------------|-----------|----------------|---------|-----------|
| Contraseña plaintext | ALTA | Media | ALTO | 🔴 P1 |
| Sin rate limiting | ALTA | Alta | ALTO | 🔴 P1 |
| Sin logging | MEDIA | N/A | MEDIO | 🟡 P3 |
| Cookie simple | MEDIA | Baja | MEDIO | 🟡 P4 |
| CSRF básico | BAJA | Baja | BAJO | 🟢 P5 |

**Puntuación CVSS estimada:** 7.5/10 (HIGH)

---

## 📝 Notas de Implementación

### Formato de Contraseña Actual
- Patrón: `Word#-Word#-Word#-Word#`
- Ejemplo: `Premises2-Rebuttal3-Same7-Denote2`
- 4 palabras capitalizadas + número de 1 dígito
- Separadas por guiones

### Consideraciones
1. ✅ Formato fuerte si las palabras son aleatorias (alta entropía)
2. ⚠️ Vulnerable a diccionario si se conoce el patrón
3. ✅ Fácil de recordar para humanos
4. ⚠️ Espacio de búsqueda reducido con el patrón conocido

### Recomendación de Contraseña
Mantener formato actual PERO:
- Usar palabras de diccionario grande (50k+ palabras)
- Números aleatorios de 1-2 dígitos
- Considerar añadir caracteres especiales opcionalmente

**Entropía estimada actual:** ~52-60 bits (BUENO, pero mejorable a 80+ bits)

---

## ✅ Checklist de Implementación

- [ ] Implementar bcrypt para hashing de contraseña
- [ ] Agregar rate limiting (5 intentos / 15 min)
- [ ] Implementar sistema de logging
- [ ] Migrar a JWT/token único
- [ ] Agregar CSRF token explícito
- [ ] Documentar proceso de recuperación de contraseña
- [ ] Configurar alertas por múltiples intentos fallidos
- [ ] Implementar 2FA (opcional, futuro)
- [ ] Pruebas de penetración completas
- [ ] Revisión de código por tercero

---

## 🔗 Recursos Útiles

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Jose JWT Library](https://github.com/panva/jose)

---

## 📞 Contacto y Soporte

Si necesitas ayuda implementando las mejoras de seguridad, puedes:
1. Revisar los scripts de prueba incluidos
2. Consultar la documentación de OWASP
3. Solicitar auditoría externa de seguridad

**Última actualización:** 6 febrero 2026  
**Próxima revisión recomendada:** Inmediata (implementar P1 y P2)
