# 📧 Guía de Configuración de Emails - Itineramio

## Estado Actual

### ❌ **Problema Principal**
El dominio `itineramio.com` NO está verificado en Resend, causando que todos los emails fallen con error 403.

### 🔧 **Soluciones Disponibles**

## Opción 1: Verificar el Dominio (RECOMENDADO para Producción)

### Pasos:
1. **Accede a Resend**
   - Ve a [https://resend.com/domains](https://resend.com/domains)
   - Inicia sesión con tu cuenta

2. **Agrega el dominio**
   - Click en "Add Domain"
   - Ingresa: `itineramio.com`
   - Click en "Add"

3. **Configura los registros DNS**
   - Resend te mostrará varios registros DNS que debes agregar
   - Normalmente incluyen:
     - **SPF Record**: `TXT` record con valor como `v=spf1 include:_spf.resend.com ~all`
     - **DKIM Records**: Varios `CNAME` records para autenticación
     - **Domain Verification**: Un `TXT` record para verificar propiedad

4. **Agrega los registros en tu proveedor DNS**
   - Ve a tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.)
   - Agrega cada registro DNS exactamente como Resend te indica
   - Espera 5-10 minutos para propagación

5. **Verifica en Resend**
   - Vuelve a Resend y click en "Verify DNS Records"
   - Una vez verificado, verás un checkmark verde

## Opción 2: Usar Email de Desarrollo (TEMPORAL)

### Para desarrollo local:
```env
# En tu archivo .env.local
RESEND_API_KEY=tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev
NODE_ENV=development
```

### Actualizar el código:
```bash
# Usar el servicio de email mejorado
mv src/lib/email.ts src/lib/email-old.ts
mv src/lib/email-improved.ts src/lib/email.ts
```

## Opción 3: Cambiar Proveedor de Email

Si tienes otro dominio verificado o prefieres otro servicio:

### SendGrid:
```env
SENDGRID_API_KEY=tu_api_key
SENDGRID_FROM_EMAIL=noreply@tudominio.com
```

### Nodemailer con Gmail:
```env
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password
```

## 🧪 Verificar Configuración

### 1. Script de prueba:
```javascript
// test-email-config.js
const testEmailConfig = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'tu-email@example.com',
        subject: 'Test - Configuración de Email',
        type: 'test'
      })
    })
    
    const result = await response.json()
    console.log('Resultado:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}

testEmailConfig()
```

### 2. Verificar en producción:
```bash
# Verificar variables de entorno
vercel env pull
cat .env.local

# Verificar logs
vercel logs --follow
```

## 📋 Checklist de Configuración

- [ ] Dominio agregado en Resend
- [ ] Registros DNS configurados
- [ ] Dominio verificado (checkmark verde)
- [ ] Variable `RESEND_API_KEY` configurada
- [ ] Variable `RESEND_FROM_EMAIL` configurada (opcional)
- [ ] Código actualizado para manejar errores
- [ ] Emails de prueba funcionando

## 🚨 Errores Comunes

### Error 403: Domain not verified
**Causa**: El dominio no está verificado en Resend
**Solución**: Seguir Opción 1 o usar Opción 2 temporalmente

### Error: No API Key
**Causa**: `RESEND_API_KEY` no está configurada
**Solución**: Agregar la API key en `.env.local` y en Vercel

### Emails no llegan
**Causas posibles**:
- Filtros de spam
- Dominio en blacklist
- Configuración SPF/DKIM incorrecta

## 📞 Soporte

Si necesitas ayuda:
1. Revisa los logs: `vercel logs`
2. Verifica en Resend Dashboard: [https://resend.com/emails](https://resend.com/emails)
3. Contacta soporte de Resend: support@resend.com