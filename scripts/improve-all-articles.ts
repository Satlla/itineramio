import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const articlesToProcess = [
  'cmiq5kw7k00017co5t5ynrc30',
  'cmiq5kvi900007co5soytmb7p',
  'cmi4dw5yi00007cfx4hlferv3',
  'cmi3galw200027c2wcah8qrhw',
  'cmi3galjk00017c2wh9s25tvo',
  'cmi3g0f0u00007cwd9dxmw4tw',
  'cmhi1q60500007cgbn21jv7re',
  'cmhe1ga4s00017cqean8wlpjy',
  'cmhe1g9s200007cqejf99s962',
  'cmhe19f5600017che6hy2p6yd',
  'cmhe19erk00007chedbhrdb33',
  'cmhe0v7fg00007c6j56v6gyzy',
  'cmhdywg9500057cm2ik2mftj9',
  'cmhdywfym00047cm2l8j6nizb',
  'cmhdywfny00037cm2tx0suxd6',
  'cmhdywfd500027cm2gfahej8p',
  'cmhdywf2500017cm25c5cwhps',
  'cmhdyweq700007cm243p73ujg'
];

function improveArticleFormatting(content: string): { improved: string; changes: string[] } {
  let improved = content;
  const changes: string[] = [];

  // 1. Mejorar listas sin formato (<ul> y <ol>)
  const improveSimpleLists = (text: string) => {
    return text.replace(
      /<(ul|ol)>(?![\s\S]*?style=)([\s\S]*?)<\/\1>/gi,
      (match, tag, listContent) => {
        changes.push(`Lista ${tag.toUpperCase()} mejorada con background gris`);
        const styledItems = listContent.replace(
          /<li>/g,
          '<li style="margin-bottom: 0.75rem;">'
        );
        return `<${tag} style="background-color: #f9fafb; padding: 2rem; border-radius: 8px; margin: 1.5rem 0;">${styledItems}</${tag}>`;
      }
    );
  };

  improved = improveSimpleLists(improved);

  // 2. Mejorar tablas
  const improveTables = (text: string) => {
    return text.replace(
      /<table(?![^>]*style=)[\s\S]*?<\/table>/gi,
      (match) => {
        if (!match.includes('border-collapse')) {
          changes.push('Tabla mejorada con estilos profesionales');
          return match
            .replace(
              /<table/,
              '<table style="width: 100%; border-collapse: collapse; margin: 2rem 0;"'
            )
            .replace(
              /<thead>/g,
              '<thead style="background-color: #8b5cf6;">'
            )
            .replace(
              /<th(?![^>]*style=)/g,
              '<th style="padding: 1rem; text-align: left; border: 1px solid #ddd; color: white; font-weight: 600;"'
            )
            .replace(
              /<td(?![^>]*style=)/g,
              '<td style="padding: 1rem; border: 1px solid #ddd;"'
            )
            .replace(
              /<tr(?![^>]*style=)/g,
              '<tr style="transition: background-color 0.2s;"'
            );
        }
        return match;
      }
    );
  };

  improved = improveTables(improved);

  // 3. Mejorar secciones de conclusión/resumen con checkmarks
  const improveConclusions = (text: string) => {
    return text.replace(
      /(<h2[^>]*>(?:Conclusión|Resumen|Conclusiones)[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2|$)/gi,
      (match, header, content) => {
        if (content.includes('<ul>') && !content.includes('#f0fdf4')) {
          changes.push('Conclusión mejorada con checkmarks verdes');
          const improvedContent = content.replace(
            /<ul>/,
            '<ul style="background-color: #f0fdf4; padding: 2rem; border-radius: 8px; list-style: none; margin: 1.5rem 0;">'
          ).replace(
            /<li>/g,
            '<li style="margin-bottom: 1rem; padding-left: 2.5rem; position: relative;"><span style="position: absolute; left: 0; color: #16a34a; font-size: 1.5rem; font-weight: bold;">✓</span>'
          );
          return header + improvedContent;
        }
        return match;
      }
    );
  };

  improved = improveConclusions(improved);

  // 4. Mejorar cajas de tips/consejos (buscar emojis seguidos de strong)
  const improveTips = (text: string) => {
    return text.replace(
      /<p>(💡|🔑|⚡|🎯|✨|⚠️|📌)\s*<strong>(.*?)<\/strong>([\s\S]*?)<\/p>/gi,
      (match, emoji, title, content) => {
        if (!match.includes('border-left')) {
          const color = emoji === '💡' ? '#8b5cf6' : emoji === '🔑' ? '#3b82f6' : emoji === '⚡' ? '#f59e0b' : emoji === '⚠️' ? '#ef4444' : '#8b5cf6';
          const bgColor = emoji === '💡' ? '#f3e8ff' : emoji === '🔑' ? '#eff6ff' : emoji === '⚡' ? '#fff7ed' : emoji === '⚠️' ? '#fef2f2' : '#f3e8ff';
          changes.push(`Tip/Consejo mejorado con caja de color`);
          return `<div style="background-color: ${bgColor}; border-left: 4px solid ${color}; padding: 1.5rem; margin: 1.5rem 0; border-radius: 4px;"><p style="margin: 0;"><span style="font-size: 1.5rem;">${emoji}</span> <strong>${title}</strong>${content}</p></div>`;
        }
        return match;
      }
    );
  };

  improved = improveTips(improved);

  // 5. Mejorar CTAs con gradiente (buscar secciones con "prueba gratis", "empieza ahora", etc.)
  const improveCTAs = (text: string) => {
    return text.replace(
      /(<h2[^>]*>(?:.*?(?:Empieza|Prueba|Comienza|Regístrate|¿Listo|Comienza a).*?)<\/h2>)([\s\S]*?)(?=<h2|$)/gi,
      (match, header, content) => {
        if (!content.includes('linear-gradient') && (content.includes('gratis') || content.includes('ahora') || content.includes('hoy'))) {
          changes.push('CTA mejorado con gradiente violeta');
          return `<div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 3rem; border-radius: 12px; margin: 3rem 0; color: white;">${header.replace(/<h2/, '<h2 style="color: white; margin-top: 0;"')}${content}</div>`;
        }
        return match;
      }
    );
  };

  improved = improveCTAs(improved);

  // 6. Mejorar secciones de errores/problemas comunes
  const improveErrorSections = (text: string) => {
    return text.replace(
      /(<h3[^>]*>(?:.*?(?:Error|Problema|Consecuencia|Evita).*?)<\/h3>)([\s\S]*?)(?=<h3|<h2|$)/gi,
      (match, header, content) => {
        if (!match.includes('background-color: #fef2f2')) {
          const isError = /Error|Problema|Consecuencia|Evita/i.test(header);
          if (isError) {
            changes.push('Sección de error mejorada con fondo rojo');
            return `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 1.5rem 0; border-radius: 4px;">${header}${content}</div>`;
          }
        }
        return match;
      }
    );
  };

  improved = improveErrorSections(improved);

  // 7. Mejorar secciones de beneficios/ventajas
  const improveBenefitSections = (text: string) => {
    return text.replace(
      /(<h3[^>]*>(?:.*?(?:Beneficio|Ventaja|Resultado).*?)<\/h3>)([\s\S]*?)(?=<h3|<h2|$)/gi,
      (match, header, content) => {
        if (!match.includes('background-color: #f0fdf4')) {
          changes.push('Sección de beneficio mejorada con fondo verde');
          return `<div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 1.5rem; margin: 1.5rem 0; border-radius: 4px;">${header}${content}</div>`;
        }
        return match;
      }
    );
  };

  improved = improveBenefitSections(improved);

  return { improved, changes };
}

async function processAllArticles() {
  console.log('🚀 Iniciando mejora de formato en 18 artículos del blog\n');
  console.log('='.repeat(80));

  const results: Array<{
    id: string;
    title: string;
    slug: string;
    changes: string[];
    status: 'improved' | 'no-changes' | 'error';
  }> = [];

  for (let i = 0; i < articlesToProcess.length; i++) {
    const articleId = articlesToProcess[i];
    console.log(`\n[${i + 1}/${articlesToProcess.length}] Procesando artículo...`);

    try {
      const article = await prisma.blogPost.findUnique({
        where: { id: articleId },
        select: { id: true, title: true, slug: true, content: true }
      });

      if (!article) {
        console.log(`❌ Artículo no encontrado: ${articleId}`);
        results.push({
          id: articleId,
          title: 'No encontrado',
          slug: '',
          changes: [],
          status: 'error'
        });
        continue;
      }

      console.log(`📄 ${article.title}`);
      console.log(`   Slug: ${article.slug}`);

      const { improved, changes } = improveArticleFormatting(article.content);

      if (changes.length > 0) {
        await prisma.blogPost.update({
          where: { id: article.id },
          data: { content: improved }
        });

        console.log(`   ✅ MEJORADO (${changes.length} cambios)`);
        changes.forEach(change => console.log(`      • ${change}`));

        results.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          changes,
          status: 'improved'
        });
      } else {
        console.log(`   ⏭️  Sin cambios necesarios (ya tiene buen formato)`);
        results.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          changes: [],
          status: 'no-changes'
        });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      results.push({
        id: articleId,
        title: 'Error',
        slug: '',
        changes: [],
        status: 'error'
      });
    }
  }

  // Resumen final
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RESUMEN FINAL DEL PROCESO');
  console.log('='.repeat(80));

  const improved = results.filter(r => r.status === 'improved');
  const noChanges = results.filter(r => r.status === 'no-changes');
  const errors = results.filter(r => r.status === 'error');

  console.log(`\n✅ Artículos mejorados: ${improved.length}`);
  console.log(`⏭️  Artículos sin cambios: ${noChanges.length}`);
  console.log(`❌ Errores: ${errors.length}`);

  if (improved.length > 0) {
    console.log('\n📋 DETALLE DE ARTÍCULOS MEJORADOS:');
    console.log('─'.repeat(80));
    improved.forEach(({ title, slug, changes }) => {
      console.log(`\n• ${title}`);
      console.log(`  URL: /blog/${slug}`);
      console.log(`  Mejoras aplicadas (${changes.length}):`);
      changes.forEach(change => console.log(`    - ${change}`));
    });
  }

  if (noChanges.length > 0) {
    console.log('\n⏭️  ARTÍCULOS SIN CAMBIOS (ya tienen buen formato):');
    console.log('─'.repeat(80));
    noChanges.forEach(({ title, slug }) => {
      console.log(`  • ${title} (/blog/${slug})`);
    });
  }

  await prisma.$disconnect();
  console.log('\n✨ Proceso completado exitosamente\n');
}

processAllArticles().catch(console.error);
