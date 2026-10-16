/* eslint-disable no-restricted-globals */

const CACHE_NAME_STATIC = "slb-static-v2";
const CACHE_NAME_DYNAMIC = "slb-dynamic-v2";

// Recursos esenciales que se precargan inmediatamente al instalar el Service Worker
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/catalogo",
  "/servicios",
  "/nosotros",
  "/novedades",
  "/terminos",
  "/privacidad"
];

// 1. INSTALACIÓN: Precarga de recursos estáticos clave
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME_STATIC).then((cache) => {
      console.log("[SW] Pre-cacheados recursos estáticos de Lady Barber");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Advertencia precaching:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. ACTIVACIÓN: Limpieza de versiones antiguas de caché
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME_STATIC && key !== CACHE_NAME_DYNAMIC) {
            console.log("[SW] Eliminando caché obsoleta:", key);
            return caches.delete(key);
          }
          return null;
        })
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH: Estrategia híbrida según el tipo de recurso
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo interceptar peticiones GET (no mutaciones POST, PUT, DELETE)
  if (req.method !== "GET") return;

  // Evitar interceptar extensiones de chrome o peticiones no http
  if (!url.protocol.startsWith("http")) return;

  // A. Peticiones a la API del Backend (Insumos, Servicios, Perfil)
  // Estrategia: Network-First con Fallback a Caché Dinámica
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME_DYNAMIC).then((cache) => {
              cache.put(req, resClone);
            });
          }
          return networkRes;
        })
        .catch(async () => {
          console.log("[SW] Offline: Recuperando API desde caché dinámico:", req.url);
          const cachedRes = await caches.match(req);
          if (cachedRes) {
            return cachedRes;
          }
          // Si no está en caché, devolver respuesta JSON vacía amigable
          return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" }
          });
        })
    );
    return;
  }

  // B. Peticiones de navegación (Páginas HTML): Network First con fallback a index.html en caché
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME_STATIC).then((cache) => {
            cache.put(req, resClone);
          });
          return networkRes;
        })
        .catch(async () => {
          const cachedPage = await caches.match(req);
          if (cachedPage) return cachedPage;
          return (await caches.match("/index.html")) || (await caches.match("/"));
        })
    );
    return;
  }

  // C. Archivos estáticos (imágenes, CSS, JS, fuentes): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME_STATIC).then((cache) => {
              cache.put(req, resClone);
            });
          }
          return networkRes;
        })
        .catch(() => {
          // Sin conexión: si no hay en caché, devolver fallback transparente para imágenes
          return null;
        });

      return cachedRes || fetchPromise;
    })
  );
});
