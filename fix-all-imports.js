const fs = require('fs');
const path = require('path');

const webDir = '/Users/alejandrosatlla/Documents/manualphi/apps/web';

// Function to calculate relative path depth
function calculateRelativePath(filePath, targetPath = 'src/') {
  const fileDir = path.dirname(filePath);
  const depth = fileDir.split('/').length - 1; // -1 because we start from 'app' or 'src'
  return '../'.repeat(depth) + targetPath;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  const fullPath = path.join(webDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;

  // Calculate relative path based on file location
  let relativePath;
  
  if (filePath.startsWith('app/')) {
    // For app directory files
    const depth = filePath.split('/').length - 2; // -2 for 'app' and filename
    relativePath = '../'.repeat(depth) + 'src/';
  } else if (filePath.startsWith('src/')) {
    // For src directory files
    const depth = filePath.split('/').length - 2; // -2 for 'src' and filename
    relativePath = '../'.repeat(depth);
  } else {
    console.log(`Unexpected file path: ${filePath}`);
    return;
  }

  // Common import patterns to replace
  const imports = [
    { from: /@\/lib\//g, to: `${relativePath}lib/` },
    { from: /@\/components\/ui/g, to: `${relativePath}components/ui` },
    { from: /@\/components\/layout/g, to: `${relativePath}components/layout` },
    { from: /@\/providers/g, to: `${relativePath}providers` },
    { from: /@\/hooks/g, to: `${relativePath}hooks` },
    { from: /@\/data/g, to: `${relativePath}data` },
    { from: /@\/types/g, to: `${relativePath}types` },
    { from: /@\/i18n/g, to: `${relativePath}i18n` },
    { from: /@\/utils/g, to: `${relativePath}utils` }
  ];

  // Apply replacements
  imports.forEach(({ from, to }) => {
    if (content.match(from)) {
      content = content.replace(from, to);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
  }
}

// List of files that need fixing (from the search results)
const filesToFix = [
  // App pages
  'app/layout.tsx',
  'app/(legal)/cookies/page.tsx',
  'app/(legal)/terms/page.tsx', 
  'app/(legal)/privacy/page.tsx',
  'app/(dashboard)/properties/page.tsx',
  'app/(dashboard)/properties/[id]/page.tsx',
  'app/(dashboard)/properties/[id]/steps/page.tsx',
  'app/(dashboard)/properties/[id]/zones/page.tsx',
  'app/(dashboard)/properties/[id]/zones/new/page.tsx',
  'app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx',
  'app/(dashboard)/properties/[id]/zones/[zoneId]/steps/page.tsx',
  'app/(dashboard)/properties/[id]/zones/[zoneId]/steps/new/page.tsx',
  'app/(dashboard)/property-sets/new/page.tsx',
  'app/(public)/guide/[propertyId]/page.tsx',
  'app/(public)/guide/[propertyId]/[zoneId]/page.tsx',
  
  // Source components
  'src/components/layout/SideMenu.tsx',
  'src/components/layout/DashboardFooter.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/ui/Input.tsx',
  'src/components/ui/LanguageSwitcher.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/ui/Avatar.tsx',
  'src/components/ui/IconSelector.tsx',
  'src/components/ui/ItineramioLogo.tsx',
  'src/components/ui/QRCodeDisplay.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/ZoneTemplateSelectorNew.tsx',
  'src/providers/I18nProvider.tsx',
  'src/data/zoneIcons.tsx',
  'src/lib/icons.ts',
  
  // API routes (just a few key ones to start)
  'app/api/auth/login/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/auth/verify-email/route.ts',
  'app/api/properties/route.ts',
  'app/api/properties/[id]/route.ts'
];

console.log('Starting import fixing process...\n');

filesToFix.forEach(filePath => {
  fixImportsInFile(filePath);
});

console.log('\n🎉 Import fixing complete!');