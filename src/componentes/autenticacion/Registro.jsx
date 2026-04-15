import React, { useMemo, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import zxcvbn from "zxcvbn";
import DOMPurify from "dompurify";

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import ArrowBackIosNewRounded from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const MySwal = withReactContent(Swal);

const API_URL = "http://localhost:4000";

const ROL_CLIENTE = "CLIENTE";

/** `public/images/landing/register-salon.jpg` */
const IMG_REGISTER = `${process.env.PUBLIC_URL || ""}/images/landing/register-salon.jpg`;

const COLORS = {
  text: "#1E293B",
  textMuted: "#64748B",
  pageBg: "#F1F5F9",
  white: "#FFFFFF",
  primaryBlue: "#2563EB",
  imageLetterbox: "#0F172A",
  overlay: "rgba(0,0,0,0.45)",
  strengthOk: "#16A34A"
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function isCorreoValido(correo) {
  const c = correo.trim();
  return EMAIL_RE.test(c);
}

/** Teléfono opcional; solo dígitos en estado, vacío o exactamente 10. */
function isTelefonoValido(telefonoDigits) {
  if (!telefonoDigits || telefonoDigits.length === 0) return true;
  return /^\d{10}$/.test(telefonoDigits);
}

function RegistroUsuarios() {
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    telefono: "",
    password: "",
    passwordConfirm: "",
    preguntaSecreta: "",
    respuestaSecreta: ""
  });

  const passwordRules = useMemo(() => {
    const p = formData.password;
    return {
      len8: p.length >= 8,
      upper: /[A-ZÁÉÍÓÚÑ]/.test(p),
      digit: /\d/.test(p)
    };
  }, [formData.password]);

  const passwordsMatch =
    formData.password === formData.passwordConfirm && formData.password.length > 0;
  const confirmHasInput = formData.passwordConfirm.length > 0;
  const confirmMismatch = confirmHasInput && formData.password !== formData.passwordConfirm;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefono") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, telefono: digitsOnly }));
      return;
    }

    if (name === "passwordConfirm") {
      setFormData((prev) => ({ ...prev, passwordConfirm: value }));
      return;
    }

    const cleanFields = [
      "nombre",
      "apellidoPaterno",
      "apellidoMaterno",
      "correo",
      "preguntaSecreta",
      "respuestaSecreta"
    ];
    let cleanValue = value;
    if (cleanFields.includes(name)) {
      cleanValue = DOMPurify.sanitize(value);
    }
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      telefono,
      password,
      passwordConfirm,
      preguntaSecreta,
      respuestaSecreta
    } = formData;

    if (!nombre?.trim() || !correo?.trim() || !password || !passwordConfirm) {
      await MySwal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Nombre, correo, contraseña y la confirmación de contraseña son obligatorios.",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    if (!isCorreoValido(correo)) {
      await MySwal.fire({
        icon: "warning",
        title: "Correo no válido",
        text: "Ingresa un correo electrónico con formato válido (ej. hola@ejemplo.com).",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    if (!isTelefonoValido(telefono)) {
      await MySwal.fire({
        icon: "warning",
        title: "Teléfono no válido",
        text: "El teléfono debe tener exactamente 10 dígitos numéricos, o déjalo vacío si no aplica.",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    if (password !== passwordConfirm) {
      await MySwal.fire({
        icon: "warning",
        title: "Contraseñas distintas",
        text: "La confirmación debe ser exactamente igual a tu contraseña.",
        position: "center",
        timer: 2800,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    const pregunta = preguntaSecreta.trim();
    const respuesta = respuestaSecreta.trim();
    if (pregunta && !respuesta) {
      await MySwal.fire({
        icon: "warning",
        title: "Recuperación de cuenta",
        text: "Si defines una pregunta secreta, debes escribir también la respuesta.",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }
    if (respuesta && !pregunta) {
      await MySwal.fire({
        icon: "warning",
        title: "Recuperación de cuenta",
        text: "Si escribes una respuesta secreta, debes definir la pregunta.",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    if (!passwordRules.len8 || !passwordRules.upper || !passwordRules.digit) {
      await MySwal.fire({
        icon: "warning",
        title: "Contraseña insuficiente",
        text: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 2) {
      await MySwal.fire({
        icon: "warning",
        title: "Contraseña débil",
        text: "La contraseña es muy débil. Usa una combinación más segura.",
        position: "center",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      apellidoPaterno: apellidoPaterno.trim() || null,
      apellidoMaterno: apellidoMaterno.trim() || null,
      correo: correo.trim(),
      telefono: telefono.length === 10 ? telefono : null,
      password,
      rol: ROL_CLIENTE,
      preguntaSecreta: pregunta || null,
      respuestaSecreta: respuesta || null
    };

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/api/registro`, payload, {
        barberHeadline: "¡Casi listo!",
        barberMessage: "Creando tu cuenta…"
      });

      const okText = res.data?.message || "Usuario registrado correctamente.";
      await runWithOverlay(
        () => new Promise((resolve) => setTimeout(resolve, 480)),
        okText,
        { headline: "Registro exitoso", minMs: 780 }
      );

      navigate("/login", { state: { email: formData.correo.trim() } });
    } catch (error) {
      let msg = "No se pudo registrar el usuario";
      if (error.response?.data?.error) {
        msg = error.response.data.error;
      }
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const linkBlueSx = {
    color: COLORS.primaryBlue,
    fontWeight: 600,
    "&:hover": { color: "#1D4ED8" }
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
          minHeight: { xs: 280, md: "100vh" },
          maxHeight: { xs: 360, md: "none" },
          bgcolor: COLORS.imageLetterbox,
          overflow: "hidden"
        }}
      >
        <Box
          component="img"
          src={IMG_REGISTER}
          alt=""
          sx={{
            width: "100%",
            height: { xs: 280, md: "100vh" },
            objectFit: "cover",
            objectPosition: "center",
            display: "block"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: COLORS.overlay,
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
            textAlign: "left"
          }}
        >
          <Typography
            component="h2"
            sx={{
              color: COLORS.white,
              fontWeight: 700,
              fontSize: { xs: "1.5rem", md: "2rem" },
              lineHeight: 1.2,
              mb: 1
            }}
          >
            Donde tu estilo cobra vida.
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.95)",
              fontSize: { xs: "0.9rem", md: "1rem" },
              lineHeight: 1.55,
              maxWidth: 440
            }}
          >
            Donde cada detalle está pensado para resaltar tu estilo
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
        <Box sx={{ width: "100%", maxWidth: 560, mx: "auto" }}>
          <Link
            component={RouterLink}
            to="/"
            underline="hover"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              ...linkBlueSx,
              fontSize: "0.9rem",
              mb: 3
            }}
          >
            <ArrowBackIosNewRounded sx={{ fontSize: 14 }} />
            Volver
          </Link>

          <Typography
            component="h1"
            sx={{
              color: COLORS.text,
              fontWeight: 700,
              fontSize: { xs: "1.65rem", sm: "1.9rem" },
              mb: 1
            }}
          >
            Crear una cuenta
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: "0.95rem", mb: 3 }}>
            Regístrate para comenzar tu experiencia en Lady Barber Itza D&apos;M
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
                mb: 2
              }}
            >
              <TextField
                fullWidth
                required
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                autoComplete="given-name"
              />
              <TextField
                fullWidth
                label="Apellido paterno"
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                autoComplete="family-name"
              />
              <TextField
                fullWidth
                label="Apellido materno"
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                autoComplete="additional-name"
              />
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="5512345678"
                autoComplete="tel"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 10,
                  "aria-describedby": "registro-telefono-helper"
                }}
                helperText={
                  formData.telefono.length > 0
                    ? `${formData.telefono.length}/10 dígitos`
                    : "Opcional. Solo números, 10 dígitos."
                }
                FormHelperTextProps={{ id: "registro-telefono-helper" }}
              />
              <Box sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}>
                <TextField
                  fullWidth
                  required
                  label="Correo electrónico"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="hola@ejemplo.com"
                  autoComplete="email"
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              required
              label="Contraseña"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              sx={{ mb: 1.5 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ mb: 2, pl: 0.25 }}>
              <StrengthLine ok={passwordRules.len8} text="8+ caracteres" />
              <StrengthLine ok={passwordRules.upper} text="1 mayúscula" />
              <StrengthLine ok={passwordRules.digit} text="1 número" />
            </Box>

            <TextField
              fullWidth
              required
              label="Repite tu contraseña"
              name="passwordConfirm"
              type={showPasswordConfirm ? "text" : "password"}
              value={formData.passwordConfirm}
              onChange={handleChange}
              autoComplete="new-password"
              error={confirmMismatch}
              helperText={
                confirmMismatch
                  ? "Las contraseñas no coinciden."
                  : confirmHasInput && passwordsMatch
                    ? "Las contraseñas coinciden."
                    : "Debe ser idéntica a la contraseña anterior."
              }
              FormHelperTextProps={{
                sx: {
                  color: confirmMismatch ? "error.main" : confirmHasInput && passwordsMatch ? COLORS.strengthOk : undefined
                }
              }}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPasswordConfirm((v) => !v)}
                      aria-label={showPasswordConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
                    >
                      {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Pregunta secreta"
              name="preguntaSecreta"
              value={formData.preguntaSecreta}
              onChange={handleChange}
              placeholder="Ej. ¿Nombre de tu mascota?"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Respuesta secreta"
              name="respuestaSecreta"
              type="password"
              value={formData.respuestaSecreta}
              onChange={handleChange}
              autoComplete="new-password"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || confirmMismatch}
              endIcon={<ArrowForwardRounded />}
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
              {isLoading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </Box>

          <Typography sx={{ textAlign: "center", mt: 4, color: COLORS.textMuted, fontSize: "0.95rem" }}>
            ¿Ya tienes cuenta?{" "}
            <Link component={RouterLink} to="/login" underline="hover" sx={linkBlueSx}>
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default RegistroUsuarios;
