

# Plan: Generate Downloadable Project Structure Document

I'll create a downloadable HTML file in the `public/` folder that contains the full project tree. You can then open it from the preview URL and save it (or copy the text).

## What it will contain

A single file `public/project-structure.txt` with the complete directory tree of the project, organized by folder, covering:

- Root config files (package.json, vite.config.ts, tsconfig, etc.)
- `src/` — all pages, components, hooks, data, types, utils, assets, integrations
- `supabase/` — all edge functions and migration files
- `public/` — static assets

## File format

Plain `.txt` file placed in `public/project-structure.txt`. Once deployed, you can download it at `https://live-reach.lovable.app/project-structure.txt` or from the preview URL.

## Content structure

```text
care-assist/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── capacitor.config.ts
├── components.json
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── public/
│   ├── favicon.ico / .png / .svg
│   ├── og-image.png
│   ├── robots.txt
│   ├── sitemap.xml
│   └── placeholder.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── WidgetApp.tsx
│   ├── vite-env.d.ts
│   ├── lib/utils.ts
│   ├── types/chat.ts
│   ├── utils/typoInjector.ts
│   ├── data/ (3 files)
│   ├── hooks/ (17 files)
│   ├── integrations/supabase/ (client.ts, types.ts)
│   ├── assets/ (logos, personas, testimonials, images)
│   ├── pages/ (28 pages + docs subfolder)
│   └── components/
│       ├── ui/ (51 shadcn components)
│       ├── dashboard/ (11 files)
│       ├── settings/ (9 files)
│       ├── admin/ (3 files)
│       ├── agent/ (1 file)
│       ├── auth/ (1 file)
│       ├── docs/ (4 files)
│       ├── landing/ (2 files)
│       ├── pricing/ (2 files)
│       ├── sidebar/ (2 files)
│       ├── video/ (2 files)
│       ├── widget/ (2 files)
│       └── 3 root components
├── supabase/
│   ├── config.toml
│   ├── functions/ (36 edge functions)
│   └── migrations/ (78 migration files)
```

The actual file will expand every folder fully with every filename listed.

## Implementation

One new file: `public/project-structure.txt`

