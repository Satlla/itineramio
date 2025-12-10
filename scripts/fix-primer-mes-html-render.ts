import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para convertir clases Tailwind a estilos inline
function convertTailwindToInline(html: string): string {
  let converted = html;
  let conversionCount = 0;

  // Mapeo completo de clases Tailwind a estilos inline
  const conversions = [
    // FONDOS Y COLORES
    { regex: /class="([^"]*\b)bg-gradient-to-r from-indigo-50 to-purple-50([^"]*)"/g,
      replacement: 'style="background: linear-gradient(to right, #eef2ff, #faf5ff);$2"',
      name: 'bg-gradient' },
    { regex: /class="([^"]*\b)bg-amber-50([^"]*)"/g,
      replacement: 'style="background-color: #fffbeb;$2"',
      name: 'bg-amber-50' },
    { regex: /class="([^"]*\b)bg-gray-50([^"]*)"/g,
      replacement: 'style="background-color: #f9fafb;$2"',
      name: 'bg-gray-50' },
    { regex: /class="([^"]*\b)bg-blue-50([^"]*)"/g,
      replacement: 'style="background-color: #eff6ff;$2"',
      name: 'bg-blue-50' },
    { regex: /class="([^"]*\b)bg-green-50([^"]*)"/g,
      replacement: 'style="background-color: #f0fdf4;$2"',
      name: 'bg-green-50' },
    { regex: /class="([^"]*\b)bg-indigo-50([^"]*)"/g,
      replacement: 'style="background-color: #eef2ff;$2"',
      name: 'bg-indigo-50' },
    { regex: /class="([^"]*\b)bg-white([^"]*)"/g,
      replacement: 'style="background-color: #ffffff;$2"',
      name: 'bg-white' },

    // BORDES
    { regex: /class="([^"]*\b)border-l-4 border-amber-400([^"]*)"/g,
      replacement: 'style="border-left: 4px solid #fbbf24;$2"',
      name: 'border-l-amber' },
    { regex: /class="([^"]*\b)border-l-4 border-blue-500([^"]*)"/g,
      replacement: 'style="border-left: 4px solid #3b82f6;$2"',
      name: 'border-l-blue' },
    { regex: /class="([^"]*\b)border-l-4 border-green-500([^"]*)"/g,
      replacement: 'style="border-left: 4px solid #22c55e;$2"',
      name: 'border-l-green' },
    { regex: /class="([^"]*\b)border-l-4 border-indigo-500([^"]*)"/g,
      replacement: 'style="border-left: 4px solid #6366f1;$2"',
      name: 'border-l-indigo' },
    { regex: /class="([^"]*\b)border border-indigo-100([^"]*)"/g,
      replacement: 'style="border: 1px solid #e0e7ff;$2"',
      name: 'border-indigo' },
    { regex: /class="([^"]*\b)border-b-2 border-indigo-200([^"]*)"/g,
      replacement: 'style="border-bottom: 2px solid #c7d2fe;$2"',
      name: 'border-b-indigo' },

    // BORDER RADIUS
    { regex: /class="([^"]*\b)rounded-2xl([^"]*)"/g,
      replacement: 'style="border-radius: 1rem;$2"',
      name: 'rounded-2xl' },
    { regex: /class="([^"]*\b)rounded-xl([^"]*)"/g,
      replacement: 'style="border-radius: 0.75rem;$2"',
      name: 'rounded-xl' },
    { regex: /class="([^"]*\b)rounded-lg([^"]*)"/g,
      replacement: 'style="border-radius: 0.5rem;$2"',
      name: 'rounded-lg' },
    { regex: /class="([^"]*\b)rounded-r-lg([^"]*)"/g,
      replacement: 'style="border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem;$2"',
      name: 'rounded-r-lg' },
    { regex: /class="([^"]*\b)rounded([^-])/g,
      replacement: 'style="border-radius: 0.25rem;$2"',
      name: 'rounded' },

    // PADDING
    { regex: /class="([^"]*\b)p-8([^"]*)"/g,
      replacement: 'style="padding: 2rem;$2"',
      name: 'p-8' },
    { regex: /class="([^"]*\b)p-6([^"]*)"/g,
      replacement: 'style="padding: 1.5rem;$2"',
      name: 'p-6' },
    { regex: /class="([^"]*\b)p-4([^"]*)"/g,
      replacement: 'style="padding: 1rem;$2"',
      name: 'p-4' },
    { regex: /class="([^"]*\b)p-3([^"]*)"/g,
      replacement: 'style="padding: 0.75rem;$2"',
      name: 'p-3' },
    { regex: /class="([^"]*\b)px-4 py-2([^"]*)"/g,
      replacement: 'style="padding: 0.5rem 1rem;$2"',
      name: 'px-4-py-2' },
    { regex: /class="([^"]*\b)px-3 py-2([^"]*)"/g,
      replacement: 'style="padding: 0.5rem 0.75rem;$2"',
      name: 'px-3-py-2' },
    { regex: /class="([^"]*\b)pb-3([^"]*)"/g,
      replacement: 'style="padding-bottom: 0.75rem;$2"',
      name: 'pb-3' },

    // MARGIN
    { regex: /class="([^"]*\b)mb-12([^"]*)"/g,
      replacement: 'style="margin-bottom: 3rem;$2"',
      name: 'mb-12' },
    { regex: /class="([^"]*\b)mb-8([^"]*)"/g,
      replacement: 'style="margin-bottom: 2rem;$2"',
      name: 'mb-8' },
    { regex: /class="([^"]*\b)mb-6([^"]*)"/g,
      replacement: 'style="margin-bottom: 1.5rem;$2"',
      name: 'mb-6' },
    { regex: /class="([^"]*\b)mb-4([^"]*)"/g,
      replacement: 'style="margin-bottom: 1rem;$2"',
      name: 'mb-4' },
    { regex: /class="([^"]*\b)mb-3([^"]*)"/g,
      replacement: 'style="margin-bottom: 0.75rem;$2"',
      name: 'mb-3' },
    { regex: /class="([^"]*\b)mb-2([^"]*)"/g,
      replacement: 'style="margin-bottom: 0.5rem;$2"',
      name: 'mb-2' },
    { regex: /class="([^"]*\b)mt-12([^"]*)"/g,
      replacement: 'style="margin-top: 3rem;$2"',
      name: 'mt-12' },
    { regex: /class="([^"]*\b)mt-8([^"]*)"/g,
      replacement: 'style="margin-top: 2rem;$2"',
      name: 'mt-8' },
    { regex: /class="([^"]*\b)mt-6([^"]*)"/g,
      replacement: 'style="margin-top: 1.5rem;$2"',
      name: 'mt-6' },
    { regex: /class="([^"]*\b)mt-4([^"]*)"/g,
      replacement: 'style="margin-top: 1rem;$2"',
      name: 'mt-4' },
    { regex: /class="([^"]*\b)mt-3([^"]*)"/g,
      replacement: 'style="margin-top: 0.75rem;$2"',
      name: 'mt-3' },
    { regex: /class="([^"]*\b)mt-2([^"]*)"/g,
      replacement: 'style="margin-top: 0.5rem;$2"',
      name: 'mt-2' },
    { regex: /class="([^"]*\b)ml-6([^"]*)"/g,
      replacement: 'style="margin-left: 1.5rem;$2"',
      name: 'ml-6' },
    { regex: /class="([^"]*\b)ml-3([^"]*)"/g,
      replacement: 'style="margin-left: 0.75rem;$2"',
      name: 'ml-3' },
    { regex: /class="([^"]*\b)ml-2([^"]*)"/g,
      replacement: 'style="margin-left: 0.5rem;$2"',
      name: 'ml-2' },

    // TEXTO Y TIPOGRAFÍA
    { regex: /class="([^"]*\b)text-4xl font-bold text-gray-900([^"]*)"/g,
      replacement: 'style="font-size: 2.25rem; font-weight: 700; color: #111827; line-height: 1.1;$2"',
      name: 'text-4xl-bold' },
    { regex: /class="([^"]*\b)text-3xl font-bold text-gray-900([^"]*)"/g,
      replacement: 'style="font-size: 1.875rem; font-weight: 700; color: #111827; line-height: 1.2;$2"',
      name: 'text-3xl-bold' },
    { regex: /class="([^"]*\b)text-2xl font-semibold text-gray-800([^"]*)"/g,
      replacement: 'style="font-size: 1.5rem; font-weight: 600; color: #1f2937; line-height: 1.3;$2"',
      name: 'text-2xl-semibold' },
    { regex: /class="([^"]*\b)text-xl font-semibold text-gray-800([^"]*)"/g,
      replacement: 'style="font-size: 1.25rem; font-weight: 600; color: #1f2937; line-height: 1.4;$2"',
      name: 'text-xl-semibold' },
    { regex: /class="([^"]*\b)text-xl text-gray-700 leading-relaxed([^"]*)"/g,
      replacement: 'style="font-size: 1.25rem; color: #374151; line-height: 1.625;$2"',
      name: 'text-xl-gray' },
    { regex: /class="([^"]*\b)text-lg font-semibold text-amber-800([^"]*)"/g,
      replacement: 'style="font-size: 1.125rem; font-weight: 600; color: #92400e;$2"',
      name: 'text-lg-amber' },
    { regex: /class="([^"]*\b)text-lg font-semibold text-gray-800([^"]*)"/g,
      replacement: 'style="font-size: 1.125rem; font-weight: 600; color: #1f2937;$2"',
      name: 'text-lg-gray' },
    { regex: /class="([^"]*\b)text-sm text-gray-600([^"]*)"/g,
      replacement: 'style="font-size: 0.875rem; color: #4b5563;$2"',
      name: 'text-sm-gray' },
    { regex: /class="([^"]*\b)text-sm text-blue-600([^"]*)"/g,
      replacement: 'style="font-size: 0.875rem; color: #2563eb;$2"',
      name: 'text-sm-blue' },
    { regex: /class="([^"]*\b)text-sm text-indigo-600([^"]*)"/g,
      replacement: 'style="font-size: 0.875rem; color: #4f46e5;$2"',
      name: 'text-sm-indigo' },
    { regex: /class="([^"]*\b)text-amber-700([^"]*)"/g,
      replacement: 'style="color: #b45309;$2"',
      name: 'text-amber-700' },
    { regex: /class="([^"]*\b)text-gray-700([^"]*)"/g,
      replacement: 'style="color: #374151;$2"',
      name: 'text-gray-700' },
    { regex: /class="([^"]*\b)text-gray-600([^"]*)"/g,
      replacement: 'style="color: #4b5563;$2"',
      name: 'text-gray-600' },
    { regex: /class="([^"]*\b)text-indigo-600([^"]*)"/g,
      replacement: 'style="color: #4f46e5;$2"',
      name: 'text-indigo-600' },
    { regex: /class="([^"]*\b)font-semibold text-gray-800([^"]*)"/g,
      replacement: 'style="font-weight: 600; color: #1f2937;$2"',
      name: 'font-semibold-gray' },
    { regex: /class="([^"]*\b)font-semibold([^"]*)"/g,
      replacement: 'style="font-weight: 600;$2"',
      name: 'font-semibold' },
    { regex: /class="([^"]*\b)font-medium([^"]*)"/g,
      replacement: 'style="font-weight: 500;$2"',
      name: 'font-medium' },

    // FLEX Y LAYOUT
    { regex: /class="([^"]*\b)flex items-start([^"]*)"/g,
      replacement: 'style="display: flex; align-items: flex-start;$2"',
      name: 'flex-start' },
    { regex: /class="([^"]*\b)flex items-center([^"]*)"/g,
      replacement: 'style="display: flex; align-items: center;$2"',
      name: 'flex-center' },
    { regex: /class="([^"]*\b)flex-shrink-0([^"]*)"/g,
      replacement: 'style="flex-shrink: 0;$2"',
      name: 'flex-shrink-0' },

    // GRID
    { regex: /class="([^"]*\b)grid grid-cols-1 md:grid-cols-2 gap-4([^"]*)"/g,
      replacement: 'style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;$2"',
      name: 'grid-2-cols' },
    { regex: /class="([^"]*\b)grid grid-cols-1 gap-4([^"]*)"/g,
      replacement: 'style="display: grid; gap: 1rem;$2"',
      name: 'grid-1-col' },

    // UTILIDADES DE ESPACIADO (space-y)
    { regex: /class="([^"]*\b)space-y-6([^"]*)"/g,
      replacement: 'class="space-y-6$2" data-space="1.5rem"',
      name: 'space-y-6' },
    { regex: /class="([^"]*\b)space-y-4([^"]*)"/g,
      replacement: 'class="space-y-4$2" data-space="1rem"',
      name: 'space-y-4' },
    { regex: /class="([^"]*\b)space-y-3([^"]*)"/g,
      replacement: 'class="space-y-3$2" data-space="0.75rem"',
      name: 'space-y-3' },
    { regex: /class="([^"]*\b)space-y-2([^"]*)"/g,
      replacement: 'class="space-y-2$2" data-space="0.5rem"',
      name: 'space-y-2' },
    { regex: /class="([^"]*\b)space-y-1([^"]*)"/g,
      replacement: 'class="space-y-1$2" data-space="0.25rem"',
      name: 'space-y-1' },

    // TAMAÑOS
    { regex: /class="([^"]*\b)h-6 w-6([^"]*)"/g,
      replacement: 'style="height: 1.5rem; width: 1.5rem;$2"',
      name: 'h-w-6' },
    { regex: /class="([^"]*\b)h-5 w-5([^"]*)"/g,
      replacement: 'style="height: 1.25rem; width: 1.25rem;$2"',
      name: 'h-w-5' },

    // LISTAS
    { regex: /class="([^"]*\b)list-disc ml-6 mt-2 space-y-1([^"]*)"/g,
      replacement: 'style="list-style-type: disc; margin-left: 1.5rem; margin-top: 0.5rem;$2" data-space="0.25rem"',
      name: 'list-disc' },

    // PROSE Y OTRAS CLASES COMPLEJAS (remover)
    { regex: /class="prose prose-lg max-w-none"/g,
      replacement: '',
      name: 'prose-remove' },

    // SVG COLORS
    { regex: /class="([^"]*\b)text-amber-400([^"]*)"/g,
      replacement: 'style="color: #fbbf24;$2"',
      name: 'text-amber-400' },
    { regex: /class="([^"]*\b)text-green-500([^"]*)"/g,
      replacement: 'style="color: #22c55e;$2"',
      name: 'text-green-500' },
    { regex: /class="([^"]*\b)text-blue-500([^"]*)"/g,
      replacement: 'style="color: #3b82f6;$2"',
      name: 'text-blue-500' },
    { regex: /class="([^"]*\b)text-indigo-500([^"]*)"/g,
      replacement: 'style="color: #6366f1;$2"',
      name: 'text-indigo-500' },
  ];

  // Aplicar todas las conversiones
  for (const conv of conversions) {
    const before = converted;
    converted = converted.replace(conv.regex, (match, ...groups) => {
      // Contar cuántas veces se hace el reemplazo
      conversionCount++;
      return conv.replacement.replace(/\$(\d+)/g, (m, n) => groups[parseInt(n) - 1] || '');
    });

    if (before !== converted) {
      const count = (before.match(conv.regex) || []).length;
      console.log(`  ✓ Convertido ${count} instancias de "${conv.name}"`);
    }
  }

  // Post-procesamiento: eliminar clases vacías y limpiar
  converted = converted.replace(/class="\s*"/g, '');
  converted = converted.replace(/style="([^"]*)"/g, (match, styles) => {
    // Limpiar estilos duplicados y espacios
    const cleaned = styles.trim().replace(/\s+/g, ' ').replace(/;\s*;/g, ';');
    return cleaned ? `style="${cleaned}"` : '';
  });

  // Manejar space-y: agregar margin-bottom a elementos hijos
  converted = converted.replace(/<div[^>]*data-space="([^"]+)"[^>]*>([\s\S]*?)<\/div>/g, (match, space, content) => {
    // Agregar margin-bottom a los elementos hijos directos (excepto el último)
    const withSpacing = content.replace(/<(div|p|ul|ol|h[1-6]|blockquote)([^>]*)>/g, (m, tag, attrs) => {
      if (attrs.includes('style=')) {
        // Si ya tiene style, agregar margin-bottom
        return m.replace(/style="([^"]*)"/, `style="$1 margin-bottom: ${space};"`);
      } else {
        // Si no tiene style, agregar uno nuevo
        return `<${tag}${attrs} style="margin-bottom: ${space};">`;
      }
    });

    // Remover el contenedor con data-space
    return `<div>${withSpacing}</div>`;
  });

  // Limpiar atributos data-space restantes
  converted = converted.replace(/\s*data-space="[^"]*"/g, '');
  converted = converted.replace(/\s*class="space-y-\d+\s*"/g, '');

  return { html: converted, count: conversionCount };
}

