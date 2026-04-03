# Agent Guidelines: Next.js Full-Stack App Best Practices

> **For AI Agents building full-stack Next.js applications**
> Reference: https://chat.z.ai/ (Agent Mode)

---

## Critical Pre-Flight Checks

Before starting ANY Next.js project or after making changes, run these checks:

### 1. Prisma Client Initialization Check

**Problem:** `.config` is a FILE instead of a DIRECTORY causes Prisma to fail silently.

**Symptoms:**
- `CLIENT_FETCH_ERROR: "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"`
- `/api/auth/session` returns HTML error page instead of JSON
- `@prisma/client did not initialize yet`

**Check:**
```bash
# Verify .config is a directory, not a file
ls -la .config
# Should show: .config/ (directory)
# NOT: .config (file)
```

**Fix if broken:**
```bash
mv .config .config-backup
mkdir -p .config/prisma
bunx prisma generate --schema=./prisma/schema.prisma
```

**Prevention:** Always verify `.config` is a directory before generating Prisma client.

---

### 2. Hydration Flickering Check

**Problem:** Multiple sources managing opacity/visibility causes page flickering.

**Symptoms:**
- Brief flash of unstyled content (FOUC)
- Page appears/disappears rapidly on load
- Hydration mismatch warnings in console

**Check in `layout.tsx`:**
```tsx
// ✅ CORRECT - CSS classes only
<html lang="en" suppressHydrationWarning className="hydrating">

// ❌ WRONG - Inline styles cause flickering
<html lang="en" style={{ opacity: 0 }}>
```

**Check in `globals.css`:**
```css
/* ✅ CORRECT - transition: none prevents flash */
html.hydrating {
  opacity: 0;
  transition: none;
}

/* ❌ WRONG - transition while hidden causes flash */
html.hydrating {
  opacity: 0;
  transition: opacity 0.3s;
}
```

**Check in `HydrationProvider.tsx`:**
```tsx
// ✅ CORRECT - Class-based reveal only
html.classList.remove("hydrating");
html.classList.add("hydrated");

// ❌ WRONG - Inline style manipulation
html.style.opacity = "1";
html.style.removeProperty("opacity");
```

---

### 3. Dev Server Running Check

**Problem:** Dev server not running causes "redirected you too many times" error.

**Check:**
```bash
# Verify dev server is running
curl -sI http://localhost:3000
# Should return: HTTP/1.1 200 OK

# If not running, start it:
bun run dev
```

---

## Standard Project Structure

```
project/
├── .config/              # MUST be a directory (not a file!)
│   └── prisma/           # Prisma config location
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout with className="hydrating"
│   │   ├── page.tsx      # Main page
│   │   ├── globals.css   # Hydration CSS rules
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/route.ts
│   ├── components/
│   │   └── HydrationProvider.tsx  # Class-based reveal
│   └── lib/
│       ├── db.ts         # Prisma client export
│       └── auth.ts       # NextAuth configuration
├── scripts/
│   └── preflight-check.ts  # Automated checks
├── fix.md                # Issue documentation
└── package.json
```

---

## Required Files for Flicker-Free Apps

### `src/app/layout.tsx`
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="hydrating">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* NO inline opacity scripts! */}
      </head>
      <body>
        <HydrationProvider>
          {children}
        </HydrationProvider>
      </body>
    </html>
  );
}
```

### `src/app/globals.css`
```css
html {
  background-color: #FFF0F5; /* Match your app background */
}

html.hydrating {
  opacity: 0;
  transition: none; /* CRITICAL: Prevents flash */
}

html.hydrated {
  opacity: 1;
}

html.reveal {
  transition: opacity 0.15s ease-out;
}
```

### `src/components/HydrationProvider.tsx`
```tsx
"use client";

import { useEffect, useSyncExternalStore, useRef, useCallback, ReactNode } from "react";

