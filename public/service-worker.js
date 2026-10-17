/* eslint-disable no-restricted-globals */

const CACHE_NAME_STATIC = "slb-core-v4";
const CACHE_NAME_API = "slb-data-v4";

// Páginas de la SPA
const APP_ROUTES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/favicon-64x64.png",
  "/icon-192.png",
  "/icon-maskable-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/screenshot-desktop.png",
  "/screenshot-mobile.png",
  "/catalogo",
  "/servicios",
  "/nosotros",
  "/novedades",
  "/terminos",
  "/privacidad",
  "/login",
  "/registro"
];

// Endpoints de API requeridos para offline
const API_ENDPOINTS_TO_PRECACHE = [
  "https://salonladybarberbackend.onrender.com/api/perfil-empresa",
  "https://salonladybarberbackend.onrender.com/api/insumos",
  "https://salonladybarberbackend.onrender.com/api/servicios",
  "https://salonladybarberbackend.onrender.com/api/terminos-condiciones"
];

// 1. INSTALACIÓN
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(CACHE_NAME_STATIC);

      // A. Precargar rutas HTML de la app
      try {
        await staticCache.addAll(APP_ROUTES);
        console.log("[SW] Rutas base y estáticos precargados.");
      } catch (err) {
        console.warn("[SW] Advertencia precaching rutas:", err);
      }

      // B. Descubrir y precargar automáticamente los bundles JS y CSS de index.html
      try {
        const indexRes = await fetch("/index.html", { cache: "reload" });
        if (indexRes && indexRes.status === 200) {
          const indexHtml = await indexRes.clone().text();
          await staticCache.put("/index.html", indexRes);
          await staticCache.put("/", indexRes.clone());

          // Buscar automáticamente todos los archivos /static/js/ y /static/css/
          const scriptMatches = [...indexHtml.matchAll(/src=["'](\/static\/js\/[^"']+)["']/g)].map((m) => m[1]);
          const cssMatches = [...indexHtml.matchAll(/href=["'](\/static\/css\/[^"']+)["']/g)].map((m) => m[1]);
          const bundlesToCache = [...new Set([...scriptMatches, ...cssMatches])];

          console.log("[SW] Bundles de producción descubiertos para precachear:", bundlesToCache);

          await Promise.allSettled(
            bundlesToCache.map(async (bundleUrl) => {
              try {
                const bRes = await fetch(bundleUrl, { cache: "reload" });
                if (bRes && bRes.status === 200) {
                  await staticCache.put(bundleUrl, bRes);
                  console.log("[SW] Bundle precargado con éxito:", bundleUrl);
                }
              } catch (e) {
                console.warn("[SW] No se pudo precargar bundle:", bundleUrl, e);
              }
            })
          );
        }
      } catch (err) {
        console.warn("[SW] Error al descubrir bundles de index.html:", err);
      }

      // C. Precargar datos de la API (catálogo, insumos, servicios, perfil)
      const apiCache = await caches.open(CACHE_NAME_API);
      await Promise.allSettled(
        API_ENDPOINTS_TO_PRECACHE.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (res && res.status === 200) {
              await apiCache.put(url, res);
              console.log("[SW] API precargada en caché:", url);
            }
          } catch (e) {
            console.warn("[SW] No se pudo precargar endpoint API:", url, e);
          }
        })
      );
    })()
  );
});

// 2. ACTIVACIÓN: Reclamar clientes inmediatamente y limpiar versiones obsoletas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME_STATIC && key !== CACHE_NAME_API) {
            console.log("[SW] Eliminando caché antigua:", key);
            return caches.delete(key);
          }
          return null;
        })
      );
      await self.clients.claim();
    })()
  );
});

// 3. FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo peticiones GET
  if (req.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // CASO A: Navegación de páginas HTML (SPA de React)
  // Estrategia: Network-First con fallback a index.html en caché
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.status === 200) {
            const staticCache = await caches.open(CACHE_NAME_STATIC);
            staticCache.put(req, networkRes.clone());
            staticCache.put("/index.html", networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          console.log("[SW] Offline navegación. Entregando index.html en caché");
          const cachedPage =
            (await caches.match(req)) ||
            (await caches.match("/index.html")) ||
            (await caches.match("/"));
          if (cachedPage) return cachedPage;

          return new Response("Offline - Lady Barber", {
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
      })()
    );
    return;
  }

  // CASO B: Backend API (Render)
  if (url.hostname.includes("onrender.com") && url.pathname.startsWith("/api/")) {
    event.respondWith(
      (async () => {
        const apiCache = await caches.open(CACHE_NAME_API);
        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.status === 200) {
            apiCache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          console.log("[SW] Offline API. Entregando caché para:", req.url);
          const cachedRes = await apiCache.match(req);
          if (cachedRes) return cachedRes;

          return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" }
          });
        }
      })()
    );
    return;
  }

  // CASO C: Fuentes externas (Google Fonts)
  if (url.hostname.includes("googleapis.com") || url.hostname.includes("gstatic.com")) {
    event.respondWith(
      (async () => {
        const staticCache = await caches.open(CACHE_NAME_STATIC);
        const cachedRes = await staticCache.match(req);
        if (cachedRes) return cachedRes;

        try {
          const networkRes = await fetch(req);
          if (networkRes && (networkRes.status === 200 || networkRes.type === "opaque")) {
            staticCache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          return new Response("", { headers: { "Content-Type": "text/css" } });
        }
      })()
    );
    return;
  }

  // CASO D: Archivos Estáticos (JS bundles, CSS, imágenes)
  // Estrategia: Cache-First
  event.respondWith(
    (async () => {
      const staticCache = await caches.open(CACHE_NAME_STATIC);

      // 1. Coincidencia exacta por Request
      let cachedRes = await staticCache.match(req);

      // 2. Si no coincide el objeto request exacto, buscar por pathname (/static/js/main....js)
      if (!cachedRes) {
        cachedRes = await staticCache.match(url.pathname);
      }

      if (cachedRes) {
        // Si hay red, actualizamos en segundo plano
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              staticCache.put(req, networkRes.clone());
            }
          })
          .catch(() => {});
        return cachedRes;
      }

      // Si no estaba en caché, intentar red y almacenar inmediatamente
      try {
        const networkRes = await fetch(req);
        if (networkRes && (networkRes.status === 200 || networkRes.type === "opaque")) {
          staticCache.put(req, networkRes.clone());
          staticCache.put(url.pathname, networkRes.clone());
        }
        return networkRes;
      } catch (err) {
        console.warn("[SW] Offline: recurso estático no encontrado en caché:", req.url);
        // Si es un archivo CSS que faltó, retornar CSS vacío para que no rompa la pantalla
        if (url.pathname.endsWith(".css")) {
          return new Response("", { headers: { "Content-Type": "text/css" } });
        }
        // Si es un archivo JS que faltó, retornar JS vacío
        if (url.pathname.endsWith(".js")) {
          return new Response("", { headers: { "Content-Type": "application/javascript" } });
        }
        return new Response("", { status: 408, statusText: "Offline" });
      }
    })()
  );
});
