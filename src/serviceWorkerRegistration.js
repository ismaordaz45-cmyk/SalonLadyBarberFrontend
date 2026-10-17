// Registro del Service Worker para soporte PWA y modo Offline

export function register() {
  if ("serviceWorker" in navigator) {
    const registerWorker = () => {
      const swUrl = `${process.env.PUBLIC_URL || ""}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("✅ [PWA] Service Worker registrado exitosamente:", registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  console.log("🔄 [PWA] Nuevo contenido disponible, se actualizará al recargar.");
                } else {
                  console.log("📦 [PWA] Contenido precacheado para uso sin conexión (Offline).");
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn("⚠️ [PWA] Error al registrar el Service Worker:", error);
        });
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
      registerWorker();
    } else {
      window.addEventListener("load", registerWorker);
    }
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
