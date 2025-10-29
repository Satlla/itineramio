#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for @/ imports in the project...\n');

const aliasImports = [];
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function findAliasImports(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
      findAliasImports(filePath, baseDir);
    } else if (extensions.some(ext => file.endsWith(ext))) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Match import/export statements with @/ alias
        const importMatch = line.match(/(?:import|export)\s+.*?from\s+['"]@\/([^'"]+)['"]/);
        if (importMatch) {
          aliasImports.push({
            file: path.relative(baseDir, filePath),
            line: index + 1,
            statement: line.trim(),
            importPath: '@/' + importMatch[1]
          });
        }
      });
    }
  });
}

// Search in src and app directories
console.log('Searching in src/ directory...');
findAliasImports(path.join(process.cwd(), 'src'), process.cwd());

console.log('Searching in app/ directory...');
findAliasImports(path.join(process.cwd(), 'app'), process.cwd());

// Display results
if (aliasImports.length === 0) {
  console.log('\n✅ No @/ imports found! Your project is ready for deployment.');
} else {
  console.log(`\n⚠️  Found ${aliasImports.length} @/ imports:\n`);
  
  // Group by file
  const fileGroups = {};
  aliasImports.forEach(imp => {
    if (!fileGroups[imp.file]) {
      fileGroups[imp.file] = [];
    }
    fileGroups[imp.file].push(imp);
  });
  
  Object.entries(fileGroups).forEach(([file, imports]) => {
    console.log(`📄 ${file}:`);
    imports.forEach(imp => {
      console.log(`   Line ${imp.line}: ${imp.statement}`);
    });
    console.log('');
  });
  
  console.log('\n💡 To fix these imports, run: node fix-build-issues.js');
}

// Summary
console.log('\n📊 Summary:');
console.log(`Total files with @/ imports: ${Object.keys(aliasImports.reduce((acc, imp) => ({ ...acc, [imp.file]: true }), {})).length}`);
console.log(`Total @/ import statements: ${aliasImports.length}`);