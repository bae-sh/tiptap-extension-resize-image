import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'lib/index.ts',
    output: [
      { dir: 'dist', format: 'cjs', sourcemap: true, exports: 'named' },
      { dir: 'esm', format: 'esm', sourcemap: true, exports: 'named' },
    ],
    external: ['@tiptap/core', '@tiptap/extension-image', '@tiptap/pm', 'tslib'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        declarationMap: false,
        outDir: undefined,
      }),
    ],
  },
];
