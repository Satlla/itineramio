const fs = require('fs');
const path = require('path');

function calculateRelativePath(filePath) {
  // Remove the base directory and file name to get the directory depth
  const relativePath = filePath.replace('/Users/alejandrosatlla/Documents/manualphi/apps/web/', '');
  const depth = relativePath.split('/').length - 1;
  
  // Determine if file is in app or src directory
  if (relativePath.startsWith('app/')) {
    // For app directory, we need to go up to reach src
    return '../'.repeat(depth) + 'src/';
  } else if (relativePath.startsWith('src/')) {
    // For src directory, we need to calculate relative path within src
    const srcDepth = relativePath.replace('src/', '').split('/').length - 1;
    return '../'.repeat(srcDepth);
  }
  return './';
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    const relativePath = calculateRelativePath(filePath);
    
    // Replace all @/ imports with relative paths
    const patterns = [
      { pattern: /@\/lib\//g, replacement: `${relativePath}lib/` },
      { pattern: /@\/components\//g, replacement: `${relativePath}components/` },
      { pattern: /@\/providers\//g, replacement: `${relativePath}providers/` },
      { pattern: /@\/hooks\//g, replacement: `${relativePath}hooks/` },
      { pattern: /@\/data\//g, replacement: `${relativePath}data/` },
      { pattern: /@\/types\//g, replacement: `${relativePath}types/` },
      { pattern: /@\/i18n\//g, replacement: `${relativePath}i18n/` },
      { pattern: /@\/utils\//g, replacement: `${relativePath}utils/` }
    ];
    
    patterns.forEach(({ pattern, replacement }) => {
      if (content.match(pattern)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath.replace('/Users/alejandrosatlla/Documents/manualphi/apps/web/', '')}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// List of files that need fixing (from grep results)
const filesToFix = [
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/layout.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/[id]/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/[id]/steps/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/[id]/zones/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/[id]/zones/new/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/[id]/zones/[zoneId]/steps/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/properties/[id]/zones/[zoneId]/steps/new/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(dashboard)/property-sets/new/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(legal)/cookies/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(legal)/terms/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(legal)/privacy/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(public)/guide/[propertyId]/page.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/(public)/guide/[propertyId]/[zoneId]/page.tsx',
  // API routes
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/auth/login/route.ts',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/auth/register/route.ts',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/auth/me/route.ts',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/auth/verify-email/route.ts',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/account/update/route.ts',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/account/delete/route.ts',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/properties/route.ts',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/app/api/properties/[id]/route.ts',
  // Source files
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/src/components/ErrorBoundary.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/src/providers/I18nProvider.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/src/components/layout/SideMenu.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/src/components/layout/DashboardFooter.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/src/components/layout/Footer.tsx',
  '/Users/alejandrosatlla/Documents/manualphi/apps/web/src/components/layout/Navbar.tsx'
];

console.log('🔧 Starting to fix imports...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  if (fixImportsInFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✨ Fixed ${fixedCount} files!`);
console.log('\n📝 Now commit and push these changes:');
console.log('git add -A');
console.log('git commit -m "Fix all @ imports to relative paths"');
console.log('git push');