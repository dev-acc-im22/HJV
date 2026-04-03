# Fix Documentation: Hydration Flickering Issue

## Issue Summary

**Problem:** The preview panel was flickering during page load due to conflicting hydration scripts setting `visibility` at different times.

**Symptoms:**
- Brief flash of unstyled content (FOUC)
- Page content appearing/disappearing rapidly on load
- Inconsistent visibility state during hydration

**Root Cause:** Multiple sources were managing the `visibility` CSS property, causing race conditions.

---

## The Problem Explained

```
┌─────────────────────────────────────────────────────────────┐
│                    THE FLICKERING CAUSE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ BEFORE (Multiple Conflicting Sources):                  │
│                                                             │
│  1. HTML renders (server)                                   │
│  2. BlockingScript sets visibility:hidden                   │
│  3. HydrationScript sets visibility:visible ← TOO EARLY!    │
│  4. Content flashes on screen                               │
│  5. HydrationProvider tries to add 'hydrated' class         │
│  6. Another script removes/adds visibility again            │
│  7. FLICKER HAPPENS!                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## The Solution

```
┌─────────────────────────────────────────────────────────────┐
│                    THE FIX                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ AFTER (Single Source of Truth):                         │
│                                                             │
│  1. HTML renders with style="visibility:hidden" (inline)    │
│     - This is the PRIMARY blocker                           │
│     - No CSS needed to hide initially                       │
│                                                             │
│  2. HydrationScript runs                                    │
│     - ONLY sets theme from localStorage                     │
│     - Does NOT touch visibility                             │
│                                                             │
│  3. React hydrates                                          │
│                                                             │
│  4. Zustand persist rehydrates                              │
│                                                             │
│  5. HydrationProvider detects BOTH complete                 │
│     - Uses useSyncExternalStore for React                   │
│     - Uses persist.hasHydrated() for Zustand                │
│                                                             │
│  6. HydrationProvider sets visibility:visible               │
│     - Uses requestAnimationFrame for smoothness             │
│     - Adds 'hydrated' class                                 │
│                                                             │
│  RESULT: Clean, flicker-free render!                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Modified

### 1. `src/app/layout.tsx` - Inline Style (CRITICAL)

**Before:**
```tsx
<html lang="en" suppressHydrationWarning>
```

**After:**
```tsx
<html lang="en" suppressHydrationWarning className="hydrating" style={{ visibility: 'hidden' }}>
```

**Why:** The inline style hides content BEFORE CSS loads, preventing any flash.

---

### 2. `src/app/globals.css` - CSS Fallback

**Added:**
```css
/* Fallback in case inline style is stripped */
html:not(.hydrated) {
  visibility: hidden;
}

html.hydrated {
  visibility: visible !important;
}
```

**Why:** Provides a CSS-based fallback if the inline style is somehow removed or not applied.

---

### 3. `src/components/HydrationProvider.tsx` - Single Source of Truth

**Created new file:**
```tsx
"use client";

import { useEffect, useSyncExternalStore, createContext, useContext, ReactNode } from "react";

// Type for Zustand persist API
interface PersistState {
  hasHydrated: () => boolean;
  onHydrate?: (callback: () => void) => () => void;
  setOptions?: (options: unknown) => void;
}

// Context for Zustand persist instance
const PersistContext = createContext<PersistState | null>(null);

// Hook to access the persist state from a provider
export function usePersistState() {
  return useContext(PersistContext);
}

// Subscribe to React hydration state
function subscribe(callback: () => void) {
  return () => {};
}

// Get snapshot of React hydration state (always true on client after hydration)
function getSnapshot() {
  return true;
}

// Server snapshot - always false on server
function getServerSnapshot() {
  return false;
}

interface HydrationProviderProps {
  children: ReactNode;
  persist?: PersistState;
  onHydrated?: () => void;
}

/**
 * HydrationProvider ensures visibility is set to visible only after:
 * 1. React hydration is complete (detected via useSyncExternalStore)
 * 2. Zustand persist rehydration is complete (if persist is provided)
 */
export function HydrationProvider({ children, persist, onHydrated }: HydrationProviderProps) {
  // Detect React hydration completion
  const isReactHydrated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Check Zustand hydration state
  const isZustandHydrated = persist?.hasHydrated?.() ?? true;

  // Only ready when BOTH React and Zustand are hydrated
  const isReady = isReactHydrated && isZustandHydrated;

  useEffect(() => {
    if (isReady && typeof window !== "undefined") {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const html = document.documentElement;
        html.classList.remove("hydrating");
        html.classList.add("hydrated");
        html.style.visibility = "visible"; // ✅ Single source of truth!
        
        onHydrated?.();
      });
    }
  }, [isReady, onHydrated]);

  return (
    <PersistContext.Provider value={persist ?? null}>
      {children}
    </PersistContext.Provider>
  );
}

export default HydrationProvider;
```

