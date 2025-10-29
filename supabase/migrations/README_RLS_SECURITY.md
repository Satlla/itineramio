# 🔒 Row Level Security (RLS) para la tabla Reviews

## 🚨 Problema de Seguridad Detectado

La tabla `public.reviews` estaba expuesta públicamente sin Row Level Security (RLS) habilitado. Esto significaba que cualquier usuario podía potencialmente:
- Ver TODAS las reseñas (incluso las privadas)
- Modificar o eliminar reseñas de otros usuarios
- Acceder a información sensible de los usuarios

## ✅ Solución Implementada

### 1. Migración de Seguridad
Archivo: `20250122_enable_rls_reviews.sql`

Esta migración:
- ✅ Habilita RLS en la tabla `reviews`
- ✅ Crea políticas de seguridad apropiadas
- ✅ Añade índices para mejorar el rendimiento
- ✅ Configura permisos correctos para diferentes roles

### 2. Políticas de Seguridad Implementadas

| Política | Descripción | Quién tiene acceso |
|----------|-------------|-------------------|
| **Ver reseñas públicas** | Solo reseñas públicas Y aprobadas | Todos (público) |
| **Ver todas las reseñas** | Públicas y privadas de sus propiedades | Hosts/Propietarios |
| **Crear reseñas** | Cualquiera puede dejar una reseña | Todos |
| **Actualizar reseñas** | Solo de sus propias propiedades | Hosts/Propietarios |
| **Eliminar reseñas** | Solo de sus propias propiedades | Hosts/Propietarios |

### 3. Cómo Aplicar la Migración

```bash
# Opción 1: Usando Supabase CLI
supabase db push

# Opción 2: Directamente en Supabase Dashboard
# 1. Ve a SQL Editor en tu proyecto de Supabase
# 2. Copia y pega el contenido de 20250122_enable_rls_reviews.sql
# 3. Ejecuta la consulta

# Opción 3: Verificar el estado de RLS
# Ejecuta check_rls_status.sql para ver qué tablas necesitan RLS
```

### 4. Verificar que RLS está Activo

Después de aplicar la migración, verifica:

```sql
-- Debe mostrar rowsecurity = true
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reviews';
```

## 🔍 Otras Tablas a Revisar

Ejecuta `check_rls_status.sql` para identificar otras tablas que puedan necesitar RLS:
- `properties`
- `zones`
- `steps`
- `media_library`
- `user_subscriptions`
- Cualquier tabla con datos sensibles

## 📚 Mejores Prácticas

1. **Siempre habilita RLS** en tablas que contengan datos de usuarios
2. **Crea políticas específicas** para cada tipo de acceso (SELECT, INSERT, UPDATE, DELETE)
3. **Prueba las políticas** con diferentes roles de usuario
4. **Documenta** las políticas de seguridad para el equipo
5. **Audita regularmente** el estado de RLS en todas las tablas

## 🚀 Próximos Pasos

1. Aplicar esta migración inmediatamente
2. Revisar otras tablas públicas sin RLS
3. Implementar tests automatizados para verificar políticas RLS
4. Configurar alertas para detectar tablas nuevas sin RLS