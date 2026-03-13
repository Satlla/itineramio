#!/usr/bin/env node
/**
 * Itineramio — Impact Analysis Agent
 * Analiza si los arreglos propuestos romperían algo antes de aplicarlos.
 *
 * Uso:
 *   node agents/impact.js --files=src/lib/auth.ts
 *   node agents/impact.js --files=src/lib/auth.ts,app/api/auth/login/route.ts
 *   node agents/impact.js --changed          → analiza archivos modificados en git
 *   node agents/impact.js --issue="Añadir rate limiting en /api/auth/login"
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', red: '\x1b[31m',
  yellow: '\x1b[33m', green: '\x1b[32m', blue: '\x1b[34m',
  cyan: '\x1b[36m', magenta: '\x1b[35m', gray: '\x1b[90m', white: '\x1b[37m',
};
const col  = (c, t) => `${C[c]}${t}${C.reset}`;
const bold = (t)    => `${C.bold}${t}${C.reset}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readFile(fp) {
  if (!fs.existsSync(fp)) return null;
  return fs.readFileSync(fp, 'utf8');
}

function findImporters(targetFile) {
  // Encuentra todos los archivos que importan el archivo objetivo
  const rel = path.relative(ROOT, targetFile).replace(/\\/g, '/');
  const basename = path.basename(targetFile, path.extname(targetFile));
  try {
    const result = execSync(
      `grep -r --include="*.ts" --include="*.tsx" -l "${basename}" "${ROOT}/app" "${ROOT}/src" 2>/dev/null`,
      { encoding: 'utf8', cwd: ROOT }
    );
    return result.trim().split('\n').filter(f => f && f !== targetFile);
  } catch {
    return [];
  }
}

function getGitDiff() {
  try {
    const diff = execSync('git diff HEAD --stat 2>/dev/null', { cwd: ROOT, encoding: 'utf8' });
    const fullDiff = execSync('git diff HEAD 2>/dev/null', { cwd: ROOT, encoding: 'utf8' });
    return { stat: diff, full: fullDiff.slice(0, 15000) };
  } catch {
    return { stat: '', full: '' };
  }
}

function getChangedFiles() {
  try {
    const out = execSync('git diff --name-only HEAD 2>/dev/null', { cwd: ROOT, encoding: 'utf8' });
    return out.trim().split('\n').filter(f => f && (f.endsWith('.ts') || f.endsWith('.tsx')))
      .map(f => path.join(ROOT, f));
  } catch { return []; }
}

function readFilesWithContext(files, maxChars = 40000) {
  let content = '';
  for (const fp of files) {
    if (!fs.existsSync(fp)) continue;
    const rel = path.relative(ROOT, fp);
    content += `\n\n// ===== ${rel} =====\n${readFile(fp)}`;
    if (content.length > maxChars) break;
  }
  return content;
}

function claudeAsk(prompt) {
  return new Promise((resolve) => {
    const env = { ...process.env };
    delete env.CLAUDECODE;
    const proc = spawn('claude', ['-p', prompt], { cwd: ROOT, env });
    let out = '';
    proc.stdout.on('data', d => { out += d.toString(); });
    proc.stderr.on('data', () => {});
    proc.on('close', () => resolve(out.trim()));
    proc.on('error', err => resolve(`Error: ${err.message}`));
  });
}

// ─── Análisis de impacto ──────────────────────────────────────────────────────
async function analyzeImpact(targetFiles, issueDescription) {
  console.log('\n' + col('cyan', bold('╔════════════════════════════════════════════════╗')));
  console.log(col('cyan', bold('║    IMPACT ANALYSIS — Itineramio                 ║')));
  console.log(col('cyan', bold('╚════════════════════════════════════════════════╝')));

  // ── 1. Encontrar qué archivos importan los archivos objetivo ────────────────
  console.log('\n' + col('gray', '  Mapeando dependencias...\n'));

  const impactMap = {};
  for (const fp of targetFiles) {
    const importers = findImporters(fp);
    impactMap[fp] = importers;
  }

  // ── 2. Leer el contenido de los archivos objetivo y sus importadores ─────────
  const allRelatedFiles = [
    ...targetFiles,
    ...Object.values(impactMap).flat(),
  ].filter((f, i, arr) => arr.indexOf(f) === i).slice(0, 25);

  const codeContext = readFilesWithContext(allRelatedFiles);

  // ── 3. Obtener tests existentes relacionados ─────────────────────────────────
  let testsContext = '';
  try {
    const testFiles = execSync(
      `find "${ROOT}/__tests__" "${ROOT}/src" -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null`,
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);
    testsContext = readFilesWithContext(testFiles.slice(0, 5), 15000);
  } catch {}

  // ── 4. Obtener schema Prisma para detectar impactos en DB ───────────────────
  let schemaContext = '';
  const schemaPath = path.join(ROOT, 'prisma/schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const schema = readFile(schemaPath);
    schemaContext = schema?.slice(0, 8000) ?? '';
  }

  // ── 5. Construir prompt de análisis ─────────────────────────────────────────
  const targetFileNames = targetFiles.map(f => path.relative(ROOT, f)).join(', ');
  const issueCtx = issueDescription ? `\nProblema a arreglar: "${issueDescription}"\n` : '';

  const prompt = `Eres un arquitecto senior analizando el impacto de cambios en una aplicación Next.js 15 de producción (Itineramio — plataforma de gestión de propiedades vacacionales con ~460 API routes, Prisma, Stripe, JWT auth).
${issueCtx}
Archivos que se van a modificar: ${targetFileNames}

Tu misión: determinar exhaustivamente QUÉ PODRÍA ROMPERSE si se modifican esos archivos.

ARCHIVOS RELEVANTES Y SUS DEPENDENCIAS:
${codeContext}

${testsContext ? `TESTS EXISTENTES:\n${testsContext}` : ''}

${schemaContext ? `SCHEMA PRISMA (fragmento):\n${schemaContext}` : ''}

Analiza y responde en este formato exacto:

## 🔴 RIESGOS ALTOS — Podría romper producción
(Lista cada riesgo con: Qué se rompe — Por qué — Cómo verificarlo antes de aplicar)

## 🟡 RIESGOS MEDIOS — Podría afectar funcionalidad
(Lista cada riesgo con: Qué se afecta — Por qué — Cómo verificarlo)

## 🟢 SEGURO DE CAMBIAR
(Qué partes no tienen dependencias críticas y se pueden cambiar sin riesgo)

## 📋 CHECKLIST ANTES DE APLICAR EL FIX
(Lista de verificaciones específicas que debes hacer: tests a correr, endpoints a probar, flujos a verificar manualmente)

## 🧪 TESTS RECOMENDADOS
(Tests concretos que deberían existir/correrse para validar el cambio. Si no existen, indicar qué habría que crear)

## ✅ VEREDICTO FINAL
(Una de estas tres opciones con justificación):
- SEGURO: Puedes aplicar el fix sin riesgo significativo
- PRECAUCIÓN: Aplica el fix pero verifica los puntos del checklist
- PELIGROSO: No apliques sin antes crear tests o revisar manualmente los riesgos altos

Sé específico con nombres de archivos, funciones y endpoints reales. No des respuestas genéricas.`;

  // ── 6. Mostrar mapa de dependencias ─────────────────────────────────────────
  console.log(col('white', bold('  Archivos objetivo:')));
  for (const fp of targetFiles) {
    const rel = path.relative(ROOT, fp);
    const importers = impactMap[fp] ?? [];
    console.log(col('cyan', `    → ${rel}`));
    if (importers.length > 0) {
      console.log(col('gray', `       Importado por ${importers.length} archivo(s):`));
      importers.slice(0, 5).forEach(f => {
        console.log(col('gray', `       • ${path.relative(ROOT, f)}`));
      });
      if (importers.length > 5) {
        console.log(col('gray', `       • ... y ${importers.length - 5} más`));
      }
    } else {
      console.log(col('gray', `       Sin importadores directos detectados`));
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(col('cyan', bold('  🔍 Analizando impacto con Claude Max...\n')));

  const start = Date.now();
  const result = await claudeAsk(prompt);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  // ── 7. Mostrar resultado con colores ─────────────────────────────────────────
  console.log('');
  result.split('\n').forEach(line => {
    if (line.includes('🔴') || line.includes('ALTOS') || line.includes('PELIGROSO')) {
      console.log(col('red', line));
    } else if (line.includes('🟡') || line.includes('MEDIOS') || line.includes('PRECAUCIÓN')) {
      console.log(col('yellow', line));
    } else if (line.includes('🟢') || line.includes('SEGURO') || line.includes('✅')) {
      console.log(col('green', line));
    } else if (line.startsWith('##')) {
      console.log('\n' + col('white', bold(line)));
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      console.log(col('gray', line));
    } else {
      console.log(line);
    }
  });

  console.log('\n' + '═'.repeat(60));
  console.log(col('gray', `  Análisis completado en ${elapsed}s`));
  console.log(col('gray', `
  Uso:
    node agents/impact.js --files=ruta/al/archivo.ts
    node agents/impact.js --changed
    node agents/impact.js --files=src/lib/auth.ts --issue="Añadir rate limiting"
`));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  const filesArg   = args.find(a => a.startsWith('--files='))?.replace('--files=', '');
  const issueArg   = args.find(a => a.startsWith('--issue='))?.replace('--issue=', '');
  const useChanged = args.includes('--changed');

  let targetFiles = [];

  if (useChanged) {
    targetFiles = getChangedFiles();
    if (targetFiles.length === 0) {
      console.log(col('yellow', '\n⚠️  No hay archivos modificados. Usa --files= para especificar archivos.\n'));
      process.exit(0);
    }
  } else if (filesArg) {
    targetFiles = filesArg.split(',').map(f => path.resolve(ROOT, f.trim()));
    const missing = targetFiles.filter(f => !fs.existsSync(f));
    if (missing.length > 0) {
      console.log(col('red', `\n❌ Archivos no encontrados:\n${missing.map(f => '  ' + f).join('\n')}\n`));
      process.exit(1);
    }
  } else {
    console.log(col('yellow', `
  Uso:
    node agents/impact.js --files=src/lib/auth.ts
    node agents/impact.js --files=src/lib/auth.ts,middleware.ts
    node agents/impact.js --changed
    node agents/impact.js --files=app/api/auth/login/route.ts --issue="Añadir rate limiting"
`));
    process.exit(0);
  }

  await analyzeImpact(targetFiles, issueArg);
}

main().catch(console.error);
