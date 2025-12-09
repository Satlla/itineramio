import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
    }
  }
});

// Formatting functions
function formatImportantLists(content: string): string {
  // Pattern: Lists with checkmarks that should be highlighted
  // Convert plain lists with checkmarks to gray background boxes
  const checkmarkListRegex = /<ul[^>]*>([\s\S]*?✅[\s\S]*?)<\/ul>/gi;
  
  return content.replace(checkmarkListRegex, (match) => {
    // Check if already has background styling
    if (match.includes('background-color: #f9fafb') || match.includes('background: #f9fafb')) {
      return match;
    }
    
    // Add gray background styling
    const styledUl = match.replace(
      /<ul[^>]*>/i,
      '<ul style="background-color: #f9fafb; border-radius: 8px; padding: 2rem; margin: 1.5rem 0; line-height: 1.8;">'
    );
    
    // Style list items
    return styledUl.replace(/<li>/gi, '<li style="margin-bottom: 0.75rem; padding-left: 0.5rem;">');
  });
}

function formatActionBoxes(content: string): string {
  // Pattern: Divs with tips, pro tips, quick wins - enhance with better colors
  
  // Convert existing tip boxes to violet style
  content = content.replace(
    /<div[^>]*style="[^"]*background[^"]*blue[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    (match) => {
      if (match.includes('8b5cf6')) return match; // Already formatted
      return match.replace(
        /style="[^"]*"/i,
        'style="background-color: #faf5ff; border-left: 4px solid #8b5cf6; border-radius: 8px; padding: 2rem; margin: 2rem 0;"'
      );
    }
  );
  
  // Format warning/tip boxes with orange
  content = content.replace(
    /<div[^>]*style="[^"]*background[^"]*yellow[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    (match) => {
      if (match.includes('f59e0b')) return match; // Already formatted
      return match.replace(
        /style="[^"]*"/i,
        'style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;"'
      );
    }
  );
  
  return content;
}

function formatErrors(content: string): string {
  // Pattern: Error sections, mistakes to avoid
  const errorPatterns = [
    /(<h[23]>)(❌|⚠️|ERROR|Errores?|Mistakes?)([^<]*<\/h[23]>)([\s\S]*?)(?=<h[23]|$)/gi
  ];
  
  errorPatterns.forEach(pattern => {
    content = content.replace(pattern, (match, h2Open, emoji, h2Rest, followingContent) => {
      // Don't re-format if already in a red box
      if (match.includes('background-color: #fee2e2')) {
        return match;
      }
      
      // Wrap in red box
      const limitedContent = followingContent.substring(0, 1500); // Limit to avoid over-capturing
      const nextHeading = limitedContent.match(/<h[23]>/);
      const contentToWrap = nextHeading ? 
        followingContent.substring(0, nextHeading.index) : 
        limitedContent;
      
      return `<div style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
  ${h2Open}${emoji}${h2Rest}
  ${contentToWrap.trim()}
</div>` + followingContent.substring(contentToWrap.length);
    });
  });
  
  return content;
}

