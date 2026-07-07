// scripts/build-content.mjs
// Copy-on-build: transforma el markdown del curso (raíz del repo, fuente
// canónica y navegable en GitHub) en el contenido que Starlight espera en
// src/content/docs/, y copia los assets no-markdown a public/ para descarga.
//
// Lo corre automáticamente npm vía los lifecycle hooks `prebuild`/`predev`
// (ver package.json). El contenido generado NO se commitea (ver .gitignore);
// la raíz del repo sigue siendo la única fuente commiteada.
//
// Qué hace, por archivo .md:
//   1. Inyecta frontmatter `title:` derivado del primer H1 (saltando
//      comentarios HTML iniciales) y elimina ese H1 del body para no
//      duplicar el título de página de Starlight.
//   2. Reescribe los links internos `.md`/dir-index a slugs Starlight con
//      el prefijo `base` (constante BASE abajo, debe coincidir con
//      astro.config.mjs). Los links externos y anchors se dejan intactos.
// Los assets (.py/.sh/.json/.yaml/etc.) se copian espejados a public/.
// Para carpetas sin README (templates/, examples/) genera un index.md.

import { readFile, writeFile, mkdir, rm, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'src', 'content', 'docs');
const PUBLIC = path.join(ROOT, 'public');

// DEBE coincidir con `base` en astro.config.mjs.
const BASE = '/ai-dev-accelerator/';