**Why:** This is the ONLY place that should set `visibility: visible`. It waits for both React and Zustand hydration to complete.

---

## Prevention Guidelines

### ✅ DO

1. **Always use inline style for initial hidden state**
   ```tsx
   <html style={{ visibility: 'hidden' }}>
   ```

2. **Keep HydrationProvider as the single source of truth for visibility**
   - Only `HydrationProvider.tsx` should set `visibility: visible`

3. **Use CSS fallback for safety**
   ```css
   html:not(.hydrated) { visibility: hidden; }
   html.hydrated { visibility: visible !important; }
   ```

4. **Use `requestAnimationFrame` for smooth transitions**
   ```tsx
   requestAnimationFrame(() => {
     html.style.visibility = "visible";
   });
   ```

5. **Wait for ALL hydration to complete**
   - React hydration (`useSyncExternalStore`)
   - State persistence rehydration (`persist.hasHydrated()`)

---

### ❌ DON'T

1. **NEVER set `visibility: visible` in multiple places**
   ```tsx
   // ❌ WRONG - causes flickering
   // In HydrationScript.tsx
   html.style.visibility = 'visible';
   
   // In HydrationProvider.tsx
   html.style.visibility = 'visible';
   ```

2. **NEVER set visibility too early in the hydration process**
   ```tsx
   // ❌ WRONG - runs before React is ready
   useEffect(() => {
     document.documentElement.style.visibility = 'visible';
   }, []); // Missing dependency check
   ```

3. **NEVER rely solely on CSS for initial hidden state**
   ```css
   /* ❌ INSUFFICIENT - CSS may load after HTML */
   html { visibility: hidden; }
   ```

4. **NEVER skip `requestAnimationFrame`**
   ```tsx
   // ❌ WRONG - may cause visual glitch
   html.style.visibility = "visible";
   
   // ✅ CORRECT - smooth transition
   requestAnimationFrame(() => {
     html.style.visibility = "visible";
   });
   ```

5. **NEVER forget `suppressHydrationWarning` on html element**
   ```tsx
   // ❌ MISSING - causes hydration mismatch warning
   <html lang="en" style={{ visibility: 'hidden' }}>
   
   // ✅ CORRECT
   <html lang="en" suppressHydrationWarning style={{ visibility: 'hidden' }}>
   ```

---

## Testing for Flickering

### Manual Testing Steps

1. Open browser DevTools (F12)
2. Go to Network tab → select "Slow 3G" throttling
3. Hard refresh the page (Ctrl+Shift+R)
4. Watch for any flash of content during load
5. There should be NO visible flickering

### Automated Testing (Optional)

```typescript
// Example Playwright test
test('no flickering on page load', async ({ page }) => {
  // Slow down network
  await page.route('**/*', route => {
    return new Promise(resolve => setTimeout(resolve, 100))
      .then(() => route.continue());
  });
  
  // Track visibility changes
  const visibilityChanges: string[] = [];
  await page.exposeFunction('onVisibilityChange', (visibility: string) => {
    visibilityChanges.push(visibility);
  });
  
  await page.evaluateOnNewDocument(() => {
    const observer = new MutationObserver(() => {
      const visibility = getComputedStyle(document.documentElement).visibility;
      (window as any).onVisibilityChange(visibility);
    });
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['style', 'class'] 
    });
  });
  
  await page.goto('/');
  
  // Visibility should only change once: hidden -> visible
  expect(visibilityChanges.filter(v => v === 'visible').length).toBeLessThanOrEqual(1);
});
```

---

## Quick Reference Checklist

When implementing or modifying hydration logic:

- [ ] Inline `style={{ visibility: 'hidden' }}` on `<html>` element
- [ ] `suppressHydrationWarning` on `<html>` element
- [ ] `className="hydrating"` on `<html>` element
- [ ] CSS fallback in `globals.css`
- [ ] `HydrationProvider` wraps children in `layout.tsx`
- [ ] NO other scripts set `visibility: visible`
- [ ] `requestAnimationFrame` used for smooth transition
- [ ] Both React and Zustand hydration checked before showing

---

## Related Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with inline visibility style |
| `src/app/globals.css` | CSS fallback for visibility |
| `src/components/HydrationProvider.tsx` | Single source of truth for visibility |

---

## Commit Reference

- **Commit:** `f0c044a`
- **Message:** "fix: Eliminate flickering with single source of truth for visibility - Add inline style to html element, HydrationProvider manages visibility, CSS fallback added"

---

## Key Principles Summary

| Principle | Why It Matters |
|-----------|---------------|
| **Inline style on `<html>`** | Hides content BEFORE CSS loads |
| **Single visibility manager** | Prevents race conditions |
| **Wait for React + Zustand** | Both must be ready before showing |
| **requestAnimationFrame** | Ensures smooth visual transition |
| **CSS fallback** | Safety net if inline style is stripped |

---

*Last Updated: March 2025*
*Author: Development Team*
