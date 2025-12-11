#!/bin/bash

# Script para analizar todos los artículos del blog de Itineramio
# Genera reportes en formato JSON y Markdown

echo "🔍 Iniciando análisis de artículos del blog..."
echo ""

# Establecer la DATABASE_URL
export DATABASE_URL="postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"

# Ejecutar el script con ts-node
npx ts-node scripts/analyze-blog-articles.ts

# Verificar si se generaron los archivos
if [ -f "/tmp/blog-articles-analysis.json" ]; then
    echo ""
    echo "✅ Archivo JSON generado: /tmp/blog-articles-analysis.json"
    ls -lh /tmp/blog-articles-analysis.json
fi

if [ -f "/tmp/blog-articles-report.md" ]; then
    echo "✅ Archivo Markdown generado: /tmp/blog-articles-report.md"
    ls -lh /tmp/blog-articles-report.md
    echo ""
    echo "📖 Vista previa del reporte:"
    echo "---"
    head -n 50 /tmp/blog-articles-report.md
    echo "..."
fi

echo ""
echo "✨ Análisis completado!"
echo ""
echo "Para ver el reporte completo:"
echo "  cat /tmp/blog-articles-report.md"
echo ""
echo "Para ver el JSON:"
echo "  cat /tmp/blog-articles-analysis.json | jq ."
