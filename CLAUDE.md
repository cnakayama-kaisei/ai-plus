# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 project using the App Router, TypeScript, React 19, and Tailwind CSS v4. The project was bootstrapped with `create-next-app` and uses the modern Next.js App Router architecture.

## Development Commands

```bash
# Start development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Tech Stack

- **Framework**: Next.js 16.1.5 with App Router
- **React**: Version 19.2.3
- **TypeScript**: Version 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (loaded via next/font/google)
- **Linting**: ESLint with Next.js config (core-web-vitals and TypeScript presets)

## Project Structure

```
ai-plus-portal/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles with Tailwind directives
│   └── favicon.ico        # Site favicon
├── public/                # Static assets served from root
├── docs/                  # Documentation files
└── [config files]         # Various configuration files at root
```

## Architecture Notes

### App Router Structure
- Uses Next.js App Router (not Pages Router)
- `app/layout.tsx` is the root layout that wraps all pages
- `app/page.tsx` is the homepage (maps to `/` route)
- Pages auto-update on file changes during development

### TypeScript Configuration
- Path alias `@/*` maps to the project root (configured in tsconfig.json)
- Strict mode enabled
- Target: ES2017
- JSX mode: react-jsx (React 19 automatic JSX transform)

### Styling
- Tailwind CSS v4 with PostCSS plugin (`@tailwindcss/postcss`)
- Global styles in `app/globals.css`
- Supports dark mode via `dark:` class prefix
- Custom CSS variables for fonts (--font-geist-sans, --font-geist-mono)

### ESLint Configuration
- Uses Next.js recommended presets (core-web-vitals and TypeScript)
- Flat config format (eslint.config.mjs)
- Ignores: .next/, out/, build/, next-env.d.ts

## Font Loading
The project uses Next.js font optimization with Geist fonts loaded from Google Fonts. Font variables are applied to the body element in the root layout.
