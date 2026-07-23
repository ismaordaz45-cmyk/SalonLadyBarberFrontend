import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  TextField,
  Skeleton,
  Chip,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  IconButton,
  Divider
} from "@mui/material";
import {
  CalendarMonthRounded,
  SearchRounded,
  CheckCircleRounded,
  CancelRounded,
  PlayArrowRounded,
  HelpOutlineRounded,
  AddRounded,
  VisibilityRounded
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import Swal from "sweetalert2";
import api from "../../api";

const DIA_SEMANA_POR_GET_DAY = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO"
];

function fechaYmdToDiaSemanaBackend(fechaYmd) {
  const parts = String(fechaYmd).trim().split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return DIA_SEMANA_POR_GET_DAY[dt.getDay()] ?? null;
}

function tiempoAperturaCierreAMinutos(horaStr) {
  const s = String(horaStr || "").trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return NaN;
  const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return hh * 60 + mm;
}

function moneyMXN(value) {
  if (value == null || value === "") return "$0.00";
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export default function GestionCitasRecepcion() {
  const [tabActiva, setTabActiva] = useState(0);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Filtros
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().slice(0, 10));
  const [busquedaTexto, setBusquedaTexto] = useState("");

  // Modal Reserva
  const [reservaOpen, setReservaOpen] = useState(false);
  const [guardandoReserva, setGuardandoReserva] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);

  // Formulario Reserva
  const [formClienteId, setFormClienteId] = useState("");
  const [formBarberoId, setFormBarberoId] = useState("");
  const [formFecha, setFormFecha] = useState("");
  const [formHora, setFormHora] = useState("");
  const [formServicios, setFormServicios] = useState([]);

  // Horarios de negocio y ocupación para "Nueva Cita"
  const [diasHorarioNegocio, setDiasHorarioNegocio] = useState([]);
  const [ocupacionApi, setOcupacionApi] = useState([]);

  // Modal Detalle Cita
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const hoyStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Cargar Citas
  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        let endpoint = "/api/citas";
        
        // Si la tab es 0 (Hoy), forzamos fecha de hoy
        if (tabActiva === 0) {
          endpoint += `?fecha=${hoyStr}`;
        }
        // Si la tab es 1 (Por Fecha), usamos la fecha seleccionada
        else if (tabActiva === 1 && fechaFiltro) {
          endpoint += `?fecha=${fechaFiltro}`;
        }
        // Tab 2 (Historial) carga todas las citas (el filtrado de texto se hace en memoria)

        const { data } = await api.get(endpoint);
        if (!cancel) setCitas(data || []);
      } catch (e) {
        if (!cancel) {
          setError(e?.response?.data?.error || e?.message || "Error al cargar citas.");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [tabActiva, fechaFiltro, hoyStr, refreshCount]);

  // Cargar catálogos para reservar
  useEffect(() => {
    if (!reservaOpen) return;

    const loadCatalogs = async () => {
      try {
        // Cargar barberos/empleadas
        const resBarberos = await api.get("/api/barberos");
        setBarberos(resBarberos.data || []);

        // Cargar servicios
        const resServicios = await api.get("/api/servicios");
        setServicios(resServicios.data || []);

        // Cargar usuarios/clientes
        const resClientes = await api.get("/api/admin/usuarios?limit=150");
        const usersList = resClientes.data?.usuarios || [];
        setClientes(usersList.filter((u) => u.rol === "CLIENTE"));

        // Cargar horarios de negocio
        const resHorarios = await api.get("/api/horario-negocio").catch(() => ({ data: null }));
        const dias = resHorarios?.data?.dias;
        setDiasHorarioNegocio(Array.isArray(dias) ? dias : []);
      } catch (e) {
        console.error("Error al cargar catálogos:", e);
      }
    };
    loadCatalogs();
  }, [reservaOpen]);

  // Cargar ocupación en tiempo real cuando cambien fecha o estilista en el formulario
  useEffect(() => {
    if (!formFecha || !formBarberoId) {
      setOcupacionApi([]);
      return;
    }
    const loadOcupacion = async () => {
      try {
        const { data } = await api.get(
          `/api/citas/ocupacion?fecha=${formFecha}&empleadaId=${formBarberoId}`
        );
        setOcupacionApi(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error al cargar ocupación:", e);
        setOcupacionApi([]);
      }
    };
    loadOcupacion();
  }, [formFecha, formBarberoId]);

  // Calcular slots disponibles para el estilista en la fecha seleccionada
  const slotsDisponibles = useMemo(() => {
    if (!formFecha || !formBarberoId || formServicios.length === 0) return [];

    // 1. Encontrar horario del día
    const clave = fechaYmdToDiaSemanaBackend(formFecha);
    const dia = diasHorarioNegocio.find((d) => d.diaSemana === clave);

    let horaApertura = "09:00";
    let horaCierre = "20:00";
    let activo = true;

    if (dia) {
      activo = dia.activo !== false;
      if (dia.horaApertura) horaApertura = dia.horaApertura;
      if (dia.horaCierre) horaCierre = dia.horaCierre;
    }

    if (!activo) return [];

    // 2. Duración total
    let duracionTotal = 0;
    formServicios.forEach((id) => {
      const s = servicios.find((item) => item.id === id);
      if (s) duracionTotal += Number(s.duracionMinutos || s.duracion || 0);
    });
    if (duracionTotal === 0) duracionTotal = 30; // valor seguro por defecto

    // 3. Generar slots cada 30 minutos
    const openMin = tiempoAperturaCierreAMinutos(horaApertura);
    const closeMin = tiempoAperturaCierreAMinutos(horaCierre);
    if (isNaN(openMin) || isNaN(closeMin) || closeMin < openMin) return [];

    const slots = [];
    let cur = openMin;
    while (cur + duracionTotal <= closeMin) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      const hStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      const slotMin = cur;
      const slotEndMin = cur + duracionTotal;
      let disponible = true;

      for (const cita of ocupacionApi) {
        const dInicio = new Date(cita.horaInicio);
        const dFin = new Date(cita.horaFin);
        const cStartMin = dInicio.getHours() * 60 + dInicio.getMinutes();
        const cEndMin = dFin.getHours() * 60 + dFin.getMinutes();

        // Traslape
        if (slotMin < cEndMin && slotEndMin > cStartMin) {
          disponible = false;
          break;
        }
      }

      slots.push({ hora: hStr, disponible });
      cur += 30;
    }

    return slots;
  }, [formFecha, formBarberoId, formServicios, ocupacionApi, diasHorarioNegocio, servicios]);

  // Resetear hora seleccionada cuando cambien los datos de reserva
  useEffect(() => {
    setFormHora("");
  }, [formFecha, formBarberoId, formServicios]);

  // Filtrar citas en memoria
  const citasFiltradas = useMemo(() => {
    let list = [...citas];

    // Si es pestaña Historial (tabActiva === 2), excluimos las citas futuras no completadas
    if (tabActiva === 2) {
      list = list.filter(
        (c) =>
          c.estado === "COMPLETADA" ||
          c.estado === "CANCELADA" ||
          c.estado === "NO_ASISTIO" ||
          (c.fecha && c.fecha < hoyStr)
      );
    }

    if (busquedaTexto.trim()) {
      const q = busquedaTexto.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.clienteNombre?.toLowerCase().includes(q) ||
          c.empleadaNombre?.toLowerCase().includes(q) ||
          c.notas?.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      const timeA = a.horaInicio ? a.horaInicio : a.fecha;
      const timeB = b.horaInicio ? b.horaInicio : b.fecha;
      return tabActiva === 2 ? timeB.localeCompare(timeA) : timeA.localeCompare(timeB);
    });
  }, [citas, tabActiva, busquedaTexto, hoyStr]);

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

  // Buscar método de pago de una cita liquidada en mostrador
  const getMetodoPagoCitaLocal = (citaId) => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("ventas_hoy_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list = JSON.parse(raw);
            const found = list.find((v) => v.tipo === "CITA" && Number(v.citaId) === Number(citaId));
            if (found) return found.metodoPago;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  // Obtener los detalles completos de la cita desde el servidor
  const handleVerDetalles = async (citaId) => {
    try {
      setCargandoDetalle(true);
      setDetalleOpen(true);
      setCitaDetalle(null);
      const { data } = await api.get(`/api/citas/${citaId}`);
      setCitaDetalle(data);
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron obtener los detalles de la cita.",
        icon: "error"
      });
      setDetalleOpen(false);
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Cambiar estado de cita
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
      await api.put(`/api/citas/${citaId}`, { estado: nuevoEstado });
      Swal.fire({
        title: "Estado Actualizado",
        text: `La cita ha sido marcada como "${desc}" con éxito.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      setRefreshCount((prev) => prev + 1);
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.response?.data?.error || e?.message || "No se pudo actualizar el estado de la cita.",
        icon: "error"
      });
    }
  };

  // Enviar reservación desde recepción
  const handleGuardarReserva = async () => {
    if (!formClienteId || !formBarberoId || !formFecha || !formHora || formServicios.length === 0) {
      Swal.fire("Faltan datos", "Por favor completa todos los campos requeridos.", "warning");
      return;
    }

    try {
      setGuardandoReserva(true);
      // El backend requiere { empleadaId, fecha: "YYYY-MM-DD", horaInicio: "HH:mm", servicios: [id, id], clienteId }
      const res = await api.post("/api/citas", {
        clienteId: Number(formClienteId),
        empleadaId: Number(formBarberoId),
        fecha: formFecha,
        horaInicio: formHora,
        servicios: formServicios
      });

      // Si es exitoso, confirmamos con el backend y ponemos como CONFIRMADA
      if (res.data?.citaId) {
        await api.put(`/api/citas/${res.data.citaId}`, {
          estado: "CONFIRMADA"
        });
      }

      Swal.fire({
        title: "Cita Agendada",
        text: "La reservación se registró y confirmó de forma exitosa.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      setReservaOpen(false);
      // Limpiar formulario
      setFormClienteId("");
      setFormBarberoId("");
      setFormFecha("");
      setFormHora("");
      setFormServicios([]);
      setRefreshCount((prev) => prev + 1);
    } catch (e) {
      const errorMsg = e?.response?.data?.error || e?.message || "El estilista seleccionado no está disponible en ese horario.";
      const isConflict = e?.response?.status === 409 || errorMsg.toLowerCase().includes("conflicto");
      Swal.fire({
        title: isConflict ? "Conflicto de Horario" : "No se pudo registrar la cita",
        text: errorMsg,
        icon: "error"
      });
    } finally {
      setGuardandoReserva(false);
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
            Gestión de Citas
          </Typography>
          <Typography sx={{ color: "#64748B", mt: 0.5, fontSize: "0.9rem", fontWeight: 650 }}>
            Agenda y consulta el historial completo del salón.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setReservaOpen(true)}
          startIcon={<AddRounded />}
          sx={{
            bgcolor: "#1E3A5F",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(30, 58, 95, 0.15)",
            "&:hover": { bgcolor: "#152a41" }
          }}
        >
          Nueva Cita (Caja)
        </Button>
      </Box>

      {/* Selector de Pestañas */}
      <GlassCard elevation={0} sx={{ mb: 3 }}>
        <Tabs
          value={tabActiva}
          onChange={(_, val) => {
            setTabActiva(val);
            setBusquedaTexto("");
          }}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            borderBottom: "1px solid #E2E8F0",
            px: 2,
            "& .MuiTab-root": { fontWeight: 800, fontSize: "0.85rem", textTransform: "none" }
          }}
        >
          <Tab label="Citas de Hoy" />
          <Tab label="Citas por Fecha" />
          <Tab label="Historial Pasado" />
        </Tabs>

        {/* Barra de Filtros */}
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={tabActiva === 1 ? 6 : 8}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por cliente, estilista o notas..."
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                InputProps={{
                  startAdornment: <SearchRounded sx={{ color: P.secondary, mr: 1, fontSize: 20 }} />
                }}
              />
            </Grid>

            {tabActiva === 1 && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Fecha de Consulta"
                  InputLabelProps={{ shrink: true }}
                  value={fechaFiltro}
                  onChange={(e) => setFechaFiltro(e.target.value)}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={tabActiva === 1 ? 2 : 4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setRefreshCount((prev) => prev + 1)}
                sx={{
                  fontWeight: 800,
                  borderColor: P.border,
                  color: P.navy,
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": { borderColor: P.navy, bgcolor: alpha(P.navy, 0.04) }
                }}
              >
                Actualizar Lista
              </Button>
            </Grid>
          </Grid>
        </Box>
      </GlassCard>

      {/* Listado de Citas */}
      {loading ? (
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={90} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={90} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" height={90} sx={{ borderRadius: 3 }} />
        </Stack>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      ) : citasFiltradas.length === 0 ? (
        <GlassCard elevation={0} sx={{ py: 8, textAlign: "center" }}>
          <CalendarMonthRounded sx={{ fontSize: 56, color: P.secondary, opacity: 0.4, mb: 1.5 }} />
          <Typography sx={{ color: P.secondary, fontWeight: 800 }}>
            No se encontraron citas en este bloque.
          </Typography>
        </GlassCard>
      ) : (
        <Stack spacing={2}>
          {citasFiltradas.map((cita) => {
            const horaInicio = cita.horaInicio ? String(cita.horaInicio).slice(11, 16) : "—";
            const horaFin = cita.horaFin ? String(cita.horaFin).slice(11, 16) : "—";
            const isPending = cita.estado === "APARTADA" || cita.estado === "CONFIRMADA";
            const isInProcess = cita.estado === "EN_PROCESO";

            return (
              <GlassCard
                key={cita.id}
                elevation={0}
                sx={{
                  p: 2.2,
                  borderRadius: 3.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: alpha(P.accent, 0.4),
                    bgcolor: alpha(P.cream, 0.1),
                    transform: "translateX(3px)"
                  }
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.05rem" }}>
                      {horaInicio} - {horaFin}
                    </Typography>
                    <Typography sx={{ color: P.secondary, fontSize: "0.78rem", mt: 0.4, fontWeight: 650 }}>
                      Fecha: {cita.fecha}
                    </Typography>
                    <Typography sx={{ color: "#22C55E", fontSize: "0.8rem", fontWeight: 800, mt: 0.4 }}>
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

                      {/* Acciones para recepcionista */}
                      {isPending && (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            color="info"
                            title="Ver Detalles"
                            onClick={() => handleVerDetalles(cita.id)}
                            sx={{ bgcolor: "rgba(30, 58, 95, 0.08)", "&:hover": { bgcolor: "rgba(30, 58, 95, 0.18)" } }}
                          >
                            <VisibilityRounded sx={{ fontSize: 16, color: P.navy }} />
                          </IconButton>
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
                            sx={{ bgcolor: alpha(P.red, 0.1), "&:hover": { bgcolor: alpha(P.red, 0.2) } }}
                          >
                            <CancelRounded sx={{ fontSize: 16, color: P.red }} />
                          </IconButton>
                        </Stack>
                      )}

                      {isInProcess && (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            color="info"
                            title="Ver Detalles"
                            onClick={() => handleVerDetalles(cita.id)}
                            sx={{ bgcolor: "rgba(30, 58, 95, 0.08)", "&:hover": { bgcolor: "rgba(30, 58, 95, 0.18)" } }}
                          >
                            <VisibilityRounded sx={{ fontSize: 16, color: P.navy }} />
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
                            title="Cliente no asistió"
                            onClick={() => handleCambiarEstado(cita.id, "NO_ASISTIO", "No Asistió")}
                            sx={{ bgcolor: "rgba(71, 85, 105, 0.1)", "&:hover": { bgcolor: "rgba(71, 85, 105, 0.2)" } }}
                          >
                            <HelpOutlineRounded sx={{ fontSize: 16, color: "#475569" }} />
                          </IconButton>
                        </Stack>
                      )}

                      {!isPending && !isInProcess && (
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            color="info"
                            title="Ver Detalles"
                            onClick={() => handleVerDetalles(cita.id)}
                            sx={{ bgcolor: "rgba(30, 58, 95, 0.08)", "&:hover": { bgcolor: "rgba(30, 58, 95, 0.18)" } }}
                          >
                            <VisibilityRounded sx={{ fontSize: 16, color: P.navy }} />
                          </IconButton>
                        </Stack>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </GlassCard>
            );
          })}
        </Stack>
      )}

      {/* 4. MODAL DIALOG: NUEVA RESERVACIÓN EN CAJA */}
      <Dialog open={reservaOpen} onClose={() => setReservaOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: P.navy, fontFamily: '"Cinzel", serif' }}>
          Nueva Cita (Reservación de Caja)
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Seleccionar Cliente */}
            <FormControl fullWidth size="small">
              <InputLabel id="select-cliente-label">Cliente</InputLabel>
              <Select
                labelId="select-cliente-label"
                value={formClienteId}
                label="Cliente"
                onChange={(e) => setFormClienteId(e.target.value)}
              >
                {clientes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nombreCompleto} ({c.correo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Seleccionar Estilista */}
            <FormControl fullWidth size="small">
              <InputLabel id="select-barbero-label">Estilista / Barbera</InputLabel>
              <Select
                labelId="select-barbero-label"
                value={formBarberoId}
                label="Estilista / Barbera"
                onChange={(e) => setFormBarberoId(e.target.value)}
              >
                {barberos.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.nombreCompleto || b.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Fecha y Hora */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Fecha"
                  InputLabelProps={{ shrink: true }}
                  value={formFecha}
                  onChange={(e) => setFormFecha(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="select-hora-reserva-label">Hora Inicio</InputLabel>
                  <Select
                    labelId="select-hora-reserva-label"
                    value={formHora}
                    label="Hora Inicio"
                    onChange={(e) => setFormHora(e.target.value)}
                    disabled={!formFecha || !formBarberoId || formServicios.length === 0}
                  >
                    {slotsDisponibles.length === 0 ? (
                      <MenuItem disabled value="">
                        {!formFecha || !formBarberoId || formServicios.length === 0
                          ? "Faltan datos previos"
                          : "Sin horarios libres"}
                      </MenuItem>
                    ) : (
                      slotsDisponibles.map((slot) => (
                        <MenuItem
                          key={slot.hora}
                          value={slot.hora}
                          disabled={!slot.disponible}
                          sx={{
                            fontWeight: slot.disponible ? 700 : 400,
                            color: slot.disponible ? P.navy : P.secondary
                          }}
                        >
                          {slot.hora} {slot.disponible ? "— Disponible" : "— Ocupado"}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Servicios Múltiples */}
            <FormControl fullWidth size="small">
              <InputLabel id="select-servicios-label">Servicios</InputLabel>
              <Select
                labelId="select-servicios-label"
                multiple
                value={formServicios}
                onChange={(e) => setFormServicios(e.target.value)}
                input={<OutlinedInput label="Servicios" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const s = servicios.find((item) => item.id === value);
                      return <Chip key={value} label={s ? s.nombre : value} size="small" />;
                    })}
                  </Box>
                )}
              >
                {servicios.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    <Checkbox checked={formServicios.indexOf(s.id) > -1} />
                    <ListItemText primary={`${s.nombre} - ${moneyMXN(s.precio)}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReservaOpen(false)} sx={{ fontWeight: 800, color: "#64748B" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarReserva}
            variant="contained"
            disabled={guardandoReserva}
            sx={{ bgcolor: P.navy, fontWeight: 900, "&:hover": { bgcolor: "#152a41" } }}
          >
            {guardandoReserva ? "Registrando..." : "Registrar Cita"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. MODAL DIALOG: DETALLES DE COMPROBANTE DE CITA */}
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: P.navy, textAlign: "center", pb: 0.5, fontFamily: '"Cinzel", serif' }}>
          Comprobante de Cita
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: alpha(P.cream, 0.08) }}>
          {cargandoDetalle ? (
            <Stack spacing={2} sx={{ py: 3, alignItems: "center" }}>
              <Typography sx={{ color: P.secondary }}>Cargando detalles del comprobante...</Typography>
              <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 3 }} />
            </Stack>
          ) : !citaDetalle ? (
            <Typography align="center" color="error" sx={{ py: 2 }}>
              No se pudo cargar la información de esta cita.
            </Typography>
          ) : (() => {
            const cd = citaDetalle;
            const total = Number(cd.precioFinal || 0);
            const tieneAnticipo = cd.mp_payment_id != null && cd.mp_payment_id !== "";
            const anticipo = tieneAnticipo ? total / 2 : 0;
            const liquidado = total - anticipo;
            
            // Buscar método de pago local o fallback
            const metodoPagoSalón = getMetodoPagoCitaLocal(cd.id) || (cd.estado === "COMPLETADA" ? "EFECTIVO (Mostrador)" : "Pendiente");

            // Rango de horas
            let timeRange = "—";
            if (cd.horaInicio) {
              try {
                const start = cd.horaInicio.slice(11, 16);
                const end = cd.horaFin ? cd.horaFin.slice(11, 16) : "—";
                timeRange = `${start} - ${end}`;
              } catch {}
            }

            return (
              <Box sx={{ p: 1, fontFamily: "monospace", fontSize: "0.85rem", color: "#334155" }}>
                {/* Cabecera del ticket térmico */}
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: P.navy, fontFamily: '"Cinzel", serif' }}>
                    LADY BARBER
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: P.secondary, fontWeight: 700 }}>
                    ITZA D'M SALÓN
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: P.secondary, mt: 0.5 }}>
                    ID: #{cd.id}
                  </Typography>
                </Box>

                <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />

                {/* Datos de la Cita */}
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold" }}>FECHA:</span>
                    <span>{cd.fecha}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold" }}>HORARIO:</span>
                    <span>{timeRange}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold" }}>ESTILISTA:</span>
                    <span>{cd.empleadaNombre || "Sin asignar"}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold" }}>CLIENTE:</span>
                    <span>{cd.clienteNombre || "Cliente walk-in"}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold" }}>CORREO:</span>
                    <span style={{ fontSize: "0.75rem" }}>{cd.clienteCorreo || "—"}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold" }}>ESTADO:</span>
                    {getEstadoChip(cd.estado)}
                  </Box>
                </Stack>

                <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />

                {/* Detalle de Servicios */}
                <Typography sx={{ fontWeight: "bold", mb: 1, textTransform: "uppercase", fontSize: "0.75rem" }}>
                  Servicios Adquiridos:
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {cd.servicios && cd.servicios.length > 0 ? (
                    cd.servicios.map((s) => (
                      <Box key={s.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                        <span>• {s.nombre}</span>
                        <span>{moneyMXN(s.precio)}</span>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ fontStyle: "italic", color: P.secondary }}>
                      Ningún servicio registrado
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />

                {/* Desglose de Pago */}
                <Stack spacing={1} sx={{ mb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span>MONTO TOTAL:</span>
                    <span>{moneyMXN(total)}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", color: P.secondary }}>
                    <span>ANTICIPO (ONLINE):</span>
                    <span>{moneyMXN(anticipo)}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#22C55E", fontSize: "0.9rem" }}>
                    <span>LIQUIDADO EN SALÓN:</span>
                    <span>{moneyMXN(liquidado)}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: P.secondary }}>
                    <span>MÉTODO DE PAGO:</span>
                    <span style={{ fontWeight: "bold" }}>{metodoPagoSalón}</span>
                  </Box>
                </Stack>

                {cd.notas && (
                  <>
                    <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />
                    <Box sx={{ bgcolor: alpha(P.border, 0.15), p: 1, borderRadius: 1.5 }}>
                      <span style={{ fontWeight: "bold", display: "block", fontSize: "0.72rem" }}>NOTAS:</span>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", fontStyle: "italic" }}>{cd.notas}</p>
                    </Box>
                  </>
                )}

                <Box sx={{ textAlign: "center", mt: 3, fontSize: "0.72rem", color: P.secondary, fontStyle: "italic" }}>
                  ¡Gracias por su preferencia!
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            onClick={() => {
              if (citaDetalle) {
                Swal.fire({
                  title: "Impresión de Comprobante",
                  text: `Enviando ticket #${citaDetalle.id} a la impresora térmica de recepción...`,
                  icon: "success",
                  confirmButtonColor: "#1E3A5F"
                });
              }
            }}
            variant="outlined"
            sx={{ borderColor: P.navy, color: P.navy, fontWeight: 800, textTransform: "none" }}
            disabled={!citaDetalle}
          >
            Imprimir Ticket
          </Button>
          <Button
            onClick={() => setDetalleOpen(false)}
            variant="contained"
            sx={{ bgcolor: P.navy, fontWeight: 900, textTransform: "none", "&:hover": { bgcolor: "#152a41" } }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
