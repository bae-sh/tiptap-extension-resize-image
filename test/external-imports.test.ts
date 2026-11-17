import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The package is "type": "module", so bundlers compile esm/index.js as strict ESM.
// A default import from an external package then resolves to the whole module object
// when the dependency is a CommonJS external or a Module Federation shared module,
// which caused "_tiptap_extension_image__WEBPACK_IMPORTED_MODULE_0__.extend is not a function" (#15).
const LIB = join(__dirname, '..', 'lib');
const DEFAULT_IMPORT_FROM_PACKAGE =
  /^import\s+(?!type\b)[A-Za-z_$][\w$]*\s*(,|\s+from)[^;]*from\s+'([^.'][^']*)'/gm;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

describe('imports from external packages', () => {
  it('uses named imports only', () => {
    const offenders = sourceFiles(LIB).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(DEFAULT_IMPORT_FROM_PACKAGE)].map(
        (match) => `${file.slice(LIB.length + 1)}: ${match[0]}`
      )
    );

    expect(offenders).toEqual([]);
  });
});
