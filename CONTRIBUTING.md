# Contributing to tiptap-extension-resize-image

First off, thank you for considering contributing to tiptap-extension-resize-image! 🎉

This document provides guidelines and steps for contributing. Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Tiptap Version Compatibility](#tiptap-version-compatibility)
- [Style Guide](#style-guide)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots, GIFs)
- **Describe the behavior you observed and what you expected**
- **Include your environment details:**
  - tiptap-extension-resize-image version
  - Tiptap version (v2 or v3)
  - Framework (React, Vue, Next.js, etc.)
  - Browser and version

### Suggesting Features

Feature suggestions are welcome! Please provide:

- **A clear and descriptive title**
- **Detailed description of the proposed feature**
- **Explain why this feature would be useful**
- **Include mockups or examples if possible**

### Pull Requests

1. Fork the repository and create your branch from `main`
2. Ensure your code follows the existing style
3. Make sure your code lints without errors
4. Test your changes with both Tiptap v2 and v3 (see [Tiptap Version Compatibility](#tiptap-version-compatibility))
5. Write a clear PR description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/tiptap-extension-resize-image.git

# Navigate to the project directory
cd tiptap-extension-resize-image

# Install dependencies
yarn install
```

You can test your changes by linking the package locally:

```bash
# In tiptap-extension-resize-image directory
yarn link

# In your test project
yarn link tiptap-extension-resize-image
```

## Tiptap Version Compatibility

This package supports both Tiptap v2 and v3:

| tiptap-extension-resize-image | Supported Tiptap Versions |
| ----------------------------- | ------------------------- |
| ≤ 1.2.2                       | v2 only                   |
| ≥ 1.2.3                       | v2 and v3                 |

**When submitting a PR, please ensure your changes work with both Tiptap v2 and v3.** If your change is version-specific, clearly note this in your PR description.

You can test compatibility using the provided examples:
- [React Example](https://codesandbox.io/p/devbox/react-tiptap-image-extension-3ztv5s)
- [Vue Example](https://codesandbox.io/p/devbox/vue-tiptap-image-extension-tvxx62)
- [Next.js Example](https://codesandbox.io/p/devbox/nextjs-tiptap-image-extension-nk6v7p)

## Style Guide

### Code Style

- We use [Prettier](https://prettier.io/) for code formatting
- Configuration is in `.prettierrc`
- Run Prettier before committing:

```bash
yarn prettier --write .
```

### TypeScript

- Use TypeScript for all new code
- Ensure proper type definitions
- Avoid using `any` type when possible

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `chore`: Changes to the build process or auxiliary tools

### Examples

```
feat: add aspect ratio lock option

fix: resolve image resize handle positioning in RTL mode

docs: update README with Vue 3 example
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

---

Thank you for contributing! 🙏
