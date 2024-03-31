# `tiptap-extension-resize-image`

![tiptap-extension-resize-image](https://github.com/bae-sh/tiptap-extension-resize-image/assets/37887690/48f47053-2ad3-4413-8b54-9a63e12e0fb5)

[Tiptap](https://tiptap.dev/) is a suite of open source content editing and real-time collaboration tools for developers building apps like Notion or Google Docs.

This package provides the ability to adjust the size of the tip tab image. It has been tested in React, Vue, and NextJS, and stability in [VanillaJS](https://codesandbox.io/p/devbox/image-resize-js-82z7cv?file=%2Fsrc%2Findex.mjs%3A7%2C47)
may not be guaranteed.

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

## Work in Progress

We're currently developing image alignment functionality, allowing you to align your images left, right, or center.
