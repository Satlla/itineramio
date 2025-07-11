# 🚨 URGENTE: ELIMINAR DIRECTORIO PARA ARREGLAR BUILD

## EJECUTA ESTE COMANDO INMEDIATAMENTE:

```bash
rm -rf app/api/public/resolve-property/\[propertyId\]
```

## VERIFICA QUE SOLO QUEDE:
```bash
ls app/api/public/resolve-property/
# Solo debe mostrar: [slugOrId]
```

## LUEGO COMMITEA:
```bash
git add .
git commit -m "Remove conflicting propertyId route directory"
git push origin main
```

El directorio `app/api/public/resolve-property/[propertyId]/` está causando un conflicto de nombres de slug con `[slugOrId]` en Next.js.

**Este archivo debe ser eliminado AHORA para que el build funcione.**