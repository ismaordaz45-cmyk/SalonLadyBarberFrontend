import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Snackbar, Slide } from "@mui/material";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function IndicadorConexionOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
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

  return (
    <>
      {/* 1. Barra Flotante cuando está Offline */}
      <Snackbar
        open={isOffline}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideTransition}
        sx={{
          top: { xs: 16, sm: 24 },
          zIndex: 9999
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: { xs: 2.5, sm: 3 },
            py: 1.5,
            borderRadius: "16px",
            bgcolor: "rgba(30, 41, 59, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#FFFFFF",
            boxShadow: "0 14px 38px rgba(0, 0, 0, 0.35)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            maxWidth: 580
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "rgba(245, 158, 11, 0.18)",
              color: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <WifiOffRoundedIcon sx={{ fontSize: 22 }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#FBBF24" }}>
              Modo sin conexión activo
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.35 }}>
              Estás navegando en modo offline con el contenido guardado en tu dispositivo. Conéctate a internet para reservar o ver el catálogo completo.
            </Typography>
          </Box>

          <Button
            size="small"
            variant="outlined"
            onClick={handleRecargar}
            startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: "#FFFFFF",
              borderColor: "rgba(255, 255, 255, 0.3)",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.78rem",
              borderRadius: "10px",
              flexShrink: 0,
              "&:hover": {
                borderColor: "#FBBF24",
                bgcolor: "rgba(245, 158, 11, 0.12)"
              }
            }}
          >
            Reintentar
          </Button>
        </Box>
      </Snackbar>

      {/* 2. Notificación Verde cuando se recupera la conexión */}
      <Snackbar
        open={showRestored}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideTransition}
        sx={{
          top: { xs: 16, sm: 24 },
          zIndex: 9999
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
            bgcolor: "rgba(16, 185, 129, 0.95)",
            backdropFilter: "blur(10px)",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <WifiRoundedIcon sx={{ fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
            ¡Conexión a internet restablecida!
          </Typography>
        </Box>
      </Snackbar>
    </>
  );
}
