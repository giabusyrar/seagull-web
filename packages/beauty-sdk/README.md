# @gateway-experience/beauty-sdk

Beauty experiences for brand Next.js (App Router) apps: a typed client, a
server-side proxy that keeps the gateway API key off the browser, headless
hooks, and ready-made components you can theme, restyle or replace.

## Install

Copy `.npmrc.example` to your app's `.npmrc` (registry + read-only token), then:

    npm install @gateway-experience/beauty-sdk

## Set up (three files)

1. `app/api/beauty/[...path]/route.ts`

       import { createBeautyProxy } from '@gateway-experience/beauty-sdk/server';
       export const { GET, POST } = createBeautyProxy({
         gatewayUrl: process.env.BEAUTY_GATEWAY_URL!,
         apiKey: process.env.BEAUTY_API_KEY!,
         brandId: process.env.BEAUTY_BRAND_ID!,
         applicationId: process.env.BEAUTY_APP_ID!,
         // authorize: async (req) => ({ customerId: ... }) — for customer-scoped operations (none in this release; they return in phase 5)
       });

   The API key must come from server env (never a NEXT_PUBLIC_ variable); the browser client never sees it. `createBeautyProxy` throws at construction, naming the field, if any of the four options is missing or empty.

2. `app/layout.tsx` — import the stylesheet before your own CSS:

       import '@gateway-experience/beauty-sdk/styles.css';

3. Wrap the client part of your page:

       'use client';
       import { BeautyProvider } from '@gateway-experience/beauty-sdk/react';
       <BeautyProvider baseUrl="/api/beauty" locale="id">…</BeautyProvider>

## Customise

1. Theme: set `--bsdk-primary`, `--bsdk-primary-foreground`, `--bsdk-foreground`,
   `--bsdk-muted`, `--bsdk-muted-foreground`, `--bsdk-border`, `--bsdk-card`,
   `--bsdk-destructive`, `--bsdk-warning`, `--bsdk-success`, `--bsdk-radius`,
   `--bsdk-font` on `:root` or a container.
2. Classes: `className` and `classNames={{ part: '…' }}`; every element has a
   stable `data-bsdk-part`.
3. Render props: replace a piece and keep the default (`renderSlot(slot, Default)`).
4. Headless: hooks from `/react`, pure helpers and the client from `/client`.
5. Copy: `<BeautyProvider messages={{ key: 'text' }}>`; Indonesian and English ship.

Import the SDK stylesheet before your own CSS. If you declare your own `@layer` order before importing it, put `bsdk` first so your layers win.

The stylesheet keeps every rule in `@layer bsdk*` except two Tailwind v4 internals that cannot be layered: `@property --tw-*` registrations and an `@layer properties` block of `--tw-*` initial values. They match what a Tailwind v4 app registers itself.

## Entry points

| Import | Use |
|---|---|
| `/client` | Typed client and helpers (Server Components too) |
| `/server` | `createBeautyProxy` |
| `/react` | Provider, messages, hooks |
| `/photo` | Photo components |
| `/styles.css` | The stylesheet |

The legacy root, `/core`, `/hooks`, `/ui`, `/vision` and `/types` entries remain
until the experience that replaces each one ships.
