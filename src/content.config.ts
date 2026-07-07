import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  // schema: docsSchema() es OBLIGATORIO: sin él, frontmatter como `draft`
  // no recibe su default `false` y el filtro de producción de Starlight
  // (data.draft === false) excluye TODAS las entradas -> routes vacío.
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};