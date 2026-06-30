import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Mic as MicIcon, Refresh as RefreshIcon, HelpOutline as HelpIcon } from "@mui/icons-material";
import api from "../../api";
import Swal from "sweetalert2";

/**
 * Componente para conectar la aplicación con Alexa.
 * Genera un código de 6 dígitos con validez de 10 minutos.
 */
const ConectarAlexa = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Colores del salón
  const COLORS = {
    background: "#1a1a2e",
    accent: "#C8944A",
    textLight: "#ffffff",
    textMuted: "#a0a0b0",
  };

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && token) {
      setToken(null);
    }

    return () => clearInterval(timer);
  }, [timeLeft, token]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const generarCodigo = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/alexa/generar-token");
      setToken(response.data.token);
      setTimeLeft(response.data.expiraEn);
    } catch (error) {
      console.error("Error al generar token de Alexa:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el código. Inténtalo de nuevo.",
        confirmButtonColor: COLORS.accent,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 4,
        bgcolor: COLORS.background,
        color: COLORS.textLight,
        textAlign: "center",
        border: `1px solid ${COLORS.accent}44`,
        maxWidth: 400,
        mx: "auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          opacity: 0.1,
          transform: "rotate(15deg)",
        }}
      >
        <MicIcon sx={{ fontSize: 120, color: COLORS.accent }} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <MicIcon sx={{ fontSize: 40, color: COLORS.accent, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Conectar con Alexa
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted, px: 2 }}>
          Controla tu salón con la voz. Vincula tu cuenta diciendo: <br />
          <strong>"Alexa, abre Lady Barber"</strong>
        </Typography>
      </Box>

      {!token ? (
        <Box sx={{ py: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={generarCodigo}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MicIcon />}
            sx={{
              bgcolor: COLORS.accent,
              color: "#000",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#b07d3a",
              },
            }}
          >
            {loading ? "Generando..." : "Conectar Vincular Alexa"}
          </Button>
        </Box>
      ) : (
        <Box sx={{ py: 2 }}>
          <Typography variant="overline" sx={{ color: COLORS.textMuted, letterSpacing: 2 }}>
            Tu código de vinculación
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              color: COLORS.accent,
              letterSpacing: 8,
              my: 2,
              textShadow: `0 0 15px ${COLORS.accent}44`,
            }}
          >
            {token}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              Expira en: {formatTime(timeLeft)}
            </Typography>
            <Tooltip title="Generar nuevo código">
              <IconButton size="small" onClick={generarCodigo} sx={{ color: COLORS.accent }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="caption" sx={{ display: "block", color: COLORS.textMuted, fontStyle: "italic" }}>
            Dicta este código a Alexa cuando te lo pida.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Tooltip title="¿Cómo funciona? Inicia la skill en tu dispositivo Alexa y selecciona 'Vincular cuenta'. Cuando Alexa te pida el código, dicta los 6 dígitos que aparecen aquí.">
          <IconButton size="small" sx={{ color: COLORS.textMuted }}>
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ConectarAlexa;
