import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DOMPurify from "dompurify";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Link,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockResetOutlined from "@mui/icons-material/LockResetOutlined";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const MySwal = withReactContent(Swal);

const IMG_RECOVERY = `${process.env.PUBLIC_URL || ""}/images/landing/hero-salon.svg`;
const API_URL = "http://localhost:4000";

const COLORS = {
  text: "#1E293B",
  textMuted: "#64748B",
  pageBg: "#F1F5F9",
  white: "#FFFFFF",
  primaryBlue: "#2563EB",
  linkOrange: "#EA580C",
  imageLetterbox: "#0F172A"
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeInput = (value) =>
  DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim();

function RecuperarContraseña() {
  const { runWithOverlay } = useBarberActionOverlay();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setCorreo(sanitizeInput(e.target.value));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    if (!EMAIL_RE.test(correo)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const peticion = () => axios.post(`${API_URL}/api/login/forgot-password`, { correo });
      const res = await runWithOverlay(
        peticion,
        "Verificando tu correo y enviando instrucciones…",
        { headline: "Recuperación", minMs: 600 }
      );

      setEnviado(true);

      await MySwal.fire({
        icon: "success",
        title: "Solicitud enviada",
        text: res.data?.message || "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.",
        position: "center",
        timer: 3200,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#F0FDF4",
        color: "#1E293B",
        iconColor: "#16A34A"
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Error al solicitar la recuperación. Inténtalo de nuevo.";
      setError(errorMsg);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#FEF2F2",
        color: "#1E293B",
        iconColor: "#DC2626"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: { xs: COLORS.pageBg, md: COLORS.white },
        fontFamily: "'Geist Sans', Arial, sans-serif"
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", md: "50%" },
          minHeight: { xs: 260, md: "100vh" },
          maxHeight: { xs: 320, md: "none" },
          bgcolor: COLORS.imageLetterbox,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}
      >
        <Box
          component="img"
          src={IMG_RECOVERY}
          alt=""
          sx={{
            width: "100%",
            height: { xs: 260, md: "100vh" },
            objectFit: "contain",
            objectPosition: "center",
            display: "block"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.35)",
            pointerEvents: "none"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            p: { xs: 2.5, md: 4 },
            zIndex: 1,
            background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)"
          }}
        >
          <Typography
            sx={{
              color: COLORS.white,
              fontWeight: 700,
              fontSize: { xs: "1.35rem", md: "1.85rem" },
              lineHeight: 1.25,
              mb: 1
            }}
          >
            Recupera el acceso a tu cuenta
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.92)",
              fontSize: { xs: "0.9rem", md: "1rem" },
              lineHeight: 1.55,
              maxWidth: 420
            }}
          >
            Te ayudaremos a restablecer tu contraseña de forma segura
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          minHeight: { xs: "auto", md: "100vh" },
          bgcolor: COLORS.white,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4, md: 6 },
          py: { xs: 4, md: 6 }
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
          <Link
            component={RouterLink}
            to="/login"
            underline="hover"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: COLORS.primaryBlue,
              fontWeight: 600,
              fontSize: "0.9rem",
              mb: 3
            }}
          >
            <ArrowBackIosNewRounded sx={{ fontSize: 14 }} />
            Volver al inicio de sesión
          </Link>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <LockResetOutlined sx={{ color: COLORS.linkOrange, fontSize: 32 }} />
            <Typography
              component="h1"
              sx={{
                color: COLORS.text,
                fontWeight: 700,
                fontSize: { xs: "1.65rem", sm: "1.85rem" }
              }}
            >
              Recuperar contraseña
            </Typography>
          </Box>

          <Typography sx={{ color: COLORS.textMuted, fontSize: "0.95rem", mb: 3 }}>
            Ingresa el correo asociado a tu cuenta. Te enviaremos los pasos para crear una nueva contraseña.
          </Typography>

          {error && (
            <Alert
              severity="error"
              icon={<ErrorOutlineRounded />}
              sx={{
                mb: 3,
                alignItems: "center",
                bgcolor: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                borderRadius: 2,
                "& .MuiAlert-icon": { color: "#DC2626" }
              }}
            >
              {error}
            </Alert>
          )}

          {enviado ? (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: "#F0FDF4",
                color: "#166534",
                border: "1px solid #BBF7D0"
              }}
            >
              Revisa tu bandeja de entrada en <strong>{correo}</strong>. Si no encuentras el mensaje, revisa la carpeta de spam.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Correo electrónico"
                name="correo"
                type="email"
                value={correo}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.35,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                  borderRadius: "12px",
                  bgcolor: COLORS.primaryBlue,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" }
                }}
              >
                {isLoading ? "Enviando…" : "Enviar instrucciones"}
              </Button>
            </Box>
          )}

          <Typography sx={{ textAlign: "center", mt: 4, color: COLORS.textMuted, fontSize: "0.95rem" }}>
            ¿Recordaste tu contraseña?{" "}
            <Link component={RouterLink} to="/login" underline="hover" sx={{ color: COLORS.linkOrange, fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default RecuperarContraseña;
