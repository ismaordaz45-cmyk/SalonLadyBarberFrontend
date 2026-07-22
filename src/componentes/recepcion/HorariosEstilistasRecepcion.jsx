import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Skeleton,
  Chip,
  Alert,
  Stack,
  Avatar,
  Divider,
  CardContent
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccessTimeRounded,
  ContentCutRounded,
  CheckCircleOutlineRounded
} from "@mui/icons-material";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import api from "../../api";

export default function HorariosEstilistasRecepcion() {
  const [barberos, setBarberos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    let cancel = false;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // 1. Cargar barberos
        const resBarberos = await api.get("/api/barberos");
        
        // 2. Cargar citas para la fecha seleccionada
        const resCitas = await api.get(`/api/citas?fecha=${fechaSeleccionada}`);

        if (!cancel) {
          setBarberos(resBarberos.data || []);
          setCitas(resCitas.data || []);
        }
      } catch (e) {
        if (!cancel) {
          setError("Error al cargar la disponibilidad del personal.");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    loadData();
    return () => {
      cancel = true;
    };
  }, [fechaSeleccionada]);

  // Agrupar citas por barbero/empleadaId
  const citasPorEstilista = useMemo(() => {
    const map = {};
    citas.forEach((cita) => {
      if (!cita.empleadaId) return;
      if (!map[cita.empleadaId]) {
        map[cita.empleadaId] = [];
      }
      map[cita.empleadaId].push(cita);
    });

    // Ordenar cronológicamente las citas de cada barbero
    Object.keys(map).forEach((id) => {
      map[id].sort((a, b) => {
        const timeA = a.horaInicio ? String(a.horaInicio).slice(11, 16) : "00:00";
        const timeB = b.horaInicio ? String(b.horaInicio).slice(11, 16) : "00:00";
        return timeA.localeCompare(timeB);
      });
    });

    return map;
  }, [citas]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "COMPLETADA":
        return P.green;
      case "EN_PROCESO":
        return P.accent;
      case "APARTADA":
        return P.blue;
      case "CONFIRMADA":
        return P.navy;
      case "CANCELADA":
        return P.red;
      default:
        return P.secondary;
    }
  };

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease" }}>
      {/* Cabecera */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#1E3A5F",
              fontFamily: '"Cinzel", ui-serif, Georgia, serif',
              letterSpacing: "-0.01em"
            }}
          >
            Horario de Estilistas
          </Typography>
          <Typography sx={{ color: "#64748B", mt: 0.5, fontSize: "0.9rem", fontWeight: 650 }}>
            Visualiza las asignaciones y ocupación del personal del salón.
          </Typography>
        </Box>

        <TextField
          size="small"
          type="date"
          label="Consultar Fecha"
          InputLabelProps={{ shrink: true }}
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          sx={{ width: 180, bgcolor: "#FFFFFF", borderRadius: "10px" }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <GlassCard elevation={0} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Skeleton width="60%" />
                </Box>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      ) : barberos.length === 0 ? (
        <GlassCard elevation={0} sx={{ py: 8, textAlign: "center" }}>
          <ContentCutRounded sx={{ fontSize: 56, color: P.secondary, opacity: 0.4, mb: 1.5 }} />
          <Typography sx={{ color: P.secondary, fontWeight: 800 }}>
            No hay barberos o estilistas registrados en el salón.
          </Typography>
        </GlassCard>
      ) : (
        <Grid container spacing={3}>
          {barberos.map((barbero) => {
            const agenda = citasPorEstilista[barbero.id] || [];
            const activeAppointments = agenda.filter((c) => c.estado !== "CANCELADA" && c.estado !== "NO_ASISTIO");
            const totalHours = activeAppointments.length;

            return (
              <Grid item xs={12} sm={6} md={4} key={barbero.id}>
                <GlassCard
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: totalHours > 0 ? `4px solid ${P.accent}` : `1px solid ${P.border}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 30px rgba(30, 58, 90, 0.06)"
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* Encabezado del barbero */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: P.navy,
                          color: "#FFFFFF",
                          fontWeight: 800,
                          fontSize: "1.1rem"
                        }}
                      >
                        {(barbero.nombreCompleto || barbero.nombre || "E").charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 900, color: P.primary, fontSize: "1rem" }}>
                          {barbero.nombreCompleto || barbero.nombre}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: P.secondary, fontWeight: 700 }}>
                          Especialidad: {barbero.especialidad || "Estilista General"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Resumen de ocupación */}
                    <Box sx={{ mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "0.78rem", color: P.secondary, fontWeight: 700 }}>
                        Citas asignadas hoy:
                      </Typography>
                      <Chip
                        label={totalHours === 0 ? "Disponible" : `${totalHours} Citas`}
                        size="small"
                        sx={{
                          bgcolor: totalHours === 0 ? alpha(P.green, 0.12) : alpha(P.accent, 0.15),
                          color: totalHours === 0 ? P.green : P.navy,
                          fontWeight: 800,
                          fontSize: "0.72rem"
                        }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Lista de citas de su agenda */}
                    <Box sx={{ flex: 1 }}>
                      {agenda.length === 0 ? (
                        <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircleOutlineRounded sx={{ color: P.green, opacity: 0.6, fontSize: 32, mb: 1 }} />
                          <Typography sx={{ fontSize: "0.8rem", color: P.secondary, fontWeight: 700, textAlign: "center" }}>
                            Sin reservaciones
                          </Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: P.secondary, mt: 0.25, textAlign: "center" }}>
                            Disponible toda la jornada
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5}>
                          {agenda.map((cita) => {
                            const horaInicio = cita.horaInicio ? String(cita.horaInicio).slice(11, 16) : "—";
                            const horaFin = cita.horaFin ? String(cita.horaFin).slice(11, 16) : "—";
                            const color = getEstadoColor(cita.estado);

                            return (
                              <Box
                                key={cita.id}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2.5,
                                  bgcolor: alpha(P.pageBg, 0.35),
                                  border: `1.2px solid ${alpha(P.border, 0.7)}`,
                                  position: "relative",
                                  overflow: "hidden"
                                }}
                              >
                                {/* Barra lateral del estado */}
                                <Box
                                  sx={{
                                    width: 3.5,
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    bgcolor: color
                                  }}
                                />
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pl: 1 }}>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, color: P.primary, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                                      <AccessTimeRounded sx={{ fontSize: 13, color: P.secondary }} />
                                      {horaInicio} - {horaFin}
                                    </Typography>
                                    <Typography noWrap sx={{ color: P.secondary, fontSize: "0.78rem", mt: 0.2, fontWeight: 700 }}>
                                      {cita.clienteNombre || "Cliente walk-in"}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={cita.estado}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: "0.6rem",
                                      bgcolor: alpha(color, 0.12),
                                      color: color,
                                      fontWeight: 800
                                    }}
                                  />
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </GlassCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
