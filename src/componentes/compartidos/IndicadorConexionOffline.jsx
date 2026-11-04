import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { usePWAInstall } from "../../utils/usePWAInstall";
import ModalInstalarPWA from "./ModalInstalarPWA";

export default function IndicadorConexionOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

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
      }, 3500);
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

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleRecargar = () => {
    handleCloseMenu();
    window.location.reload();
  };

  const handleDescargar = async () => {
    handleCloseMenu();
    await promptInstall();
  };

  return (
    <>
      <ModalInstalarPWA
        open={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        isIOS={isIOS}
        hasDirectPrompt={isInstallable}
        onDirectInstall={promptInstall}
      />

      {/* 1. Icono discreto flotante cuando NO hay conexión */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999
            }}
          >
            <Tooltip
              title="No hay conexión a internet (Modo offline activo)"
              arrow
              placement="left"
            >
              <IconButton
                onClick={handleOpenMenu}
                size="small"
                aria-label="No hay conexión"
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#D97706",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 14px rgba(217, 119, 6, 0.45)",
                  border: "2px solid rgba(255, 255, 255, 0.8)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: "#B45309",
                    transform: "scale(1.08)"
                  }
                }}
              >
                <WifiOffRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Menú contextual sutil solo si el usuario decide hacer clic */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  borderRadius: "12px",
                  bgcolor: "#0F172A",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  minWidth: 190,
                  py: 0.5
                }
              }}
            >
              <MenuItem onClick={handleRecargar} sx={{ py: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}>
                <ListItemIcon sx={{ color: "#FBBF24", minWidth: 32 }}>
                  <RefreshRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Reintentar conexión" primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: 600 }} />
              </MenuItem>
              <MenuItem onClick={handleDescargar} sx={{ py: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}>
                <ListItemIcon sx={{ color: isInstalled ? "#10B981" : "#38BDF8", minWidth: 32 }}>
                  {isInstalled ? <CheckCircleRoundedIcon fontSize="small" /> : <GetAppRoundedIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={isInstalled ? "App instalada" : "Descargar App PWA"}
                  primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: 600 }}
                />
              </MenuItem>
            </Menu>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Mini-icono verde sutil cuando se restablece la conexión */}
      <AnimatePresence>
        {showRestored && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999
            }}
          >
            <Tooltip title="¡Conexión a internet restablecida!" arrow placement="left">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  bgcolor: "#059669",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.45)",
                  border: "2px solid rgba(255, 255, 255, 0.8)"
                }}
              >
                <WifiRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
