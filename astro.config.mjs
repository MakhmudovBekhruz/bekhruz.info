// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// Static output; the root `functions/` dir (Pages Functions, e.g. /api/contact)
// is deployed by Cloudflare Pages alongside `dist/` — no adapter needed.
export default defineConfig({
  site: 'https://bekhruz.info',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'uz'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // cv-print is the internal print template behind the generated CV PDF
      filter: (page) => !page.includes('/cv-print/'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ru: 'ru', uz: 'uz' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
