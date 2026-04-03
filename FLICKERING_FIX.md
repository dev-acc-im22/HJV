# FLICKERING FIX - PERMANENT SOLUTION

> **CRITICAL DOCUMENTATION** - Last Updated: March 2025
> 
> This document describes the permanent fix for the hydration flickering issue.
> **DO NOT MODIFY** any related code without understanding this solution completely.

---

## Quick Reference

| File | Purpose | Status |
|------|---------|--------|
| `src/app/layout.tsx` | HTML element with inline `visibility: hidden` | ✅ Configured |
| `src/app/globals.css` | CSS fallback rules | ✅ Active |
| `src/components/HydrationProvider.tsx` | Single source of truth | ✅ Implemented |

---

## Problem Description

### Symptoms
- Brief flash of unstyled content (FOUC) on page load
- Page content appearing/disappearing rapidly
- White screen flicker during navigation
- Content visible before React is ready

### Root Cause
Multiple sources managing `visibility` CSS property, causing race conditions and multiple visibility changes during hydration.

---

## The Solution: Three-Layer Defense

### Layer 1: Inline Style (PRIMARY)
```tsx
// src/app/layout.tsx
<html 
  lang="en" 
  suppressHydrationWarning 
  className="hydrating" 
  style={{ visibility: 'hidden' }}
>
```
- Applied immediately on HTML render
- No dependency on CSS or JS loading

### Layer 2: CSS Fallback (BACKUP)
```css
/* src/app/globals.css */
html.hydrating,
html:not(.hydrated) {
  visibility: hidden !important;
  opacity: 0;
}

html.hydrated {
  visibility: visible !important;
  opacity: 1 !important;
}
```
- Catches cases where inline style might be stripped
- Multiple selectors for safety

### Layer 3: HydrationProvider (SINGLE SOURCE OF TRUTH)
```tsx
// src/components/HydrationProvider.tsx
// ONLY this component sets visibility: visible
// Waits for both React AND Zustand hydration
```
- Waits for React hydration (`useSyncExternalStore`)
- Waits for Zustand rehydration (`persist.hasHydrated()`)
- Uses `requestAnimationFrame` for smooth transition
- Has 5-second fallback timeout

---

## State Transitions

```
Initial State:
  html.hydrating + visibility:hidden (inline) + opacity:0

Final State:
  html.hydrated + visibility:visible + opacity:1
```

---

## Prevention Guidelines

### ✅ DO
- Only `HydrationProvider.tsx` sets `visibility: visible`
- Use inline style for initial hidden state
- Include CSS fallback with `!important`
- Wait for ALL hydration to complete before showing

### ❌ DON'T
- NEVER set `visibility: visible` in multiple places
- NEVER set visibility too early (before React is ready)
- NEVER rely solely on CSS for initial hidden state
- NEVER skip `suppressHydrationWarning`

---

## Testing

1. **Hard refresh** (Ctrl+Shift+R) - No flash should occur
2. **Slow 3G network** - Content stays hidden until fully loaded
3. **Console check** - Should see exactly ONE "[HydrationProvider] Content visible" message

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Content never appears | HydrationProvider missing | Add to layout.tsx |
| Content flickers once | Multiple visibility setters | Remove duplicate setters |
| Content shows unstyled | Inline style missing | Add style to html element |

---

*For detailed documentation, see the comprehensive version in the project archive.*