async function main() {
  console.log('🔍 Leyendo artículo actual de la base de datos...\n');

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'primer-mes-anfitrion-airbnb' }
  });

  if (!article) {
    console.error('❌ Artículo no encontrado');
    return;
  }

  console.log('✅ Artículo encontrado');
  console.log('📄 Título:', article.title);
  console.log('📏 Longitud del contenido original:', article.content.length);
  console.log('\n🔄 Convirtiendo clases Tailwind a estilos inline...\n');

  const { html: convertedContent, count } = convertTailwindToInline(article.content);

  console.log(`\n✅ Conversión completada: ${count} conversiones realizadas`);
  console.log('📏 Longitud del contenido convertido:', convertedContent.length);

  console.log('\n💾 Guardando en la base de datos...');

  await prisma.blogPost.update({
    where: { slug: 'primer-mes-anfitrion-airbnb' },
    data: {
      content: convertedContent,
      updatedAt: new Date()
    }
  });

  console.log('✅ Artículo actualizado exitosamente en la base de datos');
  console.log('\n📋 Vista previa del contenido convertido (primeros 2000 caracteres):\n');
  console.log(convertedContent.substring(0, 2000));
  console.log('\n...\n');

  console.log('🎉 ¡Conversión completada! El artículo ahora usa solo estilos inline.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
