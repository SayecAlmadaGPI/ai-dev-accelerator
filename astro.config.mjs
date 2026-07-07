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
      ],
    }),
  ],
});