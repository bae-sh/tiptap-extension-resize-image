import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'lib/index.ts',
    output: [
      { dir: 'dist', format: 'cjs', sourcemap: true, exports: 'auto' },
      { dir: 'esm', format: 'esm', sourcemap: true, exports: 'auto' },
    ],
    external: ['@tiptap/core', '@tiptap/extension-image', '@tiptap/pm', 'tslib'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
];
