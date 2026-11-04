import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Divider,
  IconButton
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import AddToHomeScreenRoundedIcon from "@mui/icons-material/AddToHomeScreenRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";

export default function ModalInstalarPWA({ open, onClose, isIOS, onDirectInstall, hasDirectPrompt }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src="/icon-192.png"
            alt="Logo Lady Barber"
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}
          />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#F8FAFC", lineHeight: 1.2 }}>
              Descargar Aplicación
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
              Salón Lady Barber Itza D´M
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#94A3B8", "&:hover": { color: "#FFF" } }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        {/* Beneficios */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            mb: 2.5,
            p: 1.5,
            borderRadius: "12px",
            bgcolor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.06)"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FlashOnRoundedIcon sx={{ fontSize: 18, color: "#38BDF8" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#CBD5E1", fontWeight: 600 }}>
              Carga ultrarrápida
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WifiOffRoundedIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#CBD5E1", fontWeight: 600 }}>
              Funciona sin internet
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GetAppRoundedIcon sx={{ fontSize: 18, color: "#10B981" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#CBD5E1", fontWeight: 600 }}>
              Cero descargas pesadas
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18, color: "#A855F7" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#CBD5E1", fontWeight: 600 }}>
              Acceso directo en inicio
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 2 }} />

        {/* Instrucciones según plataforma */}
        {isIOS ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#FBBF24" }}>
              Pasos para instalar en tu iPhone / iPad:
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0
                }}
              >
                1
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "#E2E8F0", lineHeight: 1.4 }}>
                En Safari, presiona el botón <strong>Compartir</strong> <IosShareRoundedIcon sx={{ fontSize: 16, verticalAlign: "middle", color: "#38BDF8", mx: 0.5 }} /> en la barra inferior.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0
                }}
              >
                2
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "#E2E8F0", lineHeight: 1.4 }}>
                Desliza hacia abajo y pulsa en <strong style={{ color: "#FBBF24" }}>"Agregar a inicio"</strong> <AddToHomeScreenRoundedIcon sx={{ fontSize: 16, verticalAlign: "middle", mx: 0.5 }} />.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0
                }}
              >
                3
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "#E2E8F0", lineHeight: 1.4 }}>
                Toca <strong>"Agregar"</strong> en la esquina superior derecha y ¡listo!
              </Typography>
            </Box>
          </Box>
        ) : hasDirectPrompt ? (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography sx={{ fontSize: "0.88rem", color: "#E2E8F0", mb: 2 }}>
              Puedes instalar la aplicación web en tu dispositivo con un solo toque y acceder desde tu pantalla principal como una app nativa.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<GetAppRoundedIcon />}
              onClick={onDirectInstall}
              sx={{
                bgcolor: "#2563EB",
                color: "#FFFFFF",
                fontWeight: 700,
                borderRadius: "12px",
                py: 1.3,
                textTransform: "none",
                fontSize: "0.92rem",
                boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.5)",
                "&:hover": { bgcolor: "#1D4ED8" }
              }}
            >
              Instalar Aplicación Ahora
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#FBBF24" }}>
              Cómo instalar en Android o PC:
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0
                }}
              >
                1
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "#E2E8F0", lineHeight: 1.4 }}>
                Haz clic en los <strong>tres puntos (Menú)</strong> de tu navegador o en el icono de instalación en la barra de direcciones.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "rgba(56, 189, 248, 0.15)",
                  color: "#38BDF8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  flexShrink: 0
                }}
              >
                2
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "#E2E8F0", lineHeight: 1.4 }}>
                Selecciona <strong style={{ color: "#FBBF24" }}>"Instalar Salón Lady Barber"</strong> o "Agregar a pantalla principal".
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0.5 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="outlined"
          sx={{
            color: "#94A3B8",
            borderColor: "rgba(255, 255, 255, 0.15)",
            textTransform: "none",
            borderRadius: "10px",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#CBD5E1",
              color: "#FFFFFF"
            }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

