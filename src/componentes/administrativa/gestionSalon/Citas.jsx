// ============================================
// COMPONENTE: Citas.jsx (Gestión del Salón - PROPIETARIA)
// Próximas (calendario + activas) e historial (pasadas o cerradas). Día efectivo: horaInicio, luego fecha (local).
// Tabla: cita (id, clienteId, empleadaId, fecha, horaInicio, horaFin, estado, notas, precioFinal, creadoEn, actualizadoEn)
// Estados: APARTADA | CONFIRMADA | EN_PROCESO | COMPLETADA | CANCELADA | NO_ASISTIO
// ============================================

import React, { useState, useEffect, useMemo } from "react";
import api from "../../../api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CardContent,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Stack
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";

import AdminPageShell from "../../../ui/admin/AdminPageShell";
import AdminHeader from "../../../ui/admin/AdminHeader";
import { GlassCard } from "../../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../../ui/admin/adminTokens";

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

const ESTADOS_TERMINALES = ["COMPLETADA", "CANCELADA", "NO_ASISTIO"];

/**
 * Día calendario (YYYY-MM-DD) en hora local del navegador.
 * Evita usar solo los primeros 10 caracteres de ISO (día UTC) frente a startOfTodayKey().
 */
function dayKeyLocalFromValue(fechaVal) {
  if (!fechaVal) return null;
  const d = new Date(fechaVal);
  if (!Number.isFinite(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Día efectivo de agenda: prioriza horaInicio (coincide con DATE(horaInicio) del backend). */
function dayKeyAgenda(c) {
  if (!c) return null;
  return dayKeyLocalFromValue(c.horaInicio) || dayKeyLocalFromValue(c.fecha);
}

function startOfTodayKey() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Historial: citas cerradas o cuya fecha/hora de fin ya pasó respecto a hoy. */
function esCitaHistorial(c) {
  if (ESTADOS_TERMINALES.includes(c.estado)) return true;
  const dk = dayKeyAgenda(c);
  const today = startOfTodayKey();
  if (dk && dk < today) return true;
  if (dk === today && c.horaFin) {
    const fin = new Date(c.horaFin).getTime();
    if (Number.isFinite(fin) && fin < Date.now()) return true;
  }
  return false;
}

function esCitaProxima(c) {
  return !esCitaHistorial(c);
}

function ordenarProximas(a, b) {
  const ka = dayKeyAgenda(a) || "";
  const kb = dayKeyAgenda(b) || "";
  if (ka !== kb) return ka.localeCompare(kb);
  const ta = a.horaInicio ? new Date(a.horaInicio).getTime() : 0;
  const tb = b.horaInicio ? new Date(b.horaInicio).getTime() : 0;
  return ta - tb;
}

function ordenarHistorial(a, b) {
  const ka = dayKeyAgenda(a) || "";
  const kb = dayKeyAgenda(b) || "";
  if (ka !== kb) return kb.localeCompare(ka);
  const ta = a.horaInicio ? new Date(a.horaInicio).getTime() : 0;
  const tb = b.horaInicio ? new Date(b.horaInicio).getTime() : 0;
  return tb - ta;
}

const COLOR_ESTADO = {
  APARTADA: { bg: alpha("#D4AF37", 0.15), color: "#B8860B" },
  CONFIRMADA: { bg: alpha("#22C55E", 0.15), color: "#15803D" },
  EN_PROCESO: { bg: alpha("#3B82F6", 0.15), color: "#1D4ED8" },
  COMPLETADA: { bg: alpha("#22C55E", 0.15), color: "#15803D" },
  CANCELADA: { bg: alpha("#F97373", 0.15), color: "#B91C1C" },
  NO_ASISTIO: { bg: alpha("#F59E0B", 0.15), color: "#B45309" }
};

const LABEL_ESTADO = {
  APARTADA: "Apartada",
  CONFIRMADA: "Confirmada",
  EN_PROCESO: "En proceso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  NO_ASISTIO: "No asistió"
};

// Formatear fecha para mostrar
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
};

const formatearHora = (fechaStr) => {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr);
  return d.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

const formatearPrecio = (valor) => {
  if (valor == null || valor === "") return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(valor));
};

/** Prioriza suma de duraciones de líneas; si no hay, usa horaFin − horaInicio. */
function minutosDuracionDesdeDetalle(d) {
  if (!d) return null;
  const lista = d.servicios;
  if (Array.isArray(lista) && lista.length > 0) {
    const sum = lista.reduce((acc, s) => acc + (Number(s.duracionMinutos) || 0), 0);
    if (sum > 0) return sum;
  }
  const hi = d.horaInicio ? new Date(d.horaInicio).getTime() : NaN;
  const hf = d.horaFin ? new Date(d.horaFin).getTime() : NaN;
  if (Number.isFinite(hi) && Number.isFinite(hf) && hf > hi) {
    return Math.round((hf - hi) / 60000);
  }
  return null;
}

function formatearDuracionAprox(min) {
  if (min == null || min <= 0) return "—";
  if (min < 60) return `${min} min (aprox.)`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min (aprox.)` : `${h} h (aprox.)`;
}

const MySwal = withReactContent(Swal);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function Citas() {
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [tabActiva, setTabActiva] = useState(0);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [detalleCargando, setDetalleCargando] = useState(false);

  const fetchCitas = async () => {
    setLoadingCitas(true);
    try {
      const { data } = await api.get("/api/citas");
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudieron cargar las citas",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha(PALETA.acento, 0.15),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
      setCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const citasProximas = useMemo(
    () => [...citas].filter(esCitaProxima).sort(ordenarProximas),
    [citas]
  );
  const citasHistorial = useMemo(
    () => [...citas].filter(esCitaHistorial).sort(ordenarHistorial),
    [citas]
  );

  const hoyKey = startOfTodayKey();
  const proximasHoy = useMemo(
    () => citasProximas.filter((c) => dayKeyAgenda(c) === hoyKey),
    [citasProximas, hoyKey]
  );

  const filtrarCitas = (lista) => {
    return lista.filter((c) => {
      const coincideTexto =
        !filtroTexto ||
        c.clienteNombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        c.empleadaNombre?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        (c.notas && c.notas.toLowerCase().includes(filtroTexto.toLowerCase()));
      const coincideFecha =
        !filtroFecha ||
        dayKeyAgenda(c) === filtroFecha;
      return coincideTexto && coincideFecha;
    });
  };

  const proximasFiltradas = filtrarCitas(citasProximas);
  const historialFiltrado = filtrarCitas(citasHistorial);

  const handleCambiarTab = (event, nuevoValor) => {
    setTabActiva(nuevoValor);
  };

  const cerrarDetalle = () => {
    setDetalleOpen(false);
    setDetalle(null);
    setDetalleCargando(false);
  };

  const abrirDetalle = async (cita) => {
    if (!cita?.id) return;
    setDetalleOpen(true);
    setDetalle(null);
    setDetalleCargando(true);
    try {
      const { data } = await api.get(`/api/citas/${cita.id}`);
      setDetalle(data);
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo cargar el detalle de la cita",
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true,
        background: alpha(PALETA.acento, 0.15),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
      cerrarDetalle();
    } finally {
      setDetalleCargando(false);
    }
  };

  const renderChipEstado = (estado) => {
    const config = COLOR_ESTADO[estado] || { bg: "#eee", color: "#333" };
    return (
      <Chip
        size="small"
        label={LABEL_ESTADO[estado] || estado}
        sx={{
          bgcolor: config.bg,
          color: config.color,
          fontWeight: 600,
          fontSize: "0.75rem"
        }}
      />
    );
  };

  const renderTablaPendientes = () => (
    <TableContainer>
      <Table size="medium" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.08) }}>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Cliente
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Empleada
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Fecha / Hora
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Estado
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Precio
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {proximasFiltradas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                <EventAvailableRoundedIcon
                  sx={{ fontSize: 48, color: PALETA.borde(0.5), mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No hay citas próximas
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            proximasFiltradas.map((cita) => (
              <TableRow
                key={cita.id}
                sx={{
                  "&:hover": { bgcolor: PALETA.fondoIcono(0.04) }
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonOutlineRoundedIcon
                      sx={{ fontSize: 20, color: PALETA.borde(0.6) }}
                    />
                    {cita.clienteNombre || `Cliente #${cita.clienteId}`}
                  </Box>
                </TableCell>
                <TableCell>{cita.empleadaNombre || `Empleada #${cita.empleadaId}`}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatearFecha(cita.fecha)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearHora(cita.horaInicio)} – {formatearHora(cita.horaFin)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{renderChipEstado(cita.estado)}</TableCell>
                <TableCell>{formatearPrecio(cita.precioFinal)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    sx={{ color: PALETA.principal }}
                    title="Ver detalle"
                    onClick={() => abrirDetalle(cita)}
                  >
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderTablaHistorial = () => (
    <TableContainer>
      <Table size="medium" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.08) }}>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Cliente
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Empleada
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Fecha / Hora
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Estado
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Precio
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }}>
              Notas
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: PALETA.oscuro }} align="right">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {historialFiltrado.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} sx={{ py: 6, textAlign: "center" }}>
                <HistoryRoundedIcon
                  sx={{ fontSize: 48, color: PALETA.borde(0.5), mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No hay citas en el historial
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            historialFiltrado.map((cita) => (
              <TableRow
                key={cita.id}
                sx={{
                  "&:hover": { bgcolor: PALETA.fondoIcono(0.04) },
                  opacity: cita.estado === "CANCELADA" || cita.estado === "NO_ASISTIO" ? 0.85 : 1
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonOutlineRoundedIcon
                      sx={{ fontSize: 20, color: PALETA.borde(0.6) }}
                    />
                    {cita.clienteNombre || `Cliente #${cita.clienteId}`}
                  </Box>
                </TableCell>
                <TableCell>{cita.empleadaNombre || `Empleada #${cita.empleadaId}`}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatearFecha(cita.fecha)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearHora(cita.horaInicio)} – {formatearHora(cita.horaFin)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{renderChipEstado(cita.estado)}</TableCell>
                <TableCell>{formatearPrecio(cita.precioFinal)}</TableCell>
                <TableCell sx={{ maxWidth: 160 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {cita.notas || "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    sx={{ color: PALETA.principal }}
                    title="Ver detalle"
                    onClick={() => abrirDetalle(cita)}
                  >
                    <VisibilityRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDialogDetalle = () => {
    const minDur = detalle ? minutosDuracionDesdeDetalle(detalle) : null;
    return (
      <Dialog
        open={detalleOpen}
        onClose={cerrarDetalle}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { borderRadius: 2, border: `1px solid ${PALETA.borde()}` }
        }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            fontWeight: 700,
            color: PALETA.oscuro,
            borderBottom: `1px solid ${PALETA.borde(0.08)}`
          }}
        >
          Detalle de la cita
          <IconButton
            aria-label="Cerrar vista"
            onClick={cerrarDetalle}
            sx={{ position: "absolute", right: 8, top: 8, color: PALETA.principal }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {detalleCargando && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={40} sx={{ color: PALETA.acento }} />
            </Box>
          )}
          {!detalleCargando && detalle && (
            <Stack spacing={2.25}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Cliente
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {detalle.clienteNombre || `Cliente #${detalle.clienteId}`}
                </Typography>
                <Box sx={{ mt: 1 }}>{renderChipEstado(detalle.estado)}</Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Descripción / notas
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, whiteSpace: "pre-wrap", color: PALETA.oscuro }}
                >
                  {detalle.notas?.trim() ? detalle.notas : "Sin descripción registrada."}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Servicios adquiridos
                </Typography>
                {Array.isArray(detalle.servicios) && detalle.servicios.length > 0 ? (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {detalle.servicios.map((s) => (
                      <Box
                        key={s.id}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: PALETA.fondoIcono(0.06),
                          border: `1px solid ${PALETA.borde(0.08)}`
                        }}
                      >
                        <ContentCutRoundedIcon sx={{ color: PALETA.acento, mt: 0.15 }} fontSize="small" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700}>
                            {s.nombre || `Servicio #${s.id}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Number(s.duracionMinutos) > 0
                              ? `${s.duracionMinutos} min`
                              : "Duración no indicada"}{" "}
                            · {formatearPrecio(s.precio)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    No hay servicios vinculados a esta cita en el sistema (p. ej. cita antigua sin
                    líneas en catálogo).
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Estilista
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {detalle.empleadaNombre || `Empleada #${detalle.empleadaId}`}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Fecha y horario
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {formatearFecha(detalle.fecha)} · {formatearHora(detalle.horaInicio)} –{" "}
                  {formatearHora(detalle.horaFin)}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(PALETA.acento, 0.08),
                  border: `1px solid ${alpha(PALETA.acento, 0.25)}`
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Tiempo aproximado de la cita
                </Typography>
                <Typography variant="body1" fontWeight={800} sx={{ mt: 0.5, color: PALETA.oscuro }}>
                  {formatearDuracionAprox(minDur)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Se calcula sumando la duración de cada servicio; si no hay líneas, se usa la
                  diferencia entre hora de inicio y fin.
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${PALETA.borde(0.08)}` }}>
          <Button variant="contained" onClick={cerrarDetalle} sx={{ fontWeight: 700 }}>
            Cerrar vista
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loadingCitas) {
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
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Gestión del salón"
        title="Gestión de citas"
        subtitle="Próximas e historial (completada, cancelada, no asistió)."
        icon={<EventAvailableRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
      />

        {/* ========== RESUMEN RÁPIDO ========== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <GlassCard elevation={0} sx={{ borderRadius: 2, bgcolor: alpha("#D4AF37", 0.06) }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#D4AF37", 0.2)
                  }}
                >
                  <CalendarMonthRoundedIcon sx={{ color: PALETA.acento, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Próximas hoy
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {proximasHoy.length}
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
                  <ScheduleRoundedIcon sx={{ color: PALETA.principal, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    En agenda (activas)
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {citasProximas.length}
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
                  <PaidRoundedIcon sx={{ color: "#15803D", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total historial
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={PALETA.oscuro}>
                    {citasHistorial.length}
                  </Typography>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        {/* ========== PESTAÑAS Y FILTROS ========== */}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2,
            overflow: "hidden"
          }}
        >
          <Tabs
            value={tabActiva}
            onChange={handleCambiarTab}
            sx={{
              borderBottom: `1px solid ${PALETA.borde()}`,
              bgcolor: PALETA.fondoIcono(0.04),
              "& .MuiTab-root": { fontWeight: 600, textTransform: "none" },
              "& .Mui-selected": { color: PALETA.acento }
            }}
          >
            <Tab
              icon={<EventAvailableRoundedIcon />}
              iconPosition="start"
              label={`Próximas (${citasProximas.length})`}
            />
            <Tab
              icon={<HistoryRoundedIcon />}
              iconPosition="start"
              label={`Historial (${citasHistorial.length})`}
            />
          </Tabs>

          <Box sx={{ p: 2, borderBottom: `1px solid ${PALETA.borde(0.06)}` }}>
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
                placeholder="Buscar por cliente, empleada o notas..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                sx={{
                  minWidth: 260,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff"
                  }
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
                type="date"
                label="Filtrar por fecha"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: 180,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff"
                  }
                }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 0 }}>
            {tabActiva === 0 ? renderTablaPendientes() : renderTablaHistorial()}
          </Box>
        </Paper>

        {renderDialogDetalle()}
    </AdminPageShell>
  );
}

export default Citas;
