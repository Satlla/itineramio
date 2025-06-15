#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying project configuration...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: Found`);
    checks.passed++;
    return true;
  } else {
    console.log(`❌ ${description}: Missing`);
    checks.failed++;
    return false;
  }
}

function checkJsonFile(filePath, description, validator) {
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (validator && !validator(content)) {
        console.log(`⚠️  ${description}: Found but has issues`);
        checks.warnings++;
        return false;
      }
      console.log(`✅ ${description}: Valid`);
      checks.passed++;
      return true;
    } catch (e) {
      console.log(`❌ ${description}: Invalid JSON`);
      checks.failed++;
      return false;
    }
  } else {
    console.log(`❌ ${description}: Missing`);
    checks.failed++;
    return false;
  }
}

// Check essential files
console.log('📁 Checking essential files:\n');
checkFile('package.json', 'package.json');
checkFile('tsconfig.json', 'tsconfig.json');
checkFile('next.config.js', 'next.config.js');
checkFile('postcss.config.js', 'postcss.config.js');
checkFile('tailwind.config.js', 'tailwind.config.js');
checkFile('.env.local', '.env.local (or .env)');

// Check package.json dependencies
console.log('\n📦 Checking package.json:\n');
checkJsonFile('package.json', 'package.json structure', (pkg) => {
  let valid = true;
  
  // Check for autoprefixer
  if (!pkg.devDependencies?.autoprefixer && !pkg.dependencies?.autoprefixer) {
    console.log('  ❌ autoprefixer not found in dependencies');
    valid = false;
  } else {
    console.log('  ✅ autoprefixer found');
  }
  
  // Check for postcss
  if (!pkg.devDependencies?.postcss && !pkg.dependencies?.postcss) {
    console.log('  ❌ postcss not found in dependencies');
    valid = false;
  } else {
    console.log('  ✅ postcss found');
  }
  
  // Check for tailwindcss
  if (!pkg.devDependencies?.tailwindcss && !pkg.dependencies?.tailwindcss) {
    console.log('  ❌ tailwindcss not found in dependencies');
    valid = false;
  } else {
    console.log('  ✅ tailwindcss found');
  }
  
  return valid;
});

// Check tsconfig.json
console.log('\n⚙️  Checking tsconfig.json:\n');
checkJsonFile('tsconfig.json', 'tsconfig.json structure', (tsconfig) => {
  if (tsconfig.compilerOptions?.paths?.['@/*']) {
    console.log('  ⚠️  Path aliases (@/*) are configured - may cause issues on Vercel');
    checks.warnings++;
  } else {
    console.log('  ✅ No path aliases configured');
  }
  return true;
});

// Check environment variables
console.log('\n🔐 Checking environment variables:\n');
const envFiles = ['.env', '.env.local', '.env.production'];
let envFound = false;
for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    console.log(`  ✅ Found ${envFile}`);
    envFound = true;
    
    // Check for required variables
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'NEXT_PUBLIC_API_URL'];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        console.log(`  ✅ ${varName} is defined`);
      } else {
        console.log(`  ⚠️  ${varName} might be missing`);
        checks.warnings++;
      }
    });
    break;
  }
}

if (!envFound) {
  console.log('  ❌ No environment file found');
  checks.failed++;
}

// Check Prisma
console.log('\n🗄️  Checking Prisma:\n');
checkFile('prisma/schema.prisma', 'Prisma schema');
if (fs.existsSync('node_modules/.prisma/client')) {
  console.log('✅ Prisma client generated');
  checks.passed++;
} else {
  console.log('⚠️  Prisma client not generated (run: npx prisma generate)');
  checks.warnings++;
}

// Check for common issues
console.log('\n🐛 Checking for common issues:\n');

// Check for @/ imports in source files
let aliasImportsFound = 0;
function checkImports(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      checkImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/from\s+['"]@\//g);
      if (matches) {
        aliasImportsFound += matches.length;
      }
    }
  });
}

checkImports('src');
checkImports('app');

if (aliasImportsFound > 0) {
  console.log(`⚠️  Found ${aliasImportsFound} @/ import(s) - these may cause build issues`);
  checks.warnings++;
} else {
  console.log('✅ No @/ imports found');
  checks.passed++;
}

// Summary
console.log('\n📊 Summary:\n');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log(`❌ Failed: ${checks.failed}`);

if (checks.failed === 0 && checks.warnings === 0) {
  console.log('\n🎉 All checks passed! Your project should be ready to deploy.');
} else if (checks.failed === 0) {
  console.log('\n⚠️  Some warnings found, but project should still build.');
} else {
  console.log('\n❌ Critical issues found. Please run the fix script: node fix-build-issues.js');
}

// Provide next steps
console.log('\n📝 Next steps:');
if (checks.failed > 0 || aliasImportsFound > 0) {
  console.log('  1. Run the fix script: node fix-build-issues.js');
  console.log('  2. Verify configuration again: node verify-config.js');
  console.log('  3. Test build locally: npm run build');
  console.log('  4. Deploy to Vercel');
} else {
  console.log('  1. Test build locally: npm run build');
  console.log('  2. Deploy to Vercel');
}