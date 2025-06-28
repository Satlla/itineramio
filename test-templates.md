# 🧪 Testing del Sistema de Plantillas Esenciales

## ✅ PASOS PARA TESTING COMPLETO

### **1. Aplicar Migración BD (CRÍTICO)**
```sql
-- Ejecutar en PostgreSQL:
psql -d tu_base_datos -f apply_migration.sql
```

### **2. Subir Videos de Leonardo AI**
Una vez creados los videos, subirlos a:
```
/public/templates/videos/
├── door_lock_electronic.mp4
├── wifi_instant.mp4
├── cooktop_unlock.mp4
├── door_welcome.mp4
└── qr_tutorial.mp4
```

### **3. Testing Paso a Paso**

#### **Test 1: Auto-creación de zonas**
1. ✅ Abrir la aplicación
2. ✅ Ir a "Crear nueva propiedad"
3. ✅ Llenar todos los campos obligatorios
4. ✅ Hacer clic en "Crear propiedad"
5. ✅ **VERIFICAR**: Se crean automáticamente 10 zonas esenciales

#### **Test 2: Modal de bienvenida**
1. ✅ Con la propiedad recién creada
2. ✅ Hacer clic en "Gestionar" → "Zonas"
3. ✅ **VERIFICAR**: Aparece modal de bienvenida
4. ✅ **VERIFICAR**: Modal muestra las 10 zonas creadas
5. ✅ Hacer clic en "¡Perfecto! Ver mi manual"
6. ✅ **VERIFICAR**: Modal se cierra y muestra las zonas

#### **Test 3: Videos y contenido**
1. ✅ En la lista de zonas, hacer clic en "Editar" en "Check In"
2. ✅ **VERIFICAR**: Se ven los pasos con contenido
3. ✅ **VERIFICAR**: Video `door_lock_electronic.mp4` se carga
4. ✅ Hacer lo mismo con "WiFi" → Verificar `wifi_instant.mp4`
5. ✅ Hacer lo mismo con "Cocina" → Verificar `cooktop_unlock.mp4`

#### **Test 4: Variables de plantilla**
1. ✅ En cualquier zona, editar el texto
2. ✅ **VERIFICAR**: Se ven variables como `{wifi_password}`, `{door_code}`
3. ✅ Cambiar alguna variable por texto real
4. ✅ Guardar y verificar que se mantiene

#### **Test 5: Modal NO se repite**
1. ✅ Salir de zonas y volver a entrar
2. ✅ **VERIFICAR**: Modal de bienvenida NO aparece (solo primera vez)

#### **Test 6: Otras propiedades**
1. ✅ Crear otra propiedad nueva
2. ✅ **VERIFICAR**: También se crean las 10 zonas automáticamente
3. ✅ **VERIFICAR**: Modal de bienvenida aparece en esta nueva propiedad

## 🐛 POSIBLES PROBLEMAS Y SOLUCIONES

### **Error: Videos no cargan**
- ✅ Verificar que videos están en `/public/templates/videos/`
- ✅ Verificar nombres exactos de archivos
- ✅ Verificar que son archivos de video válidos (MP4)

### **Error: Modal no aparece**
- ✅ Borrar localStorage: `localStorage.removeItem('visited_zones_${id}')`
- ✅ Verificar que la propiedad tiene zonas del sistema

### **Error: No se crean zonas automáticamente**
- ✅ Verificar que la migración BD se aplicó correctamente
- ✅ Verificar logs de la API en `/api/properties`
- ✅ Verificar que essentialTemplates.ts no tiene errores

### **Error: Faltan campos isSystemTemplate**
```sql
-- Verificar migración:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'Zone' AND column_name = 'isSystemTemplate';
```

## 📊 MÉTRICAS DE ÉXITO

### **✅ TODO FUNCIONA SI:**
- ✅ Se crean 10 zonas automáticamente al crear propiedad
- ✅ Modal de bienvenida aparece en primera visita
- ✅ Videos se cargan y reproducen correctamente
- ✅ Contenido se muestra con variables de plantilla
- ✅ Usuario puede editar y personalizar todo
- ✅ Modal no se repite en siguientes visitas

### **📈 IMPACTO ESPERADO:**
- ✅ Usuarios nuevos ven inmediatamente valor de la plataforma
- ✅ Reducción drastica del tiempo de setup inicial
- ✅ Ejemplos visuales de calidad premium
- ✅ Inspiración para crear contenido propio
- ✅ Mayor retención de usuarios nuevos

## 🚀 SIGUIENTES PASOS DESPUÉS DEL TESTING

1. **Si todo funciona**: Crear más videos/imágenes
2. **Si hay errores**: Debug y corregir
3. **Optimizaciones**: Velocidad de carga, UX
4. **Fase 2**: Backoffice para gestionar plantillas