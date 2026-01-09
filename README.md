# `tiptap-extension-resize-image`

[![npm version](https://img.shields.io/npm/v/tiptap-extension-resize-image.svg)](https://www.npmjs.com/package/tiptap-extension-resize-image)
[![npm downloads](https://img.shields.io/npm/dm/tiptap-extension-resize-image.svg)](https://www.npmjs.com/package/tiptap-extension-resize-image)
[![license](https://img.shields.io/npm/l/tiptap-extension-resize-image.svg)](https://github.com/bae-sh/tiptap-extension-resize-image/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/bae-sh/tiptap-extension-resize-image.svg?style=social)](https://github.com/bae-sh/tiptap-extension-resize-image)

![tiptap-extension-resize-image](https://github.com/bae-sh/tiptap-extension-resize-image/assets/37887690/e79f3d2a-c2df-4506-ac4a-fb71918569b4)

[Tiptap](https://tiptap.dev/) is a suite of open source content editing and real-time collaboration tools for developers building apps like Notion or Google Docs.

This package provides the ability to adjust the size of the tip tab image. It has been tested in [React](https://codesandbox.io/p/devbox/react-tiptap-image-extension-3ztv5s?file=%2Fsrc%2Ftiptap.tsx%3A5%2C26-5%2C55), [Vue](https://codesandbox.io/p/devbox/vue-tiptap-image-extension-tvxx62?file=%2Fsrc%2FTiptap.vue%3A9%2C1), and [NextJS](https://codesandbox.io/p/devbox/nextjs-tiptap-image-extension-nk6v7p?file=%2Fapp%2Ftiptap.tsx%3A17%2C1), and stability in VanillaJS may not be guaranteed. Additionally, it can align the image position.

## Compatibility

| tiptap-extension-resize-image | Supported TipTap Versions |
| ----------------------------- | ------------------------- |
| ≤ 1.2.2                       | v2 only                   |
| ≥ 1.2.3                       | v2 and v3                 |

## Installation

You can install it using npm:

```bash
$ npm install tiptap-extension-resize-image
```

## Usage

```javascript
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import { EditorContent, useEditor } from '@tiptap/react';

const editor = useEditor({
  extensions: [StarterKit, ImageResize],
  content: `<img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />`,
});
```

### Use as inline

If you want to render images as inline elements, you can configure the extension like this:

```javascript
const editor = useEditor({
  extensions: [
    StarterKit,
    ImageResize.configure({
      inline: true,
    }),
  ],
  content: `<img src="..."/>`,
});
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.
