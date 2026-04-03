#!/usr/bin/env bun
/**
 * PREFLIGHT CHECK SCRIPT
 * ======================
 *
 * This script runs before the dev server to catch potential issues
 * that could cause flickering, redirect loops, or other problems.
 *
 * Run with: bun run scripts/preflight-check.ts
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, message: string, severity: 'error' | 'warning' | 'info' = 'error') {
  results.push({ name, passed: condition, message, severity });
  return condition;
}

console.log('\n🔍 Running Preflight Checks...\n');
console.log('='.repeat(50));

// ============================================================================
// 1. HYDRATION CSS CHECK
// ============================================================================
function checkHydrationCSS() {
  const globalsPath = join(projectRoot, 'src/app/globals.css');

  if (!existsSync(globalsPath)) {
    check('Hydration CSS', false, 'globals.css not found', 'error');
    return;
  }

  const content = readFileSync(globalsPath, 'utf-8');

  // Check for .hydrating class with opacity: 0
  const hasHydratingClass = /html\.hydrating\s*\{[^}]*opacity:\s*0[^}]*\}/.test(content);
  check(
    'Hydrating Class',
    hasHydratingClass,
    hasHydratingClass
      ? '✅ html.hydrating { opacity: 0 } found'
      : '❌ Missing html.hydrating { opacity: 0 } in globals.css',
    hasHydratingClass ? 'info' : 'error'
  );

  // Check for transition: none on hydrating (prevents flash)
  const hasTransitionNone = /html\.hydrating\s*\{[^}]*transition:\s*none[^}]*\}/.test(content);
  check(
    'No Transition on Hidden',
    hasTransitionNone,
    hasTransitionNone
      ? '✅ transition: none on .hydrating (prevents flash)'
      : '⚠️ Missing transition: none on .hydrating - may cause flash',
    hasTransitionNone ? 'info' : 'warning'
  );

  // Check for .hydrated class
  const hasHydratedClass = /html\.hydrated\s*\{[^}]*opacity:\s*1[^}]*\}/.test(content);
  check(
    'Hydrated Class',
    hasHydratedClass,
    hasHydratedClass
      ? '✅ html.hydrated { opacity: 1 } found'
      : '❌ Missing html.hydrated { opacity: 1 } in globals.css',
    hasHydratedClass ? 'info' : 'error'
  );

  // Check for background color on html
  const hasBackgroundColor = /html\s*\{[^}]*background-color[^}]*\}/.test(content);
  check(
    'Background Color',
    hasBackgroundColor,
    hasBackgroundColor
      ? '✅ html element has background-color'
      : '⚠️ Missing background-color on html - may cause white flash',
    hasBackgroundColor ? 'info' : 'warning'
  );
}

// ============================================================================
// 2. LAYOUT.TSX CHECK
// ============================================================================
function checkLayoutFile() {
  const layoutPath = join(projectRoot, 'src/app/layout.tsx');

  if (!existsSync(layoutPath)) {
    check('Layout File', false, 'layout.tsx not found', 'error');
    return;
  }

  const content = readFileSync(layoutPath, 'utf-8');

  // Check for className="hydrating" on html element
  const hasHydratingClass = /<html[^>]*className=["']hydrating["']/.test(content) ||
                            /<html[^>]*className=\{["'`][^"'`]*hydrating/.test(content);
  check(
    'Hydrating Class in Layout',
    hasHydratingClass,
    hasHydratingClass
      ? '✅ html element has className="hydrating"'
      : '❌ Missing className="hydrating" on html element',
    hasHydratingClass ? 'info' : 'error'
  );

  // Check for suppressHydrationWarning
  const hasSuppressHydration = /<html[^>]*suppressHydrationWarning/.test(content);
  check(
    'Suppress Hydration Warning',
    hasSuppressHydration,
    hasSuppressHydration
      ? '✅ suppressHydrationWarning on html element'
      : '⚠️ Missing suppressHydrationWarning - may cause hydration warnings',
    hasSuppressHydration ? 'info' : 'warning'
  );

  // Check for inline opacity style (BAD!)
  const hasInlineOpacity = /<html[^>]*style=\{\{\s*opacity/.test(content) ||
                           /<html[^>]*style=\{[^}]*opacity/.test(content);
  check(
    'No Inline Opacity',
    !hasInlineOpacity,
    hasInlineOpacity
      ? '❌ INLINE OPACITY STYLE DETECTED - This causes flickering!'
      : '✅ No inline opacity style on html element',
    hasInlineOpacity ? 'error' : 'info'
  );

  // Check for script that sets opacity (BAD!)
  const hasOpacityScript = /document\.documentElement\.style\.opacity/.test(content);
  check(
    'No Opacity Script',
    !hasOpacityScript,
    hasOpacityScript
      ? '❌ SCRIPT SETTING OPACITY DETECTED - This causes flickering!'
      : '✅ No script manipulating opacity in layout',
    hasOpacityScript ? 'error' : 'info'
  );

  // Check for HydrationProvider
  const hasHydrationProvider = /HydrationProvider/.test(content);
  check(
    'Hydration Provider',
    hasHydrationProvider,
    hasHydrationProvider
      ? '✅ HydrationProvider is used'
      : '⚠️ HydrationProvider not found - may cause flickering',
    hasHydrationProvider ? 'info' : 'warning'
  );
}

// ============================================================================
// 3. HYDRATION PROVIDER CHECK
// ============================================================================
function checkHydrationProvider() {
  const providerPath = join(projectRoot, 'src/components/HydrationProvider.tsx');

  if (!existsSync(providerPath)) {
    check('HydrationProvider File', false, 'HydrationProvider.tsx not found', 'warning');
    return;
  }

  const content = readFileSync(providerPath, 'utf-8');

  // Check for inline style manipulation (BAD!)
  const hasInlineStyleManipulation = /\.style\.opacity/.test(content) ||
                                      /\.style\.removeProperty/.test(content) ||
                                      /\.style\.setProperty/.test(content);
  check(
    'No Style Manipulation',
    !hasInlineStyleManipulation,
    hasInlineStyleManipulation
      ? '❌ INLINE STYLE MANIPULATION in HydrationProvider - causes flickering!'
      : '✅ HydrationProvider uses class-based reveal',
    hasInlineStyleManipulation ? 'error' : 'info'
  );

  // Check for classList operations (GOOD!)
  const hasClassListOperations = /\.classList\.(add|remove)/.test(content);
  check(
    'Class-Based Reveal',
    hasClassListOperations,
    hasClassListOperations
      ? '✅ HydrationProvider uses classList for reveal'
      : '⚠️ HydrationProvider may not be using class-based reveal',
    hasClassListOperations ? 'info' : 'warning'
  );

  // Check for useSyncExternalStore
  const hasSyncExternalStore = /useSyncExternalStore/.test(content);
  check(
    'Hydration Detection',
    hasSyncExternalStore,
    hasSyncExternalStore
      ? '✅ Uses useSyncExternalStore for hydration detection'
      : '⚠️ May not properly detect React hydration',
    hasSyncExternalStore ? 'info' : 'warning'
  );

  // Check for requestAnimationFrame
  const hasRAF = /requestAnimationFrame/.test(content);
  check(
    'Smooth Reveal',
    hasRAF,
    hasRAF
      ? '✅ Uses requestAnimationFrame for smooth reveal'
      : '⚠️ May not have smooth reveal transition',
    hasRAF ? 'info' : 'warning'
  );

  // Check for fallback timeout
  const hasFallbackTimeout = /setTimeout/.test(content);
  check(
    'Fallback Timeout',
    hasFallbackTimeout,
    hasFallbackTimeout
      ? '✅ Has fallback timeout for stuck hydration'
      : '⚠️ No fallback timeout - page may stay hidden if hydration fails',
    hasFallbackTimeout ? 'info' : 'warning'
  );
}

// ============================================================================
// 4. PAGE.TSX CHECK
// ============================================================================
function checkPageFile() {
  const pagePath = join(projectRoot, 'src/app/page.tsx');

  if (!existsSync(pagePath)) {
    check('Page File', false, 'page.tsx not found', 'error');
    return;
  }

  const content = readFileSync(pagePath, 'utf-8');

  // Check for opacity manipulation (BAD!)
  const hasOpacityManipulation = /\.style\.opacity/.test(content);
  check(
    'Page No Opacity Manipulation',
    !hasOpacityManipulation,
    hasOpacityManipulation
      ? '❌ page.tsx is manipulating opacity - this should be in HydrationProvider only!'
      : '✅ page.tsx does not manipulate opacity',
    hasOpacityManipulation ? 'error' : 'info'
  );

  // Check for visibility manipulation (BAD!)
  const hasVisibilityManipulation = /\.style\.visibility/.test(content);
  check(
    'Page No Visibility Manipulation',
    !hasVisibilityManipulation,
    hasVisibilityManipulation
      ? '❌ page.tsx is manipulating visibility - this should be in HydrationProvider only!'
      : '✅ page.tsx does not manipulate visibility',
    hasVisibilityManipulation ? 'error' : 'info'
  );
}

// ============================================================================
// 5. PRISMA CHECK
// ============================================================================
function checkPrisma() {
  const schemaPath = join(projectRoot, 'prisma/schema.prisma');

  if (!existsSync(schemaPath)) {
    check('Prisma Schema', false, 'prisma/schema.prisma not found', 'warning');
    return;
  }

  // Check .config directory issue (common problem)
  const configPath = join(projectRoot, '.config');
  const configStat = existsSync(configPath) ? statSync(configPath) : null;
  if (configStat && configStat.isFile()) {
    check(
      'Config Directory',
      false,
      '❌ .config is a FILE not a directory! Run: mv .config .config-backup && mkdir -p .config/prisma',
      'error'
    );
  } else {
    check('Config Directory', true, '✅ .config directory structure is correct', 'info');
  }

  // Check if @prisma/client can be imported
  try {
    require.resolve('@prisma/client');
    check('Prisma Client', true, '✅ @prisma/client is available', 'info');
  } catch {
    check('Prisma Client', false, '❌ @prisma/client not generated - run: bunx prisma generate --schema=./prisma/schema.prisma', 'error');
  }

  // Check for db file
  const dbPath = join(projectRoot, 'db/custom.db');
  if (existsSync(dbPath)) {
    check('Database File', true, '✅ Database file exists', 'info');
  } else {
    check('Database File', false, '⚠️ Database file not found - run: bun run db:push', 'warning');
  }

  // Check for NextAuth session endpoint
  check('NextAuth Session', true, '✅ Session endpoint check (manual)', 'info');
}

// ============================================================================
// 6. MIDDLEWARE CHECK (Redirect Loops)
// ============================================================================
function checkMiddleware() {
  const middlewarePath = join(projectRoot, 'src/middleware.ts');

  if (!existsSync(middlewarePath)) {
    check('Middleware', true, '✅ No middleware.ts - no redirect loop risk', 'info');
    return;
  }

  const content = readFileSync(middlewarePath, 'utf-8');

  // Check for redirect patterns that could cause loops
  const hasRedirect = /redirect\(/.test(content) || /NextResponse\.redirect/.test(content);
  if (hasRedirect) {
    check(
      'Middleware Redirect',
      false,
      '⚠️ Middleware has redirects - verify no infinite loops',
      'warning'
    );
  } else {
    check('Middleware Redirect', true, '✅ No redirects in middleware', 'info');
  }
}

// ============================================================================
// 7. NEXT CONFIG CHECK
// ============================================================================
function checkNextConfig() {
  const configPath = join(projectRoot, 'next.config.ts');

  if (!existsSync(configPath)) {
    check('Next Config', true, '✅ Using default Next.js config', 'info');
    return;
  }

  const content = readFileSync(configPath, 'utf-8');

  // Check for reactStrictMode
  const hasStrictMode = /reactStrictMode:\s*(true|false)/.test(content);
  const isStrictModeOff = /reactStrictMode:\s*false/.test(content);

  if (hasStrictMode && !isStrictModeOff) {
    check(
      'React Strict Mode',
      false,
      '⚠️ Strict mode is ON - may cause double renders in development',
      'warning'
    );
  } else {
    check('React Strict Mode', true, '✅ Strict mode is OFF for smoother dev experience', 'info');
  }
}

// ============================================================================
// RUN ALL CHECKS
// ============================================================================
checkHydrationCSS();
checkLayoutFile();
checkHydrationProvider();
checkPageFile();
checkPrisma();
checkMiddleware();
checkNextConfig();

// ============================================================================
// PRINT RESULTS
// ============================================================================
console.log('\n' + '='.repeat(50));
console.log('PREFLIGHT CHECK RESULTS');
console.log('='.repeat(50) + '\n');

const errors = results.filter(r => !r.passed && r.severity === 'error');
const warnings = results.filter(r => !r.passed && r.severity === 'warning');
const passed = results.filter(r => r.passed);

console.log('✅ Passed:', passed.length);
console.log('⚠️  Warnings:', warnings.length);
console.log('❌ Errors:', errors.length);
console.log('');

if (errors.length > 0) {
  console.log('❌ ERRORS (Must Fix):');
  console.log('-'.repeat(40));
  errors.forEach(e => {
    console.log(`  [${e.name}] ${e.message}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (Should Fix):');
  console.log('-'.repeat(40));
  warnings.forEach(w => {
    console.log(`  [${w.name}] ${w.message}`);
  });
  console.log('');
}

// Exit with error code if there are errors
if (errors.length > 0) {
  console.log('❌ Preflight checks FAILED. Fix the errors above before starting the dev server.\n');
  process.exit(1);
} else {
  console.log('✅ Preflight checks PASSED. Safe to start the dev server.\n');
  process.exit(0);
}
