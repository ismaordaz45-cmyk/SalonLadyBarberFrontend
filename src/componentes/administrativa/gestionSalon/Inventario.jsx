// ============================================
// COMPONENTE: Inventario.jsx (Gestión del Salón - PROPIETARIA)
// Administra insumos, stock y productos del salón
// Tabla: insumo (id, nombre, descripcion, unidad, stockActual, stockMinimo, precioUnitario, estaActivo, imagen)
// ============================================

import React, { useEffect, useState, useRef } from "react";
import api from "../../../api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Box,
  Container,
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
  Chip,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  CircularProgress
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

const MySwal = withReactContent(Swal);

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

// Separa unidad compuesta, ej: "100 ml" → { cantidad: "100", tipo: "ml" }
const parseUnidad = (unidadCruda) => {
  if (!unidadCruda) {
    return { cantidad: "", tipo: "" };
  }
  const texto = String(unidadCruda).trim();
  const match = texto.match(/^(\d+(?:\.\d+)?)\s*(\w+)?$/);
  if (match) {
    return {
      cantidad: match[1] || "",
      tipo: match[2] || ""
    };
  }
  // Si no matchea, lo tratamos como solo tipo
  return { cantidad: "", tipo: texto };
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function Inventario() {
  const [insumos, setInsumos] = useState([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  const [savingInsumo, setSavingInsumo] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos"); // todos | activos | inactivos
  const [modalOpen, setModalOpen] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    unidad: "",
    cantidadUnidad: "",
    stockActual: 0,
    stockMinimo: 5,
    precioUnitario: "",
    estaActivo: 1,
    imagen: ""
  });
  const inputImagenRef = useRef(null);

  const fetchInsumos = async () => {
    setLoadingInsumos(true);
    try {
      const { data } = await api.get("/api/insumos", {
        params: { incluirInactivos: 1 }
      });
      setInsumos(Array.isArray(data) ? data : []);
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudieron cargar los insumos"
      });
      setInsumos([]);
    } finally {
      setLoadingInsumos(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const handleOpenModal = (insumo = null) => {
    setInsumoEditando(insumo);
    if (insumo) {
      const { cantidad, tipo } = parseUnidad(insumo.unidad);
      setForm({
        nombre: insumo.nombre || "",
        descripcion: insumo.descripcion || "",
        unidad: tipo || "",
        cantidadUnidad: cantidad || "",
        stockActual: String(insumo.stockActual ?? 0),
        stockMinimo: String(insumo.stockMinimo ?? 5),
        precioUnitario:
          insumo.precioUnitario != null ? String(insumo.precioUnitario) : "",
        estaActivo: insumo.estaActivo === 1,
        imagen: insumo.imagen || ""
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        unidad: "",
        cantidadUnidad: "",
        stockActual: "0",
        stockMinimo: "5",
        precioUnitario: "",
        estaActivo: true,
        imagen: ""
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setInsumoEditando(null);
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

  const handleGuardar = async () => {
    if (!form.nombre?.trim()) return;
    const unidadTipo = form.unidad?.trim() || "";
    const cantidadUnidadLimpia = form.cantidadUnidad?.trim();
    const unidadCompuesta =
      unidadTipo && cantidadUnidadLimpia
        ? `${cantidadUnidadLimpia} ${unidadTipo}`
        : unidadTipo || null;

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
      unidad: unidadCompuesta,
      stockActual: form.stockActual !== "" && form.stockActual !== undefined ? Number(form.stockActual) : 0,
      stockMinimo: form.stockMinimo !== "" && form.stockMinimo !== undefined ? Number(form.stockMinimo) : 5,
      precioUnitario: form.precioUnitario !== "" && form.precioUnitario != null ? Number(form.precioUnitario) : null,
      estaActivo: form.estaActivo ? 1 : 0,
      imagen: form.imagen || null
    };
    setSavingInsumo(true);
    try {
      if (insumoEditando) {
        const { data } = await api.put(`/api/insumos/${insumoEditando.id}`, payload);
        setInsumos((prev) =>
          prev.map((p) => (p.id === insumoEditando.id ? data : p))
        );
        handleCloseModal();
        MySwal.fire({
          icon: "success",
          title: "Producto actualizado",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: alpha(PALETA.acento, 0.15),
          color: PALETA.oscuro,
          iconColor: PALETA.principal
        });
      } else {
        const { data } = await api.post("/api/insumos", payload);
        setInsumos((prev) => [data, ...prev]);
        handleCloseModal();
        MySwal.fire({
          icon: "success",
          title: "Producto agregado",
          position: "center",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
          background: alpha(PALETA.acento, 0.15),
          color: PALETA.oscuro,
          iconColor: PALETA.principal
        });
      }
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo guardar el producto"
      });
    } finally {
      setSavingInsumo(false);
    }
  };

  const handleToggleActivo = async (insumo) => {
    const nuevoActivo = insumo.estaActivo === 1 ? 0 : 1;
    // Optimista para UX
    setInsumos((prev) =>
      prev.map((p) => (p.id === insumo.id ? { ...p, estaActivo: nuevoActivo } : p))
    );
    try {
      await api.patch(`/api/insumos/${insumo.id}/activo`, {
        estaActivo: nuevoActivo
      });
    } catch (err) {
      // Revertir
      setInsumos((prev) =>
        prev.map((p) => (p.id === insumo.id ? { ...p, estaActivo: insumo.estaActivo } : p))
      );
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo actualizar el estado"
      });
    }
  };

  const insumosFiltrados = insumos.filter((p) => {
    const coincideTexto =
      !filtroTexto ||
      p.nombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideActivo =
      filtroActivo === "todos" ||
      (filtroActivo === "activos" && p.estaActivo === 1) ||
      (filtroActivo === "inactivos" && p.estaActivo === 0);
    return coincideTexto && coincideActivo;
  });

  const totalProductos = insumos.length;
  const stockBajo = insumos.filter(
    (p) => p.estaActivo === 1 && p.stockActual < p.stockMinimo
  ).length;
  const productosActivos = insumos.filter((p) => p.estaActivo === 1).length;

  const renderChipStock = (insumo) => {
    const bajo = insumo.stockActual < insumo.stockMinimo && insumo.estaActivo === 1;
    return (
      <Chip
        size="small"
        icon={bajo ? <WarningAmberRoundedIcon /> : <CheckCircleRoundedIcon />}
        label={bajo ? "Stock bajo" : "OK"}
        sx={{
          bgcolor: bajo ? alpha("#F59E0B", 0.15) : alpha("#22C55E", 0.15),
          color: bajo ? "#B45309" : "#15803D",
          fontWeight: 600,
          fontSize: "0.75rem"
        }}
      />
    );
  };

  const imagenPreview = form.imagen
    ? `data:image/jpeg;base64,${form.imagen}`
    : null;

  if (loadingInsumos) {
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
    <Box sx={{ bgcolor: "#FFFFFF", py: 5, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        {/* ========== TÍTULO PÁGINA ========== */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              <Inventory2RoundedIcon sx={{ color: PALETA.principal, fontSize: 30 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.oscuro }}
              >
                Gestión de inventario
              </Typography>
              <Typography variant="body2" sx={{ color: PALETA.borde(0.8), mt: 0.5 }}>
                Administra insumos, stock y productos del salón.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              bgcolor: PALETA.principal,
              fontWeight: 600,
              "&:hover": { bgcolor: PALETA.oscuro }
            }}
          >
            Agregar producto
          </Button>
        </Box>

        {/* ========== RESUMEN RÁPIDO ========== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${PALETA.borde()}`,
                borderRadius: 2,
                bgcolor: alpha(PALETA.acento, 0.06)
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(PALETA.acento, 0.2)
                  }}
                >
                  <CategoryRoundedIcon sx={{ color: PALETA.acento, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total productos
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {totalProductos}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${PALETA.borde()}`,
                borderRadius: 2,
                bgcolor: stockBajo > 0 ? alpha("#F59E0B", 0.08) : undefined
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#F59E0B", 0.2)
                  }}
                >
                  <WarningAmberRoundedIcon sx={{ color: "#B45309", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Stock bajo
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {stockBajo}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${PALETA.borde()}`,
                borderRadius: 2
              }}
            >
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
                  <CheckCircleRoundedIcon sx={{ color: "#15803D", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Productos activos
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {productosActivos}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ========== BARRA DE BÚSQUEDA Y FILTROS ========== */}
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
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {["todos", "activos", "inactivos"].map((opt) => (
                <Button
                  key={opt}
                  size="small"
                  variant={filtroActivo === opt ? "contained" : "outlined"}
                  onClick={() => setFiltroActivo(opt)}
                  sx={{
                    textTransform: "capitalize",
                    ...(filtroActivo === opt && {
                      bgcolor: PALETA.principal,
                      "&:hover": { bgcolor: PALETA.oscuro }
                    })
                  }}
                >
                  {opt === "todos" ? "Todos" : opt === "activos" ? "Activos" : "Inactivos"}
                </Button>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* ========== TABLA DE INSUMOS ========== */}
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
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Imagen
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Nombre
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Descripción
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Unidad
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="center">
                    Stock
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="center">
                    Mínimo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Estado stock
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Precio
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Activo
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {insumosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ py: 6, textAlign: "center" }}>
                      <Inventory2RoundedIcon
                        sx={{ fontSize: 48, color: PALETA.borde(0.5), mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No hay productos. Haz clic en &quot;Agregar producto&quot; para empezar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  insumosFiltrados.map((insumo) => (
                    <TableRow
                      key={insumo.id}
                      sx={{
                        "&:hover": { bgcolor: PALETA.fondoIcono(0.04) },
                        opacity: insumo.estaActivo === 0 ? 0.7 : 1
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            overflow: "hidden",
                            bgcolor: PALETA.fondoIcono(0.3),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {insumo.imagen ? (
                            <Box
                              component="img"
                              src={`data:image/jpeg;base64,${insumo.imagen}`}
                              alt={insumo.nombre}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <ImageOutlinedIcon sx={{ color: PALETA.borde(0.5) }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {insumo.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 180 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {insumo.descripcion || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{insumo.unidad || "—"}</TableCell>
                      <TableCell align="center">{insumo.stockActual}</TableCell>
                      <TableCell align="center">{insumo.stockMinimo}</TableCell>
                      <TableCell>{renderChipStock(insumo)}</TableCell>
                      <TableCell>{formatearPrecio(insumo.precioUnitario)}</TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={insumo.estaActivo === 1}
                          onChange={() => handleToggleActivo(insumo)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: PALETA.acento
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              backgroundColor: PALETA.acento
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          sx={{ color: PALETA.principal }}
                          onClick={() => handleOpenModal(insumo)}
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
      </Container>

      {/* ========== MODAL AGREGAR / EDITAR ========== */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.oscuro }}>
          {insumoEditando ? "Editar producto" : "Agregar producto"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <Box sx={{ flexShrink: 0 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
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
                    width: 100,
                    height: 100,
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
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageOutlinedIcon sx={{ color: PALETA.borde(0.6) }} />
                  )}
                </Box>
              </Box>
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Nombre"
                  value={form.nombre}
                  onChange={handleFormChange("nombre")}
                  required
                  fullWidth
                  size="small"
                  placeholder="Ej: Gel fijador"
                />
                <TextField
                  label="Descripción"
                  value={form.descripcion}
                  onChange={handleFormChange("descripcion")}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Breve descripción del producto"
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                  label="Cantidad unidad"
                  value={form.cantidadUnidad}
                  onChange={handleNumChange("cantidadUnidad")}
                  size="small"
                  type="text"
                  inputProps={{ inputMode: "decimal" }}
                  placeholder="Ej: 100"
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Unidad"
                  value={form.unidad}
                  onChange={handleFormChange("unidad")}
                  select
                  size="small"
                  sx={{ width: 120 }}
                >
                  <MenuItem value="pza">pza</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="gr">gr</MenuItem>
                </TextField>
                  <TextField
                    label="Precio unitario"
                    value={form.precioUnitario}
                    onChange={handleNumChange("precioUnitario")}
                    size="small"
                    type="text"
                    inputProps={{ inputMode: "decimal" }}
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyRoundedIcon sx={{ fontSize: 20, color: PALETA.borde(0.6) }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Stock actual"
                value={form.stockActual}
                onChange={handleNumChange("stockActual")}
                size="small"
                type="text"
                inputProps={{ inputMode: "numeric" }}
                fullWidth
              />
              <TextField
                label="Stock mínimo"
                value={form.stockMinimo}
                onChange={handleNumChange("stockMinimo")}
                size="small"
                type="text"
                inputProps={{ inputMode: "numeric" }}
                fullWidth
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={form.estaActivo}
                  onChange={handleFormChange("estaActivo")}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: PALETA.acento },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: PALETA.acento
                    }
                  }}
                />
              }
              label="Producto activo"
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
            disabled={!form.nombre?.trim() || savingInsumo}
            sx={{
              bgcolor: PALETA.principal,
              "&:hover": { bgcolor: PALETA.oscuro }
            }}
          >
            {insumoEditando ? "Guardar cambios" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Inventario;
