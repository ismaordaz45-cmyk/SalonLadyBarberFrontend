// ============================================
// COMPONENTE: Servicios.jsx (Gestión del Salón - PROPIETARIA)
// Administra el catálogo de servicios de la barbería
// Tabla: servicio (id, nombre, descripcion, precio, duracionMinutos, categoria, imagenUrl, estaActivo)
// Conectado a backend /api/servicios
// ============================================

import React, { useState, useRef, useEffect } from "react";
import api from "../../../api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardContent,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { resolveServicioImagenUrl } from "../../../utils/resolveServicioImagenUrl";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import AdminPageShell from "../../../ui/admin/AdminPageShell";
import AdminHeader from "../../../ui/admin/AdminHeader";
import { GlassCard } from "../../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../../ui/admin/adminTokens";

const MySwal = withReactContent(Swal);

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const base64 =
        typeof result === "string" && result.includes(",")
          ? result.split(",")[1]
          : result;
      resolve(base64);
    };
    reader.onerror = reject;
  });

const formatearPrecio = (valor) => {
  if (valor == null || valor === "") return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(valor));
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [savingServicio, setSavingServicio] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracionMinutos: "",
    categoria: "",
    estaActivo: true,
    imagen: ""
  });
  const inputImagenRef = useRef(null);

  const fetchServicios = async () => {
    setLoadingServicios(true);
    try {
      const { data } = await api.get("/api/servicios", {
        params: { incluirInactivos: 1 },
        barberHeadline: "Catálogo de servicios",
        barberMessage: "Cargando servicios del salón…"
      });
      setServicios(Array.isArray(data) ? data : []);
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.error ||
          "No se pudieron cargar los servicios",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha("#D4AF37", 0.15),
        color: "#1A252F",
        iconColor: "#2C3E50"
      });
      setServicios([]);
    } finally {
      setLoadingServicios(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const categoriasDisponibles = Array.from(
    new Set(servicios.map((s) => s.categoria).filter(Boolean))
  );

  const handleOpenModal = (servicio = null) => {
    setServicioEditando(servicio);
    if (servicio) {
      setForm({
        nombre: servicio.nombre || "",
        descripcion: servicio.descripcion || "",
        precio: servicio.precio != null ? String(servicio.precio) : "",
        duracionMinutos:
          servicio.duracionMinutos != null
            ? String(servicio.duracionMinutos)
            : "",
        categoria: servicio.categoria || "",
        estaActivo: servicio.estaActivo === 1,
        imagen: servicio.imagenUrl || ""
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        duracionMinutos: "",
        categoria: "",
        estaActivo: true,
        imagen: ""
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setServicioEditando(null);
  };

  const handleFormChange = (campo) => (e) => {
    const valor =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleNumChange = (campo) => (e) => {
    const v = e.target.value;
    if (v === "" || /^\d*\.?\d*$/.test(v)) {
      setForm((prev) => ({ ...prev, [campo]: v }));
    }
  };

  const handleImagenChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, imagen: base64 }));
    } catch (err) {
      console.error("Error al leer imagen:", err);
    }
  };

  const handleGuardar = () => {
    if (!form.nombre?.trim()) return;
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
      precio:
        form.precio !== "" && form.precio !== undefined
          ? Number(form.precio)
          : null,
      duracionMinutos:
        form.duracionMinutos !== "" && form.duracionMinutos !== undefined
          ? Number(form.duracionMinutos)
          : null,
      categoria: form.categoria?.trim() || null,
      estaActivo: form.estaActivo ? 1 : 0,
      imagenUrl: form.imagen || null
    };

    setSavingServicio(true);
    const esEdicion = Boolean(servicioEditando);
    const url = esEdicion ? `/api/servicios/${servicioEditando.id}` : "/api/servicios";
    const metodo = esEdicion ? "put" : "post";

    (async () => {
      try {
        const { data } = await api[metodo](url, payload);

        if (esEdicion) {
          setServicios((prev) =>
            prev.map((s) => (s.id === servicioEditando.id ? data : s))
          );
        } else {
          setServicios((prev) => [data, ...prev]);
        }

        handleCloseModal();
        MySwal.fire({
          icon: "success",
          title: esEdicion ? "Servicio actualizado" : "Servicio agregado",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: alpha("#D4AF37", 0.15),
          color: "#1A252F",
          iconColor: "#2C3E50"
        });
      } catch (err) {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text:
            err.response?.data?.error ||
            "No se pudo guardar el servicio",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: alpha("#D4AF37", 0.15),
          color: "#1A252F",
          iconColor: "#2C3E50"
        });
      } finally {
        setSavingServicio(false);
      }
    })();
  };

  const handleToggleActivo = (servicio) => {
    const nuevo = servicio.estaActivo === 1 ? 0 : 1;
    // Actualización optimista
    setServicios((prev) =>
      prev.map((s) =>
        s.id === servicio.id ? { ...s, estaActivo: nuevo } : s
      )
    );
    (async () => {
      try {
        await api.patch(
          `/api/servicios/${servicio.id}/activo`,
          { estaActivo: nuevo },
          {
            barberHeadline: "Catálogo de servicios",
            barberMessage: "Actualizando visibilidad en el catálogo…"
          }
        );
      } catch (err) {
        // Revertir
        setServicios((prev) =>
          prev.map((s) =>
            s.id === servicio.id ? { ...s, estaActivo: servicio.estaActivo } : s
          )
        );
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text:
            err.response?.data?.error ||
            "No se pudo actualizar el estado del servicio",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: alpha("#D4AF37", 0.15),
          color: "#1A252F",
          iconColor: "#2C3E50"
        });
      }
    })();
  };

  const serviciosFiltrados = servicios.filter((s) => {
    const coincideTexto =
      !filtroTexto ||
      s.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      s.descripcion?.toLowerCase().includes(filtroTexto.toLowerCase());

    const coincideCategoria =
      filtroCategoria === "todas" || s.categoria === filtroCategoria;

    return coincideTexto && coincideCategoria;
  });

  const totalServicios = servicios.length;
  const activos = servicios.filter((s) => s.estaActivo === 1).length;
  const promedioDuracion =
    servicios.length > 0
      ? Math.round(
          servicios.reduce(
            (acc, s) => acc + (s.duracionMinutos || 0),
            0
          ) / servicios.length
        )
      : 0;

  const imagenPreview = form.imagen
    ? resolveServicioImagenUrl(form.imagen, api.defaults.baseURL)
    : null;

  if (loadingServicios) {
    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          py: 5,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress sx={{ color: PALETA.acento }} size={48} />
      </Box>
    );
  }

  return (
    <>
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Catálogo"
        title="Catálogo de servicios"
        subtitle="Administra los servicios disponibles en la barbería."
        icon={<StorefrontRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        right={
          <Button variant="contained" color="primary" startIcon={<AddRoundedIcon />} onClick={() => handleOpenModal()}>
            Agregar servicio
          </Button>
        }
      />

        {/* ========== RESUMEN RÁPIDO ========== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <GlassCard elevation={0} sx={{ bgcolor: alpha(P.accent, 0.06) }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(P.accent, 0.2)
                  }}
                >
                  <CategoryRoundedIcon
                    sx={{ color: P.accent, fontSize: 24 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total servicios
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={P.primary}
                  >
                    {totalServicios}
                  </Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <GlassCard elevation={0} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#22C55E", 0.1)
                  }}
                >
                  <CheckCircleRoundedIcon
                    sx={{ color: "#15803D", fontSize: 24 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Activos
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={PALETA.oscuro}
                  >
                    {activos}
                  </Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <GlassCard elevation={0} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: PALETA.fondoIcono()
                  }}
                >
                  <ScheduleRoundedIcon
                    sx={{ color: PALETA.principal, fontSize: 24 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duración promedio
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={PALETA.oscuro}
                  >
                    {promedioDuracion} min
                  </Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        {/* ========== BÚSQUEDA Y FILTROS ========== */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center"
            }}
          >
            <TextField
              size="small"
              placeholder="Buscar por nombre o descripción..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              sx={{
                minWidth: 260,
                "& .MuiOutlinedInput-root": { bgcolor: "#fff" }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: PALETA.borde(0.6) }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              size="small"
              select
              label="Categoría"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="todas">Todas las categorías</MenuItem>
              {categoriasDisponibles.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Paper>

        {/* ========== TABLA DE SERVICIOS ========== */}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2,
            overflow: "hidden"
          }}
        >
          <TableContainer>
            <Table size="medium" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.08) }}>
                  <TableCell sx={{ width: 60, fontWeight: 700, color: PALETA.oscuro }}>
                    Imagen
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Nombre
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Descripción
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Categoría
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: PALETA.oscuro }}
                    align="center"
                  >
                    Duración
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Precio
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Activo
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: PALETA.oscuro }}
                    align="right"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serviciosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 6, textAlign: "center" }}>
                      <StorefrontRoundedIcon
                        sx={{
                          fontSize: 48,
                          color: PALETA.borde(0.5),
                          mb: 1
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No hay servicios registrados. Haz clic en
                        {" \"Agregar servicio\""} para comenzar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  serviciosFiltrados.map((servicio) => (
                    <TableRow
                      key={servicio.id}
                      sx={{
                        "&:hover": { bgcolor: PALETA.fondoIcono(0.04) },
                        opacity: servicio.estaActivo === 0 ? 0.7 : 1
                      }}
                    >
                      <TableCell>
                        {resolveServicioImagenUrl(servicio.imagenUrl, api.defaults.baseURL) ? (
                          <Box
                            component="img"
                            src={resolveServicioImagenUrl(servicio.imagenUrl, api.defaults.baseURL)}
                            alt={servicio.nombre}
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              objectFit: "cover",
                              bgcolor: PALETA.fondoIcono(0.05),
                              display: "block"
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1,
                              bgcolor: PALETA.fondoIcono(0.05),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <ImageOutlinedIcon sx={{ color: PALETA.borde(0.5) }} />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {servicio.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {servicio.descripcion || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{servicio.categoria || "—"}</TableCell>
                      <TableCell align="center">
                        {servicio.duracionMinutos
                          ? `${servicio.duracionMinutos} min`
                          : "—"}
                      </TableCell>
                      <TableCell>{formatearPrecio(servicio.precio)}</TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={servicio.estaActivo === 1}
                          onChange={() => handleToggleActivo(servicio)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: PALETA.acento
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: PALETA.acento
                              }
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          sx={{ color: PALETA.principal }}
                          onClick={() => handleOpenModal(servicio)}
                          title="Editar"
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
    </AdminPageShell>

      {/* ========== MODAL AGREGAR / EDITAR ========== */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: "'Playfair Display', serif",
            color: PALETA.oscuro
          }}
        >
          {servicioEditando ? "Editar servicio" : "Agregar servicio"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" }
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Imagen
                </Typography>
                <input
                  ref={inputImagenRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagenChange}
                  style={{ display: "none" }}
                />
                <Box
                  onClick={() => inputImagenRef.current?.click()}
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: 2,
                    border: `2px dashed ${PALETA.borde(0.4)}`,
                    bgcolor: PALETA.fondoIcono(0.05),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: PALETA.acento,
                      bgcolor: PALETA.fondoIcono(0.08)
                    }
                  }}
                >
                  {imagenPreview ? (
                    <Box
                      component="img"
                      src={imagenPreview}
                      alt="Preview"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <ImageOutlinedIcon sx={{ color: PALETA.borde(0.6) }} />
                  )}
                </Box>
              </Box>
              <Box
                sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Nombre"
                  value={form.nombre}
                  onChange={handleFormChange("nombre")}
                  required
                  fullWidth
                  size="small"
                  placeholder="Ej: Corte clásico"
                />
                <TextField
                  label="Descripción"
                  value={form.descripcion}
                  onChange={handleFormChange("descripcion")}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Describe brevemente el servicio"
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Precio"
                    value={form.precio}
                    onChange={handleNumChange("precio")}
                    size="small"
                    type="text"
                    inputProps={{ inputMode: "decimal" }}
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyRoundedIcon
                            sx={{ fontSize: 20, color: PALETA.borde(0.6) }}
                          />
                        </InputAdornment>
                      )
                    }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Duración (min)"
                    value={form.duracionMinutos}
                    onChange={handleNumChange("duracionMinutos")}
                    size="small"
                    type="text"
                    inputProps={{ inputMode: "numeric" }}
                    placeholder="Ej: 30"
                    sx={{ width: 140 }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Categoría"
                value={form.categoria}
                onChange={handleFormChange("categoria")}
                select
                size="small"
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">Sin categoría</MenuItem>
                <MenuItem value="Corte">Corte</MenuItem>
                <MenuItem value="Barba">Barba</MenuItem>
                <MenuItem value="Paquete">Paquete</MenuItem>
                <MenuItem value="Coloración">Coloración</MenuItem>
                <MenuItem value="Tratamiento">Tratamiento</MenuItem>
              </TextField>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.estaActivo}
                  onChange={handleFormChange("estaActivo")}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: PALETA.acento
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: PALETA.acento
                    }
                  }}
                />
              }
              label="Servicio activo"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={!form.nombre?.trim() || savingServicio}
            sx={{
              bgcolor: PALETA.principal,
              "&:hover": { bgcolor: PALETA.oscuro }
            }}
          >
            {servicioEditando ? "Guardar cambios" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Servicios;
