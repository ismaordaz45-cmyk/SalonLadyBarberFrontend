import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  Box,
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
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import { logoBase64ToDataUrl } from "../../../utils/logoDataUrl";
import { compressLogoImageFile } from "../../../utils/compressLogoImage";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import HorarioSemanalPerfil from "./HorarioSemanalPerfil.jsx";

import AdminPageShell from "../../../ui/admin/AdminPageShell";
import AdminHeader from "../../../ui/admin/AdminHeader";
import { ADMIN_PALETTE as P } from "../../../ui/admin/adminTokens";

const MySwal = withReactContent(Swal);
const API_URL = "http://localhost:4000";

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

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
    logo: "",
    hero_image: "",
    login_image: ""
  });

  const [redes, setRedes] = useState([]);
  const [modalRedOpen, setModalRedOpen] = useState(false);
  const [redEditando, setRedEditando] = useState(null);
  const [formRed, setFormRed] = useState({ nombreRed: "", url: "" });
  const inputLogoRef = useRef(null);
  const inputHeroRef = useRef(null);
  const inputLoginImgRef = useRef(null);

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
      const base64 = await compressLogoImageFile(file);
      setPerfil((prev) => ({ ...prev, logo: base64 }));
    } catch (err) {
      console.error("Error al procesar imagen:", err);
      await MySwal.fire({
        icon: "error",
        title: "No se pudo procesar la imagen",
        text: "Prueba con otro archivo o uno más pequeño.",
        timer: 2800,
        showConfirmButton: false,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleHeroChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await compressLogoImageFile(file);
      setPerfil((prev) => ({ ...prev, hero_image: base64 }));
    } catch (err) {
      console.error("Error al procesar imagen de fondo:", err);
      await MySwal.fire({
        icon: "error",
        title: "No se pudo procesar la imagen",
        text: "Prueba con un archivo más pequeño.",
        timer: 2800,
        showConfirmButton: false,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleLoginImgChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await compressLogoImageFile(file);
      setPerfil((prev) => ({ ...prev, login_image: base64 }));
    } catch (err) {
      console.error("Error al procesar imagen de login:", err);
      await MySwal.fire({
        icon: "error",
        title: "No se pudo procesar la imagen",
        text: "Prueba con un archivo más pequeño.",
        timer: 2800,
        showConfirmButton: false,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } finally {
      if (e.target) e.target.value = "";
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
          logo: data.logo || "",
          hero_image: data.hero_image || "",
          login_image: data.login_image || ""
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
            logo: "",
            hero_image: "",
            login_image: ""
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

    const { isConfirmed } = await MySwal.fire({
      icon: "question",
      title: "Confirmar cambios",
      html: `
        <p style="margin:0 0 10px;font-size:15px;line-height:1.5;color:#334155;">
          Los datos modificados (incluido el logo, si lo cambió) actualizarán el perfil público de la empresa
          y lo verán clientes y el panel administrativo.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.5;color:#64748B;">
          ¿Desea aplicar estos cambios ahora?
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, guardar cambios",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: false,
      background: "#FFFFFF",
      color: PALETA.oscuro,
      iconColor: PALETA.principal,
      confirmButtonColor: PALETA.principal,
      cancelButtonColor: "#94A3B8"
    });
    if (!isConfirmed) return;

    setSavingPerfil(true);
    try {
      const payload = {
        nombre: perfil.nombre.trim(),
        descripcion: perfil.descripcion || null,
        telefono: perfil.telefono || null,
        correo: perfil.correo || null,
        direccion: perfil.direccion || null,
        ubicacion: perfil.ubicacion || null,
        sitioWeb: perfil.sitioWeb || null,
        logo: perfil.logo || null,
        hero_image: perfil.hero_image || null,
        login_image: perfil.login_image || null,
        activo: 1
      };
      const barberOpts = {
        barberHeadline: "Perfil de la empresa",
        barberMessage: "Guardando datos, contacto y logo…"
      };
      if (perfilId) {
        await axios.put(`${API_URL}/api/perfil-empresa/${perfilId}`, payload, barberOpts);
      } else {
        const { data } = await axios.post(`${API_URL}/api/perfil-empresa`, payload, {
          ...barberOpts,
          barberMessage: "Registrando la información de tu negocio…"
        });
        setPerfilId(data.id);
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
        await axios.put(
          `${API_URL}/api/redes-sociales/${redEditando.id}`,
          {
            nombreRed: formRed.nombreRed.trim(),
            url: formRed.url.trim(),
            icono: redEditando.icono ?? null,
            activo: redEditando.activo === 1 || redEditando.activo === true ? 1 : 0
          },
          {
            barberHeadline: "Redes sociales",
            barberMessage: "Actualizando enlace y nombre…"
          }
        );
        setRedes((prev) =>
          prev.map((r) =>
            r.id === redEditando.id
              ? { ...r, nombreRed: formRed.nombreRed.trim(), url: formRed.url.trim() }
              : r
          )
        );
      } else {
        const { data } = await axios.post(
          `${API_URL}/api/redes-sociales`,
          {
            nombreRed: formRed.nombreRed.trim(),
            url: formRed.url.trim(),
            perfilEmpresaId: perfilId,
            activo: 1
          },
          {
            barberHeadline: "Redes sociales",
            barberMessage: "Añadiendo la nueva red…"
          }
        );
        setRedes((prev) => [...prev, { id: data.id, ...formRed, icono: null, activo: true }]);
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
      await axios.delete(`${API_URL}/api/redes-sociales/${id}`, {
        barberHeadline: "Redes sociales",
        barberMessage: "Eliminando enlace…"
      });
      setRedes((prev) => prev.filter((r) => r.id !== id));
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
      await axios.put(
        `${API_URL}/api/redes-sociales/${red.id}`,
        {
          nombreRed: red.nombreRed,
          url: red.url,
          icono: red.icono ?? null,
          activo: nuevoActivo
        },
        {
          barberHeadline: "Redes sociales",
          barberMessage: "Actualizando visibilidad…"
        }
      );
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

  const logoPreview = perfil.logo ? logoBase64ToDataUrl(perfil.logo) : null;
  const heroPreview = perfil.hero_image ? logoBase64ToDataUrl(perfil.hero_image) : null;
  const loginPreview = perfil.login_image ? logoBase64ToDataUrl(perfil.login_image) : null;

  if (loadingPerfil) {
    return (
      <Box sx={{ bgcolor: "#FFFFFF", py: 5, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: PALETA.acento }} size={48} />
      </Box>
    );
  }

  return (
    <>
      <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
        <AdminHeader
          eyebrow="Empresa"
          title="Perfil de la empresa"
          subtitle="Administra los datos públicos y el logo del salón."
          icon={<PersonOutlineRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
          right={
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadRoundedIcon />}
              onClick={handleGuardarPerfil}
              disabled={savingPerfil || loadingPerfil}
            >
              {savingPerfil ? "Guardando..." : "Guardar"}
            </Button>
          }
        />

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
                Logo de la empresa
              </Typography>
              <input
                ref={inputLogoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                style={{ display: "none" }}
              />
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  borderRadius: 2,
                  border: `1px solid ${PALETA.borde(0.25)}`,
                  bgcolor: PALETA.fondoIcono(0.05),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(44, 62, 80, 0.08)"
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
                    <ImageOutlinedIcon sx={{ color: PALETA.borde(0.5), fontSize: 44 }} />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, lineHeight: 1.35 }}>
                      Sin imagen
                    </Typography>
                  </Box>
                )}
              </Box>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => inputLogoRef.current?.click()}
                sx={{
                  mt: 1.5,
                  minWidth: 160,
                  borderColor: PALETA.principal,
                  color: PALETA.principal,
                  fontWeight: 600,
                  textTransform: "none",
                  py: 0.75,
                  "&:hover": {
                    borderColor: PALETA.acento,
                    color: PALETA.oscuro,
                    bgcolor: alpha(PALETA.acento, 0.12)
                  }
                }}
              >
                {logoPreview ? "Cambiar imagen" : "Subir imagen"}
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, maxWidth: 200, lineHeight: 1.45 }}>
                JPG, PNG o WebP. Se ajusta tamaño y se guarda como JPEG para evitar errores con imágenes muy pesadas. Use &quot;Guardar perfil&quot; para aplicar.
              </Typography>
            </Box>

            {/* Nueva tarjeta para la Imagen de Fondo Hero */}
            <Box sx={{ flexShrink: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Imagen de fondo (Sección Pública)
              </Typography>
              <input
                ref={inputHeroRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleHeroChange}
                style={{ display: "none" }}
              />
              <Box
                sx={{
                  width: 240,
                  height: 135, // Proporción 16:9 aprox
                  borderRadius: 2,
                  border: `1px solid ${PALETA.borde(0.25)}`,
                  bgcolor: PALETA.fondoIcono(0.05),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(44, 62, 80, 0.08)"
                }}
              >
                {heroPreview ? (
                  <Box
                    component="img"
                    src={heroPreview}
                    alt="Fondo Hero"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", px: 2 }}>
                    <ImageOutlinedIcon sx={{ color: PALETA.borde(0.5), fontSize: 44 }} />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, lineHeight: 1.35 }}>
                      Sin fondo personalizado
                    </Typography>
                  </Box>
                )}
              </Box>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => inputHeroRef.current?.click()}
                sx={{
                  mt: 1.5,
                  minWidth: 240,
                  borderColor: PALETA.principal,
                  color: PALETA.principal,
                  fontWeight: 600,
                  textTransform: "none",
                  py: 0.75,
                  "&:hover": {
                    borderColor: PALETA.acento,
                    color: PALETA.oscuro,
                    bgcolor: alpha(PALETA.acento, 0.12)
                  }
                }}
              >
                {heroPreview ? "Cambiar fondo" : "Subir fondo"}
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, maxWidth: 240, lineHeight: 1.45 }}>
                Esta imagen aparecerá como fondo principal en la página de inicio pública. Se recomienda una imagen apaisada (Landscape).
              </Typography>
            </Box>

            {/* Nueva tarjeta para la Imagen de Login */}
            <Box sx={{ flexShrink: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Imagen de Login (Lateral)
              </Typography>
              <input
                ref={inputLoginImgRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLoginImgChange}
                style={{ display: "none" }}
              />
              <Box
                sx={{
                  width: 160,
                  height: 200, // Proporción vertical para el login
                  borderRadius: 2,
                  border: `1px solid ${PALETA.borde(0.25)}`,
                  bgcolor: PALETA.fondoIcono(0.05),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(44, 62, 80, 0.08)"
                }}
              >
                {loginPreview ? (
                  <Box
                    component="img"
                    src={loginPreview}
                    alt="Imagen Login"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", px: 2 }}>
                    <ImageOutlinedIcon sx={{ color: PALETA.borde(0.5), fontSize: 44 }} />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, lineHeight: 1.35 }}>
                      Sin imagen de login
                    </Typography>
                  </Box>
                )}
              </Box>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => inputLoginImgRef.current?.click()}
                sx={{
                  mt: 1.5,
                  minWidth: 160,
                  borderColor: PALETA.principal,
                  color: PALETA.principal,
                  fontWeight: 600,
                  textTransform: "none",
                  py: 0.75,
                  "&:hover": {
                    borderColor: PALETA.acento,
                    color: PALETA.oscuro,
                    bgcolor: alpha(PALETA.acento, 0.12)
                  }
                }}
              >
                {loginPreview ? "Cambiar imagen" : "Subir imagen"}
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, maxWidth: 160, lineHeight: 1.45 }}>
                Esta imagen aparecerá en el lateral izquierdo de la pantalla de inicio de sesión. Se recomienda una imagen vertical (Portrait).
              </Typography>
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
              <HorarioSemanalPerfil
                apiBaseUrl={API_URL}
                palette={PALETA}
                horarioResumen={perfil.horarioAtencion}
                onHorarioAtencionUpdated={(texto) =>
                  setPerfil((prev) => ({ ...prev, horarioAtencion: texto }))
                }
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
      </AdminPageShell>
    </>
  );
}

export default Perfil;
