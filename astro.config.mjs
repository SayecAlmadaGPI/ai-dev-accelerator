import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// El contenido de src/content/docs/ lo genera scripts/build-content.mjs
// (copy-on-build) antes de cada build/dev. La fuente canónica es la raíz
// del repo (modules/, labs/, cheatsheets/, templates/, examples/).
export default defineConfig({
  site: 'https://SayecAlmadaGPI.github.io',
  base: '/ai-dev-accelerator/',
  integrations: [
    starlight({
      title: 'AI Dev Accelerator',
      // Español neutro como único idioma, sin prefijo /es/ (root locale).
      locales: { root: { label: 'Español', lang: 'es' } },
      // social es un array de link items desde Starlight v0.33.
      social: [
        {
          label: 'GitHub',
          href: 'https://github.com/SayecAlmadaGPI/ai-dev-accelerator',
          icon: 'github',
        },
      ],
      // Design system ámbar + fonts. customCss acepta paths en src/ (no
      // public/) y paquetes npm cuyo main es CSS (los @fontsource cargan
      // los @font-face de Inter Variable y JetBrains Mono Variable).
      customCss: [
        '/src/styles/theme.css',
        '@fontsource-variable/inter',
        '@fontsource-variable/jetbrains-mono',
      ],
      // PWA (Fase 4b): manifest + theme-color. hrefs con base prefijada porque
      // los assets en public/ se sirven bajo /ai-dev-accelerator/.
      head: [
        { tag: 'link', attrs: { rel: 'manifest', href: '/ai-dev-accelerator/manifest.webmanifest' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#f59e0b' } },
        { tag: 'link', attrs: { rel: 'icon', href: '/ai-dev-accelerator/icon.svg', type: 'image/svg+xml' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/ai-dev-accelerator/icon.svg' } },
      ],
      // Overrides de componentes de Starlight (mapea clave -> path .astro).
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
        Hero: './src/components/Hero.astro',
        PageTitle: './src/components/PageTitle.astro',
      },
      // Desde Starlight v0.39, los grupos autogenerados van como
      // { label, items: [{ autogenerate: { directory } }] }.
      sidebar: [
        { slug: 'index', label: 'Inicio' },
        { label: 'Módulos', items: [{ autogenerate: { directory: 'modules' } }] },
        { label: 'Labs', items: [{ autogenerate: { directory: 'labs' } }] },
        { label: 'Cheatsheets', items: [{ autogenerate: { directory: 'cheatsheets' } }] },
        { label: 'Plantillas', items: [{ autogenerate: { directory: 'templates' } }] },
        { label: 'Ejemplos', items: [{ autogenerate: { directory: 'examples' } }] },
        { slug: 'blueprint', label: 'Blueprint' },
        { slug: 'simulador', label: 'Simulador' },
      ],
    }),
  ],
});