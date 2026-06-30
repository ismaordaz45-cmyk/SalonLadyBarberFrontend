// ============================================
// COMPONENTE: Barberos.jsx (Gestión del Salón - PROPIETARIA)
// Monitorea y administra barberos/empleadas
// Tabla: empleada (id, usuarioId, especialidad, horarios)
// SOLO FRONTEND (datos mock; luego se conectará al backend)
// ============================================

import React, { useMemo, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

// ============================================
// DATOS MOCK
// (usuarioId aquí solo como referencia; el nombre real se obtendrá con JOIN a usuario en backend)
// horarios: JSON string (como está en BD) o null
// ============================================
const EMPLEADAS_MOCK = [
  {
    id: 1,
    usuarioId: 10,
    nombre: "Ana Martínez",
    especialidad: "Cortes clásicos",
    horarios: JSON.stringify({
      lun: [{ inicio: "10:00", fin: "18:00" }],
      mar: [{ inicio: "10:00", fin: "18:00" }],
      mie: [{ inicio: "10:00", fin: "18:00" }],
      jue: [{ inicio: "10:00", fin: "18:00" }],
      vie: [{ inicio: "10:00", fin: "18:00" }],
      sab: [{ inicio: "10:00", fin: "14:00" }]
    })
  },
  {
    id: 2,
    usuarioId: 11,
    nombre: "Laura Rodríguez",
    especialidad: "Barba y afeitado",
    horarios: JSON.stringify({
      lun: [{ inicio: "12:00", fin: "20:00" }],
      mar: [{ inicio: "12:00", fin: "20:00" }],
      jue: [{ inicio: "12:00", fin: "20:00" }],
      vie: [{ inicio: "12:00", fin: "20:00" }]
    })
  },
  {
    id: 3,
    usuarioId: 12,
    nombre: "Diana Palacios",
    especialidad: "Coloración",
    horarios: null
  }
];

const DIAS = [
  { key: "lun", label: "Lun" },
  { key: "mar", label: "Mar" },
  { key: "mie", label: "Mié" },
  { key: "jue", label: "Jue" },
  { key: "vie", label: "Vie" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" }
];

const parseHorarios = (horariosStr) => {
  if (!horariosStr) return null;
  try {
    return typeof horariosStr === "string" ? JSON.parse(horariosStr) : horariosStr;
  } catch {
    return null;
  }
};

const resumenHorarios = (horariosStr) => {
  const h = parseHorarios(horariosStr);
  if (!h) return "Sin horario";
  const diasConHorario = DIAS.filter((d) => Array.isArray(h[d.key]) && h[d.key].length > 0).length;
  if (diasConHorario === 0) return "Sin horario";
  return `${diasConHorario} día(s) con horario`;
};

function Barberos() {
  const [empleadas, setEmpleadas] = useState(EMPLEADAS_MOCK);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("todas");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    usuarioId: "",
    especialidad: "",
    horarios: "" // JSON string editable
  });

  const especialidadesDisponibles = useMemo(
    () =>
      Array.from(
        new Set(empleadas.map((e) => e.especialidad).filter(Boolean))
      ),
    [empleadas]
  );

  const empleadasFiltradas = useMemo(() => {
    return empleadas.filter((e) => {
      const texto = filtroTexto.trim().toLowerCase();
      const coincideTexto =
        !texto ||
        e.nombre?.toLowerCase().includes(texto) ||
        e.especialidad?.toLowerCase().includes(texto) ||
        String(e.usuarioId ?? "").includes(texto);
      const coincideEspecialidad =
        filtroEspecialidad === "todas" || e.especialidad === filtroEspecialidad;
      return coincideTexto && coincideEspecialidad;
    });
  }, [empleadas, filtroTexto, filtroEspecialidad]);

  const total = empleadas.length;
  const conHorario = empleadas.filter((e) => Boolean(parseHorarios(e.horarios))).length;
  const especialidades = especialidadesDisponibles.length;

  const handleOpenModal = (empleada = null) => {
    setEditando(empleada);
    if (empleada) {
      setForm({
        nombre: empleada.nombre || "",
        usuarioId: empleada.usuarioId != null ? String(empleada.usuarioId) : "",
        especialidad: empleada.especialidad || "",
        horarios: empleada.horarios || ""
      });
    } else {
      setForm({
        nombre: "",
        usuarioId: "",
        especialidad: "",
        horarios: ""
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  const handleFormChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const handleGuardar = () => {
    if (!form.nombre.trim()) return;
    const payload = {
      nombre: form.nombre.trim(),
      usuarioId: form.usuarioId !== "" ? Number(form.usuarioId) : null,
      especialidad: form.especialidad.trim() || null,
      horarios: form.horarios.trim() || null
    };

    // Validación ligera de JSON si hay horarios
    if (payload.horarios) {
      const parsed = parseHorarios(payload.horarios);
      if (!parsed) return;
    }

    if (editando) {
      setEmpleadas((prev) =>
        prev.map((e) => (e.id === editando.id ? { ...e, ...payload } : e))
      );
    } else {
      const nuevoId = total > 0 ? Math.max(...empleadas.map((e) => e.id)) + 1 : 1;
      setEmpleadas((prev) => [{ id: nuevoId, ...payload }, ...prev]);
    }
    handleCloseModal();
  };

  const chipHorario = (horariosStr) => {
    const tiene = Boolean(parseHorarios(horariosStr));
    return (
      <Chip
        size="small"
        icon={<ScheduleRoundedIcon />}
        label={resumenHorarios(horariosStr)}
        sx={{
          bgcolor: tiene ? alpha("#22C55E", 0.15) : alpha("#F59E0B", 0.15),
          color: tiene ? "#15803D" : "#B45309",
          fontWeight: 600,
          fontSize: "0.75rem"
        }}
      />
    );
  };

  return (
    <Box sx={{ bgcolor: "#FFFFFF", py: 5, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        {/* ========== TÍTULO PÁGINA ========== */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 4
          }}
        >
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
              <ContentCutRoundedIcon sx={{ color: PALETA.principal, fontSize: 30 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.oscuro }}
              >
                Equipo de barberos
              </Typography>
              <Typography variant="body2" sx={{ color: PALETA.borde(0.8), mt: 0.5 }}>
                Monitorea especialidades y horarios del personal.
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
            Agregar barbero
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
                  <GroupRoundedIcon sx={{ color: PALETA.acento, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total barberos
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {total}
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
                    bgcolor: PALETA.fondoIcono()
                  }}
                >
                  <ScheduleRoundedIcon sx={{ color: PALETA.principal, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Con horario
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {conHorario}
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
                    bgcolor: alpha("#3B82F6", 0.12)
                  }}
                >
                  <BadgeRoundedIcon sx={{ color: "#1D4ED8", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Especialidades
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {especialidades}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre, especialidad o usuarioId..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              sx={{ minWidth: 280, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
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
              label="Especialidad"
              value={filtroEspecialidad}
              onChange={(e) => setFiltroEspecialidad(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="todas">Todas</MenuItem>
              {especialidadesDisponibles.map((esp) => (
                <MenuItem key={esp} value={esp}>
                  {esp}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Paper>

        {/* ========== TABLA ========== */}
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
                    Barbero
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    usuarioId
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Especialidad
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
                    Horario
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empleadasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 6, textAlign: "center" }}>
                      <ContentCutRoundedIcon sx={{ fontSize: 48, color: PALETA.borde(0.5), mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No hay barberos registrados. Haz clic en &quot;Agregar barbero&quot; para comenzar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  empleadasFiltradas.map((e) => (
                    <TableRow
                      key={e.id}
                      sx={{ "&:hover": { bgcolor: PALETA.fondoIcono(0.04) } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {e.nombre || `Empleada #${e.id}`}
                        </Typography>
                      </TableCell>
                      <TableCell>{e.usuarioId ?? "—"}</TableCell>
                      <TableCell>{e.especialidad || "—"}</TableCell>
                      <TableCell>{chipHorario(e.horarios)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          sx={{ color: PALETA.principal }}
                          onClick={() => handleOpenModal(e)}
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

        <Typography variant="caption" sx={{ display: "block", mt: 2, color: PALETA.borde(0.7) }}>
          Datos de demostración. La integración con el backend se implementará después.
        </Typography>
      </Container>

      {/* ========== MODAL AGREGAR / EDITAR ========== */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.oscuro }}>
          {editando ? "Editar barbero" : "Agregar barbero"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <TextField
              label="Nombre (solo UI por ahora)"
              value={form.nombre}
              onChange={handleFormChange("nombre")}
              required
              fullWidth
              size="small"
              placeholder="Ej: Ana Martínez"
            />
            <TextField
              label="usuarioId"
              value={form.usuarioId}
              onChange={handleFormChange("usuarioId")}
              fullWidth
              size="small"
              placeholder="Ej: 10"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeRoundedIcon sx={{ fontSize: 20, color: PALETA.borde(0.6) }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              label="Especialidad"
              value={form.especialidad}
              onChange={handleFormChange("especialidad")}
              fullWidth
              size="small"
              placeholder="Ej: Barba y afeitado"
            />
            <TextField
              label="Horarios (JSON)"
              value={form.horarios}
              onChange={handleFormChange("horarios")}
              fullWidth
              size="small"
              multiline
              minRows={4}
              placeholder={`Ej:\n{\n  "lun": [{"inicio":"10:00","fin":"18:00"}],\n  "mar": [{"inicio":"10:00","fin":"18:00"}]\n}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleRoundedIcon sx={{ fontSize: 20, color: PALETA.borde(0.6) }} />
                  </InputAdornment>
                )
              }}
            />
            <Typography variant="caption" sx={{ color: PALETA.borde(0.8) }}>
              Por ahora el horario se captura como JSON. En el backend lo convertiremos a un editor visual por día/hora.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={!form.nombre?.trim()}
            sx={{ bgcolor: PALETA.principal, "&:hover": { bgcolor: PALETA.oscuro } }}
          >
            {editando ? "Guardar cambios" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Barberos;
  
