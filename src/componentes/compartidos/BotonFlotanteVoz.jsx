import React, { useEffect } from "react";
import { Box, Tooltip, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import { useVoiceSearchContext } from "../../context/VoiceSearchContext";

export default function BotonFlotanteVoz() {
  const { openVoiceSearch } = useVoiceSearchContext();

  // Atajo de teclado: Presionar Alt + V o Ctrl + M abre la búsqueda por voz
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key.toLowerCase() === "v") || (e.ctrlKey && e.key.toLowerCase() === "m")) {
        e.preventDefault();
        openVoiceSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openVoiceSearch]);

  return (
    <Box
      component={motion.div}
      drag
      dragMomentum={false}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ scale: 1.15, cursor: "grabbing" }}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9998,
        touchAction: "none"
      }}
    >
      <Tooltip title="Búsqueda por Voz (Micrófono) [Alt+V]" placement="left" arrow>
        <IconButton
          onClick={() => openVoiceSearch()}
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            bgcolor: "#2563EB",
            color: "#FFFFFF",
            boxShadow: "0 10px 25px -4px rgba(37, 99, 235, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.2)",
            border: "2px solid #60A5FA",
            cursor: "grab",
            "&:hover": {
              bgcolor: "#1D4ED8",
              boxShadow: "0 12px 30px -4px rgba(37, 99, 235, 0.85)"
            }
          }}
        >
          <MicRoundedIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

