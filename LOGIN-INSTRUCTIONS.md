# 🔐 Instrucciones de Login - SISTEMA CORREGIDO

## ✅ Estado Actual

- ✅ Servidor corriendo en: http://localhost:3000
- ✅ Variables de entorno cargadas desde `.env.local`
- ✅ Hash de contraseña verificado y correcto
- ✅ JWT_SECRET configurado

---

## 🚀 Cómo Hacer Login AHORA

### Paso 1: Abrir el Navegador

```
http://localhost:3000/actas
```

### Paso 2: Ingresar la Contraseña

```
Wildness4-Chop8-Stung1-Theme0
```

**IMPORTANTE:** 
- ✅ Copia y pega EXACTAMENTE como está arriba
- ❌ NO agregues espacios al principio o final
- ❌ Verifica que NO haya saltos de línea

### Paso 3: Clic en "Accedir"

Debería funcionar correctamente ahora.

---

## 🐛 Si TODAVÍA Falla

### Opción 1: Limpia la caché del navegador

**Chrome/Edge:**
1. F12 (DevTools)
2. Click derecho en el botón Reload
3. Selecciona "Empty Cache and Hard Reload"

**Firefox:**
1. Ctrl + Shift + Delete
2. Selecciona "Cached Web Content"
3. Click "Clear Now"

### Opción 2: Prueba en modo incógnito

Abre una ventana de incógnito y prueba de nuevo:
- Chrome: Ctrl + Shift + N
- Firefox: Ctrl + Shift + P

### Opción 3: Verifica que NO haya caracteres invisibles

Escribe la contraseña manualmente en lugar de copiar/pegar:

```
W i l d n e s s 4 - C h o p 8 - S t u n g 1 - T h e m e 0
```

---

## 🧪 Verificaciones Técnicas

### Verificar Hash (debería decir MATCHES)
```bash
node scripts/verify-password.js "Wildness4-Chop8-Stung1-Theme0"
```

**Resultado esperado:**
```
✅ PASSWORD MATCHES! ✅
The password is correct and will work for login.
```

### Verificar que el servidor está usando .env.local
```bash
curl -s http://localhost:3000/actas | grep "Actes de Reunió"
```

**Resultado esperado:** Debe mostrar "Actes de Reunió"

---

## 📊 Información Técnica

### Credenciales Actuales en .env.local

```env
# Authentication (in .env.local)
JWT_SECRET=5c387068093dafc7654fda5456a8175d326aa1e8b579ab35b6b081a222d1b5449e69ad97516a15f9f634738a9609685ebf6fbfa9eeaf8ed015cedfece0dc3f16
ACTAS_PASSWORD_HASH_BASE64=JDJiJDEyJGMzODdlSEVYWjdQUXViSVYwVGk0ZU8wNkYuampzcHowUFhValppbVZzZEZRN0x5S01nU2pT
```

**Note:** The hash is base64-encoded to prevent issues with `$` characters in Next.js environment variables.

### Contraseña que corresponde a ese hash

```
Wildness4-Chop8-Stung1-Theme0
```

- Formato: Word#-Word#-Word#-Word#
- Longitud: 29 caracteres
- Sin espacios al inicio o final
- Exactamente como está escrito

---

## ❓ Troubleshooting

### Error: "Contrasenya incorrecta"

**Causa más común:** Caracteres invisibles al copiar/pegar

**Solución:**
1. Escribe manualmente: `Wildness4-Chop8-Stung1-Theme0`
2. O copia carácter por carácter desde aquí
3. Asegúrate de que la primera letra sea W mayúscula

### Error: "Massa intents fallits"

**Causa:** Rate limiting activado (5 intentos fallidos)

**Solución:**
```bash
# Reiniciar servidor para resetear contador
pkill -f "next dev"
cd /home/asensionacher/repos/afaescolabernatdesclot-org
pnpm dev
```

Espera 10 segundos y prueba de nuevo.

### Error: Página no carga

**Causa:** Servidor no está corriendo

**Solución:**
```bash
cd /home/asensionacher/repos/afaescolabernatdesclot-org
pnpm dev
```

---

## ✅ Confirmación Visual

Después de un login exitoso, deberías ver:
- ✅ La página recarga
- ✅ Ya no ves el formulario de login
- ✅ Ves la lista de actas de reunión
- ✅ Cookie `actas_auth` en DevTools con un JWT largo

---

**Si sigues teniendo problemas, comparte:**
1. El mensaje de error EXACTO que ves
2. Screenshot del formulario
3. Screenshot de DevTools > Console
