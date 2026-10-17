/* eslint-disable no-restricted-globals */

const CACHE_NAME_STATIC = "slb-core-v3";
const CACHE_NAME_API = "slb-data-v3";

// Rutas internas de la SPA
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

// Endpoints de API que el profesor exige precargar automáticamente al inicio (catálogo, servicios, perfil, insumos, etc.)
const API_ENDPOINTS_TO_PRECACHE = [
  "https://salonladybarberbackend.onrender.com/api/perfil-empresa",
  "https://salonladybarberbackend.onrender.com/api/insumos",
  "https://salonladybarberbackend.onrender.com/api/servicios",
  "https://salonladybarberbackend.onrender.com/api/terminos-condiciones"
];

// 1. INSTALACIÓN: Precarga inmediata de rutas y de las APIs clave
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // A. Precargar rutas y estáticos locales
      const staticCache = await caches.open(CACHE_NAME_STATIC);
      try {
        await staticCache.addAll(APP_ROUTES);
        console.log("[SW] Rutas base y estáticos precheados con éxito");
      } catch (err) {
        console.warn("[SW] Advertencia precaching estáticos:", err);
      }

      // B. Precargar datos de la API (catálogo, insumos, servicios, perfil)
      const apiCache = await caches.open(CACHE_NAME_API);
      await Promise.allSettled(
        API_ENDPOINTS_TO_PRECACHE.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (res && res.status === 200) {
              await apiCache.put(url, res);
              console.log("[SW] API precargada automáticamente en caché:", url);
            }
          } catch (e) {
            console.warn("[SW] No se pudo precargar endpoint API:", url, e);
          }
        })
      );
    })()
  );
  self.skipWaiting();
});

// 2. ACTIVACIÓN: Reclamar clientes inmediatamente y limpiar cachés anteriores
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

// 3. FETCH: Intercepción segura sin lanzar jamás promesas rechazadas o valores no Response
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo peticiones GET
  if (req.method !== "GET") return;

  // Ignorar protocolos no HTTP/HTTPS (extensiones de chrome, data:, etc.)
  if (!url.protocol.startsWith("http")) return;

  // CASO A: Navegación de páginas HTML (SPA de React)
  // Estrategia: Network-First con fallback infalible a index.html en caché
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.status === 200) {
            const staticCache = await caches.open(CACHE_NAME_STATIC);
            staticCache.put(req, networkRes.clone());
          }
          return networkRes;
        } catch (err) {
          console.log("[SW] Offline navegación. Sirviendo index.html cacheado");
          const cachedExact = await caches.match(req);
          if (cachedExact) return cachedExact;
          const cachedIndex = await caches.match("/index.html");
          if (cachedIndex) return cachedIndex;
          const cachedRoot = await caches.match("/");
          if (cachedRoot) return cachedRoot;
          return new Response("Offline - Lady Barber", {
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
      })()
    );
    return;
  }

  // CASO B: Peticiones a la API del Backend (Render)
  // Estrategia: Stale-While-Revalidate / Network-First con Fallback a Datos en Caché
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
          console.log("[SW] Red offline para API. Recuperando de caché:", req.url);
          const cachedRes = await apiCache.match(req);
          if (cachedRes) return cachedRes;

          // Si no existe coincidencia exacta, devolver un JSON vacío seguro para que React no rompa
          return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" }
          });
        }
      })()
    );
    return;
  }

  // CASO C: Fuentes externas (Google Fonts: fonts.googleapis.com, fonts.gstatic.com)
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
          // Si falla y no está en caché, devolver CSS vacío seguro
          return new Response("", {
            headers: { "Content-Type": "text/css" }
          });
        }
      })()
    );
    return;
  }

  // CASO D: Archivos estáticos de la aplicación (JS bundles, CSS, imágenes, logos)
  // Estrategia: Cache-First con actualización en segundo plano
  event.respondWith(
    (async () => {
      const staticCache = await caches.open(CACHE_NAME_STATIC);
      const cachedRes = await staticCache.match(req);

      // Si ya está en caché, devolverlo de inmediato (¡Carga ultra rápida sin parpadeo!)
      if (cachedRes) {
        // En segundo plano intentamos actualizar la caché si hay red
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              staticCache.put(req, networkRes.clone());
            }
          })
          .catch(() => {});
        return cachedRes;
      }

      // Si no estaba en caché, pedir a la red y guardar
      try {
        const networkRes = await fetch(req);
        if (networkRes && (networkRes.status === 200 || networkRes.type === "opaque")) {
          staticCache.put(req, networkRes.clone());
        }
        return networkRes;
      } catch (err) {
        console.warn("[SW] Recurso estático no disponible en offline:", req.url);
        // Devolver respuesta transparente para que no tire excepción unhandled en el FetchEvent
        return new Response("", { status: 408, statusText: "Offline" });
      }
    })()
  );
});
