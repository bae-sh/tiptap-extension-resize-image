/**
 * Whitelist-based CSS style sanitizer.
 *
 * The image node persists its layout state in the `containerStyle` and
 * `wrapperStyle` attributes as raw CSS text. Without sanitization a crafted
 * document could embed arbitrary CSS (e.g. `position: fixed; top: 0; ...`,
 * `background: url(...)`, expressions, etc.) that would survive load and be
 * re-applied on every render, enabling UI redress, data exfiltration through
 * CSS, and tracking via remote URLs.
 *
 * This sanitizer accepts only the small set of properties the extension
 * actually uses for sizing/positioning and validates each value against
 * conservative patterns. Unknown properties, function calls (url(),
 * expression(), calc(), var(), attr(), ...), and unsafe characters are
 * stripped silently.
 */

const DIMENSION_TOKEN = /^-?\d+(?:\.\d+)?(?:px|em|rem|%|vw|vh)$|^auto$|^0$/i;

const isDimensionValue = (value: string): boolean => {
  // Accept single tokens or shorthand sequences like "0 auto" / "10px 0 0 5px"
  return value
    .trim()
    .split(/\s+/)
    .every((token) => DIMENSION_TOKEN.test(token));
};

const isOneOf = (allowed: readonly string[]) => (value: string) =>
  allowed.includes(value.trim().toLowerCase());

type Validator = (value: string) => boolean;

const ALLOWED_PROPERTIES: Record<string, Validator> = {
  width: isDimensionValue,
  height: isDimensionValue,
  'min-width': isDimensionValue,
  'max-width': isDimensionValue,
  'min-height': isDimensionValue,
  'max-height': isDimensionValue,

  display: isOneOf(['block', 'inline-block', 'inline', 'flex', 'none', 'contents']),
  float: isOneOf(['left', 'right', 'none']),
  'text-align': isOneOf(['left', 'center', 'right', 'justify']),

  margin: isDimensionValue,
  'margin-top': isDimensionValue,
  'margin-right': isDimensionValue,
  'margin-bottom': isDimensionValue,
  'margin-left': isDimensionValue,

  padding: isDimensionValue,
  'padding-top': isDimensionValue,
  'padding-right': isDimensionValue,
  'padding-bottom': isDimensionValue,
  'padding-left': isDimensionValue,

  cursor: isOneOf([
    'pointer',
    'default',
    'auto',
    'move',
    'text',
    'nwse-resize',
    'nesw-resize',
    'ew-resize',
    'ns-resize',
  ]),
};

// Reject any value containing characters that enable CSS escapes, function
// calls, or rule injection. This is checked before per-property validation
// as a coarse first pass.
const UNSAFE_VALUE = /[<>{}\\\(\)`@]|\/\*|\*\//;

/**
 * Returns a sanitized CSS declaration string containing only whitelisted
 * properties and validated values. Order is preserved; the output is
 * normalized as `prop: value;` declarations separated by single spaces.
 */
export function sanitizeStyle(input: string | null | undefined): string {
  if (!input) return '';

  const declarations: string[] = [];
  const seen = new Set<string>();

  for (const rawDecl of input.split(';')) {
    const colon = rawDecl.indexOf(':');
    if (colon === -1) continue;

    const property = rawDecl.slice(0, colon).trim().toLowerCase();
    const value = rawDecl.slice(colon + 1).trim();

    if (!property || !value) continue;
    if (seen.has(property)) continue;
    if (UNSAFE_VALUE.test(value)) continue;
    // CSS hacks like `!important` would not be useful here and could be
    // abused to override sibling rules; strip them entirely.
    if (/!important/i.test(value)) continue;

    const validate = ALLOWED_PROPERTIES[property];
    if (!validate || !validate(value)) continue;

    declarations.push(`${property}: ${value};`);
    seen.add(property);
  }

  return declarations.join(' ');
}
