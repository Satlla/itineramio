#!/usr/bin/env node

/**
 * 🛡️ SCRIPT DE VERIFICACIÓN PRE-PUSH
 * Este script evita que subas código roto a producción
 * Se ejecuta automáticamente antes de cada push
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Interfaz para preguntas
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar al usuario
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
};

// Función para ejecutar comandos
const runCommand = (command, description) => {
  console.log(`\n${colors.blue}🔍 ${description}...${colors.reset}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`${colors.green}✅ ${description} - EXITOSO${colors.reset}`);
    return { success: true, output };
  } catch (error) {
    console.log(`${colors.red}❌ ${description} - FALLÓ${colors.reset}`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.log(error.stderr.toString());
    return { success: false, error };
  }
};

// Función principal de verificación
async function prePushCheck() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🛡️  VERIFICACIÓN DE SEGURIDAD PRE-PUSH 🛡️              ║
║                                                            ║
║     Evita romper producción verificando tu código         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  const checks = [];
  let hasErrors = false;

  // 1. Verificar rama actual
  console.log(`\n${colors.magenta}📍 PASO 1: Verificando rama actual${colors.reset}`);
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`   Rama actual: ${colors.yellow}${currentBranch}${colors.reset}`);
    
    if (currentBranch === 'main' || currentBranch === 'master') {
      console.log(`${colors.yellow}⚠️  ADVERTENCIA: Estás en la rama principal${colors.reset}`);
      const answer = await askQuestion(`${colors.yellow}¿Realmente quieres hacer push directamente a ${currentBranch}? (s/n): ${colors.reset}`);
      if (answer !== 's' && answer !== 'si' && answer !== 'sí') {
        console.log(`${colors.green}✅ Buena decisión. Crea una rama de desarrollo primero:${colors.reset}`);
        console.log(`   ${colors.cyan}git checkout -b feature/mi-nueva-funcionalidad${colors.reset}`);
        process.exit(1);
      }
    }
    checks.push({ name: 'Rama', status: '✅' });
  } catch (error) {
    checks.push({ name: 'Rama', status: '❌' });
    hasErrors = true;
  }

  // 2. Verificar TypeScript
  console.log(`\n${colors.magenta}📍 PASO 2: Verificando TypeScript${colors.reset}`);
  const tsCheck = runCommand('npm run typecheck', 'Verificación de tipos TypeScript');
  checks.push({ name: 'TypeScript', status: tsCheck.success ? '✅' : '❌' });
  if (!tsCheck.success) hasErrors = true;

  // 3. Verificar Linting
  console.log(`\n${colors.magenta}📍 PASO 3: Verificando calidad del código${colors.reset}`);
  const lintCheck = runCommand('npm run lint', 'Verificación de linting');
  checks.push({ name: 'Linting', status: lintCheck.success ? '✅' : '❌' });
  if (!lintCheck.success) hasErrors = true;

  // 4. Verificar Build
  console.log(`\n${colors.magenta}📍 PASO 4: Compilando proyecto (como en producción)${colors.reset}`);
  const buildCheck = runCommand('npm run build', 'Build de producción');
  checks.push({ name: 'Build', status: buildCheck.success ? '✅' : '❌' });
  if (!buildCheck.success) hasErrors = true;

  // 5. Buscar console.logs peligrosos
  console.log(`\n${colors.magenta}📍 PASO 5: Buscando console.logs peligrosos${colors.reset}`);
  try {
    const dangerousPatterns = [
      'console.log.*password',
      'console.log.*token',
      'console.log.*secret',
      'console.log.*key',
      'console.log.*api',
      'console.log.*private'
    ];
    
    let foundDangerous = false;
    for (const pattern of dangerousPatterns) {
      try {
        execSync(`grep -r -i "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" ./app ./src`, { encoding: 'utf8' });
        foundDangerous = true;
        console.log(`${colors.red}   ⚠️ Encontrado: ${pattern}${colors.reset}`);
      } catch (e) {
        // No encontrado es bueno
      }
    }
    
    if (foundDangerous) {
      console.log(`${colors.red}❌ Se encontraron console.logs potencialmente peligrosos${colors.reset}`);
      checks.push({ name: 'Console.logs', status: '⚠️' });
    } else {
      console.log(`${colors.green}✅ No se encontraron console.logs peligrosos${colors.reset}`);
      checks.push({ name: 'Console.logs', status: '✅' });
    }
  } catch (error) {
    checks.push({ name: 'Console.logs', status: '⚠️' });
  }

  // 6. Verificar archivos sensibles
  console.log(`\n${colors.magenta}📍 PASO 6: Verificando archivos sensibles${colors.reset}`);
  const sensitiveFiles = ['.env.local', '.env', 'secrets.json', 'credentials.json'];
  let foundSensitive = false;
  
  for (const file of sensitiveFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      try {
        const gitCheck = execSync(`git check-ignore ${file}`, { encoding: 'utf8' });
        console.log(`${colors.green}   ✅ ${file} está en .gitignore${colors.reset}`);
      } catch (e) {
        console.log(`${colors.red}   ❌ ${file} NO está en .gitignore - PELIGRO${colors.reset}`);
        foundSensitive = true;
      }
    }
  }
  
  checks.push({ name: 'Archivos sensibles', status: foundSensitive ? '❌' : '✅' });
  if (foundSensitive) hasErrors = true;

  // RESUMEN FINAL
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║                     RESUMEN DE VERIFICACIÓN                ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

  checks.forEach(check => {
    console.log(`   ${check.status} ${check.name}`);
  });

  console.log('');

  if (hasErrors) {
    console.log(`
${colors.red}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ❌ PUSH BLOQUEADO - HAY ERRORES QUE CORREGIR ❌        ║
║                                                            ║
║     Por tu seguridad, no puedes hacer push hasta que      ║
║     corrijas los errores anteriores.                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}💡 Sugerencias:${colors.reset}
   1. Revisa los errores de TypeScript: ${colors.cyan}npm run typecheck${colors.reset}
   2. Corrige problemas de linting: ${colors.cyan}npm run lint${colors.reset}
   3. Asegúrate de que compila: ${colors.cyan}npm run build${colors.reset}
   4. Elimina console.logs sensibles
   5. Agrega archivos sensibles a .gitignore
`);
    rl.close();
    process.exit(1);
  } else {
    console.log(`
${colors.green}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ✅ TODAS LAS VERIFICACIONES PASARON ✅                 ║
║                                                            ║
║     Tu código está listo para producción                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝${colors.reset}
`);

    const answer = await askQuestion(`\n${colors.green}¿Continuar con el push? (s/n): ${colors.reset}`);
    
    if (answer === 's' || answer === 'si' || answer === 'sí') {
      console.log(`${colors.green}🚀 Continuando con el push...${colors.reset}`);
      rl.close();
      process.exit(0);
    } else {
      console.log(`${colors.yellow}Push cancelado por el usuario${colors.reset}`);
      rl.close();
      process.exit(1);
    }
  }
}

// Ejecutar verificación
prePushCheck().catch(error => {
  console.error(`${colors.red}Error en la verificación:${colors.reset}`, error);
  rl.close();
  process.exit(1);
});