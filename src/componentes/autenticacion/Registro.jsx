import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import zxcvbn from "zxcvbn";
import DOMPurify from "dompurify";

import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  HelpOutline as HelpIcon,
  VpnKey as KeyIcon,
  PersonAdd as PersonAddIcon
} from "@mui/icons-material";

import { motion } from "framer-motion";

const MySwal = withReactContent(Swal);

const API_URL = "http://localhost:4000";

const MotionPaper = motion(Paper);

function RegistroUsuarios() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    telefono: "",
    password: "",
    preguntaSecreta: "",
    respuestaSecreta: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const cleanFields = [
      "nombre",
      "apellidoPaterno",
      "apellidoMaterno",
      "correo",
      "telefono",
      "preguntaSecreta",
      "respuestaSecreta"
    ];

    let cleanValue = value;

    if (cleanFields.includes(name)) {
      cleanValue = DOMPurify.sanitize(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      nombre,
      correo,
      password
    } = formData;

    if (!nombre || !correo || !password) {
      await MySwal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Nombre, correo y contraseña son obligatorios",
        position: "center",
        timer: 2000,
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
        text: "La contraseña es muy débil. Usa una más segura.",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post(
        `${API_URL}/api/registro`,
        formData
      );

      await MySwal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: res.data?.message || "Usuario registrado correctamente",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });

      navigate("/login", {
        state: { email: formData.correo }
      });

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha("#E8DED2", 0.5)} 0%, ${alpha("#FFFFFF", 0.8)} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2,
        fontFamily: "'Geist Sans', Arial, sans-serif"
      }}
    >
      <Container component="main" maxWidth="sm">
        <MotionPaper
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          elevation={8}
          sx={{
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: `1px solid ${alpha("#2C3E50", 0.2)}`
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #2C3E50 0%, #D4AF37 100%)",
              py: 3,
              textAlign: "center",
              color: "#FFFFFF"
            }}
          >
            <PersonAddIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" fontWeight="700" fontFamily="'Playfair Display', serif">
              Crear cuenta
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              Completa tus datos para registrarte
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

              <TextField
                fullWidth
                label="Nombre *"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#2C3E50" }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#D4AF37" },
                    "&.Mui-focused fieldset": { borderColor: "#2C3E50" }
                  }
                }}
              />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  sx={{ flex: 1, minWidth: 120 }}
                  label="Apellido paterno"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  size="small"
                />
                <TextField
                  sx={{ flex: 1, minWidth: 120 }}
                  label="Apellido materno"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  size="small"
                />
              </Box>

              <TextField
                fullWidth
                label="Correo electrónico *"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                required
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#2C3E50" }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#D4AF37" },
                    "&.Mui-focused fieldset": { borderColor: "#2C3E50" }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: "#2C3E50" }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#D4AF37" },
                    "&.Mui-focused fieldset": { borderColor: "#2C3E50" }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Contraseña *"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                size="small"
                helperText="Mínimo seguridad media (zxcvbn)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#2C3E50" }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#D4AF37" },
                    "&.Mui-focused fieldset": { borderColor: "#2C3E50" }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Pregunta secreta"
                name="preguntaSecreta"
                value={formData.preguntaSecreta}
                onChange={handleChange}
                size="small"
                placeholder="Ej: ¿Nombre de tu mascota?"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HelpIcon sx={{ color: "#2C3E50" }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#D4AF37" },
                    "&.Mui-focused fieldset": { borderColor: "#2C3E50" }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Respuesta secreta"
                name="respuestaSecreta"
                value={formData.respuestaSecreta}
                onChange={handleChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: "#2C3E50" }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "#D4AF37" },
                    "&.Mui-focused fieldset": { borderColor: "#2C3E50" }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)",
                  color: "#D4AF37",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1A252F 0%, #2C3E50 100%)",
                    color: "#FFFFFF"
                  }
                }}
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes cuenta?
                <Button
                  component={Link}
                  to="/login"
                  size="small"
                  sx={{
                    color: "#2C3E50",
                    fontWeight: 600,
                    "&:hover": { color: "#D4AF37", backgroundColor: "transparent" }
                  }}
                >
                  Iniciar sesión
                </Button>
              </Typography>
            </Box>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
}

export default RegistroUsuarios;
