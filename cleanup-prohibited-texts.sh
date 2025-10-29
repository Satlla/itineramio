#!/bin/bash

# Script de limpieza de textos prohibidos - USER-FACING files
# Fecha: 2025-10-19 22:00
# Ejecutar SOLO una vez

echo "🧹 Iniciando limpieza de textos prohibidos (USER-FACING)..."

# API plan-info (CRÍTICO)
echo "📝 Limpiando app/api/account/plan-info/route.ts..."
sed -i.bak '
s/currentPlan = '\''Gratuito'\''/currentPlan = null/g
s/currentPlan = '\''Growth'\''/currentPlan = '\''HOST'\''/g
s/'\''1 propiedad incluida'\''/'\''Sin plan activo'\''/g
s/case '\''Gratuito'\''/case null/g
s/case '\''Growth'\''/case '\''HOST'\''/g
' app/api/account/plan-info/route.ts

# Billing page (CRÍTICO)
echo "📝 Limpiando app/(dashboard)/account/billing/page.tsx..."
sed -i.bak2 '
s/currentPlan: '\''Gratuito'\''/currentPlan: null/g
s/planInfo\.currentPlan === '\''Gratuito'\''/!planInfo.currentPlan/g
s/propiedad gratuita/período de evaluación/g
s/por solo €2\.50\/mes por propiedad adicional/- planes desde €9\/mes/g
s/meses gratis/descuento/g
' app/(dashboard)/account/billing/page.tsx

# Plans page (CRÍTICO)
echo "📝 Limpiando app/(dashboard)/account/plans/page.tsx..."
sed -i.bak3 '
s/Precio por propiedad:/Plan mensual:/g
s/\/mes por propiedad/\/mes/g
s/currentPlan: '\''Gratuito'\''/currentPlan: null/g
' app/(dashboard)/account/plans/page.tsx

# TrialActivationModal (CRÍTICO - muy problemático)
echo "📝 Limpiando src/components/TrialActivationModal.tsx..."
sed -i.bak4 '
s/¡Tu primera propiedad es GRATIS!/15 días de evaluación/g
s/tu primera propiedad está incluida sin coste/puedes probar Itineramio durante 15 días/g
s/Incluido en el plan gratuito:/Prueba de 15 días incluye:/g
s/Por propiedad adicional/Plan desde €9\/mes/g
s/Prueba GRATIS 48 horas/Evaluación de 15 días/g
' src/components/TrialActivationModal.tsx

# PlanLimitsCard (CRÍTICO)
echo "📝 Limpiando src/components/plan-limits/PlanLimitsCard.tsx..."
sed -i.bak5 '
s/\/mes por propiedad/\/mes/g
s/planName === '\''Gratuito'\''/!planName || planName === null/g
s/Plan Gratuito incluye:/Evaluación incluye:/g
s/1 propiedad completamente gratis/15 días de prueba/g
s/Plan Growth incluye:/Plan HOST incluye:/g
s/Solo €.*\/mes por propiedad adicional/Planes desde €9\/mes/g
' src/components/plan-limits/PlanLimitsCard.tsx

# BillingOverview (CRÍTICO)
echo "📝 Limpiando src/components/billing/BillingOverview.tsx..."
sed -i.bak6 '
s/Plan Gratuito/Sin plan activo/g
' src/components/billing/BillingOverview.tsx

# Pricing V2 (menos crítico pero visible)
echo "📝 Limpiando app/(dashboard)/pricing-v2/page.tsx..."
sed -i.bak7 '
s/meses gratuitos/descuentos/g
s/funcionalidades incluidas/funcionalidades/g
' app/(dashboard)/pricing-v2/page.tsx

echo "✅ Limpieza de archivos USER-FACING completada"
echo "📋 Archivos backup creados con extensión .bak[N]"
echo ""
echo "⚠️  Revisa manualmente estos archivos para confirmar los cambios antes de borrar los .bak"
