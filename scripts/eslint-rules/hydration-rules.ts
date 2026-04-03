/**
 * ESLint Rules for Hydration Flickering Prevention
 * ================================================
 *
 * This module provides custom ESLint rules to catch patterns that cause
 * hydration flickering before they become problems.
 *
 * Add to eslint.config.mjs:
 *
 * import { hydrationRules } from './scripts/eslint-rules/hydration-rules';
 *
 * export default [
 *   ...hydrationRules,
 *   // other configs
 * ];
 */

export const hydrationRules = {
  files: ['**/*.tsx', '**/*.ts'],
  rules: {
    'no-restricted-syntax': [
      'error',
      // Prevent inline opacity styles on html element
      {
        selector: 'JSXOpeningElement[name.name="html"] JSXAttribute[name.name="style"] ObjectExpression > Property[key.name="opacity"]',
        message: '❌ Do not set inline opacity on <html> element. Use CSS classes (.hydrating, .hydrated) instead. See fix.md for details.'
      },
      // Prevent document.documentElement.style.opacity
      {
        selector: 'MemberExpression[object.object.object.name="document"][object.object.property.name="documentElement"][object.property.name="style"][property.name="opacity"]',
        message: '❌ Do not manipulate document.documentElement.style.opacity directly. Use CSS classes instead. See fix.md for details.'
      },
      // Prevent document.documentElement.style.visibility
      {
        selector: 'MemberExpression[object.object.object.name="document"][object.object.property.name="documentElement"][object.property.name="style"][property.name="visibility"]',
        message: '❌ Do not manipulate document.documentElement.style.visibility directly. Use CSS classes instead. See fix.md for details.'
      }
    ]
  }
};

/**
 * Quick Reference for Developers
 * ===============================
 *
 * ❌ WRONG (causes flickering):
 *
 * // Inline style on html
 * <html style={{ opacity: 0 }}>
 *
 * // Script manipulating opacity
 * document.documentElement.style.opacity = '0';
 * html.style.removeProperty('opacity');
 *
 * // Multiple opacity setters
 * // In one file:
 * html.style.opacity = '0';
 * // In another file:
 * html.style.opacity = '1';
 *
 *
 * ✅ CORRECT (no flickering):
 *
 * // layout.tsx - just use className
 * <html className="hydrating" suppressHydrationWarning>
 *
 * // globals.css - CSS controls opacity
 * html.hydrating { opacity: 0; transition: none; }
 * html.hydrated { opacity: 1; }
 *
 * // HydrationProvider.tsx - class-based reveal only
 * html.classList.remove('hydrating');
 * html.classList.add('hydrated');
 */