export function HydrationProvider({ children }: { children: ReactNode }) {
  const hasRevealedRef = useRef(false);

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const revealContent = useCallback(() => {
    if (hasRevealedRef.current) return;
    hasRevealedRef.current = true;

    const html = document.documentElement;
    html.classList.add("reveal");
    
    requestAnimationFrame(() => {
      html.classList.remove("hydrating");
      html.classList.add("hydrated");
    });
  }, []);

  useEffect(() => {
    if (isHydrated) {
      revealContent();
    }
  }, [isHydrated, revealContent]);

  // Fallback timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasRevealedRef.current) revealContent();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [revealContent]);

  return <>{children}</>;
}
```

---

## Preflight Check Script

Create `scripts/preflight-check.ts` and run before starting dev:

```typescript
#!/usr/bin/env bun
import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
let hasErrors = false;

function check(name: string, passed: boolean, message: string) {
  console.log(passed ? '✅' : '❌', name + ':', message);
  if (!passed) hasErrors = true;
}

// 1. Check .config is a directory
const configPath = join(projectRoot, '.config');
if (existsSync(configPath)) {
  const stats = statSync(configPath);
  check('Config Directory', stats.isDirectory(), 
    stats.isDirectory() ? 'Is a directory' : 'Is a FILE - must be directory!');
}

// 2. Check Prisma client
try {
  require.resolve('@prisma/client');
  check('Prisma Client', true, 'Available');
} catch {
  check('Prisma Client', false, 'Not generated - run: bunx prisma generate');
}

// 3. Check globals.css for hydration rules
const cssPath = join(projectRoot, 'src/app/globals.css');
if (existsSync(cssPath)) {
  const css = readFileSync(cssPath, 'utf-8');
  check('Hydrating Class', css.includes('.hydrating'), 'Found in globals.css');
  check('Transition None', css.includes('transition: none'), 'Prevents flash');
}

// 4. Check layout.tsx for correct html setup
const layoutPath = join(projectRoot, 'src/app/layout.tsx');
if (existsSync(layoutPath)) {
  const layout = readFileSync(layoutPath, 'utf-8');
  check('Hydrating ClassName', layout.includes('className="hydrating"') || layout.includes("className='hydrating'"), 'Found');
  check('No Inline Opacity', !layout.includes('style={{ opacity'), 'No inline styles');
  check('Suppress Hydration', layout.includes('suppressHydrationWarning'), 'Found');
}

process.exit(hasErrors ? 1 : 0);
```

---

## Common Errors Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `CLIENT_FETCH_ERROR` | `.config` is a file | `mv .config .config-backup && mkdir -p .config/prisma` |
| `@prisma/client did not initialize` | Prisma not generated | `bunx prisma generate --schema=./prisma/schema.prisma` |
| Hydration mismatch | Inline opacity styles | Remove inline styles, use CSS classes |
| Page flickering | Missing `transition: none` | Add to `.hydrating` class |
| White flash | No background on html | Add `html { background-color: ... }` |
| "Redirected too many times" | Dev server not running | `bun run dev` |

---

## Quick Start Checklist for New Projects

- [ ] `.config` is a directory (not a file)
- [ ] Prisma schema exists in `prisma/schema.prisma`
- [ ] Prisma client generated
- [ ] `layout.tsx` has `className="hydrating"` on `<html>`
- [ ] `layout.tsx` has `suppressHydrationWarning` on `<html>`
- [ ] `globals.css` has `.hydrating { opacity: 0; transition: none; }`
- [ ] `globals.css` has `.hydrated { opacity: 1; }`
- [ ] `globals.css` has `html { background-color: ... }`
- [ ] `HydrationProvider` wraps children in `layout.tsx`
- [ ] NO inline `style={{ opacity` anywhere
- [ ] Dev server running on port 3000

---

## Run Preflight Before Dev

```bash
# Add to package.json scripts:
"preflight": "bun run scripts/preflight-check.ts"

# Run before starting:
bun run preflight && bun run dev
```

---

*Last Updated: March 2026*
*For: AI Agents building Next.js full-stack applications*
