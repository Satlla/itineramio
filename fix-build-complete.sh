#!/bin/bash

echo "🔧 INICIANDO ARREGLO COMPLETO DEL PROYECTO"
echo "=========================================="

# 1. Limpiar e instalar dependencias
echo ""
echo "📦 1. Limpiando e instalando dependencias..."
rm -rf node_modules package-lock.json
npm install

# 2. Verificar que autoprefixer está instalado
echo ""
echo "✅ 2. Verificando autoprefixer..."
npm list autoprefixer

# 3. Arreglar todas las importaciones
echo ""
echo "🔄 3. Arreglando importaciones..."
node fix-all-imports-batch.js

# 4. Generar cliente Prisma
echo ""
echo "🗄️ 4. Generando cliente Prisma..."
npx prisma generate

# 5. Intentar build local
echo ""
echo "🏗️ 5. Probando build local..."
npm run build

# 6. Si el build funciona, hacer commit y push
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build exitoso! Haciendo commit y push..."
    git add -A
    git commit -m "Fix complete build issues - autoprefixer and imports

- Clean install all dependencies including autoprefixer
- Fix all @ imports to relative paths
- Generate Prisma client
- Ensure build works locally before deploy

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    git push
    
    echo ""
    echo "🎉 COMPLETADO! Verifica el deployment en Vercel"
    echo ""
    echo "⚠️ IMPORTANTE: Asegúrate de tener estas variables en Vercel:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET=itineramio-secret-key-2024"
    echo "   - NEXT_PUBLIC_APP_URL=https://www.itineramio.com"
    echo "   - RESEND_API_KEY=re_EuT63Wc2_Np1z28sdw1EB8QqK9yy86y76"
else
    echo ""
    echo "❌ Build falló. Revisa los errores arriba."
fi