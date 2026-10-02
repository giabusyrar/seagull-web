# Next.js brand example

What a brand app looks like on `@gateway-experience/beauty-sdk`:

- `app/api/beauty/[...path]/route.ts` — the proxy; the API key stays on the server.
- `app/layout.tsx` — imports the SDK stylesheet before the app's own CSS.
- `app/globals.css` — theming through `--bsdk-*` variables and `[data-bsdk-part]`.
- `app/Demo.tsx` — provider, a hook and a component, with a message override.
- `app/brands/page.tsx` — a Server Component using the React-free client.

`npm run verify` builds and packs the SDK, installs the tarball and runs `next build`.