const CONTENT_DIRS = ['modules', 'labs', 'cheatsheets', 'templates', 'examples'];
// Dotfolders / dirs de tooling que no se copian como contenido.
const SKIP_DIRS = new Set(['.claude', '.planning', '.git', 'node_modules', 'dist', 'src']);
const ASSET_EXTS = new Set(['.py', '.sh', '.json', '.yaml', '.yml', '.toml', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);

const GENERATED_DOCS = [...CONTENT_DIRS, 'index.md', 'blueprint.md'];
const GENERATED_PUBLIC = [...CONTENT_DIRS];

let copied = 0, assets = 0, skipped = 0, indexes = 0;

async function cleanGenerated() {
  for (const t of GENERATED_DOCS) await rm(path.join(DOCS, t), { recursive: true, force: true });
  for (const t of GENERATED_PUBLIC) await rm(path.join(PUBLIC, t), { recursive: true, force: true });
  await mkdir(DOCS, { recursive: true });
  await mkdir(PUBLIC, { recursive: true });
}

// --- frontmatter / título ---

// Saca comentarios HTML y blanks iniciales y devuelve el texto del primer H1.
function deriveTitle(body) {
  let s = body;
  while (true) {
    s = s.replace(/^\s+/, '');
    if (s.startsWith('<!--')) {
      const end = s.indexOf('-->');
      if (end === -1) return null;
      s = s.slice(end + 3);
    } else break;
  }
  const m = s.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

// Devuelve { fm, body } con frontmatter `title:` y body sin el primer H1.
function splitForOutput(content, fallbackSlug) {
  const title = deriveTitle(content) || fallbackSlug;
  const body = content
    .replace(/^[ \t]*#[ \t]+[^\n]*\n?/m, '')   // elimina el primer H1
    .replace(/^\n+/, '');
  const fm = `---\ntitle: ${JSON.stringify(title)}\n---\n\n`;
  return { fm, body };
}

// --- reescritura de links ---

function isInternal(href) {
  if (!href) return false;
  if (/^(https?:|mailto:|tel:|\/\/|#)/.test(href)) return false;
  return true;
}

// srcRelDir: dir del archivo fuente relativo a ROOT (posix), ej. 'modules',
// 'cheatsheets', 'templates/mcp-server-template', '' (raíz).
// Slug sin base ni trailing slash (igual que el interno de hrefToUrl).
function slugFromRelPath(relPath) {
  let p = relPath.replace(/\.(md|mdx)$/, '');
  if (p.endsWith('/README')) p = p.slice(0, -'/README'.length);
  if (p === 'README') p = '';
  return p.toLowerCase();
}

// srcRelDir: dir del archivo fuente relativo a ROOT (posix), ej. 'modules',
// 'cheatsheets', 'templates/mcp-server-template', '' (raíz).
function hrefToUrl(href, srcRelDir) {
  const hashIdx = href.indexOf('#');
  let linkPath = href, anchor = '';
  if (hashIdx !== -1) {
    anchor = href.slice(hashIdx + 1);
    linkPath = href.slice(0, hashIdx);
  }
  if (!linkPath) return anchor ? `${BASE}#${anchor}` : BASE;
  const resolved = path.posix.join(srcRelDir, linkPath);
  let slug;
  if (resolved.endsWith('.md') || resolved.endsWith('.mdx')) {
    let p = resolved.replace(/\.(md|mdx)$/, '');
    if (p.endsWith('/README')) p = p.slice(0, -'/README'.length);
    if (p === 'README') p = '';
    slug = p;
  } else {
    slug = resolved.replace(/\/$/, '');
  }
  // Minúsculas: GitHub Pages sirve case-sensitive y los archivos destino
  // se escriben en minúsculas (ver walk). Así link y ruta siempre coinciden.
  slug = slug.toLowerCase();
  let url = BASE + (slug ? slug + '/' : '');
  if (anchor) url += `#${anchor}`;
  return url;
}

function rewriteLinks(body, srcRelDir) {
  return body.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (m, text, href) => {
    if (!isInternal(href)) return m;
    return `[${text}](${hrefToUrl(href, srcRelDir)})`;
  });
}

// --- walk + copy ---

async function walk(srcAbsDir, relDir, destAbsDir, publicAbsDir, collector) {
  const entries = await readdir(srcAbsDir, { withFileTypes: true });
  await mkdir(destAbsDir, { recursive: true });
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) { skipped++; continue; }
    const srcAbs = path.join(srcAbsDir, e.name);
    if (e.isDirectory()) {
      await walk(
        srcAbs,
        relDir ? `${relDir}/${e.name}` : e.name,
        path.join(destAbsDir, e.name),
        path.join(publicAbsDir, e.name),
        collector,
      );
      continue;
    }
    if (!e.isFile()) continue;
    const ext = path.extname(e.name);
    const relPath = relDir ? `${relDir}/${e.name}` : e.name;
    if (ext === '.md' || ext === '.mdx') {
      const content = await readFile(srcAbs, 'utf8');
      const { fm, body } = splitForOutput(content, path.basename(e.name, ext));
      // Trackeables (Fase 3): modules/*.md (no README) y labs/lab-*/README.md.
      const lowerName = e.name.toLowerCase();
      const isModule = relDir === 'modules' && lowerName !== 'readme.md';
      const isLab = relDir.startsWith('labs/lab-') && lowerName === 'readme.md';
      let out = fm + rewriteLinks(body, relDir);
      // Quiz mount-point (Fase 4a): se inyecta al final de cada módulo. La isla
      // vanilla (src/scripts/quiz.ts) lo detecta y monta el quiz ahí.
      if (isModule) {
        const slug = slugFromRelPath(relPath);
        out += `\n\n<!-- quiz -->\n<div data-quiz-mount data-slug="${slug}"></div>\n`;
      }
      // README.md -> index.md: Astro no colapsa README a índice de directorio,
      // solo `index`. Renombrando logramos que labs/README.md sirva en /labs/
      // (slugToParam quita el `/index` final). Demás archivos, en minúsculas.
      const destName =
        e.name.toLowerCase() === 'readme.md' ? 'index.md' : e.name.toLowerCase();
      await writeFile(path.join(destAbsDir, destName), out, 'utf8');
      copied++;
      collector.mdPages.push(relPath);
      if (isModule || isLab) {
        collector.trackables.push({
          slug: slugFromRelPath(relPath),
          title: deriveTitle(content),
          group: isModule ? 'modules' : 'labs',
        });
      }
    } else {
      await mkdir(publicAbsDir, { recursive: true });
      await copyFile(srcAbs, path.join(publicAbsDir, e.name));
      assets++;
      collector.assets.push(relPath);
    }
  }
}

// Genera <topDir>/index.md listando páginas y assets descargables.
async function genIndex(topDir, title, collector) {
  const strip = `${topDir}/`;
  const pages = collector.mdPages
    .filter((p) => p.startsWith(strip))
    .map((p) => p.slice(strip.length));
  const files = collector.assets
    .filter((p) => p.startsWith(strip))
    .map((p) => p.slice(strip.length));

  let body = `# ${title}\n\nÍndice generado automáticamente desde \`${topDir}/\` (el contenido vive en la raíz del repo).\n\n`;
  if (pages.length) {
    body += `## Páginas\n\n`;
    for (const p of pages) {
      let slug = p.replace(/\.(md|mdx)$/, '');
      if (slug.endsWith('/README')) slug = slug.slice(0, -'/README'.length);
      const label = slug.split('/').pop() || slug || topDir; // display original-case
      slug = slug.toLowerCase();
      body += `- [${label}](${BASE}${topDir}/${slug ? slug + '/' : ''})\n`;
    }
  }
  if (files.length) {
    body += `\n## Archivos descargables\n\n`;
    for (const f of files) body += `- [${f}](${BASE}${topDir}/${f})\n`;
  }
  const fm = `---\ntitle: ${JSON.stringify(title)}\n---\n\n`;
  await mkdir(path.join(DOCS, topDir), { recursive: true });
  await writeFile(path.join(DOCS, topDir, 'index.md'), fm + body, 'utf8');
  indexes++;
}

async function copyRootFile(srcName, destName) {
  const content = await readFile(path.join(ROOT, srcName), 'utf8');
  const { fm, body } = splitForOutput(content, destName.replace(/\.md$/, ''));
  const out = fm + rewriteLinks(body, '');
  await writeFile(path.join(DOCS, destName), out, 'utf8');
  copied++;
}

// Index raíz (de README.md): además del frontmatter `title:`, inyecta un
// bloque `hero:` (title con gradient text, tagline, 2 CTA) para que
// Starlight renderice el Hero override. Los links llevan el prefijo BASE.
// El body del README (sin su H1, que pasa a ser el `title` de página) se
// renderiza debajo del hero. `template: doc` (default) deja el sidebar
// visible para la navegación del curso.
async function copyRootIndex() {
  const content = await readFile(path.join(ROOT, 'README.md'), 'utf8');
  const pageTitle = deriveTitle(content) || 'AI Accelerated Development';
  const { body } = splitForOutput(content, 'index');
  const heroTitle = "AI <span class='aida-grad'>Accelerated</span> Development";
  const tagline =
    'Spec-Driven Development como hilo conductor. Especifica, diseña el harness y verifica — sin depender del agente.';
  const fm =
    '---\n' +
    `title: ${JSON.stringify(pageTitle)}\n` +
    'hero:\n' +
    `  title: ${JSON.stringify(heroTitle)}\n` +
    `  tagline: ${JSON.stringify(tagline)}\n` +
    '  actions:\n' +
    `    - text: ${JSON.stringify('Empezar por M0')}\n` +
    `      link: ${JSON.stringify(BASE + 'modules/00-lenguaje-operativo/')}\n` +
    '      variant: primary\n' +
    '      icon: right-arrow\n' +
    `    - text: ${JSON.stringify('Ver el blueprint')}\n` +
    `      link: ${JSON.stringify(BASE + 'blueprint/')}\n` +
    '      variant: secondary\n' +
    '---\n\n';
  const out = fm + rewriteLinks(body, '');
  await writeFile(path.join(DOCS, 'index.md'), out, 'utf8');
  copied++;
}

async function main() {
  await cleanGenerated();
  const collector = { mdPages: [], assets: [], trackables: [] };

  for (const dir of CONTENT_DIRS) {
    const src = path.join(ROOT, dir);
    await walk(src, dir, path.join(DOCS, dir), path.join(PUBLIC, dir), collector);
    // ¿Hay un README.md en el tope de este dir? Si no, generar index.
    const hasReadme = collector.mdPages.includes(`${dir}/README.md`);
    if (!hasReadme) {
      const title = dir === 'templates' ? 'Plantillas' : dir === 'examples' ? 'Ejemplos' : dir;
      await genIndex(dir, title, collector);
    }
  }

  await copyRootIndex();
  await copyRootFile('BLUEPRINT.md', 'blueprint.md');

  // trackable.json (Fase 3): lista de páginas trackeables para el
  // ProgressOverview del landing y el filtro de PageTitle. Derivado del
  // filesystem (modules + labs), no hardcodeado. Gitignored.
  const sortedTrackables = [
    ...collector.trackables.filter((t) => t.group === 'modules').sort((a, b) => a.slug.localeCompare(b.slug)),
    ...collector.trackables.filter((t) => t.group === 'labs').sort((a, b) => a.slug.localeCompare(b.slug)),
  ];
  await mkdir(path.join(ROOT, 'src', 'data'), { recursive: true });
  await writeFile(
    path.join(ROOT, 'src', 'data', 'trackable.json'),
    JSON.stringify(sortedTrackables, null, 2),
    'utf8',
  );

  console.log(
    `build-content: ${copied} páginas, ${assets} assets, ${indexes} índices generados, ${skipped} dirs saltados, ${sortedTrackables.length} trackeables.`,
  );
  console.log(`  -> ${DOCS}`);
}

main().catch((err) => {
  console.error('build-content: ERROR');
  console.error(err);
  process.exit(1);
});