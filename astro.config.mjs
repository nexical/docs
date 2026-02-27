// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
import sidebar from './src/sidebar.json';
import meta from './src/meta.json';

export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE,
  integrations: [
    starlight({
      title: meta.title,
      logo: {
        src: './src/assets/logo.svg',
      },
      favicon: '/favicon.svg',
      social: /** @type {any} */ (meta.social),
      sidebar: [
        ...(meta.sidebar?.header || []),
        ...sidebar,
        ...(meta.sidebar?.footer || []),
      ],
    }),
  ],
});
