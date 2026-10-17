/* eslint-disable no-restricted-globals */

const CACHE_NAME_STATIC = "slb-core-v5";
const CACHE_NAME_API = "slb-data-v5";

// Rutas clave de la aplicación
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

// Imágenes esenciales de la landing
const ESSENTIAL_IMAGES = [
  "/images/landing/hero-salon.jpg",
  "/images/landing/hero-salon.svg",
  "/images/landing/tradicion-calidad.jpg",
  "/images/landing/login-salon.jpg",
  "/images/landing/register-salon.jpg",
  "/images/landing/categoria-barberia.svg",
  "/images/landing/categoria-cortes.svg",
  "/images/landing/categoria-coloracion.svg",
  "/images/landing/categoria-peinados.svg",
  "/images/landing/categoria-especiales.svg",
  "/images/landing/evento-bodas.jpg",
  "/images/landing/evento-graduaciones.jpg",
  "/images/landing/evento-xv-anos.jpg",
  "/images/landing/evento-presentaciones.jpg"
];

// Endpoints de la API
const API_ENDPOINTS_TO_PRECACHE = [
  "https://salonladybarberbackend.onrender.com/api/perfil-empresa",
  "https://salonladybarberbackend.onrender.com/api/insumos",
  "https://salonladybarberbackend.onrender.com/api/servicios",
  "https://salonladybarberbackend.onrender.com/api/terminos-condiciones"
];

// 1. INSTALACIÓN: Precarga agresiva de TODO en el primer impacto
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(CACHE_NAME_STATIC);

      // A. Precargar rutas y recursos locales
      try {
        await staticCache.addAll([...APP_ROUTES, ...ESSENTIAL_IMAGES]);
        console.log("[SW] Rutas y multimedia de landing precheadas exitosamente.");
      } catch (err) {
        console.warn("[SW] Precaching parcial:", err);
      }

      // B. Descubrir bundles JS y CSS leyendo index.html directamente en el install
      try {
        const indexRes = await fetch("/index.html", { cache: "reload" });
        if (indexRes && indexRes.status === 200) {
          const indexHtml = await indexRes.clone().text();
          await staticCache.put("/index.html", indexRes);
          await staticCache.put("/", indexRes.clone());

          const scriptMatches = [...indexHtml.matchAll(/src=["'](\/static\/js\/[^"']+)["']/g)].map((m) => m[1]);
          const cssMatches = [...indexHtml.matchAll(/href=["'](\/static\/css\/[^"']+)["']/g)].map((m) => m[1]);
          const bundles = [...new Set([...scriptMatches, ...cssMatches])];

          console.log("[SW] Precargando bundles React automáticamente:", bundles);
          await Promise.allSettled(
            bundles.map(async (bundleUrl) => {
              try {
                const bRes = await fetch(bundleUrl, { cache: "reload" });
                if (bRes && bRes.status === 200) {
                  await staticCache.put(bundleUrl, bRes);
                }
              } catch (e) {
                console.warn("[SW] Bundle warning:", bundleUrl, e);
              }
            })
          );
        }
      } catch (err) {
        console.warn("[SW] Error al precargar bundles en install:", err);
      }

      // C. Precargar datos de la API (catálogo, insumos, servicios, perfil)
      const apiCache = await caches.open(CACHE_NAME_API);
      await Promise.allSettled(
        API_ENDPOINTS_TO_PRECACHE.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (res && res.status === 200) {
              await apiCache.put(url, res);
              console.log("[SW] API precargada en primera visita:", url);
            }
          } catch (e) {
            console.warn("[SW] API precache warning:", url, e);
          }
        })
      );
    })()
  );
});

// 2. ACTIVACIÓN: Reclamar inmediatamente a todos los clientes (¡Clave para no requerir 2da recarga!)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME_STATIC && key !== CACHE_NAME_API) {
            console.log("[SW] Limpiando versión previa:", key);
            return caches.delete(key);
          }
          return null;
        })
      );
      // self.clients.claim() le dice al navegador: "Toma el control de esta pestaña AHORA MISMO"
      await self.clients.claim();
      console.log("[SW] Service Worker activo y controlando clientes desde la primera carga.");
    })()
  );
});

// 3. FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // CASO A: Navegación SPA
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
          console.log("[SW] Offline navegación. Entregando index.html");
          const cachedPage =
            (await caches.match(req)) ||
            (await caches.match("/index.html")) ||
            (await caches.match("/"));
          if (cachedPage) return cachedPage;

          return new Response("Offline - Salón Lady Barber", {
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
      })()
    );
    return;
  }

  // CASO B: Backend API
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

  // CASO C: Fuentes externas
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

  // CASO D: Archivos Estáticos (JS bundles, CSS, imágenes y multimedia)
  // Estrategia: Cache-First
  event.respondWith(
    (async () => {
      const staticCache = await caches.open(CACHE_NAME_STATIC);

      let cachedRes = await staticCache.match(req);
      if (!cachedRes) {
        cachedRes = await staticCache.match(url.pathname);
      }

      if (cachedRes) {
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              staticCache.put(req, networkRes.clone());
            }
          })
          .catch(() => {});
        return cachedRes;
      }

      // Si no estaba en caché, pedir a la red y guardar inmediatamente
      try {
        const networkRes = await fetch(req);
        if (networkRes && (networkRes.status === 200 || networkRes.type === "opaque")) {
          staticCache.put(req, networkRes.clone());
          staticCache.put(url.pathname, networkRes.clone());
        }
        return networkRes;
      } catch (err) {
        if (url.pathname.endsWith(".css")) {
          return new Response("", { headers: { "Content-Type": "text/css" } });
        }
        if (url.pathname.endsWith(".js")) {
          return new Response("", { headers: { "Content-Type": "application/javascript" } });
        }
        return new Response("", { status: 408, statusText: "Offline" });
      }
    })()
  );
});
