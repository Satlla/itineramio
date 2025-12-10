import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función mejorada para convertir clases Tailwind a estilos inline
function convertTailwindToInline(html: string): string {
  let converted = html;
  let conversionCount = 0;

  // Mapeo de clases individuales a estilos CSS
  const classToStyleMap: { [key: string]: string } = {
    // Fondos
    'bg-gradient-to-r': '',
    'from-indigo-50': '',
    'to-purple-50': '',
    'bg-amber-50': 'background-color: #fffbeb;',
    'bg-gray-50': 'background-color: #f9fafb;',
    'bg-blue-50': 'background-color: #eff6ff;',
    'bg-green-50': 'background-color: #f0fdf4;',
    'bg-indigo-50': 'background-color: #eef2ff;',
    'bg-white': 'background-color: #ffffff;',

    // Bordes
    'border': 'border: 1px solid;',
    'border-l-4': 'border-left: 4px solid;',
    'border-b-2': 'border-bottom: 2px solid;',
    'border-amber-400': 'border-color: #fbbf24;',
    'border-blue-500': 'border-color: #3b82f6;',
    'border-green-500': 'border-color: #22c55e;',
    'border-indigo-100': 'border-color: #e0e7ff;',
    'border-indigo-200': 'border-color: #c7d2fe;',
    'border-indigo-500': 'border-color: #6366f1;',

    // Border radius
    'rounded': 'border-radius: 0.375rem;',
    'rounded-lg': 'border-radius: 0.5rem;',
    'rounded-xl': 'border-radius: 0.75rem;',
    'rounded-2xl': 'border-radius: 1rem;',
    'rounded-r-lg': 'border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem;',

    // Padding
    'p-3': 'padding: 0.75rem;',
    'p-4': 'padding: 1rem;',
    'p-6': 'padding: 1.5rem;',
    'p-8': 'padding: 2rem;',
    'px-3': 'padding-left: 0.75rem; padding-right: 0.75rem;',
    'px-4': 'padding-left: 1rem; padding-right: 1rem;',
    'py-2': 'padding-top: 0.5rem; padding-bottom: 0.5rem;',
    'pb-3': 'padding-bottom: 0.75rem;',

    // Margin
    'mb-2': 'margin-bottom: 0.5rem;',
    'mb-3': 'margin-bottom: 0.75rem;',
    'mb-4': 'margin-bottom: 1rem;',
    'mb-6': 'margin-bottom: 1.5rem;',
    'mb-8': 'margin-bottom: 2rem;',
    'mb-12': 'margin-bottom: 3rem;',
    'mt-2': 'margin-top: 0.5rem;',
    'mt-3': 'margin-top: 0.75rem;',
    'mt-4': 'margin-top: 1rem;',
    'mt-6': 'margin-top: 1.5rem;',
    'mt-8': 'margin-top: 2rem;',
    'mt-12': 'margin-top: 3rem;',
    'ml-2': 'margin-left: 0.5rem;',
    'ml-3': 'margin-left: 0.75rem;',
    'ml-6': 'margin-left: 1.5rem;',

    // Texto
    'text-4xl': 'font-size: 2.25rem; line-height: 2.5rem;',
    'text-3xl': 'font-size: 1.875rem; line-height: 2.25rem;',
    'text-2xl': 'font-size: 1.5rem; line-height: 2rem;',
    'text-xl': 'font-size: 1.25rem; line-height: 1.75rem;',
    'text-lg': 'font-size: 1.125rem; line-height: 1.75rem;',
    'text-sm': 'font-size: 0.875rem; line-height: 1.25rem;',
    'text-xs': 'font-size: 0.75rem; line-height: 1rem;',
    'font-bold': 'font-weight: 700;',
    'font-semibold': 'font-weight: 600;',
    'font-medium': 'font-weight: 500;',
    'text-gray-900': 'color: #111827;',
    'text-gray-800': 'color: #1f2937;',
    'text-gray-700': 'color: #374151;',
    'text-gray-600': 'color: #4b5563;',
    'text-amber-700': 'color: #b45309;',
    'text-amber-800': 'color: #92400e;',
    'text-amber-400': 'color: #fbbf24;',
    'text-blue-600': 'color: #2563eb;',
    'text-blue-500': 'color: #3b82f6;',
    'text-green-500': 'color: #22c55e;',
    'text-indigo-600': 'color: #4f46e5;',
    'text-indigo-500': 'color: #6366f1;',
    'leading-relaxed': 'line-height: 1.625;',

    // Layout
    'flex': 'display: flex;',
    'items-start': 'align-items: flex-start;',
    'items-center': 'align-items: center;',
    'flex-shrink-0': 'flex-shrink: 0;',
    'grid': 'display: grid;',
    'grid-cols-1': 'grid-template-columns: repeat(1, minmax(0, 1fr));',
    'grid-cols-2': 'grid-template-columns: repeat(2, minmax(0, 1fr));',
    'gap-4': 'gap: 1rem;',

    // Tamaños
    'h-5': 'height: 1.25rem;',
    'h-6': 'height: 1.5rem;',
    'w-5': 'width: 1.25rem;',
    'w-6': 'width: 1.5rem;',

    // Listas
    'list-disc': 'list-style-type: disc;',

    // Clases a ignorar
    'prose': '',
    'prose-lg': '',
    'max-w-none': '',
    'space-y-1': '',
    'space-y-2': '',
    'space-y-3': '',
    'space-y-4': '',
    'space-y-6': '',
    'md:grid-cols-2': '', // responsive, se ignora
  };

  // Función para procesar cada elemento con clase
  converted = converted.replace(/class="([^"]*)"/g, (match, classes) => {
    const classList = classes.trim().split(/\s+/).filter((c: string) => c);

    if (classList.length === 0) {
      return '';
    }

    const styles: string[] = [];
    const remainingClasses: string[] = [];

    // Detectar gradientes especiales
    if (classList.includes('bg-gradient-to-r') &&
        classList.includes('from-indigo-50') &&
        classList.includes('to-purple-50')) {
      styles.push('background: linear-gradient(to right, #eef2ff, #faf5ff);');
      conversionCount += 3;
    } else {
      // Procesar cada clase individualmente
      for (const cls of classList) {
        if (cls in classToStyleMap) {
          const style = classToStyleMap[cls];
          if (style) {
            styles.push(style);
          }
          conversionCount++;
        } else {
          // Clase no reconocida, mantenerla
          remainingClasses.push(cls);
        }
      }
    }

    // Construir resultado
    const parts: string[] = [];

    if (styles.length > 0) {
      const styleStr = styles.join(' ').trim();
      parts.push(`style="${styleStr}"`);
    }

    if (remainingClasses.length > 0) {
      parts.push(`class="${remainingClasses.join(' ')}"`);
    }

    return parts.join(' ');
  });

  // Post-procesamiento: limpiar
  converted = converted.replace(/\s+style=""/g, '');
  converted = converted.replace(/\s+class=""/g, '');
  converted = converted.replace(/\s{2,}/g, ' ');

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

  console.log(`\n✅ Conversión completada: ${count} clases Tailwind convertidas a estilos inline`);
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
