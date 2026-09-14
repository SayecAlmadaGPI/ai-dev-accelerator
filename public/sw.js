// Service worker de AI Dev Accelerator (Fase 4b).
// Cache de runtime stale-while-revalidate para GETs same-origin: tras la
// primera visita, el sitio sirve offline. Scope = /ai-dev-accelerator/.
// Sin precache masivo (runtime cache basta); precache ligero del start_url.

const CACHE = 'aida-v2';
const MAX_RUNTIME_ENTRIES = 80;
const START_URL = '/ai-dev-accelerator/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.add(START_URL).catch(() => {})),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

// Escribe en el caché de runtime con evicción FIFO: si al insertar se
// supera MAX_RUNTIME_ENTRIES, borra las entradas más viejas (el Cache API
// conserva las claves en orden de inserción).
async function cacheRuntime(req, res) {
  const c = await caches.open(CACHE);
  const keys = await c.keys();
  const exceso = keys.length - MAX_RUNTIME_ENTRIES + 1;
  for (let i = 0; i < exceso; i++) {
    await c.delete(keys[i]);
  }
  await c.put(req, res);
}

// Stale-while-revalidate: sirve el caché al instante y refresca por detrás.
// Solo cachea respuestas útiles: ok para same-origin; las del CDN cross-origin
// llegan opacas (status 0) y también sirven offline.
function staleWhileRevalidate(req, event) {
  return caches.match(req).then((cached) => {
    const network = fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          event.waitUntil(cacheRuntime(req, res.clone()));
        }
        return res;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // CDN de Mermaid: mismo stale-while-revalidate para que los diagramas
  // sigan funcionando offline tras la primera carga.
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(staleWhileRevalidate(req, event));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Navegacion: network-first con fallback a cache (sirve offline tras visita).
  // Solo cachea respuestas ok: un 404/500 nunca debe quedarse como página.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) event.waitUntil(cacheRuntime(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(START_URL))),
    );
    return;
  }

  // Assets: stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req, event));
});