import React, { useMemo, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import zxcvbn from "zxcvbn";
import DOMPurify from "dompurify";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography
} from "@mui/material";
import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const MySwal = withReactContent(Swal);

const IMG_RESET = `${process.env.PUBLIC_URL || ""}/images/landing/hero-salon.svg`;
const API_URL = "http://localhost:4000";

const COLORS = {
  text: "#1E293B",
  textMuted: "#64748B",
  pageBg: "#F1F5F9",
  white: "#FFFFFF",
  primaryBlue: "#2563EB",
  linkOrange: "#EA580C",
  strengthOk: "#16A34A",
  imageLetterbox: "#0F172A"
};

function StrengthLine({ ok, text }) {
  return (
    <Typography
      component="div"
      sx={{
        fontSize: "0.8125rem",
        lineHeight: 1.8,
        color: ok ? COLORS.strengthOk : COLORS.textMuted,
        fontWeight: ok ? 600 : 400
      }}
    >
      {ok ? "✓" : "○"} {text}
    </Typography>
  );
}

function RestablecerContraseña() {
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtener el token de los parámetros de la URL
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  const passwordRules = useMemo(() => {
    return {
      len8: password.length >= 8,
      upper: /[A-ZÁÉÍÓÚÑ]/.test(password),
      digit: /\d/.test(password)
    };
  }, [password]);

  const passwordsMatch = password === passwordConfirm && password.length > 0;
  const confirmHasInput = passwordConfirm.length > 0;
  const confirmMismatch = confirmHasInput && password !== passwordConfirm;

  const handlePasswordChange = (e) => {
    setPassword(DOMPurify.sanitize(e.target.value));
    setError("");
  };

  const handleConfirmChange = (e) => {
    setPasswordConfirm(DOMPurify.sanitize(e.target.value));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Falta el token de recuperación en el enlace.");
      return;
    }

    if (!password || !passwordConfirm) {
      setError("Por favor ingresa la nueva contraseña y confírmala.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!passwordRules.len8 || !passwordRules.upper || !passwordRules.digit) {
      setError("La contraseña no cumple con los requisitos mínimos.");
      return;
    }

    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 2) {
      setError("La contraseña es muy débil. Por favor usa una combinación más segura.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const peticion = () =>
        axios.post(`${API_URL}/api/login/reset-password`, {
          token,
          newPassword: password
        });

      const res = await runWithOverlay(
        peticion,
        "Actualizando tu contraseña de forma segura…",
        { headline: "Restablecer contraseña", minMs: 600 }
      );

      await MySwal.fire({
        icon: "success",
        title: "Contraseña restablecida",
        text: res.data?.message || "Tu contraseña ha sido restablecida con éxito.",
        position: "center",
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#F0FDF4",
        color: "#1E293B",
        iconColor: "#16A34A"
      });

      navigate("/login", { replace: true });
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Ocurrió un error al restablecer la contraseña.";
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
      {/* Mitad izquierda: imagen */}
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
          src={IMG_RESET}
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
            Tu seguridad es primero
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.92)",
              fontSize: { xs: "0.9rem", md: "1rem" },
              lineHeight: 1.55,
              maxWidth: 420
            }}
          >
            Crea una nueva contraseña segura para proteger tu cuenta del salón
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

          <Typography
            component="h1"
            sx={{
              color: COLORS.text,
              fontWeight: 700,
              fontSize: { xs: "1.65rem", sm: "1.85rem" },
              mb: 1
            }}
          >
            Nueva contraseña
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: "0.95rem", mb: 3 }}>
            Crea tu nueva contraseña. Debe ser diferente de tus contraseñas anteriores.
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

          {!token ? (
            <Alert
              severity="warning"
              sx={{
                borderRadius: 2,
                border: "1px solid #FDE047"
              }}
            >
              El enlace es inválido porque no contiene el token necesario. Asegúrate de copiar el enlace completo que llegó a tu correo.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                required
                label="Nueva contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                autoComplete="new-password"
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar contraseña">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Box sx={{ mb: 2.5, pl: 0.25 }}>
                <StrengthLine ok={passwordRules.len8} text="8+ caracteres" />
                <StrengthLine ok={passwordRules.upper} text="1 mayúscula" />
                <StrengthLine ok={passwordRules.digit} text="1 número" />
              </Box>

              <TextField
                fullWidth
                required
                label="Confirma tu contraseña"
                name="passwordConfirm"
                type={showPasswordConfirm ? "text" : "password"}
                value={passwordConfirm}
                onChange={handleConfirmChange}
                autoComplete="new-password"
                error={confirmMismatch}
                helperText={
                  confirmMismatch
                    ? "Las contraseñas no coinciden."
                    : confirmHasInput && passwordsMatch
                      ? "Las contraseñas coinciden."
                      : "Escribe de nuevo tu contraseña."
                }
                FormHelperTextProps={{
                  sx: {
                    color: confirmMismatch ? "error.main" : confirmHasInput && passwordsMatch ? COLORS.strengthOk : undefined
                  }
                }}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowPasswordConfirm((v) => !v)} aria-label="Mostrar confirmación">
                        {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || confirmMismatch}
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
                {isLoading ? "Restableciendo…" : "Restablecer contraseña"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default RestablecerContraseña;
