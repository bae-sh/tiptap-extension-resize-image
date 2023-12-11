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
      },
    ],
    plugins: [
      typescript({
        tslib,
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
      },
    ],
    plugins: [
      typescript({
        outDir: './esm',
        declaration: false,
        tslib,
      }),
    ],
  },
];

//   [
//   {
//     input: 'lib/index.ts',
//     output: modules.map({ dir, format } =>(return {

//     }));
//     output: [
//       {
//         dir: './dist',
//         file: 'index.js',
//         format: 'cjs',
//       },
//     ],
//     plugins: [
//       typescript({
//         tslib,
//       }),
//     ],
//     external: ['@tiptap/extension-image'],
//   },
//   {
//     input: 'lib/index.ts',
//     output: [
//       {
//         dir: './esm',
//         format: 'esm',
//       },
//     ],
//     plugins: [
//       typescript({
//         outDir: './esm',
//         tslib,
//       }),
//     ],
//     external: ['@tiptap/extension-image'],
//   },
// ];
