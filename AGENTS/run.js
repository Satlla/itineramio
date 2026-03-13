#!/usr/bin/env node
/**
 * Itineramio — Multi-Agent Code Review (EXHAUSTIVO)
 * Análisis al milímetro. Sin límites de archivos. Máximo detalle.
 *
 * Uso:
 *   node agents/run.js                          → todos los agentes en paralelo
 *   node agents/run.js --agent=security         → solo seguridad
 *   node agents/run.js --agent=security,mobile  → varios
 *   node agents/run.js --files=src/lib/auth.ts  → archivo específico
 *   node agents/run.js --changed                → solo archivos modificados en git
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const ROOT = path.resolve(__dirname, '..');

const C = {
  reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m',
  red:'\x1b[31m', yellow:'\x1b[33m', green:'\x1b[32m',
  blue:'\x1b[34m', cyan:'\x1b[36m', magenta:'\x1b[35m',
  white:'\x1b[37m', gray:'\x1b[90m',
};
const col  = (c, t) => `${C[c]}${t}${C.reset}`;
const bold = (t)    => `${C.bold}${t}${C.reset}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function findFiles(globs) {
  const result = [];
  for (const g of globs) {
    try {
      const out = execSync(
        `find "${ROOT}" -name "${g}" \
          -not -path "*/node_modules/*" -not -path "*/.next/*" \
          -not -path "*/dist/*"         -not -path "*/.git/*" \
          -not -path "*/coverage/*"     -not -name "*.d.ts" \
          2>/dev/null`,
        { encoding: 'utf8' }
      );
      result.push(...out.trim().split('\n').filter(Boolean));
    } catch {}
  }
  return [...new Set(result)];
}

// Sin límite de archivos — carga todo lo que quepa en 180k chars por agente
function readFiles(filePaths, maxChars = 180000) {
  let content  = '';
  let included = 0;
  let skipped  = 0;
  for (const fp of filePaths) {
    if (!fs.existsSync(fp)) continue;
    const rel  = path.relative(ROOT, fp);
    const code = fs.readFileSync(fp, 'utf8');
    const chunk = `\n\n// ===== FILE: ${rel} =====\n${code}`;
    if (content.length + chunk.length > maxChars) { skipped++; continue; }
    content += chunk;
    included++;
  }
  return { content, included, skipped };
}

function getChangedFiles() {
  try {
    const a = execSync('git diff --cached --name-only', { cwd: ROOT, encoding: 'utf8' }).trim();
    const b = execSync('git diff --name-only',          { cwd: ROOT, encoding: 'utf8' }).trim();
    return [...new Set([...a.split('\n'), ...b.split('\n')])]
      .filter(f => f && (f.endsWith('.ts') || f.endsWith('.tsx')))
      .map(f => path.join(ROOT, f));
  } catch { return []; }
}

// ─── Definición de agentes ───────────────────────────────────────────────────
function buildAgents(customFiles) {
  const apiFiles       = findFiles(['*.ts']).filter(f => f.includes('/api/'));
  const libFiles       = findFiles(['*.ts']).filter(f => f.includes('/lib/') || f.includes('middleware'));
  const componentFiles = findFiles(['*.tsx']).filter(f => f.includes('/components/') || f.includes('/(dashboard)/'));
  const hookFiles      = findFiles(['*.ts','*.tsx']).filter(f => f.includes('/hooks/') || f.includes('/providers/'));
  const allTsFiles     = findFiles(['*.ts','*.tsx']).filter(f => !f.includes('.test.') && !f.includes('.spec.'));

  const target = customFiles?.length > 0 ? customFiles : null;

  return [

    // ── 🔒 SECURITY ──────────────────────────────────────────────────────────
    {
      id: 'security', name: '🔒 SECURITY', color: 'red',
      files: target ?? [...apiFiles, ...libFiles],
      prompt: (code, count, skipped) => `Eres un experto en seguridad ofensiva y defensiva con 15 años de experiencia en auditorías de aplicaciones web. Estás auditando ITINERAMIO, una plataforma SaaS de gestión de propiedades vacacionales en producción con datos reales de clientes, pagos con Stripe, y JWT auth.

Stack: Next.js 15 App Router, Prisma 6 + PostgreSQL, JWT (jsonwebtoken + jose), Stripe, Resend, Vercel Blob, Upstash Redis, TypeScript.

Analiza EXHAUSTIVAMENTE los siguientes ${count} archivos (${skipped} omitidos por tamaño). No te saltes nada. Revisa cada función, cada endpoint, cada validación.

CHECKLIST COMPLETO A REVISAR:

AUTENTICACIÓN Y AUTORIZACIÓN:
- Cada API route: ¿llama a getUser() o verifica token antes de operar?
- Rutas que devuelven datos de usuario: ¿verifican que userId del token === userId del recurso? (IDOR)
- Rutas admin: ¿verifican user.isAdmin === true además del token?
- ¿Hay endpoints que aceptan userId como parámetro de query/body en lugar de extraerlo del token?
- JWT: ¿se verifica la firma? ¿hay expiración? ¿se usa el secret correcto?
- ¿Hay rutas que solo comprueban si existe cookie pero no verifican su contenido?

INYECCIÓN Y VALIDACIÓN:
- Queries Prisma con whereRaw, queryRaw, executeRaw con input de usuario sin sanitizar
- Template literals en queries SQL
- Input de usuario usado directamente en nombres de campos Prisma ($orderBy dinámico sin whitelist)
- Falta de validación zod/joi en body de requests
- Campos opcionales que deberían ser obligatorios en schemas de validación

EXPOSICIÓN DE DATOS:
- Endpoints que devuelven campos sensibles (password hash, tokens, secrets) que no deberían
- Prisma select que incluye campos como passwordHash, internalNotes, adminOnly
- Logs con console.log que imprimen datos sensibles
- Mensajes de error que revelan información interna (stack traces, nombres de tabla, etc.)

RATE LIMITING Y ABUSO:
- Endpoints de autenticación (/login, /register, /forgot-password) sin rate limiting
- Endpoints de envío de email sin rate limiting (pueden usarse para spam)
- Endpoints que consumen recursos (AI, Stripe, Resend) sin rate limiting
- Endpoints públicos que podrían usarse para scraping masivo

STRIPE Y PAGOS:
- ¿Se verifica la firma del webhook de Stripe con stripe.webhooks.constructEvent?
- ¿Se comprueba que el customerId de Stripe corresponde al userId del token?
- ¿Hay lógica de precios que se puede manipular desde el cliente?

CORS Y HEADERS:
- Endpoints que aceptan cualquier Origin
- Falta de validación de Content-Type
- Cookies sin SameSite, HttpOnly, Secure en producción

SECRETOS Y CONFIGURACIÓN:
- Strings que parecen API keys, tokens o secrets hardcodeados
- Variables de entorno accedidas sin validación
- Rutas que exponen configuración interna

CRON Y BACKGROUND JOBS:
- Endpoints /api/cron/* sin verificación del header Authorization de Vercel
- Jobs que operan sobre datos sin scope de usuario

PARA CADA VULNERABILIDAD ENCONTRADA, formato exacto:
[CRÍTICO|ALTO|MEDIO|BAJO] archivo/ruta.ts:línea
  → Qué es el problema
  → Por qué es explotable
  → Ejemplo de cómo se explotaría
  → Cómo arreglarlo (código específico)

Si un archivo está limpio, no lo menciones. Agrupa por severidad. Sé brutalmente honesto.

CÓDIGO A AUDITAR:
${code}`,
    },

    // ── ⚡ PERFORMANCE ───────────────────────────────────────────────────────
    {
      id: 'performance', name: '⚡ PERFORMANCE', color: 'yellow',
      files: target ?? [...apiFiles, ...hookFiles, ...allTsFiles.filter(f => f.includes('/components/'))],
      prompt: (code, count, skipped) => `Eres un experto en performance de aplicaciones web con especialización en Next.js, Prisma y React. Estás analizando ITINERAMIO, una plataforma con ~460 API routes, PostgreSQL, y miles de usuarios concurrentes.

Analiza EXHAUSTIVAMENTE ${count} archivos (${skipped} omitidos). Cada línea importa. No hay issue demasiado pequeño.

CHECKLIST COMPLETO:

BASE DE DATOS - PRISMA:
- Queries dentro de bucles for/forEach/map/while (N+1 queries — el problema más grave)
- findMany sin take/skip/cursor (queries sin límite que cargan toda la tabla)
- SELECT * implícito (sin select: {} específico) en tablas grandes
- include: { relación: true } que carga datos no necesarios
- Falta de índices: campos usados en where frecuente que probablemente no tienen índice (createdAt para filtros de fecha, userId para joins, status para filtros)
- Múltiples await prisma.X en serie que podrían ser Promise.all([])
- Transacciones innecesariamente grandes o largas
- count() + findMany() en el mismo endpoint (pueden combinarse)
- Queries de agregación complejas que deberían ser vistas materializadas

REACT Y NEXT.JS:
- useEffect con array de dependencias vacío [] que oculta dependencias reales
- useState para datos que deberían estar en URL params o TanStack Query
- Componentes grandes (>200 líneas) sin dividir que causan re-renders masivos
- Props drilling profundo (>3 niveles) sin Context o Zustand
- Imágenes sin next/image (sin lazy loading ni optimización)
- Imports de librerías completas: import _ from 'lodash', import * as Icons from '@heroicons/react'
- Dynamic imports faltantes en componentes pesados que no se usan en first paint
- getServerSideProps cuando podría ser getStaticProps o ISR
- API routes que hacen trabajo síncrono pesado bloqueando el event loop
- Falta de cache headers en endpoints de solo lectura (GET sin datos de usuario)

REACT NATIVE / EXPO (app móvil):
- FlatList sin getItemLayout ni windowSize configurado
- ScrollView con listas largas (>20 items) en lugar de FlatList
- Imágenes sin resizeMode ni dimensiones fijas causando layout thrashing
- Animaciones en JS thread en lugar de nativo (Reanimated)

MEMORIA Y BUNDLES:
- Variables globales que acumulan estado indefinidamente
- Event listeners sin cleanup en useEffect return
- Closures que mantienen referencias a objetos grandes
- Importaciones que añaden >50KB al bundle innecesariamente

CACHING:
- Endpoints GET sin ningún tipo de cache (ni HTTP headers ni Redis ni Next.js cache)
- Datos estáticos o semi-estáticos recomputados en cada request
- TanStack Query sin staleTime configurado (refetch innecesario)

PARA CADA ISSUE:
[ALTO|MEDIO|BAJO] archivo.ts:línea
  → Problema específico (qué hace exactamente el código malo)
  → Impacto en producción (ms extra, queries extra, memoria extra)
  → Solución con código de ejemplo

CÓDIGO:
${code}`,
    },

    // ── 📱 MOBILE ────────────────────────────────────────────────────────────
    {
      id: 'mobile', name: '📱 MOBILE', color: 'cyan',
      files: target ?? [...componentFiles, ...allTsFiles.filter(f => f.includes('/app/') && !f.includes('/api/'))],
      prompt: (code, count, skipped) => `Eres un experto en React Native, Expo SDK 54 y diseño de apps móviles nativas. Tienes experiencia en auditorías de apps rechazadas por App Store y Google Play. Estás revisando ITINERAMIO, una app de gestión de propiedades vacacionales para iOS y Android.

Analiza EXHAUSTIVAMENTE ${count} archivos (${skipped} omitidos). Revisa cada componente, cada StyleSheet, cada prop.

CHECKLIST COMPLETO:

TOUCH Y ACCESIBILIDAD:
- Botones/TouchableOpacity con height o padding que resulten en áreas táctiles <44x44pt (mínimo Apple HIG)
- Falta de accessibilityLabel en elementos interactivos (rechazado por App Store en accessibility audit)
- Falta de accessibilityRole en botones, links, imágenes decorativas
- Colores con contraste <4.5:1 entre texto y fondo (WCAG AA)
- Elementos que no responden a Dynamic Type (texto con fontSize fijo sin allowFontScaling)

SAFE AREAS Y NOTCH:
- Pantallas sin SafeAreaView o useSafeAreaInsets en dispositivos con notch/dynamic island
- Tab bars o headers sin padding bottom para iPhone con home indicator
- Contenido que queda debajo de la barra de estado en Android

TECLADO Y FORMULARIOS:
- Formularios sin KeyboardAvoidingView (campos ocultos por teclado)
- TextInput sin returnKeyType configurado
- Formularios multi-campo sin blurOnSubmit={false} y ref para saltar entre campos
- Falta de autoCapitalize, autoComplete, autoCorrect apropiados por tipo de campo
- ScrollView en formularios sin keyboardShouldPersistTaps="handled"

LAYOUT Y ESTILOS:
- Valores de pixel hardcodeados que no usan Dimensions.get('window') ni porcentajes
- StyleSheet con shadow* props (deprecated en web, usar boxShadow)
- gap en StyleSheet (no soportado en RN <0.71)
- Colores hardcodeados en lugar de tokens del tema (#6366f1 disperso en lugar de theme.colors.primary)
- Textos sin numberOfLines en contenedores de ancho fijo (overflow)
- Imágenes sin width+height o aspectRatio definidos
- flex: 1 en elementos que no deben expandirse
- position: 'absolute' sin considerar diferentes tamaños de pantalla

RENDIMIENTO NATIVO:
- Listas con .map() en ScrollView con >15 items (usar FlatList)
- FlatList sin keyExtractor definido
- Animaciones JS-driven que deberían ser nativas con Reanimated
- onPress handlers con lógica pesada síncrona (bloquea UI thread)
- Images cargando URLs externas sin caché (sin expo-image o FastImage)

PLATAFORMA:
- Código que asume iOS o Android sin Platform.OS check
- APIs solo disponibles en un platform sin guard (expo-secure-store en web)
- Permisos no solicitados antes de usar (cámara, notificaciones, localización)
- Deep links no configurados en app.json/scheme

EXPO Y BUILD:
- Importaciones de módulos nativos sin verificar disponibilidad en web
- Constants.expoConfig accedido sin null check
- SplashScreen sin hideAsync() asegurado en finally

PARA CADA ISSUE:
[ALTO|MEDIO|BAJO] archivo.tsx:línea
  → Problema específico y en qué dispositivos falla
  → Consecuencia (crash, rechazo App Store, mala UX)
  → Solución con código exacto

CÓDIGO:
${code}`,
    },

    // ── 📐 LAYOUT ────────────────────────────────────────────────────────────
    {
      id: 'layout', name: '📐 LAYOUT', color: 'magenta',
      files: target ?? componentFiles,
      prompt: (code, count, skipped) => `Eres un experto en sistemas de diseño, CSS, Tailwind y React Native StyleSheet con obsesión por la consistencia visual y los detalles de UI. Estás auditando ITINERAMIO, una plataforma con dashboard web (Next.js + Tailwind) y app móvil (React Native + NativeWind).

Analiza EXHAUSTIVAMENTE ${count} archivos (${skipped} omitidos). Pixel perfect. Sin excusas.

CHECKLIST COMPLETO:

SISTEMA DE DISEÑO Y CONSISTENCIA:
- Colores hardcodeados que no usan tokens del tema (hex directos, rgb(), hsl() en lugar de clases Tailwind o variables CSS)
- Espaciados inconsistentes (mezcla de px-3, px-4, px-5 sin sistema)
- Fuentes sin jerarquía clara (mezcla de text-sm, text-[13px], fontSize: 13 para lo mismo)
- Border radius inconsistente (rounded-lg en unos, rounded-xl en otros, borderRadius: 12 en otros)
- Sombras inconsistentes (mezcla de shadow-sm, shadow-md, elevation: 4, shadowColor)
- Iconos de diferentes tamaños para el mismo contexto (size=16 aquí, size=18 allí)
- Colores de error/success/warning no uniformes (#ef4444 vs #f87171 vs 'red')

FLEXBOX Y GRID (React Native):
- View sin flex en contenedores que deberían crecer
- flex: 1 en elementos hijo cuando el padre no tiene display: flex o flex definido
- alignItems/justifyContent usados incorrectamente (confusión eje principal vs cruzado)
- flexDirection: 'row' sin flexWrap cuando el contenido puede desbordarse
- gap no soportado en versiones antiguas de RN (usar marginBottom/marginRight)

TAILWIND (Next.js):
- Clases conflictivas (px-4 y pl-6 en el mismo elemento)
- Responsive breakpoints faltantes (diseño que se rompe en tablet/mobile)
- Dark mode classes faltantes en elementos que deberían tener variante oscura
- Clases arbitrary values ([23px], [#1a1a2e]) cuando existe token equivalente
- overflow-hidden faltante en contenedores con rounded corners y contenido dinámico

TEXTO Y TIPOGRAFÍA:
- Texto que puede truncarse sin truncate o line-clamp
- numberOfLines sin ellipsizeMode en React Native
- Texto en botones sin ajuste cuando la fuente del sistema es grande (Dynamic Type)
- Falta de lang attribute en textos multiidioma

IMÁGENES Y MEDIA:
- img sin width y height en Next.js (layout shift — CLS)
- Image de Next.js sin sizes prop cuando el layout es responsivo
- Imágenes sin alt text (accesibilidad + SEO)
- Imágenes que no tienen estado de carga (sin skeleton o placeholder)
- Avatar/profile images sin fallback cuando la URL falla

Z-INDEX Y STACKING:
- z-index hardcodeados sin sistema (z-10, z-[999], z-[9999] mezclados)
- Modales/overlays sin z-index suficiente
- Elementos que se solapan sin intención
- position: relative faltante en padre de position: absolute

FORMULARIOS:
- Inputs sin label asociado (for/htmlFor o aria-label)
- Estados de error sin estilos visuales claros
- Placeholder como sustituto de label (mala práctica de UX)
- Focus ring ausente o insuficiente (accesibilidad keyboard)
- Estados disabled sin estilo visual diferenciado

SCROLL Y OVERFLOW:
- Contenedores con overflow: hidden que cortan sombras o tooltips
- ScrollView sin showsVerticalScrollIndicator={false} donde no es necesario
- Contenido que se corta en pantallas pequeñas (iPhone SE, Galaxy A)

PARA CADA ISSUE:
[ALTO|MEDIO|BAJO] archivo.tsx:línea
  → Problema específico (qué clase o estilo está mal y por qué)
  → Impacto visual (en qué dispositivo/breakpoint se ve mal)
  → Solución exacta (qué clase o valor usar)

CÓDIGO:
${code}`,
    },

    // ── 🔷 TYPESCRIPT ────────────────────────────────────────────────────────
    {
      id: 'typescript', name: '🔷 TYPESCRIPT', color: 'blue',
      files: [],
      custom: async () => {
        process.stdout.write(col('blue', bold('  🔷 TYPESCRIPT')) + col('gray', ' ejecutando tsc --noEmit...\n'));
        let tsOut = '';
        try {
          execSync('npm run typecheck 2>&1', { cwd: ROOT, encoding: 'utf8' });
          return '✅ Sin errores TypeScript';
        } catch (e) {
          tsOut = (e.stdout ?? '') + (e.stderr ?? '') + (e.message ?? '');
        }

        const prompt = `Eres un experto en TypeScript analizando los errores del compilador de ITINERAMIO (Next.js 15, Prisma, React).

Estos son los errores raw del compilador. Analízalos de forma exhaustiva:

1. Agrupa por ARCHIVO
2. Para cada error: línea exacta → qué significa en lenguaje humano → cómo arreglarlo con código específico
3. Al final, una sección "PATRONES SISTÉMICOS" con los problemas que se repiten y cómo arreglarlos de raíz (no uno a uno)
4. Prioriza: errores que causan bugs en runtime > errores de tipos > warnings

No omitas ningún error. Si hay muchos del mismo tipo, agrúpalos pero menciona todos los archivos afectados.

ERRORES DEL COMPILADOR:
${tsOut.slice(0, 15000)}`;

        return new Promise((resolve) => {
          let out = '';
          const env = { ...process.env };
          delete env.CLAUDECODE;
          const proc = spawn('claude', ['-p', prompt], { cwd: ROOT, env });
          proc.stdout.on('data', d => { out += d.toString(); });
          proc.stderr.on('data', () => {});
          proc.on('close', () => resolve(out || '✅ Sin errores TypeScript'));
          proc.on('error', () => resolve('⚠️  Error ejecutando tsc'));
        });
      },
    },

  ];
}

// ─── Runner ───────────────────────────────────────────────────────────────────
function runAgent(agent) {
  return new Promise(async (resolve) => {
    const label = col(agent.color, bold(agent.name));
    const start = Date.now();

    if (agent.custom) {
      const result = await agent.custom();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      process.stdout.write('\n' + '─'.repeat(70) + '\n');
      process.stdout.write(`${label}\n\n`);
      result.split('\n').forEach(line => {
        if (!line.trim()) { process.stdout.write('\n'); return; }
        if (line.includes('[CRÍTICO]') || line.includes('CRÍTICO'))     process.stdout.write(`  ${col('red',     line)}\n`);
        else if (line.includes('[ALTO]')   || line.startsWith('## '))   process.stdout.write(`  ${col('yellow',  line)}\n`);
        else if (line.includes('[MEDIO]'))                               process.stdout.write(`  ${col('cyan',    line)}\n`);
        else if (line.includes('[BAJO]'))                                process.stdout.write(`  ${col('gray',    line)}\n`);
        else if (line.startsWith('✅'))                                  process.stdout.write(`  ${col('green',   line)}\n`);
        else                                                             process.stdout.write(`  ${line}\n`);
      });
      process.stdout.write(col('gray', `\n  └─ completado en ${elapsed}s\n`));
      return resolve();
    }

    if (!agent.files?.length) {
      process.stdout.write(`${label} ${col('gray', '— sin archivos\n')}`);
      return resolve();
    }

    const { content, included, skipped } = readFiles(agent.files);
    if (!content.trim()) {
      process.stdout.write(`${label} ${col('gray', '— sin contenido\n')}`);
      return resolve();
    }

    const prompt = agent.prompt(content, included, skipped);

    process.stdout.write('\n' + '─'.repeat(70) + '\n');
    process.stdout.write(`${label} ${col('gray', `— ${included} archivos analizados${skipped > 0 ? ` (${skipped} omitidos por límite de contexto)` : ''} — iniciando...`)}\n\n`);

    const env = { ...process.env };
    delete env.CLAUDECODE;

    const proc = spawn('claude', ['-p', prompt], { cwd: ROOT, env });

    let buffer = '';
    proc.stdout.on('data', d => { buffer += d.toString(); });
    proc.stderr.on('data', () => {});

    proc.on('close', () => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      buffer.trim().split('\n').forEach(line => {
        if (!line.trim()) { process.stdout.write('\n'); return; }
        if (line.includes('[CRÍTICO]'))                            process.stdout.write(`  ${col('red',     bold(line))}\n`);
        else if (line.includes('[ALTO]'))                          process.stdout.write(`  ${col('red',     line)}\n`);
        else if (line.includes('[MEDIO]'))                         process.stdout.write(`  ${col('yellow',  line)}\n`);
        else if (line.includes('[BAJO]'))                          process.stdout.write(`  ${col('gray',    line)}\n`);
        else if (line.startsWith('✅'))                            process.stdout.write(`  ${col('green',   line)}\n`);
        else if (line.startsWith('##') || line.startsWith('===')) process.stdout.write(`\n  ${col('white',  bold(line))}\n`);
        else if (line.startsWith('  →') || line.startsWith('→'))  process.stdout.write(`  ${col('cyan',    line)}\n`);
        else                                                       process.stdout.write(`  ${line}\n`);
      });
      process.stdout.write(col('gray', `\n  └─ completado en ${elapsed}s\n`));
      resolve();
    });

    proc.on('error', err => {
      process.stdout.write(`${label} ${col('red', `Error: ${err.message}`)}\n`);
      resolve();
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args        = process.argv.slice(2);
  const agentFilter = args.find(a => a.startsWith('--agent='))?.replace('--agent=', '').split(',');
  const filesArg    = args.find(a => a.startsWith('--files='))?.replace('--files=', '');
  const useChanged  = args.includes('--changed');

  let customFiles = [];
  if (useChanged) {
    customFiles = getChangedFiles();
    if (!customFiles.length) { console.log(col('yellow', '\n⚠️  Sin archivos modificados. Usa --files= o corre sin --changed\n')); process.exit(0); }
  } else if (filesArg) {
    customFiles = filesArg.split(',').map(f => path.resolve(ROOT, f.trim()));
  }

  const allAgents = buildAgents(customFiles.length ? customFiles : null);
  const agents    = agentFilter ? allAgents.filter(a => agentFilter.includes(a.id)) : allAgents;

  console.log('\n' + col('magenta', bold('╔════════════════════════════════════════════════════╗')));
  console.log(col('magenta', bold('║   ITINERAMIO — Multi-Agent Code Review (EXHAUSTIVO) ║')));
  console.log(col('magenta', bold('╚════════════════════════════════════════════════════╝')));
  console.log(col('gray', `\n  Agentes activos : ${agents.map(a => a.name).join('  ')}`));
  console.log(col('gray', `  Modo            : EXHAUSTIVO (sin límite de archivos)`));
  console.log(col('gray', `  Modelo          : Claude Max (tu cuenta)\n`));

  const t0 = Date.now();
  await Promise.all(agents.map(runAgent));
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('\n' + '═'.repeat(70));
  console.log(col('green', bold(`  ✓ Análisis exhaustivo completado en ${elapsed}s`)));
  console.log(col('gray', `
  Comandos:
    npm run agents                         → todos (exhaustivo)
    npm run agents:security                → solo seguridad
    npm run agents:performance             → solo performance
    npm run agents:mobile                  → solo mobile
    npm run agents:layout                  → solo layout
    npm run agents:ts                      → solo TypeScript
    npm run agents:changed                 → solo archivos modificados en git
    node agents/run.js --files=ruta/file.ts  → archivo específico
`));
}

main().catch(console.error);
