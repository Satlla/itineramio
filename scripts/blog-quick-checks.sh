#!/bin/bash

# Script de verificaciones rápidas del blog
# Ejecuta análisis específicos sin generar el reporte completo

echo "🚀 Blog Quick Checks - Itineramio"
echo "=================================="
echo ""

export DATABASE_URL="postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"

# Función de ayuda
show_help() {
    echo "Uso: ./scripts/blog-quick-checks.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  stats          - Estadísticas generales"
    echo "  top            - Top 10 artículos más vistos"
    echo "  published      - Listar artículos publicados"
    echo "  draft          - Listar artículos en borrador"
    echo "  missing        - Artículos sin metadata completa"
    echo "  short          - Artículos muy cortos"
    echo "  search [query] - Buscar artículos"
    echo "  detail [slug]  - Ver detalle de un artículo"
    echo "  help           - Mostrar esta ayuda"
    echo ""
}

# Verificar si se pasó un comando
if [ -z "$1" ]; then
    show_help
    exit 0
fi

case "$1" in
    stats)
        echo "📊 Estadísticas Generales del Blog"
        echo "-----------------------------------"
        npx ts-node scripts/query-blog-articles.ts stats
        ;;

    top)
        echo "🏆 Top 10 Artículos Más Vistos"
        echo "------------------------------"
        npx ts-node scripts/query-blog-articles.ts top 10
        ;;

    published)
        echo "✅ Artículos Publicados"
        echo "----------------------"
        npx ts-node scripts/query-blog-articles.ts status PUBLISHED
        ;;

    draft)
        echo "📝 Artículos en Borrador"
        echo "------------------------"
        npx ts-node scripts/query-blog-articles.ts status DRAFT
        ;;

    missing)
        echo "⚠️  Artículos sin Metadata Completa"
        echo "-----------------------------------"
        npx ts-node scripts/query-blog-articles.ts missing
        ;;

    short)
        echo "📏 Artículos Muy Cortos (< 5000 caracteres)"
        echo "-------------------------------------------"
        npx ts-node scripts/query-blog-articles.ts short 5000
        ;;

    search)
        if [ -z "$2" ]; then
            echo "❌ Error: Debes proporcionar un término de búsqueda"
            echo "Uso: ./scripts/blog-quick-checks.sh search [query]"
            exit 1
        fi
        echo "🔍 Buscando: $2"
        echo "----------------"
        npx ts-node scripts/query-blog-articles.ts search "$2"
        ;;

    detail)
        if [ -z "$2" ]; then
            echo "❌ Error: Debes proporcionar un slug"
            echo "Uso: ./scripts/blog-quick-checks.sh detail [slug]"
            exit 1
        fi
        echo "📄 Detalle del Artículo: $2"
        echo "----------------------------"
        npx ts-node scripts/query-blog-articles.ts detail "$2"
        ;;

    help)
        show_help
        ;;

    *)
        echo "❌ Comando no reconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo "✨ Verificación completada!"
