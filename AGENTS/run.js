#!/usr/bin/env node
/**
 * Itineramio — Multi-Agent Code Review
 * Usa tu cuenta Claude Max (sin coste extra de API)
 *
 * Uso:
 *   node agents/run.js                          → todos los agentes
 *   node agents/run.js --agent=security         → solo seguridad
 *   node agents/run.js --agent=security,mobile  → varios
 *   node agents/run.js --files=src/lib/auth.ts  → archivo específico
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

// ─── Colores terminal ────────────────────────────────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  green:   '\x1b[32m',
  blue:    '\x1b[34m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
};
const col = (color, text) => `${C[color]}${text}${C.reset}`;
const bold = (text) => `${C.bold}${text}${C.reset}`;

// ─── Utilidades de archivos ──────────────────────────────────────────────────
function findFiles(globs) {
  const result = [];
  for (const g of globs) {
    try {
      const out = execSync(
        `find "${ROOT}" -name "${g}" \
          -not -path "*/node_modules/*" \
          -not -path "*/.next/*" \
          -not -path "*/dist/*" \
          -not -path "*/.git/*" \
          -not -path "*/coverage/*" \
          -not -name "*.d.ts" \
          2>/dev/null`,
        { encoding: 'utf8' }
      );
      result.push(...out.trim().split('\n').filter(Boolean));
    } catch {}
  }
  return [...new Set(result)];
}

function readFiles(filePaths, maxChars = 60000) {
  let content = '';
  let included = 0;
  for (const fp of filePaths) {
    if (!fs.existsSync(fp)) continue;
    const rel = path.relative(ROOT, fp);
    const code = fs.readFileSync(fp, 'utf8');
    content += `\n\n// ===== ${rel} =====\n${code}`;
    included++;
    if (content.length > maxChars) {
      content += `\n// ... (${filePaths.length - included} archivos más omitidos por longitud)`;
      break;
    }
  }
  return { content, included };
}

function getChangedFiles() {
  try {
    const staged = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf8' }).trim();
    const unstaged = execSync('git diff --name-only', { cwd: ROOT, encoding: 'utf8' }).trim();
    const files = [...new Set([...staged.split('\n'), ...unstaged.split('\n')])]
      .filter(f => f && (f.endsWith('.ts') || f.endsWith('.tsx')))
      .map(f => path.join(ROOT, f));
    return files;
  } catch {
    return [];
  }
}

// ─── Definición de agentes ───────────────────────────────────────────────────
function buildAgents(customFiles) {
  const apiFiles     = findFiles(['*.ts']).filter(f => f.includes('/api/'));
  const libFiles     = findFiles(['*.ts']).filter(f => f.includes('/lib/') || f.includes('/middleware'));
  const componentFiles = findFiles(['*.tsx']).filter(f => f.includes('/components/') || f.includes('/(dashboard)/'));
  const hookFiles    = findFiles(['*.ts', '*.tsx']).filter(f => f.includes('/hooks/') || f.includes('/providers/'));
  const allTsFiles   = findFiles(['*.ts', '*.tsx']).filter(f => !f.includes('.test.'));

  const targetFiles = customFiles?.length > 0 ? customFiles : null;

  return [
    {
      id: 'security',
      name: '🔒 SECURITY',
      color: 'red',
      files: targetFiles ?? [...apiFiles.slice(0, 15), ...libFiles.slice(0, 5)],
      prompt: (code, count) => `Eres un experto en seguridad web revisando una aplicación Next.js 15 con API routes, JWT auth, Prisma y Stripe.

Analiza el siguiente código (${count} archivos) y reporta SOLO vulnerabilidades reales y específicas.

Formato por issue:
[CRÍTICO|ALTO|MEDIO] archivo.ts:línea — Qué está mal — Cómo arreglarlo

Busca específicamente:
- API routes sin verificación de auth (getUser() faltante)
- Queries Prisma con input de usuario sin sanitizar
- Secrets o API keys hardcodeadas en código
- Endpoints sin rate limiting que deberían tenerlo
- JWT mal verificado o tokens sin expiración
- CORS mal configurado
- XSS por dangerouslySetInnerHTML sin sanitizar
- IDOR (acceso a recursos de otros usuarios sin verificar userId)
- Rutas admin accesibles sin verificar isAdmin

CÓDIGO:
${code}

Lista todos los issues encontrados. Si no hay issues reales: "✅ Sin vulnerabilidades críticas detectadas"`,
    },

    {
      id: 'performance',
      name: '⚡ PERFORMANCE',
      color: 'yellow',
      files: targetFiles ?? [...apiFiles.slice(0, 12), ...hookFiles.slice(0, 8)],
      prompt: (code, count) => `Eres un experto en performance revisando una app Next.js 15 + React con Prisma y TanStack Query.

Analiza el siguiente código (${count} archivos) buscando problemas de rendimiento reales.

Formato por issue:
[ALTO|MEDIO|BAJO] archivo.ts:línea — Problema — Solución concreta

Busca:
- Queries Prisma dentro de bucles (N+1 queries)
- SELECT * cuando solo se necesitan campos específicos
- Falta de paginación en endpoints que devuelven listas
- useEffect con dependencias incorrectas causando re-renders infinitos
- Componentes grandes sin React.memo donde habría mejora
- Imports de librerías completas cuando se podría importar solo lo necesario (ej: import _ from 'lodash')
- await en paralelo que se podría hacer con Promise.all
- Datos que se refetch innecesariamente
- API routes síncronas que bloquean con operaciones pesadas

CÓDIGO:
${code}

Lista todos los issues. Si no hay: "✅ Sin problemas de performance críticos detectados"`,
    },

    {
      id: 'mobile',
      name: '📱 MOBILE',
      color: 'cyan',
      files: targetFiles ?? componentFiles.slice(0, 20),
      prompt: (code, count) => `Eres un experto en React Native y diseño móvil revisando una app Expo SDK 54.

Analiza el siguiente código (${count} archivos) buscando problemas de compatibilidad móvil.

Formato por issue:
[ALTO|MEDIO|BAJO] archivo.tsx:línea — Problema — Solución

Busca:
- Touch targets menores de 44x44px (botones demasiado pequeños)
- Falta de SafeAreaView en pantallas principales
- Valores de pixel hardcodeados que no escalan entre dispositivos
- Formularios sin KeyboardAvoidingView
- ScrollView sin keyboardShouldPersistTaps="handled"
- Colores hardcoded en lugar de variables de tema
- Texto que puede overflow sin numberOfLines
- Imágenes sin dimensiones fijas o aspectRatio
- shadow* props deprecated en web (usar boxShadow)
- Listas largas sin FlatList/SectionList (usando map en ScrollView)
- Falta de Platform.select para diferencias iOS/Android

CÓDIGO:
${code}

Lista todos los issues. Si no hay: "✅ Sin problemas de compatibilidad móvil detectados"`,
    },

    {
      id: 'layout',
      name: '📐 LAYOUT',
      color: 'magenta',
      files: targetFiles ?? componentFiles.slice(0, 18),
      prompt: (code, count) => `Eres un experto en UI/layout revisando componentes React Native y Next.js.

Analiza el siguiente código (${count} archivos) buscando problemas de layout y estilos.

Formato por issue:
[ALTO|MEDIO|BAJO] archivo.tsx:línea — Problema — Solución

Busca:
- flex: 1 en elementos que no deberían expandirse
- Contenedores sin flex que causan overflow o colapso
- Spacing inconsistente (mezcla de valores arbitrarios en lugar de sistema de diseño)
- overflow hidden faltante en contenedores con borderRadius
- Z-index hardcodeados que pueden crear conflictos
- Estilos inline en lugar de StyleSheet.create (peor performance)
- gap en StyleSheet en versiones antiguas de RN que no lo soportan
- Posición absolute que rompe en pantallas pequeñas
- Widths en % sin considerar padding del padre
- Componentes que no se adaptan a texto grande (accesibilidad)

CÓDIGO:
${code}

Lista todos los issues. Si no hay: "✅ Sin problemas de layout detectados"`,
    },

    {
      id: 'typescript',
      name: '🔷 TYPESCRIPT',
      color: 'blue',
      files: [],
      custom: async () => {
        process.stdout.write(col('blue', bold('  🔷 TYPESCRIPT')) + col('gray', ' ejecutando tsc...\n'));
        let tsErrors = '';
        try {
          execSync('npm run typecheck 2>&1', { cwd: ROOT, encoding: 'utf8' });
          return '✅ Sin errores TypeScript';
        } catch (e) {
          tsErrors = (e.stdout ?? '') + (e.stderr ?? '') + (e.message ?? '');
        }

        // Pasar errores a Claude para análisis legible
        const prompt = `Analiza estos errores del compilador TypeScript de una app Next.js y dame un resumen accionable.

Agrupa por:
1. [ERRORES CRÍTICOS] — bloquean el build
2. [WARNINGS] — no bloquean pero deberían arreglarse

Para cada error: archivo:línea — descripción breve — cómo arreglarlo

Máximo 20 issues más importantes. Ignora duplicados.

ERRORES RAW:
${tsErrors.slice(0, 8000)}`;

        return new Promise((resolve) => {
          let out = '';
          const tsEnv = { ...process.env };
          delete tsEnv.CLAUDECODE;
          const proc = spawn('claude', ['-p', prompt], { cwd: ROOT, env: tsEnv });
          proc.stdout.on('data', d => { out += d.toString(); });
          proc.on('close', () => resolve(out || '✅ Sin errores TypeScript'));
          proc.on('error', () => resolve('⚠️  No se pudo ejecutar tsc'));
        });
      },
    },
  ];
}

// ─── Runner de agente ─────────────────────────────────────────────────────────
function runAgent(agent) {
  return new Promise(async (resolve) => {
    const label = col(agent.color, bold(agent.name));
    const start = Date.now();

    // Agente custom (TypeScript)
    if (agent.custom) {
      const result = await agent.custom();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      process.stdout.write('\n' + '─'.repeat(60) + '\n');
      process.stdout.write(`${label}\n`);
      result.split('\n').forEach(line => {
        if (line.trim()) process.stdout.write(`  ${line}\n`);
      });
      process.stdout.write(col('gray', `  └─ ${elapsed}s\n`));
      return resolve();
    }

    if (!agent.files || agent.files.length === 0) {
      process.stdout.write(`${label} ${col('gray', '— sin archivos para analizar\n')}`);
      return resolve();
    }

    const { content, included } = readFiles(agent.files);
    if (!content.trim()) {
      process.stdout.write(`${label} ${col('gray', '— sin contenido\n')}`);
      return resolve();
    }

    const prompt = agent.prompt(content, included);

    process.stdout.write('\n' + '─'.repeat(60) + '\n');
    process.stdout.write(`${label} ${col('gray', `— ${included} archivos — analizando...`)}\n`);

    const env = { ...process.env };
    delete env.CLAUDECODE;
    const proc = spawn('claude', ['-p', prompt], { cwd: ROOT, env });

    let buffer = '';
    proc.stdout.on('data', (data) => {
      buffer += data.toString();
    });

    proc.stderr.on('data', () => {}); // silenciar progress de claude

    proc.on('close', () => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const lines = buffer.trim().split('\n');
      lines.forEach(line => {
        if (!line.trim()) return;
        // Colorear según severidad
        if (line.includes('[CRÍTICO]') || line.includes('[ALTO]')) {
          process.stdout.write(`  ${col('red', line)}\n`);
        } else if (line.includes('[MEDIO]')) {
          process.stdout.write(`  ${col('yellow', line)}\n`);
        } else if (line.includes('[BAJO]')) {
          process.stdout.write(`  ${col('gray', line)}\n`);
        } else if (line.startsWith('✅')) {
          process.stdout.write(`  ${col('green', line)}\n`);
        } else {
          process.stdout.write(`  ${line}\n`);
        }
      });
      process.stdout.write(col('gray', `  └─ ${elapsed}s\n`));
      resolve();
    });

    proc.on('error', (err) => {
      process.stdout.write(`${label} ${col('red', `Error: ${err.message}`)}\n`);
      process.stdout.write(col('gray', '  Asegúrate de estar logueado: claude auth login\n'));
      resolve();
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const agentFilter = args.find(a => a.startsWith('--agent='))?.replace('--agent=', '').split(',');
  const fileFilter  = args.find(a => a.startsWith('--files='))?.replace('--files=', '').split(',')
    .map(f => path.resolve(ROOT, f));
  const onlyChanged = args.includes('--changed');

  let customFiles = fileFilter ?? [];
  if (onlyChanged) {
    customFiles = getChangedFiles();
    if (customFiles.length === 0) {
      console.log(col('yellow', '\n⚠️  No hay archivos modificados en git. Usa --files= o corre sin --changed\n'));
      process.exit(0);
    }
  }

  const allAgents = buildAgents(customFiles.length > 0 ? customFiles : null);
  const agents = agentFilter ? allAgents.filter(a => agentFilter.includes(a.id)) : allAgents;

  // Header
  console.log('\n' + col('magenta', bold('╔══════════════════════════════════════════════╗')));
  console.log(col('magenta', bold('║    ITINERAMIO — Multi-Agent Code Review       ║')));
  console.log(col('magenta', bold('╚══════════════════════════════════════════════╝')));
  console.log(col('gray', `\n  Agentes: ${agents.map(a => a.name).join('  ')}`));
  if (customFiles.length > 0) {
    console.log(col('gray', `  Archivos: ${customFiles.map(f => path.relative(ROOT, f)).join(', ')}`));
  }
  console.log(col('gray', `  Modelo: Claude Code Max (tu cuenta)\n`));

  const totalStart = Date.now();

  // Correr todos en paralelo
  await Promise.all(agents.map(runAgent));

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log('\n' + '═'.repeat(60));
  console.log(col('green', bold(`  ✓ Análisis completado en ${totalElapsed}s`)));
  console.log(col('gray', `
  Comandos disponibles:
    npm run agents                    → todos los agentes
    npm run agents:security           → solo seguridad
    npm run agents:mobile             → solo mobile
    npm run agents:performance        → solo performance
    npm run agents:layout             → solo layout
    npm run agents:ts                 → solo TypeScript
    node agents/run.js --changed      → solo archivos modificados en git
    node agents/run.js --files=src/lib/auth.ts  → archivo específico
`));
}

main().catch(console.error);
