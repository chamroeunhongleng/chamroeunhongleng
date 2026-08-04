# Local setup

## Requirements
- Node 24+ (`.nvmrc` pins it; `node --version` to check)
- npm 10+ (ships with Node 24)
- No Python, no global tools, no secrets — the site needs none to build.

## First run
```bash
npm install
npm run dev          # http://localhost:3000, review mode by default
```

## Modes locally
```bash
# default (review): owner content, unfinished fields render as visible chips
npm run dev

# demo: adds the demonstration banner
NUXT_PUBLIC_PORTFOLIO_MODE=demo npm run dev        # bash/zsh
$env:NUXT_PUBLIC_PORTFOLIO_MODE='demo'; npm run dev # PowerShell

# production build test — EXPECTED TO FAIL while placeholders remain:
npm run generate:production
```

## Everyday commands
```bash
npm run verify                 # the full 12-phase pipeline
npm run check:owner-content    # what content is still unfinished
npm run test                   # vitest suite
npm run generate               # static build to .output/public
npx serve .output/public       # preview the generated site
```

## Troubleshooting
- **`nuxt: not found` / missing types** → `npm install` again, then
  `npx nuxt prepare` (regenerates `.nuxt/`).
- **Scripts fail with import errors** → they run via jiti
  (`node --import jiti/register`); use the npm scripts, not plain `node`.
- **Generate fails in production mode** → that's the content gate working;
  read its violation list.
- **Port busy** → `npm run dev -- --port 3001`.
