# 🚀 Flujo de Trabajo de Desarrollo

## 📝 Desarrollo Local

### 1. Crear rama de trabajo
```bash
# Para nuevas funcionalidades
git checkout -b feature/nombre-descriptivo

# Para arreglos
git checkout -b fix/descripcion-del-bug
```

### 2. Desarrollar y probar
```bash
# Iniciar servidor local
pnpm dev

# Ver cambios en http://localhost:3000
# Hacer cambios, probar todo
```

### 3. Guardar cambios
```bash
# Ver qué archivos cambiaste
git status

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar función de exportar PDF"
```

### 4. Sincronizar con main
```bash
# Cambiar a main
git checkout main

# Actualizar main
git pull origin main

# Volver a tu rama
git checkout feature/nombre-descriptivo

# Fusionar cambios de main
git merge main
```

## 🚀 Deploy a Producción

### Opción A: Deploy Directo (Rápido)
```bash
# 1. Asegurarte de estar en main
git checkout main

# 2. Fusionar tu rama
git merge feature/nombre-descriptivo

# 3. Ejecutar deploy
./scripts/deploy.sh
```

### Opción B: Pull Request (Recomendado)
```bash
# 1. Subir tu rama
git push origin feature/nombre-descriptivo

# 2. Crear Pull Request en GitHub
# 3. Revisar cambios
# 4. Merge en GitHub
# 5. Vercel deploya automáticamente
```

## 🔄 Rollback (Volver Atrás)

### Ver versiones disponibles
```bash
./scripts/rollback.sh
```

### Hacer rollback
```bash
./scripts/rollback.sh v2024.01.15.1430
```

## 📋 Comandos Útiles

```bash
# Ver historial de cambios
git log --oneline -10

# Ver qué cambió en un archivo
git diff archivo.tsx

# Deshacer cambios locales
git checkout -- archivo.tsx

# Ver ramas
git branch -a

# Eliminar rama local
git branch -d feature/nombre

# Ver tags (versiones)
git tag -l
```

## ⚠️ Reglas de Oro

1. **NUNCA** hacer push directo a main sin probar
2. **SIEMPRE** probar en local primero
3. **CREAR TAGS** antes de cambios grandes
4. **COMMITS FRECUENTES** con mensajes claros
5. **PULL** antes de empezar a trabajar

## 🆘 Emergencias

### Si rompiste producción:
```bash
# Rollback inmediato
./scripts/rollback.sh [ultima-version-buena]
```

### Si perdiste cambios:
```bash
# Ver todos los commits (incluso borrados)
git reflog

# Recuperar commit perdido
git checkout [hash-del-commit]
```

### Si hay conflictos:
```bash
# Ver archivos en conflicto
git status

# Editar archivos manualmente
# Luego:
git add .
git commit -m "fix: resolver conflictos"
```