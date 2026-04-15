import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import Google from "@mui/icons-material/Google";
import Facebook from "@mui/icons-material/Facebook";

const IMG_LOGIN = `${process.env.PUBLIC_URL || ""}/images/landing/login-salon.jpg`;

const COLORS = {
  text: "#1E293B",
  textMuted: "#64748B",
  pageBg: "#F1F5F9",
  white: "#FFFFFF",
  primaryBlue: "#2563EB",
  linkOrange: "#EA580C",
  hover: "#E2E8F0",
  imageLetterbox: "#0F172A"
};

/**
 * Layout split-screen login (Figma): imagen izquierda / formulario derecha.
 * La lógica (submit, API) vive en el contenedor (Login.jsx).
 */
function LoginPage({
  formData,
  onChange,
  onSubmit,
  error,
  showPassword,
  onTogglePassword,
  isLoading
}) {
  const showErrorAlert = Boolean(error && String(error).trim());

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
      {/* Mitad izquierda: imagen completa visible (sin recorte tipo zoom) */}
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
          src={IMG_LOGIN}
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
            Tu imagen, nuestra inspiración
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.92)",
              fontSize: { xs: "0.9rem", md: "1rem" },
              lineHeight: 1.55,
              maxWidth: 420
            }}
          >
            Un espacio creado para transformar tu imagen y resaltar tu estilo con calidad
          </Typography>
        </Box>
      </Box>

      {/* Mitad derecha: formulario */}
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
            to="/"
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
            Regresar al inicio
          </Link>

          <Typography
            component="h1"
            sx={{
              color: COLORS.text,
              fontWeight: 700,
              fontSize: { xs: "1.65rem", sm: "1.85rem" },
              mb: 1
            }}
          >
            Bienvenido de nuevo
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: "0.95rem", mb: 3 }}>
            Inicia sesión para una mejor experiencia
          </Typography>

          {showErrorAlert && (
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

          <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
              fullWidth
              label="Correo electrónico"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={onChange}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: COLORS.textMuted }} />
                  </InputAdornment>
                )
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.75,
                mt: 0.5
              }}
            >
              <Typography component="span" sx={{ fontWeight: 600, color: COLORS.text, fontSize: "0.875rem" }}>
                Contraseña
              </Typography>
              <Link
                component={RouterLink}
                to="/recovery"
                underline="hover"
                sx={{ color: COLORS.linkOrange, fontSize: "0.85rem", fontWeight: 600 }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={onChange}
              autoComplete="current-password"
              inputProps={{ "aria-label": "Contraseña" }}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: COLORS.textMuted }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={onTogglePassword} aria-label="Mostrar contraseña">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
                "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
                ...(isLoading
                  ? {
                      animation: "barberSubmitGlow 1.15s ease-in-out infinite"
                    }
                  : {})
              }}
            >
              {isLoading ? "Iniciando…" : "Iniciar sesión"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography sx={{ color: COLORS.textMuted, fontSize: "0.72rem", fontWeight: 600, px: 1, letterSpacing: "0.06em" }}>
              O CONTINUAR CON
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google sx={{ color: "#4285F4" }} />}
              sx={{
                py: 1.1,
                textTransform: "none",
                borderColor: COLORS.hover,
                color: COLORS.text,
                borderRadius: "12px",
                "&:hover": { borderColor: COLORS.textMuted, bgcolor: "rgba(0,0,0,0.02)" }
              }}
            >
              Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Facebook sx={{ color: "#1877F2" }} />}
              sx={{
                py: 1.1,
                textTransform: "none",
                borderColor: COLORS.hover,
                color: COLORS.text,
                borderRadius: "12px",
                "&:hover": { borderColor: COLORS.textMuted, bgcolor: "rgba(0,0,0,0.02)" }
              }}
            >
              Facebook
            </Button>
          </Box>

          <Typography sx={{ textAlign: "center", mt: 4, color: COLORS.textMuted, fontSize: "0.95rem" }}>
            ¿No tienes una cuenta?{" "}
            <Link component={RouterLink} to="/registro" underline="hover" sx={{ color: COLORS.linkOrange, fontWeight: 600 }}>
              Crear una ahora
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
