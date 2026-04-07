import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  CircularProgress
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";

const MySwal = withReactContent(Swal);
const API_URL = "http://localhost:4000";

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

// Convierte archivo a base64 (texto para guardar en BD)
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      // Quitar prefijo "data:image/...;base64," para guardar solo el texto base64
      const base64 = typeof result === "string" && result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
  });

function Perfil() {
  const [perfilId, setPerfilId] = useState(null);
  const [perfil, setPerfil] = useState({
    nombre: "",
    descripcion: "",
    telefono: "",
    correo: "",
    direccion: "",
    ubicacion: "",
    horarioAtencion: "",
    sitioWeb: "",
    logo: ""
  });

  const [redes, setRedes] = useState([]);
  const [modalRedOpen, setModalRedOpen] = useState(false);
  const [redEditando, setRedEditando] = useState(null);
  const [formRed, setFormRed] = useState({ nombreRed: "", url: "" });
  const inputLogoRef = useRef(null);

  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [loadingRedes, setLoadingRedes] = useState(false);
  const [savingRed, setSavingRed] = useState(false);

  const handlePerfilChange = (campo) => (e) => {
    setPerfil((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await fileToBase64(file);
      setPerfil((prev) => ({ ...prev, logo: base64 }));
    } catch (err) {
      console.error("Error al leer imagen:", err);
    }
  };

  // Cargar perfil al montar
  useEffect(() => {
    const fetchPerfil = async () => {
      setLoadingPerfil(true);
      try {
        const { data } = await axios.get(`${API_URL}/api/perfil-empresa`);
        setPerfilId(data.id);
        setPerfil({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          telefono: data.telefono || "",
          correo: data.correo || "",
          direccion: data.direccion || "",
          ubicacion: data.ubicacion || "",
          horarioAtencion: data.horarioAtencion || "",
          sitioWeb: data.sitioWeb || "",
          logo: data.logo || ""
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setPerfilId(null);
          setPerfil({
            nombre: "",
            descripcion: "",
            telefono: "",
            correo: "",
            direccion: "",
            ubicacion: "",
            horarioAtencion: "",
            sitioWeb: "",
            logo: ""
          });
        } else {
          await MySwal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.error || "No se pudo cargar el perfil",
            position: "center",
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true,
            background: PALETA.fondoIcono(0.2),
            color: PALETA.oscuro,
            iconColor: PALETA.principal
          });
        }
      } finally {
        setLoadingPerfil(false);
      }
    };
    fetchPerfil();
  }, []);

  // Cargar redes cuando hay perfilId
  useEffect(() => {
    if (perfilId == null) {
      setRedes([]);
      return;
    }
    const fetchRedes = async () => {
      setLoadingRedes(true);
      try {
        const { data } = await axios.get(`${API_URL}/api/redes-sociales?perfilEmpresaId=${perfilId}`);
        setRedes(Array.isArray(data) ? data : []);
      } catch (err) {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.error || "No se pudieron cargar las redes",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: PALETA.fondoIcono(0.2),
          color: PALETA.oscuro,
          iconColor: PALETA.principal
        });
        setRedes([]);
      } finally {
        setLoadingRedes(false);
      }
    };
    fetchRedes();
  }, [perfilId]);

  const handleGuardarPerfil = async () => {
    if (!perfil.nombre?.trim()) {
      await MySwal.fire({
        icon: "warning",
        title: "Nombre obligatorio",
        text: "El nombre de la empresa es obligatorio",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
      return;
    }
    setSavingPerfil(true);
    try {
      const payload = {
        nombre: perfil.nombre.trim(),
        descripcion: perfil.descripcion || null,
        telefono: perfil.telefono || null,
        correo: perfil.correo || null,
        direccion: perfil.direccion || null,
        ubicacion: perfil.ubicacion || null,
        horarioAtencion: perfil.horarioAtencion || null,
        sitioWeb: perfil.sitioWeb || null,
        logo: perfil.logo || null,
        activo: 1
      };
      if (perfilId) {
        await axios.put(`${API_URL}/api/perfil-empresa/${perfilId}`, payload);
        await MySwal.fire({
          icon: "success",
          title: "Perfil actualizado",
          text: "Los datos se guardaron correctamente",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: PALETA.fondoIcono(0.2),
          color: PALETA.oscuro,
          iconColor: PALETA.principal
        });
      } else {
        const { data } = await axios.post(`${API_URL}/api/perfil-empresa`, payload);
        setPerfilId(data.id);
        await MySwal.fire({
          icon: "success",
          title: "Perfil creado",
          text: "Los datos se guardaron correctamente",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: PALETA.fondoIcono(0.2),
          color: PALETA.oscuro,
          iconColor: PALETA.principal
        });
      }
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo guardar el perfil",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleOpenModalRed = (red = null) => {
    setRedEditando(red);
    setFormRed(red ? { nombreRed: red.nombreRed, url: red.url } : { nombreRed: "", url: "" });
    setModalRedOpen(true);
  };

  const handleCloseModalRed = () => {
    setModalRedOpen(false);
    setRedEditando(null);
    setFormRed({ nombreRed: "", url: "" });
  };

  const handleSaveRed = async () => {
    if (!formRed.nombreRed.trim() || !formRed.url.trim()) return;
    if (!perfilId) {
      await MySwal.fire({
        icon: "warning",
        title: "Guarda primero el perfil",
        text: "Debes guardar el perfil de la empresa antes de agregar redes sociales",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
      return;
    }
    setSavingRed(true);
    try {
      if (redEditando) {
        await axios.put(`${API_URL}/api/redes-sociales/${redEditando.id}`, {
          nombreRed: formRed.nombreRed.trim(),
          url: formRed.url.trim(),
          icono: redEditando.icono ?? null,
          activo: redEditando.activo === 1 || redEditando.activo === true ? 1 : 0
        });
        setRedes((prev) =>
          prev.map((r) =>
            r.id === redEditando.id
              ? { ...r, nombreRed: formRed.nombreRed.trim(), url: formRed.url.trim() }
              : r
          )
        );
        await MySwal.fire({
          icon: "success",
          title: "Red actualizada",
          text: "Los cambios se guardaron correctamente",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: PALETA.fondoIcono(0.2),
          color: PALETA.oscuro,
          iconColor: PALETA.principal
        });
      } else {
        const { data } = await axios.post(`${API_URL}/api/redes-sociales`, {
          nombreRed: formRed.nombreRed.trim(),
          url: formRed.url.trim(),
          perfilEmpresaId: perfilId,
          activo: 1
        });
        setRedes((prev) => [...prev, { id: data.id, ...formRed, icono: null, activo: true }]);
        await MySwal.fire({
          icon: "success",
          title: "Red agregada",
          text: "La red social se agregó correctamente",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: PALETA.fondoIcono(0.2),
          color: PALETA.oscuro,
          iconColor: PALETA.principal
        });
      }
      handleCloseModalRed();
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo guardar la red",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } finally {
      setSavingRed(false);
    }
  };

  const handleEliminarRed = async (id) => {
    const { isConfirmed } = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar red?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonColor: "#B91C1C",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Eliminar"
    });
    if (!isConfirmed) return;
    try {
      await axios.delete(`${API_URL}/api/redes-sociales/${id}`);
      setRedes((prev) => prev.filter((r) => r.id !== id));
      await MySwal.fire({
        icon: "success",
        title: "Eliminada",
        text: "La red social se eliminó correctamente",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo eliminar",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    }
  };

  const handleToggleActivoRed = async (red) => {
    const nuevoActivo = red.activo !== false ? 0 : 1;
    try {
      await axios.put(`${API_URL}/api/redes-sociales/${red.id}`, {
        nombreRed: red.nombreRed,
        url: red.url,
        icono: red.icono ?? null,
        activo: nuevoActivo
      });
      setRedes((prev) =>
        prev.map((r) => (r.id === red.id ? { ...r, activo: nuevoActivo } : r))
      );
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo actualizar el estado",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    }
  };

  const logoPreview = perfil.logo
    ? `data:image/jpeg;base64,${perfil.logo}`
    : null;

  if (loadingPerfil) {
    return (
      <Box sx={{ bgcolor: "#FFFFFF", py: 5, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: PALETA.acento }} size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#FFFFFF", py: 5, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        {/* ========== TÍTULO PÁGINA ========== */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: PALETA.fondoIcono()
            }}
          >
            <PersonOutlineRoundedIcon sx={{ color: PALETA.principal, fontSize: 30 }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.oscuro }}
            >
              Perfil de la empresa
            </Typography>
            <Typography variant="body2" sx={{ color: PALETA.borde(0.8), mt: 0.5 }}>
              Administra los datos públicos y el logo del salón.
            </Typography>
          </Box>
        </Box>

        {/* ========== SECCIÓN 1: DATOS DEL PERFIL + LOGO ========== */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" fontWeight={700} color={PALETA.principal} sx={{ mb: 3, fontFamily: "'Geist Sans', Arial, sans-serif" }}>
            Datos del perfil
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
            {/* Logo: subida y vista previa */}
            <Box sx={{ flexShrink: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Logo
              </Typography>
              <input
                ref={inputLogoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                style={{ display: "none" }}
              />
              <Box
                onClick={() => inputLogoRef.current?.click()}
                sx={{
                  width: 160,
                  height: 160,
                  borderRadius: 2,
                  border: `2px dashed ${PALETA.borde(0.4)}`,
                  bgcolor: PALETA.fondoIcono(0.05),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover": { borderColor: PALETA.acento, bgcolor: PALETA.fondoIcono(0.08) }
                }}
              >
                {logoPreview ? (
                  <Box
                    component="img"
                    src={logoPreview}
                    alt="Logo"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", px: 2 }}>
                    <ImageOutlinedIcon sx={{ color: PALETA.borde(0.6), fontSize: 48 }} />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Clic para subir
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Campos del perfil */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Nombre de la empresa"
                value={perfil.nombre}
                onChange={handlePerfilChange("nombre")}
                required
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorefrontRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                }}
                InputLabelProps={{ sx: { color: PALETA.borde(0.9) } }}
              />
              <TextField
                label="Descripción"
                value={perfil.descripcion}
                onChange={handlePerfilChange("descripcion")}
                multiline
                rows={2}
                fullWidth
                size="small"
                placeholder="Breve descripción del salón"
                InputProps={{
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                }}
              />
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <TextField
                  label="Teléfono"
                  value={perfil.telefono}
                  onChange={handlePerfilChange("telefono")}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                  }}
                />
                <TextField
                  label="Correo"
                  value={perfil.correo}
                  onChange={handlePerfilChange("correo")}
                  type="email"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                  }}
                />
              </Box>
              <TextField
                label="Dirección"
                value={perfil.direccion}
                onChange={handlePerfilChange("direccion")}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                }}
              />
              <TextField
                label="Ubicación"
                value={perfil.ubicacion}
                onChange={handlePerfilChange("ubicacion")}
                fullWidth
                size="small"
                placeholder="Ej: link de Google Maps o referencia"
                InputProps={{
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                }}
              />
              <TextField
                label="Horario de atención"
                value={perfil.horarioAtencion}
                onChange={handlePerfilChange("horarioAtencion")}
                fullWidth
                size="small"
                placeholder="Ej: Lun–Vie 9:00–18:00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                }}
              />
              <TextField
                label="Sitio web"
                value={perfil.sitioWeb}
                onChange={handlePerfilChange("sitioWeb")}
                fullWidth
                size="small"
                placeholder="https://..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) }, "&:hover fieldset": { borderColor: PALETA.principal } }
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleGuardarPerfil}
              disabled={savingPerfil}
              sx={{
                bgcolor: PALETA.acento,
                color: PALETA.oscuro,
                fontWeight: 700,
                px: 4,
                py: 1.2,
                "&:hover": { bgcolor: PALETA.oscuro, color: "#fff" }
              }}
            >
              {savingPerfil ? "Guardando..." : "Guardar perfil"}
            </Button>
          </Box>
        </Paper>

        {/* ========== SECCIÓN 2: REDES SOCIALES ========== */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ShareRoundedIcon sx={{ color: PALETA.principal, fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700} color={PALETA.principal}>
                Redes sociales
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => handleOpenModalRed()}
              disabled={!perfilId || loadingRedes}
              sx={{
                borderColor: PALETA.principal,
                color: PALETA.principal,
                fontWeight: 600,
                "&:hover": { borderColor: PALETA.acento, color: PALETA.acento, bgcolor: PALETA.fondoIcono(0.05) }
              }}
            >
              Agregar red
            </Button>
          </Box>

          {loadingRedes ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress sx={{ color: PALETA.acento }} size={36} />
            </Box>
          ) : redes.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                border: `1px dashed ${PALETA.borde(0.4)}`,
                borderRadius: 2,
                bgcolor: PALETA.fondoIcono(0.03)
              }}
            >
              <LinkRoundedIcon sx={{ color: PALETA.borde(0.5), fontSize: 48 }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {perfilId
                  ? "No hay redes sociales agregadas. Usa el botón \"Agregar red\" para añadir Facebook, Instagram, etc."
                  : "Guarda primero el perfil de la empresa para poder agregar redes sociales."}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.06) }}>
                    <TableCell sx={{ fontWeight: 700, color: PALETA.principal }}>Red</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: PALETA.principal }}>URL</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: PALETA.principal }}>
                      Estado
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: PALETA.principal }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {redes.map((red) => (
                    <TableRow key={red.id} hover sx={{ "&:hover": { bgcolor: PALETA.fondoIcono(0.04) } }}>
                      <TableCell sx={{ fontWeight: 500 }}>{red.nombreRed}</TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }} title={red.url}>
                        {red.url}
                      </TableCell>
                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={red.activo !== false && red.activo !== 0}
                              onChange={() => handleToggleActivoRed(red)}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: PALETA.acento },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: PALETA.acento }
                              }}
                            />
                          }
                            label={
                            <Chip
                              size="small"
                              label={red.activo !== false && red.activo !== 0 ? "Activo" : "Inactivo"}
                              sx={{
                                bgcolor: red.activo !== false && red.activo !== 0 ? alpha("#22C55E", 0.15) : alpha("#94A3B8", 0.2),
                                color: red.activo !== false && red.activo !== 0 ? "#15803D" : "#64748B",
                                fontWeight: 600
                              }}
                            />
                          }
                          labelPlacement="start"
                          sx={{ mr: 0 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModalRed(red)}
                          sx={{ color: PALETA.principal, "&:hover": { bgcolor: PALETA.fondoIcono(0.1), color: PALETA.acento } }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEliminarRed(red.id)}
                          sx={{ color: "#B91C1C", "&:hover": { bgcolor: alpha("#B91C1C", 0.08) } }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* ========== MODAL AGREGAR / EDITAR RED ========== */}
        <Dialog
          open={modalRedOpen}
          onClose={handleCloseModalRed}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: `1px solid ${PALETA.borde()}`,
              boxShadow: "0 8px 32px rgba(44, 62, 80, 0.12)"
            }
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.principal, fontWeight: 700 }}>
            {redEditando ? "Editar red social" : "Agregar red social"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
              <TextField
                label="Nombre de la red"
                value={formRed.nombreRed}
                onChange={(e) => setFormRed((prev) => ({ ...prev, nombreRed: e.target.value }))}
                placeholder="Ej: Facebook, Instagram, WhatsApp"
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShareRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } }
                }}
              />
              <TextField
                label="URL"
                value={formRed.url}
                onChange={(e) => setFormRed((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkRoundedIcon sx={{ color: PALETA.principal, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
            <Button onClick={handleCloseModalRed} sx={{ color: PALETA.borde(0.9) }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveRed}
              disabled={!formRed.nombreRed.trim() || !formRed.url.trim() || savingRed}
              sx={{
                bgcolor: PALETA.acento,
                color: PALETA.oscuro,
                fontWeight: 700,
                "&:hover": { bgcolor: PALETA.oscuro, color: "#fff" },
                "&.Mui-disabled": { bgcolor: PALETA.borde(0.2), color: PALETA.borde(0.6) }
              }}
            >
              {savingRed ? "Guardando..." : redEditando ? "Guardar cambios" : "Agregar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Perfil;
