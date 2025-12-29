const fs = require('fs');
const path = require('path');

const templatesDir = './src/emails/templates';

function extractContent(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract Preview text
  const previewMatch = content.match(/<Preview>([^<]+)<\/Preview>/);
  const preview = previewMatch ? previewMatch[1] : 'N/A';

  // Extract Heading
  const headingMatch = content.match(/<Heading[^>]*>\s*\n?\s*([^<\n]+)/);
  const heading = headingMatch ? headingMatch[1].trim() : 'N/A';

  // Extract all paragraph content between <Text> tags
  const textMatches = content.match(/<Text style=\{paragraph\}>([\s\S]*?)<\/Text>/g) || [];
  const texts = textMatches
    .map(t => t.replace(/<Text style=\{paragraph\}>/g, '').replace(/<\/Text>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(t => t.length > 15);

  // Extract bullet points
  const bulletMatches = content.match(/<Text style=\{listItem\}>([\s\S]*?)<\/Text>/g) || [];
  const bullets = bulletMatches
    .map(t => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(t => t.length > 5);

  // Extract CTA button text
  const ctaMatch = content.match(/<Link[^>]*style=\{button\}[^>]*>\s*([^<]+)/);
  const cta = ctaMatch ? ctaMatch[1].trim() : 'N/A';

  return { preview, heading, texts, bullets, cta };
}

// Group templates by funnel
const funnels = {
  'QR': ['tool-qr-day0', 'tool-qr-day2', 'tool-qr-day4', 'tool-qr-day6', 'tool-qr-day8'],
  'WIFI': ['tool-wifi-day0', 'tool-wifi-day2', 'tool-wifi-day4', 'tool-wifi-day6', 'tool-wifi-day8'],
  'CHECKLIST': ['tool-checklist-day0', 'tool-checklist-day2', 'tool-checklist-day4', 'tool-checklist-day6', 'tool-checklist-day8'],
  'PRICING': ['tool-pricing-day0', 'tool-pricing-day2', 'tool-pricing-day4', 'tool-pricing-day6', 'tool-pricing-day8'],
  'ROI': ['tool-roi-day0', 'tool-roi-day2', 'tool-roi-day4', 'tool-roi-day6', 'tool-roi-day8'],
  'HOUSE-RULES': ['tool-house-rules-day0', 'tool-house-rules-day2', 'tool-house-rules-day4', 'tool-house-rules-day6', 'tool-house-rules-day8'],
  'REVIEWS': ['tool-reviews-day0', 'tool-reviews-day2', 'tool-reviews-day4', 'tool-reviews-day6', 'tool-reviews-day8'],
};

const toolsDir = path.join(templatesDir, 'tools');
const files = fs.readdirSync(toolsDir);

for (const [funnel, prefixes] of Object.entries(funnels)) {
  console.log('\n' + '═'.repeat(70));
  console.log('📧 EMBUDO: ' + funnel);
  console.log('═'.repeat(70));

  for (const prefix of prefixes) {
    const file = files.find(f => f.startsWith(prefix));
    if (!file) {
      console.log('\n❌ ' + prefix + ': TEMPLATE NO ENCONTRADO');
      continue;
    }

    const filePath = path.join(toolsDir, file);
    const { preview, heading, texts, bullets, cta } = extractContent(filePath);
    const day = prefix.split('-').pop().replace('day', 'DÍA ').toUpperCase();

    console.log('\n━━━ ' + day + ' ━━━');
    console.log('📌 Preview: ' + preview);
    console.log('📌 Heading: ' + heading);
    console.log('📌 CTA: ' + cta);

    if (texts.length > 0) {
      console.log('\n📝 Párrafos:');
      texts.slice(0, 5).forEach((t, i) => {
        const truncated = t.length > 120 ? t.substring(0, 120) + '...' : t;
        console.log('   ' + (i+1) + '. ' + truncated);
      });
    }

    if (bullets.length > 0) {
      console.log('\n📋 Bullets:');
      bullets.forEach(b => console.log('   • ' + b));
    }
  }
}