function formatConclusions(content: string): string {
  // Pattern: Conclusion sections with checkmarks
  const conclusionRegex = /(<h[23]>)(Conclusión|Resumen|En Resumen|Key Takeaways)([^<]*<\/h[23]>)([\s\S]*?)(?=<h[23]|<div style="background: linear-gradient|$)/gi;
  
  return content.replace(conclusionRegex, (match, h2Open, title, h2Rest, followingContent) => {
    // Don't re-format if already in a green box
    if (match.includes('background-color: #d1fae5')) {
      return match;
    }
    
    // Find the content until next heading or CTA
    const nextHeading = followingContent.match(/<h[23]>/);
    const contentToWrap = nextHeading ? 
      followingContent.substring(0, nextHeading.index) : 
      followingContent.substring(0, 800); // Limit
    
    // Convert list items to checkmark format
    let wrappedContent = contentToWrap.replace(/<li[^>]*>/gi, '<li style="margin-bottom: 1rem; font-size: 1.1rem; list-style: none;">✅ ');
    
    return `<div style="background-color: #d1fae5; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
  ${h2Open.replace(/>/,'style="margin-top: 0; color: #059669;">')}${title}${h2Rest}
  ${wrappedContent.trim()}
</div>` + followingContent.substring(contentToWrap.length);
  });
}

function formatCTAs(content: string): string {
  // Pattern: Final CTAs - convert to gradient violet boxes
  // Look for sections near the end with CTA language
  const ctaPatterns = [
    /(<h[23]>[^<]*(?:Comienza|Empieza|Prueba|Descubre|Automatiza|Optimiza)[^<]*<\/h[23]>[\s\S]{0,500}?)(?=<h[23]|$)/gi
  ];
  
  ctaPatterns.forEach(pattern => {
    content = content.replace(pattern, (match) => {
      // Don't re-format if already has gradient
      if (match.includes('linear-gradient')) {
        return match;
      }
      
      // Check if this is near the end (last 20% of content)
      const matchIndex = content.indexOf(match);
      const isNearEnd = matchIndex > content.length * 0.7;
      
      if (!isNearEnd) {
        return match;
      }
      
      // Extract heading and content
      const headingMatch = match.match(/<h[23]>([^<]*)<\/h[23]>/);
      const heading = headingMatch ? headingMatch[1] : '';
      const remainingContent = match.replace(/<h[23]>[^<]*<\/h[23]>/, '');
      
      return `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 3rem; margin: 3rem 0; text-align: center; color: white;">
  <h3 style="color: white; font-size: 28px; margin-top: 0;">${heading}</h3>
  ${remainingContent.replace(/<p[^>]*>/gi, '<p style="font-size: 18px; color: white; margin: 1rem 0;">').replace(/<strong>/gi, '<strong style="color: white;">')}
</div>`;
    });
  });
  
  return content;
}

function formatTables(content: string): string {
  // Enhance existing tables with better styling
  return content.replace(/<table(?![^>]*style=)/gi, 
    '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">')
    .replace(/<th(?![^>]*style=)/gi, 
      '<th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb; background-color: #f3f4f6;">')
    .replace(/<td(?![^>]*style=)/gi, 
      '<td style="padding: 0.75rem; border: 1px solid #e5e7eb;">');
}

async function formatArticle(articleId: string, slug: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Processing: ${slug} (${articleId})`);
  console.log('='.repeat(80));
  
  const article = await prisma.blogPost.findUnique({
    where: { id: articleId }
  });
  
  if (!article) {
    console.log(`❌ Article not found: ${articleId}`);
    return { success: false, slug, error: 'Not found' };
  }
  
  console.log(`✓ Article found: ${article.title}`);
  console.log(`  Original content length: ${article.content.length} chars`);
  
  let content = article.content;
  const originalLength = content.length;
  
  // Apply formatting functions
  console.log('\n  Applying formatting:');
  
  console.log('    - Formatting important lists...');
  content = formatImportantLists(content);
  
  console.log('    - Formatting action boxes...');
  content = formatActionBoxes(content);
  
  console.log('    - Formatting error sections...');
  content = formatErrors(content);
  
  console.log('    - Formatting conclusions...');
  content = formatConclusions(content);
  
  console.log('    - Formatting CTAs...');
  content = formatCTAs(content);
  
  console.log('    - Formatting tables...');
  content = formatTables(content);
  
  const changes = content.length - originalLength;
  console.log(`\n  Final content length: ${content.length} chars (${changes > 0 ? '+' : ''}${changes})`);
  
  // Update the article
  try {
    await prisma.blogPost.update({
      where: { id: articleId },
      data: { content, updatedAt: new Date() }
    });
    console.log('  ✅ Article updated successfully');
    return { success: true, slug, changes };
  } catch (error) {
    console.log(`  ❌ Error updating article: ${error}`);
    return { success: false, slug, error: String(error) };
  }
}

async function main() {
  console.log('📝 FORMATTING BLOG ARTICLES - BATCH 1 (Articles 1-6)');
  console.log('='.repeat(80));
  
  const batch1 = [
    { id: 'cmiq5kw7k00017co5t5ynrc30', slug: 'mensajes-automaticos-booking' },
    { id: 'cmiq5kvi900007co5soytmb7p', slug: 'mensajes-automaticos-airbnb' },
    { id: 'cmi4dw5yi00007cfx4hlferv3', slug: 'metodologia-datos-itineramio' },
    { id: 'cmi3galw200027c2wcah8qrhw', slug: 'caso-laura' },
    { id: 'cmi3galjk00017c2wh9s25tvo', slug: 'del-modo-bombero-al-modo-ceo' },
    { id: 'cmi3g0f0u00007cwd9dxmw4tw', slug: 'revpar-vs-ocupacion' },
  ];
  
  const results = [];
  
  for (const article of batch1) {
    const result = await formatArticle(article.id, article.slug);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('BATCH 1 SUMMARY');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Successfully formatted: ${successful}/${batch1.length}`);
  console.log(`❌ Failed: ${failed}/${batch1.length}`);
  
  if (failed > 0) {
    console.log('\nFailed articles:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.slug}: ${r.error}`);
    });
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
