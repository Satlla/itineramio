import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PALETA DE COLORES OFICIAL (NEUTRAL)
const APPROVED_PALETTE = {
  // Textos
  'text-primary': '#1f2937',      // gray-800
  'text-secondary': '#4b5563',    // gray-600
  'text-tertiary': '#6b7280',     // gray-500
  'text-muted': '#9ca3af',        // gray-400

  // Backgrounds
  'bg-light': '#f9fafb',          // gray-50
  'bg-lighter': '#f3f4f6',        // gray-100

  // Borders
  'border-light': '#e5e7eb',      // gray-200
  'border-medium': '#d1d5db',     // gray-300

  // Accent (solo para enlaces)
  'accent': '#6366f1'             // indigo-500
};

// Mapeo de colores brillantes a neutrales
const COLOR_REPLACEMENTS: { [key: string]: string } = {
  // Amarillo/Amber → Gris claro
  '#fbbf24': APPROVED_PALETTE['bg-lighter'],   // amber-400 → gray-100
  '#f59e0b': APPROVED_PALETTE['bg-lighter'],   // amber-500 → gray-100
  '#d97706': APPROVED_PALETTE['text-tertiary'], // amber-600 → gray-500
  '#b45309': APPROVED_PALETTE['text-secondary'], // amber-700 → gray-600
  '#92400e': APPROVED_PALETTE['text-primary'],   // amber-800 → gray-800
  '#fef3c7': APPROVED_PALETTE['bg-light'],      // amber-50 → gray-50
  '#fef08a': APPROVED_PALETTE['bg-lighter'],    // amber-100 → gray-100

  // Azul → Gris
  '#60a5fa': APPROVED_PALETTE['text-tertiary'], // blue-400 → gray-500
  '#3b82f6': APPROVED_PALETTE['text-secondary'], // blue-500 → gray-600
  '#2563eb': APPROVED_PALETTE['text-primary'],   // blue-600 → gray-800
  '#1e40af': APPROVED_PALETTE['text-primary'],   // blue-800 → gray-800
  '#dbeafe': APPROVED_PALETTE['bg-light'],      // blue-50 → gray-50
  '#bfdbfe': APPROVED_PALETTE['bg-lighter'],    // blue-100 → gray-100

  // Verde → Gris
  '#22c55e': APPROVED_PALETTE['text-tertiary'], // green-500 → gray-500
  '#16a34a': APPROVED_PALETTE['text-secondary'], // green-600 → gray-600
  '#15803d': APPROVED_PALETTE['text-primary'],   // green-700 → gray-800
  '#166534': APPROVED_PALETTE['text-primary'],   // green-800 → gray-800
  '#bbf7d0': APPROVED_PALETTE['bg-lighter'],    // green-200 → gray-100
  '#dcfce7': APPROVED_PALETTE['bg-light'],      // green-50 → gray-50

  // Rojo → Gris
  '#f87171': APPROVED_PALETTE['text-tertiary'], // red-400 → gray-500
  '#ef4444': APPROVED_PALETTE['text-secondary'], // red-500 → gray-600
  '#dc2626': APPROVED_PALETTE['text-primary'],   // red-600 → gray-800
  '#991b1b': APPROVED_PALETTE['text-primary'],   // red-800 → gray-800
  '#fecaca': APPROVED_PALETTE['bg-lighter'],    // red-200 → gray-100
  '#fee2e2': APPROVED_PALETTE['bg-light'],      // red-50 → gray-50

  // Púrpura → Gris
  '#a855f7': APPROVED_PALETTE['text-tertiary'], // purple-500 → gray-500
  '#9333ea': APPROVED_PALETTE['text-secondary'], // purple-600 → gray-600
  '#7e22ce': APPROVED_PALETTE['text-primary'],   // purple-700 → gray-800
  '#f3e8ff': APPROVED_PALETTE['bg-light'],      // purple-50 → gray-50

  // Rosa → Gris
  '#ec4899': APPROVED_PALETTE['text-tertiary'], // pink-500 → gray-500
  '#db2777': APPROVED_PALETTE['text-secondary'], // pink-600 → gray-600
  '#fce7f3': APPROVED_PALETTE['bg-light'],      // pink-50 → gray-50
};

async function normalizeColors(content: string): Promise<{ content: string, changes: number }> {
  let normalized = content;
  let changes = 0;

  // Reemplazar cada color brillante por su equivalente neutral
  for (const [brightColor, neutralColor] of Object.entries(COLOR_REPLACEMENTS)) {
    const regex = new RegExp(brightColor.replace('#', '\\#'), 'gi');
    const matches = normalized.match(regex);
    if (matches) {
      normalized = normalized.replace(regex, neutralColor);
      changes += matches.length;
    }
  }

  return { content: normalized, changes };
}

async function main() {
  console.log('🎨 Normalizando colores del blog a paleta neutral\n');
  console.log('=' .repeat(70));
  console.log('\n📋 PALETA APROBADA:');
  console.log('   Textos: #1f2937, #4b5563, #6b7280, #9ca3af');
  console.log('   Backgrounds: #f9fafb, #f3f4f6');
  console.log('   Borders: #e5e7eb, #d1d5db');
  console.log('   Accent (enlaces): #6366f1');
  console.log('\n' + '='.repeat(70) + '\n');

  // Artículos específicos a corregir
  const articlesToFix = [
    'primer-mes-anfitrion-airbnb',
    'vut-madrid-2025-requisitos-normativa-checklist',
    'operaciones-check-in-sin-estres'
  ];

  let totalChanges = 0;
  let articlesFixed = 0;

  for (const slug of articlesToFix) {
    const article = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!article) {
      console.log(`❌ Artículo no encontrado: ${slug}\n`);
      continue;
    }

    console.log(`📄 ${article.title}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Longitud: ${article.content.length} caracteres`);

    const { content: normalizedContent, changes } = await normalizeColors(article.content);

    if (changes > 0) {
      await prisma.blogPost.update({
        where: { slug },
        data: {
          content: normalizedContent,
          updatedAt: new Date()
        }
      });

      console.log(`   ✅ ${changes} colores normalizados`);
      totalChanges += changes;
      articlesFixed++;
    } else {
      console.log(`   ℹ️  Sin colores brillantes`);
    }

    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Artículos corregidos: ${articlesFixed}`);
  console.log(`   🎨 Colores normalizados: ${totalChanges}`);
  console.log(`   📝 Total artículos revisados: ${articlesToFix.length}`);
  console.log('\n✨ ¡Normalización completada!\n');
  console.log('💡 Paleta neutral aplicada consistentemente en todo el blog.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
