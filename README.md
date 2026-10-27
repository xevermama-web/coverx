# CoverX Pro — Master deploy project

One React + TypeScript + Vite project works on **both Netlify and Cloudflare Pages**. Upload the *contents* of this project to the root of a Git repository. It uses no server/API and requires no environment variables.

## Deploy to Netlify

- Repository: connect this repository and the `main` branch.
- Base directory: leave empty (repository root).
- Build command: `npm run build` (also configured in `netlify.toml`).
- Publish directory: `dist`.
- Node.js: 22 (set in `.node-version`, `.nvmrc`, and `netlify.toml`).

If your existing Netlify project still has `bun run build` configured, change it to `npm run build`, or rely on the included `netlify.toml`. Clear the deploy cache when replacing an older version.

## Deploy to Cloudflare Pages

- Connect the **same repository** under Workers & Pages → Pages.
- Framework preset: React (Vite) or none.
- Production branch: `main`.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Root directory: repository root (empty/default).
- Set `NODE_VERSION=22` in Pages build environment variables if the build image does not honor `.node-version`.

`public/_redirects` provides the single-page route fallback on both platforms. Do not set a Workers build command or `wrangler deploy`; this is a **Pages** static site.

## Work locally

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

**Project structure:** `index.html`, `src/main.tsx`, `src/App.tsx`, `src/components`, `src/context`, `public`, `package.json`, `vite.config.ts` must all live at repository root with the same folder layout. The compiled website is emitted to `dist/`.

## Browser-saved logo and details

- University name, course title, people details, title checkbox and other text inputs are saved in `localStorage`.
- An uploaded PNG/JPG/WEBP/GIF (up to 8 MB) is normalized to a circular 512 × 512 PNG and saved in IndexedDB; if IndexedDB is unavailable, the app attempts localStorage instead.
- The logo remains in subsequent visits until the user uploads another one, or clears the browser/site data. It is used in the preview, PDF and print output.
- Browser storage is *per origin*: a Netlify domain and a Cloudflare Pages domain do **not** automatically share the logo, and neither can sync across devices/browsers. Private browsing, storage restrictions, and clearing site data can erase saved information.
- No uploaded logo/data leaves the browser. Images are not uploaded to Netlify or Cloudflare.
- The first-visit default university logo is bundled locally in `public/briu-default-logo.png` so PDF output has no third-party image dependency.
- **Course title is required** for PDF/print. Optional title is off until its switch is enabled.

## Notes

The project relies on the browser's File API, Canvas, IndexedDB, html2canvas and jsPDF. Downloading a PDF or printing is done entirely in-browser; no API key, database or backend is necessary.
