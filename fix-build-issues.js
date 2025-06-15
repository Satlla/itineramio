#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive build fix...\n');

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Step 1: Clean installation
function cleanInstall() {
  log('\n📦 Step 1: Clean installation of dependencies...', 'cyan');
  
  try {
    // Remove node_modules and lock files
    log('Removing node_modules and lock files...', 'yellow');
    if (fs.existsSync('node_modules')) {
      fs.rmSync('node_modules', { recursive: true, force: true });
    }
    if (fs.existsSync('package-lock.json')) {
      fs.unlinkSync('package-lock.json');
    }
    if (fs.existsSync('yarn.lock')) {
      fs.unlinkSync('yarn.lock');
    }
    if (fs.existsSync('pnpm-lock.yaml')) {
      fs.unlinkSync('pnpm-lock.yaml');
    }
    
    // Clear npm cache
    log('Clearing npm cache...', 'yellow');
    execSync('npm cache clean --force', { stdio: 'inherit' });
    
    // Install dependencies
    log('Installing dependencies with npm...', 'yellow');
    execSync('npm install', { stdio: 'inherit' });
    
    log('✅ Dependencies installed successfully!', 'green');
  } catch (error) {
    log(`❌ Error during installation: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Step 2: Fix import paths
function fixImportPaths() {
  log('\n🔄 Step 2: Fixing import paths from @/ to relative paths...', 'cyan');
  
  const filesToProcess = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  // Recursively find all TypeScript/JavaScript files
  function findFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findFiles(filePath);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        filesToProcess.push(filePath);
      }
    });
  }
  
  // Find all files in src and app directories
  if (fs.existsSync('src')) findFiles('src');
  if (fs.existsSync('app')) findFiles('app');
  
  log(`Found ${filesToProcess.length} files to process`, 'yellow');
  
  let fixedCount = 0;
  
  filesToProcess.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Match import statements with @/ alias
    const importRegex = /^(import\s+(?:(?:\{[^}]*\}|[\w*]+)\s+from\s+|)|export\s+(?:\{[^}]*\}\s+from\s+|[\w*]+\s+from\s+))'@\/(.*)'/gm;
    
    content = content.replace(importRegex, (match, prefix, importPath) => {
      modified = true;
      
      // Calculate relative path from current file to src directory
      const currentDir = path.dirname(filePath);
      const srcPath = path.join(process.cwd(), 'src', importPath);
      const relativePath = path.relative(currentDir, srcPath);
      
      // Ensure path starts with ./ or ../
      const formattedPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
      
      return `${prefix}'${formattedPath}'`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      log(`  ✓ Fixed imports in: ${filePath}`, 'green');
    }
  });
  
  log(`✅ Fixed imports in ${fixedCount} files!`, 'green');
}

// Step 3: Fix tsconfig.json
function fixTsConfig() {
  log('\n⚙️  Step 3: Updating tsconfig.json...', 'cyan');
  
  const tsconfigPath = 'tsconfig.json';
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Remove the paths alias configuration
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
      delete tsconfig.compilerOptions.paths;
      
      // Also ensure baseUrl is set correctly
      tsconfig.compilerOptions.baseUrl = '.';
      
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      log('✅ Updated tsconfig.json to remove path aliases', 'green');
    } else {
      log('ℹ️  tsconfig.json already has no path aliases', 'yellow');
    }
  }
}

// Step 4: Verify postcss.config.js
function verifyPostcssConfig() {
  log('\n🔍 Step 4: Verifying postcss.config.js...', 'cyan');
  
  const postcssPath = 'postcss.config.js';
  if (!fs.existsSync(postcssPath)) {
    log('Creating postcss.config.js...', 'yellow');
    const postcssContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
    fs.writeFileSync(postcssPath, postcssContent);
    log('✅ Created postcss.config.js', 'green');
  } else {
    log('✅ postcss.config.js exists', 'green');
  }
}

// Step 5: Generate Prisma client
function generatePrismaClient() {
  log('\n🗄️  Step 5: Generating Prisma client...', 'cyan');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('✅ Prisma client generated successfully!', 'green');
  } catch (error) {
    log(`⚠️  Warning: Could not generate Prisma client: ${error.message}`, 'yellow');
  }
}

// Step 6: Run build test
function testBuild() {
  log('\n🏗️  Step 6: Testing build...', 'cyan');
  
  try {
    log('Running build command...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build completed successfully!', 'green');
    return true;
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'red');
    return false;
  }
}

// Main execution
async function main() {
  log('🚀 ManualPhi Build Fix Script', 'bright');
  log('================================\n', 'bright');
  
  // Run all steps
  cleanInstall();
  fixImportPaths();
  fixTsConfig();
  verifyPostcssConfig();
  generatePrismaClient();
  
  // Test the build
  log('\n' + '='.repeat(50), 'bright');
  const buildSuccess = testBuild();
  
  if (buildSuccess) {
    log('\n✨ All issues fixed! Your project should now build successfully.', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Commit these changes: git add -A && git commit -m "Fix build issues"', 'yellow');
    log('  2. Push to your repository: git push', 'yellow');
    log('  3. Deploy to Vercel', 'yellow');
  } else {
    log('\n⚠️  Build still failing. Please check the error messages above.', 'red');
    log('Common issues to check:', 'yellow');
    log('  - Missing environment variables', 'yellow');
    log('  - Database connection issues', 'yellow');
    log('  - TypeScript errors', 'yellow');
  }
}

// Run the script
main().catch(error => {
  log(`\n❌ Script failed: ${error.message}`, 'red');
  process.exit(1);
});