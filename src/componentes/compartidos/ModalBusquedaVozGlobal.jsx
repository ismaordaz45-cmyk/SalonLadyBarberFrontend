import React, { useEffect } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { useVoiceSearch } from "../../utils/useVoiceSearch";
import { useVoiceSearchContext } from "../../context/VoiceSearchContext";

export default function ModalBusquedaVozGlobal() {
  const { isOpen, closeVoiceSearch, processVoiceResult } = useVoiceSearchContext();

  const handleVoiceCompleted = (recognizedText) => {
    if (recognizedText && recognizedText.trim()) {
      setTimeout(() => {
        processVoiceResult(recognizedText);
      }, 500);
    }
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceSearch({
    onResult: handleVoiceCompleted,
    lang: "es-MX"
  });

  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      startListening();
    } else {
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleConfirmar = () => {
    const textToSearch = transcript || interimTranscript;
    if (textToSearch && textToSearch.trim()) {
      processVoiceResult(textToSearch);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10000,
            pointerEvents: "auto"
          }}
        >
          {/* Pastilla compacta minimalista que NO cubre la pantalla */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: "50px",
              bgcolor: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(12px)",
              color: "#FFFFFF",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
              maxWidth: { xs: "92vw", sm: 420 },
              minWidth: 260
            }}
          >
            {/* Icono de Micrófono pulsante sutil */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: isListening ? "#2563EB" : "#475569",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: isListening ? "0 0 10px #38BDF8" : "none"
              }}
            >
              <MicRoundedIcon sx={{ fontSize: 18 }} />
            </Box>

            {/* Texto dictado en tiempo real */}
            <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: transcript || interimTranscript ? "#F8FAFC" : "#94A3B8",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {transcript || interimTranscript || (isListening ? "Escuchando... Di lo que buscas" : (error || "Listo"))}
              </Typography>
            </Box>

            {/* Botón buscar manual si ya hay texto */}
            {(transcript || interimTranscript) && (
              <Tooltip title="Buscar ahora">
                <IconButton
                  size="small"
                  onClick={handleConfirmar}
                  sx={{ color: "#38BDF8", p: 0.5, "&:hover": { color: "#FFF" } }}
                >
                  <SearchRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Botón cerrar pastilla */}
            <IconButton
              size="small"
              onClick={closeVoiceSearch}
              sx={{ color: "#94A3B8", p: 0.5, "&:hover": { color: "#FFF" } }}
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
