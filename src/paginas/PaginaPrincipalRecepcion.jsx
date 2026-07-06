import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  CardContent,
  Typography,
  Button,
  Box,
  Skeleton,
  Chip,
  Alert,
  Stack
} from "@mui/material";
import {
  CalendarMonthRounded,
  AccessTimeRounded,
  CheckCircleRounded,
  ChevronRightRounded,
  EventAvailableRounded
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import AdminPageShell from "../ui/admin/AdminPageShell";
import AdminHeader from "../ui/admin/AdminHeader";
import { GlassCard, IconWrapper } from "../ui/admin/components";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import ConectarAlexa from "../componentes/autenticacion/ConectarAlexa";
import api from "../api";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const PaginaPrincipalRecepcion = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = useMemo(() => readStoredUser(), []);
  const nombreMostrar =
    storedUser?.nombre ||
    storedUser?.correo ||
    "Recepción";

  useEffect(() => {
    let cancel = false;
    const cargarCitas = async () => {
      try {
        setLoading(true);
        setError("");
        const hoy = new Date().toISOString().slice(0, 10);
        // Obtener citas programadas para la fecha actual
        const { data } = await api.get(`/api/citas?fecha=${hoy}`);
        if (!cancel) setCitas(data || []);
      } catch (e) {
        if (!cancel) {
          setError(
            e?.response?.data?.error ||
              e?.message ||
              "No se pudieron cargar las citas del día."
          );
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    cargarCitas();
    return () => {
      cancel = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = citas.length;
    const confirmadas = citas.filter(
      (c) => c.estado === "CONFIRMADA" || c.estado === "APARTADA" || c.estado === "EN_PROCESO"
    ).length;
    const completadas = citas.filter((c) => c.estado === "COMPLETADA").length;

    // Obtener la hora actual en formato HH:MM
    const ahoraStr = new Date().toTimeString().slice(0, 5);
    
    // Filtrar citas pendientes futuras del día de hoy
    const proximas = citas
      .filter(
        (c) =>
          c.estado !== "CANCELADA" &&
          c.estado !== "COMPLETADA" &&
          c.estado !== "NO_ASISTIO"
      )
      .map((c) => {
        const time = c.horaInicio ? String(c.horaInicio).slice(11, 16) : "";
        return { ...c, timeStr: time };
      })
      .filter((c) => c.timeStr >= ahoraStr)
      .sort((a, b) => a.timeStr.localeCompare(b.timeStr));

    const proxima = proximas[0] || null;

    return { total, confirmadas, completadas, proxima };
  }, [citas]);

  const getEstadoChip = (estado) => {
    let label = estado;
    let bg = P.secondary;

    switch (estado) {
      case "APARTADA":
        label = "Apartada";
        bg = P.blue;
        break;
      case "CONFIRMADA":
        label = "Confirmada";
        bg = P.navy;
        break;
      case "EN_PROCESO":
        label = "En Proceso";
        bg = P.accent;
        break;
      case "COMPLETADA":
        label = "Completada";
        bg = P.green;
        break;
      case "CANCELADA":
        label = "Cancelada";
        bg = P.red;
        break;
      case "NO_ASISTIO":
        label = "No Asistió";
        bg = "#475569";
        break;
      default:
        break;
    }

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: alpha(bg, 0.15),
          color: bg,
          fontWeight: 800,
          fontSize: "0.72rem",
          border: `1px solid ${alpha(bg, 0.25)}`,
          borderRadius: "6px"
        }}
      />
    );
  };

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Panel de Recepción"
        title={loading ? <Skeleton width={260} /> : `Hola, ${nombreMostrar}`}
        subtitle="Agenda de hoy, disponibilidad de personal y vinculación con Alexa."
        icon={<CalendarMonthRounded sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        right={
          <Button variant="contained" color="primary" onClick={() => navigate("/admin/citas")}>
            Ver agenda completa
          </Button>
        }
      />

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <GlassCard elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                    Citas hoy
                  </Typography>
                  <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "2rem", mt: 0.5 }}>
                    {loading ? <Skeleton width={48} /> : stats.total}
                  </Typography>
                </Box>
                <IconWrapper bgcolor={P.navy}>
                  <EventAvailableRounded sx={{ color: P.navy }} />
                </IconWrapper>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <GlassCard elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                    Estado de atención
                  </Typography>
                  <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.1rem", mt: 1 }}>
                    {loading ? (
                      <Skeleton width={120} />
                    ) : (
                      `${stats.completadas} completadas · ${stats.confirmadas} pendientes`
                    )}
                  </Typography>
                </Box>
                <IconWrapper bgcolor={P.green}>
                  <CheckCircleRounded sx={{ color: P.green }} />
                </IconWrapper>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <GlassCard elevation={0}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                  <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                    Próxima cita
                  </Typography>
                  <Typography
                    noWrap
                    sx={{ color: P.primary, fontWeight: 900, fontSize: "1.1rem", mt: 1 }}
                  >
                    {loading ? (
                      <Skeleton width={120} />
                    ) : stats.proxima ? (
                      `${String(stats.proxima.horaInicio).slice(11, 16)} - ${stats.proxima.clienteNombre}`
                    ) : (
                      "Sin citas próximas"
                    )}
                  </Typography>
                </Box>
                <IconWrapper bgcolor={P.accent}>
                  <AccessTimeRounded sx={{ color: P.accent }} />
                </IconWrapper>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Timeline Column */}
        <Grid item xs={12} md={8}>
          <GlassCard elevation={0} sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: P.primary, fontWeight: 800, mb: 2 }}>
                Agenda de Citas - Hoy
              </Typography>

              {loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                </Stack>
              ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              ) : citas.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <CalendarMonthRounded sx={{ fontSize: 48, color: P.secondary, opacity: 0.5, mb: 1.5 }} />
                  <Typography sx={{ color: P.secondary, fontWeight: 700 }}>
                    No hay citas registradas para hoy
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 2,
                      borderColor: P.navy,
                      color: P.navy,
                      fontWeight: 700,
                      "&:hover": { borderColor: P.navy, bgcolor: alpha(P.navy, 0.04) }
                    }}
                    onClick={() => navigate("/admin/citas")}
                  >
                    Agendar primera cita
                  </Button>
                </Box>
              ) : (
                <Stack spacing={2} sx={{ maxHeight: 550, overflowY: "auto", pr: 1 }}>
                  {citas.map((cita) => {
                    const horaInicio = cita.horaInicio ? String(cita.horaInicio).slice(11, 16) : "—";
                    const horaFin = cita.horaFin ? String(cita.horaFin).slice(11, 16) : "—";
                    return (
                      <Box
                        key={cita.id}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: `1px solid ${alpha(P.border, 0.6)}`,
                          bgcolor: alpha(P.pageBg, 0.3),
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: alpha(P.accent, 0.4),
                            bgcolor: alpha(P.cream, 0.2),
                            transform: "translateX(4px)"
                          }
                        }}
                      >
                        <Grid container spacing={1} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.05rem" }}>
                              {horaInicio} - {horaFin}
                            </Typography>
                            <Typography sx={{ color: P.secondary, fontSize: "0.75rem", mt: 0.25 }}>
                              Precio: ${cita.precioFinal}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: P.primary, fontWeight: 800 }}>
                              {cita.clienteNombre || "Cliente no especificado"}
                            </Typography>
                            <Typography sx={{ color: P.secondary, fontSize: "0.8rem", mt: 0.25 }}>
                              Atendido por: {cita.empleadaNombre || "Sin asignar"}
                            </Typography>
                            {cita.notas && (
                              <Typography
                                sx={{
                                  color: P.secondary,
                                  fontSize: "0.75rem",
                                  fontStyle: "italic",
                                  mt: 0.5
                                }}
                              >
                                Nota: {cita.notas}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={3} sx={{ textAlign: { sm: "right" } }}>
                            {getEstadoChip(cita.estado)}
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Control Panel Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Quick Actions Card */}
            <GlassCard elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: P.primary, fontWeight: 800, mb: 2 }}>
                  Acciones Administrativas
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/admin/citas")}
                    sx={{
                      bgcolor: P.navy,
                      color: "#FFFFFF",
                      fontWeight: 700,
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.25,
                      borderRadius: 2.5,
                      "&:hover": { bgcolor: "#122947" }
                    }}
                    endIcon={<ChevronRightRounded />}
                  >
                    Agendar Nueva Cita
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/admin/barberos")}
                    sx={{
                      borderColor: P.border,
                      color: P.primary,
                      fontWeight: 700,
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.25,
                      borderRadius: 2.5,
                      "&:hover": { borderColor: P.primary, bgcolor: alpha(P.primary, 0.04) }
                    }}
                    endIcon={<ChevronRightRounded />}
                  >
                    Administrar Personal
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/admin/inventario")}
                    sx={{
                      borderColor: P.border,
                      color: P.primary,
                      fontWeight: 700,
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.25,
                      borderRadius: 2.5,
                      "&:hover": { borderColor: P.primary, bgcolor: alpha(P.primary, 0.04) }
                    }}
                    endIcon={<ChevronRightRounded />}
                  >
                    Control de Inventario
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/admin/servicios")}
                    sx={{
                      borderColor: P.border,
                      color: P.primary,
                      fontWeight: 700,
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.25,
                      borderRadius: 2.5,
                      "&:hover": { borderColor: P.primary, bgcolor: alpha(P.primary, 0.04) }
                    }}
                    endIcon={<ChevronRightRounded />}
                  >
                    Ver Catálogo de Servicios
                  </Button>
                </Stack>
              </CardContent>
            </GlassCard>

            {/* Alexa Integration Card */}
            <ConectarAlexa />
          </Stack>
        </Grid>
      </Grid>
    </AdminPageShell>
  );
};

export default PaginaPrincipalRecepcion;
