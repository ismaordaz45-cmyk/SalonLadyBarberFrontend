import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está en modo Standalone (PWA ya instalada)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // 2. Detectar si es dispositivo iOS
    const userAgent = window.navigator.userAgent || "";
    const isAppleDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // 3. Escuchar el evento nativo beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      // Evitar que el mini-infobar aparezca por defecto en móviles
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("📲 [PWA] Evento beforeinstallprompt capturado. Listo para instalar.");
    };

    // 4. Escuchar cuando la app ha sido instalada exitosamente
    const handleAppInstalled = () => {
      console.log("🎉 [PWA] ¡Aplicación instalada exitosamente!");
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallModal(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Función para disparar la instalación
  const promptInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] Respuesta del usuario a la instalación: ${outcome}`);
        if (outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
        return { success: true, outcome };
      } catch (err) {
        console.warn("[PWA] Error al ejecutar deferredPrompt.prompt():", err);
        setShowInstallModal(true);
        return { success: false, error: err };
      }
    } else {
      // Si no hay evento nativo (ej: iOS Safari o navegadores donde no se dispara), abrir modal instructivo
      setShowInstallModal(true);
      return { success: false, manualRequired: true };
    }
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    showInstallModal,
    setShowInstallModal,
    promptInstall
  };
}

