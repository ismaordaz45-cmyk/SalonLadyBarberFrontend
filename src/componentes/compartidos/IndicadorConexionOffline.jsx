import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Tooltip, Slide } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { usePWAInstall } from "../../utils/usePWAInstall";
import ModalInstalarPWA from "./ModalInstalarPWA";

export default function IndicadorConexionOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Hook para gestión de instalación de la PWA
  const {
    isInstallable,
    isInstalled,
    isIOS,
    showInstallModal,
    setShowInstallModal,
    promptInstall
  } = usePWAInstall();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRecargar = () => {
    window.location.reload();
  };

  const handleDescargarApp = async (e) => {
    if (e) e.stopPropagation();
    await promptInstall();
  };

  return (
    <>
      {/* 1. Modal de Instrucciones de Instalación PWA */}
      <ModalInstalarPWA
        open={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        isIOS={isIOS}
        hasDirectPrompt={isInstallable}
        onDirectInstall={promptInstall}
      />

      {/* 2. Banner Flotante y Arrastrable (Draggable) cuando está Offline */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileDrag={{ scale: 1.03, boxShadow: "0 22px 45px rgba(0, 0, 0, 0.6)" }}
            style={{
              position: "fixed",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 99999,
              touchAction: "none"
            }}
          >
            {isMinimized ? (
              // Versión compacta / minimizada (también arrastrable libremente)
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  borderRadius: "50px",
                  bgcolor: "rgba(15, 23, 42, 0.95)",
                  backdropFilter: "blur(14px)",
                  color: "#FFFFFF",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(245, 158, 11, 0.5)",
                  cursor: "grab",
                  userSelect: "none",
                  "&:active": { cursor: "grabbing" }
                }}
              >
                <DragIndicatorRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.4)" }} />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#F59E0B",
                    boxShadow: "0 0 10px #F59E0B"
                  }}
                />
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#FBBF24" }}>
                  Sin conexión
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(false);
                  }}
                  sx={{ color: "rgba(255,255,255,0.8)", p: 0.5, "&:hover": { color: "#FFF" } }}
                >
                  <OpenInFullRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ) : (
              // Versión completa con arrastre, estado, recargar y descargar PWA
              <Box
                sx={{
                  width: { xs: "calc(100vw - 32px)", sm: 540 },
                  maxWidth: "95vw",
                  borderRadius: "18px",
                  bgcolor: "rgba(15, 23, 42, 0.96)",
                  backdropFilter: "blur(16px)",
                  color: "#FFFFFF",
                  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.45)",
                  border: "1px solid rgba(245, 158, 11, 0.45)",
                  p: { xs: 1.8, sm: 2.2 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  userSelect: "none"
                }}
              >
                {/* Cabecera / Barra de arrastre */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pb: 0.8,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    cursor: "grab",
                    "&:active": { cursor: "grabbing" }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DragIndicatorRoundedIcon sx={{ fontSize: 18, color: "rgba(255, 255, 255, 0.45)" }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      Arrastra para mover en la pantalla
                    </Typography>
                  </Box>

                  <Tooltip title="Minimizar barra">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMinimized(true);
                      }}
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        p: 0.4,
                        "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255, 255, 255, 0.1)" }
                      }}
                    >
                      <CloseFullscreenRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Contenido principal del aviso offline */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.8 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      bgcolor: "rgba(245, 158, 11, 0.16)",
                      color: "#F59E0B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "1px solid rgba(245, 158, 11, 0.3)"
                    }}
                  >
                    <WifiOffRoundedIcon sx={{ fontSize: 24 }} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#FBBF24", mb: 0.3 }}>
                      Modo sin conexión activo
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.35 }}>
                      Estás navegando con el contenido guardado en tu dispositivo. Puedes mover este aviso a cualquier lugar o instalar la app para acceso directo.
                    </Typography>
                  </Box>
                </Box>

                {/* Botones de acción: Descargar App PWA y Reintentar */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1.2,
                    pt: 0.5
                  }}
                >
                  {/* Botón para descargar/instalar la Aplicación Web Progresiva */}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleDescargarApp}
                    startIcon={isInstalled ? <CheckCircleRoundedIcon sx={{ fontSize: 17 }} /> : <GetAppRoundedIcon sx={{ fontSize: 17 }} />}
                    sx={{
                      bgcolor: isInstalled ? "#059669" : "#2563EB",
                      color: "#FFFFFF",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      borderRadius: "10px",
                      px: 2,
                      py: 0.7,
                      boxShadow: isInstalled ? "0 4px 12px rgba(5, 150, 105, 0.35)" : "0 4px 14px rgba(37, 99, 235, 0.4)",
                      "&:hover": {
                        bgcolor: isInstalled ? "#047857" : "#1D4ED8"
                      }
                    }}
                  >
                    {isInstalled ? "App instalada" : "Descargar App PWA"}
                  </Button>

                  {/* Botón para reintentar conexión */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleRecargar}
                    startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      color: "#FFFFFF",
                      borderColor: "rgba(255, 255, 255, 0.28)",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      borderRadius: "10px",
                      px: 1.8,
                      py: 0.7,
                      "&:hover": {
                        borderColor: "#FBBF24",
                        bgcolor: "rgba(245, 158, 11, 0.12)"
                      }
                    }}
                  >
                    Reintentar
                  </Button>
                </Box>
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Notificación Verde Flotante cuando se recupera la conexión */}
      <AnimatePresence>
        {showRestored && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 99999
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 3,
                py: 1.25,
                borderRadius: "14px",
                bgcolor: "rgba(16, 185, 129, 0.96)",
                backdropFilter: "blur(12px)",
                color: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              <WifiRoundedIcon sx={{ fontSize: 22 }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                ¡Conexión a internet restablecida!
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
