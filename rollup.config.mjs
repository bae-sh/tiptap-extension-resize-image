import typescript from '@rollup/plugin-typescript';
import tslib from 'tslib';

export default [
  {
    input: 'lib/index.ts',
    output: [
      {
        dir: './dist',
        format: 'cjs',
        sourcemap: true,
        exports: 'auto',
      },
    ],
    external: ['@tiptap/core', '@tiptap/extension-image', '@tiptap/pm', 'tslib'],
    plugins: [
      typescript({
        tslib,
        tsconfig: './tsconfig.json',
      }),
    ],
  },
  {
    input: 'lib/index.ts',
    output: [
      {
        dir: './esm',
        format: 'esm',
        sourcemap: true,
        exports: 'auto',
      },
    ],
    external: ['@tiptap/core', '@tiptap/extension-image', '@tiptap/pm', 'tslib'],
    plugins: [
      typescript({
        tslib,
        tsconfig: './tsconfig.json',
        compilerOptions: {
          outDir: './esm',
          composite: false,
          declaration: false,
          declarationMap: false,
        },
      }),
    ],
  },
];
