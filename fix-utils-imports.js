const fs = require('fs');

const filesToFix = [
  'src/components/ui/Badge.tsx',
  'src/components/ui/Avatar.tsx', 
  'src/components/ui/IconSelector.tsx',
  'src/components/ui/ItineramioLogo.tsx',
  'src/components/ui/Card.tsx'
];

filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace @/lib/utils with ../../lib/utils
    const updated = content.replace(/@\/lib\/utils/g, '../../lib/utils');
    
    if (updated !== content) {
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Done! Now commit and push the changes.');