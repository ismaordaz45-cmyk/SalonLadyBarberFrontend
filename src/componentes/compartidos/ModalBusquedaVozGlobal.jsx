import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Alert
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";

import { useVoiceSearch } from "../../utils/useVoiceSearch";
import { useVoiceSearchContext } from "../../context/VoiceSearchContext";
import { getStoredUser } from "../../auth/session";

export default function ModalBusquedaVozGlobal() {
  const { isOpen, closeVoiceSearch, processVoiceResult } = useVoiceSearchContext();

  const handleVoiceCompleted = (recognizedText) => {
    // Si se reconoció un texto con éxito, esperar un instante y procesar
    if (recognizedText && recognizedText.trim()) {
      setTimeout(() => {
        processVoiceResult(recognizedText);
      }, 700);
    }
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceSearch({
    onResult: handleVoiceCompleted,
    lang: "es-MX"
  });

  // Iniciar micrófono automáticamente cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      startListening();
    } else {
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const user = getStoredUser();
  const rol = user?.rol;

  // Sugerencias personalizadas según el rol y la sección actual
  const getSugerencias = () => {
    if (rol === "PROPIETARIA") {
      return ["Ver citas", "Inventario", "Auditoría de caja", "Barberos", "Corte clásico", "Servicios"];
    }
    if (rol === "EMPLEADA") {
      return ["Ver citas", "Horarios estilistas", "Clientes", "Venta productos", "Corte degrafilado"];
    }
    if (rol === "CLIENTE") {
      return ["Mis citas", "Reservar cita", "Corte fade", "Pomada mate", "Tinte", "Tratamiento capilar"];
    }
    return ["Corte degradado", "Barba y bigote", "Peinado de noche", "Ver servicios", "Productos"];
  };

  const handleChipClick = (texto) => {
    processVoiceResult(texto);
  };

  const handleConfirmar = () => {
    const textToSearch = transcript || interimTranscript;
    if (textToSearch && textToSearch.trim()) {
      processVoiceResult(textToSearch);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={closeVoiceSearch}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          bgcolor: "#0B132B",
          color: "#FFFFFF",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.75)",
          overflow: "hidden",
          p: { xs: 2, sm: 3 }
        }
      }}
    >
      {/* Botón cerrar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VolumeUpRoundedIcon sx={{ color: "#38BDF8", fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#F1F5F9" }}>
            Búsqueda por Voz (Sensor de Micrófono)
          </Typography>
        </Box>
        <IconButton onClick={closeVoiceSearch} sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 1, sm: 2 }, textAlign: "center" }}>
        {/* Onda de Audio / Micrófono Animado */}
        <Box
          sx={{
            my: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}
        >
          {/* Ondas pulsantes de sonido cuando está escuchando */}
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    backgroundColor: "rgba(56, 189, 248, 0.35)",
                    pointerEvents: "none"
                  }}
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: [1, 1.3, 1.5], opacity: [0.8, 0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  style={{
                    position: "absolute",
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    backgroundColor: "rgba(37, 99, 235, 0.3)",
                    pointerEvents: "none"
                  }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Botón Central de Micrófono */}
          <IconButton
            onClick={isListening ? stopListening : startListening}
            sx={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              bgcolor: isListening ? "#2563EB" : "#334155",
              color: "#FFFFFF",
              boxShadow: isListening
                ? "0 0 25px rgba(56, 189, 248, 0.6)"
                : "0 8px 20px rgba(0, 0, 0, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: isListening ? "#1D4ED8" : "#475569",
                transform: "scale(1.05)"
              }
            }}
          >
            {isListening ? (
              <MicRoundedIcon sx={{ fontSize: 44 }} />
            ) : (
              <MicOffRoundedIcon sx={{ fontSize: 40, color: "#94A3B8" }} />
            )}
          </IconButton>

          <Typography
            sx={{
              mt: 2,
              fontWeight: 700,
              fontSize: "1.05rem",
              color: isListening ? "#38BDF8" : "#94A3B8"
            }}
          >
            {isListening ? "Escuchando... Di lo que buscas" : "Micrófono en pausa. Toca para hablar"}
          </Typography>
        </Box>

        {/* Transcripción en vivo */}
        <Box
          sx={{
            minHeight: 64,
            bgcolor: "rgba(255, 255, 255, 0.04)",
            border: "1px dashed rgba(56, 189, 248, 0.35)",
            borderRadius: "14px",
            p: 2,
            mb: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {transcript || interimTranscript ? (
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 600, color: "#F8FAFC" }}>
              "{transcript || interimTranscript}"
            </Typography>
          ) : (
            <Typography sx={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.45)", fontStyle: "italic" }}>
              Ejemplos: "Corte de cabello", "Ver citas", "Inventario", "Barberos", "Tinte"...
            </Typography>
          )}
        </Box>

        {/* Mensajes de error o permisos */}
        {error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: "12px", bgcolor: "rgba(245, 158, 11, 0.15)", color: "#FDE68A" }}>
            {error}
          </Alert>
        )}

        {!isSupported && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
            Tu navegador actual no admite la API de reconocimiento de voz. Te recomendamos usar Google Chrome, Edge o Safari actualizado.
          </Alert>
        )}

        {/* Botón manual para confirmar si ya habló */}
        {(transcript || interimTranscript) && (
          <Button
            variant="contained"
            fullWidth
            onClick={handleConfirmar}
            startIcon={<SearchRoundedIcon />}
            sx={{
              mb: 2.5,
              py: 1.2,
              borderRadius: "12px",
              bgcolor: "#2563EB",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              "&:hover": { bgcolor: "#1D4ED8" }
            }}
          >
            Buscar "{transcript || interimTranscript}"
          </Button>
        )}

        {/* Sugerencias Rápidas */}
        <Box sx={{ textAlign: "left", mt: 1 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, mb: 1, textTransform: "uppercase" }}>
            O toca para buscar directamente:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {getSugerencias().map((sug) => (
              <Chip
                key={sug}
                label={sug}
                onClick={() => handleChipClick(sug)}
                clickable
                size="small"
                sx={{
                  bgcolor: "rgba(56, 189, 248, 0.12)",
                  color: "#E2E8F0",
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  "&:hover": {
                    bgcolor: "rgba(56, 189, 248, 0.25)",
                    borderColor: "#38BDF8"
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

