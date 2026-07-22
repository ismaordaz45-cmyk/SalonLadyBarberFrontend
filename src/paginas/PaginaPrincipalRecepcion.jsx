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
  Stack,
  Divider,
  IconButton
} from "@mui/material";
import {
  CalendarMonthRounded,
  AccessTimeRounded,
  CheckCircleRounded,
  CancelRounded,
  PlayArrowRounded,
  HelpOutlineRounded,
  TrendingUpRounded,
  ShoppingBagRounded
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { GlassCard, IconWrapper } from "../ui/admin/components";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import Swal from "sweetalert2";
import api from "../api";

function moneyMXN(value) {
  if (value == null || value === "") return "$0.00";
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

const PaginaPrincipalRecepcion = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const hoyStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Cargar citas de hoy
  useEffect(() => {
    let cancel = false;
    const cargarCitas = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/api/citas?fecha=${hoyStr}`);
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
  }, [hoyStr, refreshCount]);

  // Cargar ventas locales de hoy (POS)
  const ventasProductosHoy = useMemo(() => {
    try {
      const key = "ventas_hoy_" + hoyStr;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoyStr, refreshCount]);

  // Calcular ingresos del día (Corte de Caja)
  const corteCaja = useMemo(() => {
    // Ingresos de citas completadas (total facturado)
    const citasCompletadas = citas.filter((c) => c.estado === "COMPLETADA");
    const ingresosCitasTotal = citasCompletadas.reduce((sum, c) => sum + Number(c.precioFinal || 0), 0);

    // Ingresos de ventas físicas en mostrador (registradas localmente)
    const ingresosProductos = ventasProductosHoy
      .filter((v) => v.tipo === "PRODUCTO" || !v.tipo)
      .reduce((sum, v) => sum + Number(v.total || 0), 0);

    const ingresosCitasMostrador = ventasProductosHoy
      .filter((v) => v.tipo === "CITA")
      .reduce((sum, v) => sum + Number(v.total || 0), 0);

    const totalCajaFisica = ingresosProductos + ingresosCitasMostrador;

    // Desglose de ingresos físicos recibidos en mostrador
    const efectivoProd = ventasProductosHoy
      .filter((v) => v.metodoPago === "EFECTIVO")
      .reduce((sum, v) => sum + Number(v.total || 0), 0);

    const tarjetaProd = ventasProductosHoy
      .filter((v) => v.metodoPago === "TARJETA")
      .reduce((sum, v) => sum + Number(v.total || 0), 0);

    const transferProd = ventasProductosHoy
      .filter((v) => v.metodoPago === "TRANSFERENCIA")
      .reduce((sum, v) => sum + Number(v.total || 0), 0);

    return {
      ingresosCitasTotal,
      ingresosProductos,
      ingresosCitasMostrador,
      totalCajaFisica,
      efectivoProd,
      tarjetaProd,
      transferProd,
      citasCompletadasCount: citasCompletadas.length,
      citasPendientesCount: citas.filter(
        (c) => c.estado === "APARTADA" || c.estado === "CONFIRMADA" || c.estado === "EN_PROCESO"
      ).length
    };
  }, [citas, ventasProductosHoy]);

  // Obtener próxima cita del día
  const proximaCita = useMemo(() => {
    const ahoraStr = new Date().toTimeString().slice(0, 5);
    const futuras = citas
      .filter((c) => c.estado === "CONFIRMADA" || c.estado === "APARTADA" || c.estado === "EN_PROCESO")
      .map((c) => {
        const time = c.horaInicio ? String(c.horaInicio).slice(11, 16) : "23:59";
        return { ...c, timeStr: time };
      })
      .filter((c) => c.timeStr >= ahoraStr)
      .sort((a, b) => a.timeStr.localeCompare(b.timeStr));

    return futuras[0] || null;
  }, [citas]);

  // Confirmar y cobrar la cita completando el restante de pago
  const handleCobrarYCompletarCita = async (citaId) => {
    const cita = citas.find((c) => c.id === citaId);
    if (!cita) return;

    const total = Number(cita.precioFinal || 0);
    const tieneAnticipo = cita.mp_payment_id != null && cita.mp_payment_id !== "";
    const anticipo = tieneAnticipo ? total / 2 : 0;
    const restante = total - anticipo;

    const { value: metodo } = await Swal.fire({
      title: "Liquidación y Cobro",
      html: `
        <div style="text-align: left; font-family: 'Montserrat', sans-serif; font-size: 0.9rem; line-height: 1.6;">
          <p><strong>Cliente:</strong> ${cita.clienteNombre || "Cliente walk-in / sin asignar"}</p>
          <p><strong>Monto Total:</strong> ${moneyMXN(total)}</p>
          <p><strong>Anticipo Pagado Online:</strong> ${moneyMXN(anticipo)}</p>
          <p style="font-size: 1.15rem; color: #22C55E; margin-top: 8px;">
            <strong>Monto Restante a Cobrar:</strong> ${moneyMXN(restante)}
          </p>
          <hr style="margin: 15px 0; border: 0; border-top: 1px solid #E2E8F0;" />
          <label for="swal-metodo" style="font-weight: 700; display: block; margin-bottom: 6px;">Selecciona el Método de Pago:</label>
          <select id="swal-metodo" class="swal2-select" style="display: flex; width: 100%; margin: 0; box-sizing: border-box; font-family: inherit;">
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta (Débito/Crédito)</option>
            <option value="TRANSFERENCIA">Transferencia bancaria</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Cobrar y Finalizar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#64748B",
      preConfirm: () => {
        return document.getElementById("swal-metodo").value;
      }
    });

    if (!metodo) return;

    try {
      // 1. Modificar cita en base de datos a COMPLETADA
      await api.put(`/api/citas/${citaId}`, { estado: "COMPLETADA" });

      // 2. Registrar el cobro del saldo restante en la caja del día
      const ventaKey = "ventas_hoy_" + hoyStr;
      const ventasExistentes = JSON.parse(localStorage.getItem(ventaKey) || "[]");
      const nuevaVenta = {
        id: Date.now(),
        tipo: "CITA",
        citaId: cita.id,
        total: restante,
        metodoPago: metodo,
        items: [
          {
            nombre: `Cierre Cita - ${cita.clienteNombre || "Cliente"}`,
            cantidad: 1,
            precio: restante
          }
        ],
        fecha: new Date().toLocaleTimeString("es-MX", { hour12: false })
      };

      localStorage.setItem(ventaKey, JSON.stringify([...ventasExistentes, nuevaVenta]));

      Swal.fire({
        title: "Cita Completada",
        text: `Se cobró ${moneyMXN(restante)} con éxito en el mostrador del salón.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      setRefreshCount((prev) => prev + 1);
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.response?.data?.error || e?.message || "No se pudo completar el cobro.",
        icon: "error"
      });
    }
  };

  // Actualizar estado de cita
  const handleCambiarEstado = async (citaId, nuevoEstado, desc) => {
    const result = await Swal.fire({
      title: `¿Cambiar estado a ${desc}?`,
      text: `La cita cambiará a estado "${desc}" de manera inmediata.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#64748B"
    });

    if (!result.isConfirmed) return;

    try {
      // Mandar PUT /api/citas/:id
      await api.put(`/api/citas/${citaId}`, {
        estado: nuevoEstado
      });

      Swal.fire({
        title: "Estado Actualizado",
        text: `La cita ha sido marcada como "${desc}" con éxito.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      // Refrescar datos
      setRefreshCount((prev) => prev + 1);
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.response?.data?.error || e?.message || "No se pudo actualizar el estado de la cita.",
        icon: "error"
      });
    }
  };

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
    <Box sx={{ animation: "fadeIn 0.3s ease" }}>
      {/* 1. Header del Dashboard */}
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
            Agenda del Día
          </Typography>
          <Typography sx={{ color: "#64748B", mt: 0.5, fontSize: "0.9rem", fontWeight: 650 }}>
            Control diario de citas, ventas del salón y caja.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate("/recepcion/citas")}
          sx={{
            bgcolor: "#1E3A5F",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(30, 58, 95, 0.15)",
            "&:hover": { bgcolor: "#152a41" }
          }}
        >
          Ver agenda completa
        </Button>
      </Box>

      {/* 2. Tarjetas de Métricas Rápidas */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Citas de Hoy */}
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={0}>
            <CardContent sx={{ p: 2.2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.8rem" }}>
                    Citas del Día
                  </Typography>
                  <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.8rem", mt: 0.5 }}>
                    {loading ? <Skeleton width={40} /> : citas.length}
                  </Typography>
                </Box>
                <IconWrapper bgcolor={P.navy}>
                  <CalendarMonthRounded sx={{ color: P.navy }} />
                </IconWrapper>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Citas Completadas vs Pendientes */}
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={0}>
            <CardContent sx={{ p: 2.2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.8rem" }}>
                    Citas Atendidas
                  </Typography>
                  <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.15rem", mt: 1 }}>
                    {loading ? (
                      <Skeleton width={120} />
                    ) : (
                      `${corteCaja.citasCompletadasCount} de ${citas.length} listas`
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

        {/* Próxima Cita */}
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={0}>
            <CardContent sx={{ p: 2.2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                  <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.8rem" }}>
                    Próximo Cliente
                  </Typography>
                  <Typography
                    noWrap
                    sx={{ color: P.primary, fontWeight: 900, fontSize: "1.1rem", mt: 1 }}
                  >
                    {loading ? (
                      <Skeleton width={100} />
                    ) : proximaCita ? (
                      `${proximaCita.timeStr} - ${proximaCita.clienteNombre?.split(" ")[0]}`
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

        {/* Caja Rápida del Día */}
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={0} sx={{ border: `1.5px solid ${alpha(P.accent, 0.3)}` }}>
            <CardContent sx={{ p: 2.2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ color: P.secondary, fontWeight: 850, fontSize: "0.8rem" }}>
                    Caja del Día
                  </Typography>
                  <Typography sx={{ color: "#22C55E", fontWeight: 900, fontSize: "1.5rem", mt: 0.5 }}>
                    {loading ? <Skeleton width={80} /> : moneyMXN(corteCaja.totalCajaFisica)}
                  </Typography>
                </Box>
                <IconWrapper bgcolor="#22C55E">
                  <TrendingUpRounded sx={{ color: "#22C55E" }} />
                </IconWrapper>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* 3. Contenido Principal del Dashboard */}
      <Grid container spacing={3}>
        {/* Línea de Citas de Hoy */}
        <Grid item xs={12} md={7.5}>
          <GlassCard elevation={0} sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: P.primary, fontWeight: 900, mb: 2.5, fontFamily: '"Cinzel", serif' }}>
                Monitoreo de Citas de Hoy
              </Typography>

              {loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" height={85} sx={{ borderRadius: 3 }} />
                  <Skeleton variant="rectangular" height={85} sx={{ borderRadius: 3 }} />
                  <Skeleton variant="rectangular" height={85} sx={{ borderRadius: 3 }} />
                </Stack>
              ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {error}
                </Alert>
              ) : citas.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <CalendarMonthRounded sx={{ fontSize: 52, color: P.secondary, opacity: 0.4, mb: 1.5 }} />
                  <Typography sx={{ color: P.secondary, fontWeight: 800 }}>
                    No hay citas registradas para hoy.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2} sx={{ maxHeight: 520, overflowY: "auto", pr: 0.5 }}>
                  {citas.map((cita) => {
                    const horaInicio = cita.horaInicio ? String(cita.horaInicio).slice(11, 16) : "—";
                    const horaFin = cita.horaFin ? String(cita.horaFin).slice(11, 16) : "—";
                    const isPending = cita.estado === "APARTADA" || cita.estado === "CONFIRMADA";
                    const isInProcess = cita.estado === "EN_PROCESO";

                    return (
                      <Box
                        key={cita.id}
                        sx={{
                          p: 2.2,
                          borderRadius: 3.5,
                          border: `1px solid ${alpha(P.border, 0.7)}`,
                          bgcolor: alpha("#FFFFFF", 0.6),
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: alpha(P.accent, 0.5),
                            bgcolor: alpha(P.cream, 0.15),
                            transform: "translateX(3px)",
                            boxShadow: "0 8px 24px rgba(30, 58, 90, 0.04)"
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.05rem" }}>
                              {horaInicio} - {horaFin}
                            </Typography>
                            <Typography sx={{ color: "#22C55E", fontSize: "0.8rem", fontWeight: 800, mt: 0.5 }}>
                              {moneyMXN(cita.precioFinal)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6.5}>
                            <Typography sx={{ color: P.primary, fontWeight: 800, fontSize: "0.95rem" }}>
                              {cita.clienteNombre || "Cliente walk-in / sin asignar"}
                            </Typography>
                            <Typography sx={{ color: P.secondary, fontSize: "0.8rem", mt: 0.3, fontWeight: 650 }}>
                              Estilista: {cita.empleadaNombre || "Sin asignar"}
                            </Typography>
                            {cita.notas && (
                              <Typography
                                sx={{
                                  color: P.secondary,
                                  fontSize: "0.75rem",
                                  fontStyle: "italic",
                                  mt: 0.6
                                }}
                              >
                                Nota: {cita.notas}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={2.5} sx={{ textAlign: { sm: "right" } }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: { sm: "flex-end" } }}>
                              {getEstadoChip(cita.estado)}
                              
                              {/* Botones de acción rápida para recepcionista */}
                              {isPending && (
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    title="Iniciar Servicio"
                                    onClick={() => handleCambiarEstado(cita.id, "EN_PROCESO", "En Proceso")}
                                    sx={{ bgcolor: alpha(P.accent, 0.12), "&:hover": { bgcolor: alpha(P.accent, 0.25) } }}
                                  >
                                    <PlayArrowRounded sx={{ fontSize: 16, color: P.accent }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    title="Confirmar y Cobrar"
                                    onClick={() => handleCobrarYCompletarCita(cita.id)}
                                    sx={{ bgcolor: alpha(P.green, 0.12), "&:hover": { bgcolor: alpha(P.green, 0.25) } }}
                                  >
                                    <CheckCircleRounded sx={{ fontSize: 16, color: P.green }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    title="Cancelar Cita"
                                    onClick={() => handleCambiarEstado(cita.id, "CANCELADA", "Cancelada")}
                                    sx={{ bgcolor: alpha(P.red, 0.10), "&:hover": { bgcolor: alpha(P.red, 0.2) } }}
                                  >
                                    <CancelRounded sx={{ fontSize: 16, color: P.red }} />
                                  </IconButton>
                                </Stack>
                              )}

                              {isInProcess && (
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    title="Confirmar y Cobrar"
                                    onClick={() => handleCobrarYCompletarCita(cita.id)}
                                    sx={{ bgcolor: alpha(P.green, 0.12), "&:hover": { bgcolor: alpha(P.green, 0.25) } }}
                                  >
                                    <CheckCircleRounded sx={{ fontSize: 16, color: P.green }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    title="Cliente no asistió"
                                    onClick={() => handleCambiarEstado(cita.id, "NO_ASISTIO", "No Asistió")}
                                    sx={{ bgcolor: "rgba(71, 85, 105, 0.1)", "&:hover": { bgcolor: "rgba(71, 85, 105, 0.2)" } }}
                                  >
                                    <HelpOutlineRounded sx={{ fontSize: 16, color: "#475569" }} />
                                  </IconButton>
                                </Stack>
                              )}
                            </Box>
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

        {/* Corte de Caja Diario (Ingresos) */}
        <Grid item xs={12} md={4.5}>
          <Stack spacing={3}>
            {/* Corte de caja */}
            <GlassCard elevation={0} sx={{ borderLeft: `4px solid ${P.accent}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: P.primary, fontWeight: 900, mb: 2, fontFamily: '"Cinzel", serif' }}>
                  Auditoría de Caja Hoy
                </Typography>

                <Stack spacing={2}>
                  {/* Desglose de ingresos */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: P.secondary, fontSize: "0.85rem", fontWeight: 700 }}>
                      Facturado en Citas Completadas:
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 800, fontSize: "0.95rem" }}>
                      {moneyMXN(corteCaja.ingresosCitasTotal)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: P.secondary, fontSize: "0.85rem", fontWeight: 700 }}>
                      Cobrado por Citas en Caja:
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 800, fontSize: "0.95rem" }}>
                      {moneyMXN(corteCaja.ingresosCitasMostrador)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: P.secondary, fontSize: "0.85rem", fontWeight: 700 }}>
                      Venta de Productos ({ventasProductosHoy.filter(v => v.tipo === "PRODUCTO" || !v.tipo).length} ventas):
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 800, fontSize: "0.95rem" }}>
                      {moneyMXN(corteCaja.ingresosProductos)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                    <Typography sx={{ color: P.primary, fontSize: "1rem", fontWeight: 900 }}>
                      Total Recaudado Caja:
                    </Typography>
                    <Typography sx={{ color: "#22C55E", fontWeight: 900, fontSize: "1.2rem" }}>
                      {moneyMXN(corteCaja.totalCajaFisica)}
                    </Typography>
                  </Box>

                  {/* Detalle de productos por método */}
                  <Box sx={{ bgcolor: alpha(P.pageBg, 0.35), p: 1.8, borderRadius: 3, border: `1px solid ${P.border}` }}>
                    <Typography sx={{ color: P.primary, fontWeight: 800, fontSize: "0.78rem", mb: 1, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                      Cobros Recibidos en Caja:
                    </Typography>
                    <Stack spacing={0.8} sx={{ fontSize: "0.8rem", color: P.secondary, fontWeight: 650 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Efectivo:</Typography>
                        <Typography sx={{ color: P.primary, fontWeight: 800 }}>{moneyMXN(corteCaja.efectivoProd)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Tarjeta de Débito/Crédito:</Typography>
                        <Typography sx={{ color: P.primary, fontWeight: 800 }}>{moneyMXN(corteCaja.tarjetaProd)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography>Transferencia Directa:</Typography>
                        <Typography sx={{ color: P.primary, fontWeight: 800 }}>{moneyMXN(corteCaja.transferProd)}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </GlassCard>

            {/* Accesos rápidos */}
            <GlassCard elevation={0}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: P.primary, fontWeight: 900, mb: 2, fontFamily: '"Cinzel", serif' }}>
                  Acciones de Caja
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/recepcion/ventas")}
                    startIcon={<ShoppingBagRounded />}
                    sx={{
                      bgcolor: "#1E3A5F",
                      fontWeight: 800,
                      textTransform: "none",
                      borderRadius: "10px",
                      py: 1.2,
                      "&:hover": { bgcolor: "#152a41" }
                    }}
                  >
                    Registrar Venta de Insumos
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/recepcion/citas")}
                    startIcon={<CalendarMonthRounded />}
                    sx={{
                      borderColor: P.border,
                      color: P.navy,
                      fontWeight: 800,
                      textTransform: "none",
                      borderRadius: "10px",
                      py: 1.2,
                      "&:hover": { borderColor: P.navy, bgcolor: alpha(P.navy, 0.04) }
                    }}
                  >
                    Nueva Reservación en Caja
                  </Button>
                </Stack>
              </CardContent>
            </GlassCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaginaPrincipalRecepcion;
