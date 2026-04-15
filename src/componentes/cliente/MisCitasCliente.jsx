import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  Stack,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography
} from "@mui/material";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import BarberPole from "../compartidos/BarberPole";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const API_URL = "http://localhost:4000";

const COLORS = {
  navy: "#1E3A5A",
  black: "#000000",
  gold: "#D4AF37",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  muted: "#64748B"
};

/** Índice = getDay() JS: 0 domingo … 6 sábado (coincide con backend horario_negocio). */
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

function minutosAHHmmEnPunto(totalMin) {
  const h = Math.floor(totalMin / 60);
  return `${String(h).padStart(2, "0")}:00`;
}

/**
 * Horas en punto desde la primera hora completa ≥ apertura hasta cierre inclusive (ej. cierra 18:00 → último slot 18:00).
 */
function construirSlotsCadaHora(horaApertura, horaCierre) {
  const openMin = tiempoAperturaCierreAMinutos(horaApertura);
  const closeMin = tiempoAperturaCierreAMinutos(horaCierre);
  if (Number.isNaN(openMin) || Number.isNaN(closeMin) || closeMin < openMin) {
    return [];
  }
  let cur = openMin % 60 === 0 ? openMin : Math.ceil(openMin / 60) * 60;
  const slots = [];
  while (cur <= closeMin) {
    slots.push(minutosAHHmmEnPunto(cur));
    cur += 60;
  }
  return slots;
}

const PROMOCIONES = [
  { titulo: "20% OFF", subtitulo: "Tratamientos capilares" },
  { titulo: "2x1", subtitulo: "Peinados fin de semana" },
  { titulo: "Combo especial", subtitulo: "Corte + Peinado" }
];

const cardSx = {
  borderRadius: "16px",
  bgcolor: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
};

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const CANCELABLE = new Set(["APARTADA", "CONFIRMADA"]);

/** Citas futuras en estado cancelable, ordenadas por hora de inicio (la más próxima primero). */
function listarCitasProximas(citas) {
  if (!Array.isArray(citas) || citas.length === 0) return [];
  const now = Date.now();
  const candidatas = citas.filter((c) => {
    if (!CANCELABLE.has(c.estado)) return false;
    const t = new Date(c.horaInicio).getTime();
    return !Number.isNaN(t) && t >= now;
  });
  candidatas.sort((a, b) => new Date(a.horaInicio) - new Date(b.horaInicio));
  return candidatas;
}

function formatFechaCita(isoOrMysql) {
  if (!isoOrMysql) return "—";
  const d = new Date(isoOrMysql);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
}

function formatHoraCita(isoOrMysql) {
  if (!isoOrMysql) return "—";
  const d = new Date(isoOrMysql);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function MisCitasCliente() {
  const { runWithOverlay } = useBarberActionOverlay();
  const [serviciosApi, setServiciosApi] = useState([]);
  const [diasHorarioNegocio, setDiasHorarioNegocio] = useState([]);
  const [empleadasApi, setEmpleadasApi] = useState([]);
  const [citasApi, setCitasApi] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [cargandoEstilistas, setCargandoEstilistas] = useState(false);
  const [cargandoCitas, setCargandoCitas] = useState(true);

  const [empleadaId, setEmpleadaId] = useState("");
  const [serviciosSel, setServiciosSel] = useState([]);
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);

  const citasProximas = useMemo(() => listarCitasProximas(citasApi), [citasApi]);

  const horariosDisponibles = useMemo(() => {
    if (!fecha || diasHorarioNegocio.length === 0) return [];
    const clave = fechaYmdToDiaSemanaBackend(fecha);
    if (!clave) return [];
    const dia = diasHorarioNegocio.find((d) => d.diaSemana === clave);
    if (!dia || dia.activo === false || !dia.horaApertura || !dia.horaCierre) {
      return [];
    }
    return construirSlotsCadaHora(dia.horaApertura, dia.horaCierre);
  }, [fecha, diasHorarioNegocio]);

  useEffect(() => {
    if (horariosDisponibles.length === 0) {
      setHorario("");
      return;
    }
    setHorario((prev) =>
      horariosDisponibles.includes(prev) ? prev : horariosDisponibles[0]
    );
  }, [horariosDisponibles]);

  const cargarCitas = useCallback(async (silent = false) => {
    if (!getToken()) {
      setCitasApi([]);
      setCargandoCitas(false);
      return;
    }
    try {
      setCargandoCitas(true);
      const reqCfg = { headers: authHeaders() };
      if (!silent) {
        reqCfg.barberHeadline = "Mis citas";
        reqCfg.barberMessage = "Cargando tus citas…";
      } else {
        reqCfg.barberOverlay = false;
      }
      const { data } = await axios.get(`${API_URL}/api/cliente/citas`, reqCfg);
      setCitasApi(Array.isArray(data) ? data : []);
    } catch {
      setCitasApi([]);
    } finally {
      setCargandoCitas(false);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setCargandoCatalogo(true);
        const [srvRes, horRes] = await Promise.all([
          axios.get(`${API_URL}/api/servicios`, {
            barberHeadline: "Catálogo",
            barberMessage: "Cargando servicios…"
          }),
          axios
            .get(`${API_URL}/api/horario-negocio`, {
              barberHeadline: "Horario",
              barberMessage: "Cargando horario del salón…"
            })
            .catch(() => ({ data: null }))
        ]);
        if (!cancel) {
          setServiciosApi(Array.isArray(srvRes.data) ? srvRes.data : []);
          const dias = horRes?.data?.dias;
          setDiasHorarioNegocio(Array.isArray(dias) ? dias : []);
        }
      } catch {
        if (!cancel) {
          setServiciosApi([]);
          setDiasHorarioNegocio([]);
        }
      } finally {
        if (!cancel) setCargandoCatalogo(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    let cancel = false;

    const cargarEstilistasPorServicios = async () => {
      if (serviciosSel.length === 0) {
        setEmpleadasApi([]);
        setEmpleadaId("");
        setCargandoEstilistas(false);
        return;
      }

      try {
        setCargandoEstilistas(true);
        setEmpleadasApi([]);
        const results = await Promise.all(
          serviciosSel.map((sid) =>
            axios.get(`${API_URL}/api/empleadas/por-servicio/${Number(sid)}`)
          )
        );
        if (cancel) return;

        const listas = results.map((r) => (Array.isArray(r.data) ? r.data : []));
        let candidatas = listas[0] || [];
        for (let i = 1; i < listas.length; i++) {
          const ids = new Set(listas[i].map((e) => e.id));
          candidatas = candidatas.filter((e) => ids.has(e.id));
        }

        setEmpleadasApi(candidatas);
        setEmpleadaId((prev) => {
          if (!prev) return "";
          const ok = candidatas.some((e) => String(e.id) === String(prev));
          return ok ? prev : "";
        });
      } catch {
        if (!cancel) {
          setEmpleadasApi([]);
          setEmpleadaId("");
        }
      } finally {
        if (!cancel) setCargandoEstilistas(false);
      }
    };

    cargarEstilistasPorServicios();
    return () => {
      cancel = true;
    };
  }, [serviciosSel]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  const nombreEmpleada = (e) =>
    [e.nombre, e.apellidoPaterno, e.apellidoMaterno].filter(Boolean).join(" ").trim() ||
    `Empleada #${e.id}`;

  const handleFechaChange = async (e) => {
    const v = e.target.value;
    setFecha(v);
    if (!v || diasHorarioNegocio.length === 0) return;
    const clave = fechaYmdToDiaSemanaBackend(v);
    if (!clave) return;
    const dia = diasHorarioNegocio.find((d) => d.diaSemana === clave);
    const abierto =
      dia &&
      (dia.activo === true || dia.activo === 1) &&
      dia.horaApertura &&
      dia.horaCierre;
    if (!abierto) {
      setHorario("");
      await Swal.fire({
        icon: "info",
        title: "Día no disponible",
        text: "El salón no atiende ese día según su horario de atención. Elige otra fecha.",
        confirmButtonColor: COLORS.navy
      });
    }
  };

  const handleReservar = async () => {
    if (!getToken()) {
      await Swal.fire({
        icon: "warning",
        title: "Sesión",
        text: "Inicia sesión para reservar.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }
    if (!serviciosSel.length) {
      await Swal.fire({
        icon: "info",
        title: "Falta seleccionar",
        text: "Elige al menos un servicio.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }
    if (!empleadaId) {
      await Swal.fire({
        icon: "info",
        title: "Falta seleccionar",
        text: "Elige una estilista disponible para esos servicios.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }
    if (!fecha) {
      await Swal.fire({
        icon: "info",
        title: "Falta la fecha",
        text: "Selecciona el día de tu cita.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }
    if (!horario) {
      await Swal.fire({
        icon: "info",
        title: "Horario",
        text: "Elige una hora disponible o cambia la fecha: ese día el salón puede estar cerrado.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }

    const emp = empleadasApi.find((e) => String(e.id) === String(empleadaId));
    const nombreEstilista = emp ? nombreEmpleada(emp) : "—";
    const nombresServicios = serviciosSel
      .map((id) => serviciosApi.find((s) => s.id === id)?.nombre)
      .filter(Boolean)
      .join(", ");
    const fechaLegible = (() => {
      const d = new Date(`${fecha}T12:00:00`);
      return Number.isNaN(d.getTime())
        ? fecha
        : d.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          });
    })();

    const confirmar = await Swal.fire({
      icon: "question",
      title: "¿Confirmar reserva?",
      html: `
        <div style="text-align:left;font-size:0.95rem;line-height:1.55;color:#334155;">
          <p style="margin:0 0 10px;"><strong>Estilista:</strong> ${escapeHtml(nombreEstilista)}</p>
          <p style="margin:0 0 10px;"><strong>Servicios:</strong> ${escapeHtml(nombresServicios)}</p>
          <p style="margin:0 0 10px;"><strong>Fecha:</strong> ${escapeHtml(fechaLegible)}</p>
          <p style="margin:0;"><strong>Hora:</strong> ${escapeHtml(horario)}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, reservar",
      cancelButtonText: "Volver",
      confirmButtonColor: COLORS.navy,
      cancelButtonColor: COLORS.muted,
      focusCancel: false
    });

    if (!confirmar.isConfirmed) {
      return;
    }

    try {
      setGuardando(true);
      const { data } = await axios.post(
        `${API_URL}/api/citas`,
        {
          empleadaId: Number(empleadaId),
          fecha,
          horaInicio: horario,
          servicios: serviciosSel.map(Number)
        },
        {
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          barberHeadline: "Apartando servicio",
          barberMessage: "Reservando tu cita en el sistema…"
        }
      );
      const okMsg = data?.message || "Cita creada correctamente.";
      await runWithOverlay(
        () => new Promise((resolve) => setTimeout(resolve, 420)),
        okMsg,
        { headline: "¡Listo!", minMs: 720 }
      );
      await cargarCitas(true);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo crear la cita.";
      await Swal.fire({
        icon: "error",
        title: "No se pudo reservar",
        text: msg,
        confirmButtonColor: COLORS.navy
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = async (citaId) => {
    if (!citaId) return;
    const cita = citasProximas.find((c) => String(c.id) === String(citaId));
    const resumen = cita?.serviciosLabel || "esta cita";

    const ok = await Swal.fire({
      icon: "question",
      title: "¿Cancelar esta cita?",
      text: `Se cancelará: ${resumen}`,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: COLORS.navy,
      cancelButtonColor: COLORS.muted
    });
    if (!ok.isConfirmed) return;

    try {
      setCancelandoId(citaId);
      await axios.patch(
        `${API_URL}/api/cliente/citas/${citaId}/cancelar`,
        {},
        {
          headers: authHeaders(),
          barberHeadline: "Cancelando",
          barberMessage: "Actualizando el estado de tu cita…"
        }
      );
      await runWithOverlay(
        () => new Promise((resolve) => setTimeout(resolve, 380)),
        "Tu agenda se ha actualizado.",
        { headline: "Cita cancelada", minMs: 700 }
      );
      await cargarCitas(true);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cancelar.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonColor: COLORS.navy
      });
    } finally {
      setCancelandoId(null);
    }
  };

  return (
    <Box sx={{ bgcolor: "transparent", minHeight: "100%" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 1.5 }}>
        <Typography
          component="h1"
          sx={{
            color: COLORS.black,
            fontWeight: 700,
            fontSize: { xs: "1.85rem", sm: "2.125rem" },
            letterSpacing: "-0.02em",
            m: 0
          }}
        >
          Mis Citas
        </Typography>
        <BarberPole size={42} width={11} sx={{ display: { xs: "none", sm: "flex" } }} />
      </Box>
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={7} sx={{ display: "flex" }}>
          <Card elevation={0} sx={{ ...cardSx, width: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography
                sx={{
                  color: COLORS.navy,
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  mb: 2.5
                }}
              >
                Reservar servicio
              </Typography>

              {cargandoCatalogo ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress sx={{ color: COLORS.navy }} />
                </Box>
              ) : (
                <>
                  <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                    <InputLabel id="mis-citas-servicios-label">Servicios</InputLabel>
                    <Select
                      labelId="mis-citas-servicios-label"
                      multiple
                      value={serviciosSel}
                      onChange={(e) => {
                        const v = e.target.value;
                        setServiciosSel(
                          typeof v === "string" ? v.split(",").map(Number) : v.map(Number)
                        );
                      }}
                      input={<OutlinedInput label="Servicios" sx={{ borderRadius: "12px" }} />}
                      renderValue={(selected) =>
                        selected
                          .map((id) => serviciosApi.find((s) => s.id === id)?.nombre || id)
                          .join(", ")
                      }
                      sx={{
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border }
                      }}
                    >
                      {serviciosApi.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ mx: 0 }}>
                      Elige primero los servicios; solo verás estilistas que los ofrecen.
                    </FormHelperText>
                  </FormControl>

                  <FormControl
                    fullWidth
                    size="small"
                    sx={{ mb: 2.5 }}
                    disabled={serviciosSel.length === 0}
                  >
                    <InputLabel id="mis-citas-empleada-label">Estilista</InputLabel>
                    <Select
                      labelId="mis-citas-empleada-label"
                      value={empleadaId}
                      label="Estilista"
                      disabled={
                        serviciosSel.length === 0 ||
                        cargandoEstilistas ||
                        (empleadasApi.length === 0 && !cargandoEstilistas)
                      }
                      onChange={(e) => setEmpleadaId(e.target.value)}
                      sx={{
                        borderRadius: "12px",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border }
                      }}
                    >
                      <MenuItem value="">
                        <em>Selecciona…</em>
                      </MenuItem>
                      {empleadasApi.map((e) => (
                        <MenuItem key={e.id} value={String(e.id)}>
                          {nombreEmpleada(e)}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ mx: 0 }}>
                      {serviciosSel.length === 0
                        ? "Selecciona al menos un servicio."
                        : cargandoEstilistas
                          ? "Cargando estilistas…"
                          : empleadasApi.length === 0
                            ? "Ninguna estilista cubre todos los servicios elegidos."
                            : "Solo estilistas asignadas a esos servicios en el salón."}
                    </FormHelperText>
                  </FormControl>

                  <TextField
                    fullWidth
                    size="small"
                    label="Fecha"
                    type="date"
                    value={fecha}
                    onChange={handleFechaChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      mb: 2.5,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: COLORS.border }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <CalendarTodayOutlined sx={{ color: COLORS.muted, fontSize: 22 }} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Typography
                    sx={{
                      color: COLORS.black,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      mb: 1.5
                    }}
                  >
                    Horario disponible
                  </Typography>
                  {!fecha ? (
                    <Typography sx={{ color: COLORS.muted, fontSize: "0.9rem", mb: 3 }}>
                      Selecciona una fecha para ver las horas según el horario de atención del salón.
                    </Typography>
                  ) : diasHorarioNegocio.length === 0 ? (
                    <Typography sx={{ color: COLORS.muted, fontSize: "0.9rem", mb: 3 }}>
                      No se pudo cargar el horario del salón. Intenta de nuevo más tarde.
                    </Typography>
                  ) : horariosDisponibles.length === 0 ? (
                    <Typography sx={{ color: COLORS.muted, fontSize: "0.9rem", mb: 3 }}>
                      Este día el salón no tiene atención. Elige otra fecha.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                      {horariosDisponibles.map((h) => {
                        const selected = horario === h;
                        return (
                          <Button
                            key={h}
                            onClick={() => setHorario(h)}
                            variant="outlined"
                            sx={{
                              minWidth: 72,
                              py: 0.75,
                              px: 1.5,
                              borderRadius: "10px",
                              textTransform: "none",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              borderColor: selected ? COLORS.navy : COLORS.border,
                              color: selected ? COLORS.navy : COLORS.black,
                              bgcolor: selected ? "rgba(30, 58, 90, 0.08)" : "transparent",
                              "&:hover": {
                                borderColor: COLORS.navy,
                                bgcolor: "rgba(30, 58, 90, 0.06)"
                              }
                            }}
                          >
                            {h}
                          </Button>
                        );
                      })}
                    </Box>
                  )}
                  {fecha &&
                    diasHorarioNegocio.length > 0 &&
                    horariosDisponibles.length > 0 && (
                      <Typography
                        sx={{
                          color: COLORS.muted,
                          fontSize: "0.8rem",
                          mb: 3,
                          display: "block"
                        }}
                      >
                        Horarios en punto según el perfil del salón (incluye la hora de cierre como último
                        turno disponible).
                      </Typography>
                    )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={guardando}
                    onClick={handleReservar}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.35,
                      borderRadius: "12px",
                      bgcolor: COLORS.navy,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#172f4a", boxShadow: "none" }
                    }}
                  >
                    {guardando ? "Reservando…" : "Reservar cita"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: "flex",
            alignSelf: { md: "flex-start" }
          }}
        >
          <Card
            elevation={0}
            sx={{
              ...cardSx,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "visible"
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2.5, sm: 3 },
                pb: { xs: 3, sm: 3.5 },
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                minHeight: 0,
                overflow: "visible",
                "&:last-child": { pb: { xs: 3, sm: 3.5 } }
              }}
            >
              <Typography
                sx={{
                  color: COLORS.black,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  mb: 0.5,
                  flexShrink: 0
                }}
              >
                Tus próximas citas
              </Typography>
              {!cargandoCitas && citasProximas.length > 0 && (
                <Typography sx={{ color: COLORS.muted, fontSize: "0.8rem", mb: 2 }}>
                  Tienes {citasProximas.length}{" "}
                  {citasProximas.length === 1 ? "cita reservada" : "citas reservadas"}.
                </Typography>
              )}

              {cargandoCitas ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 4,
                    flex: "1 1 auto",
                    minHeight: 120
                  }}
                >
                  <CircularProgress size={32} sx={{ color: COLORS.navy }} />
                </Box>
              ) : citasProximas.length === 0 ? (
                <Typography sx={{ color: COLORS.muted, lineHeight: 1.6, mb: 1 }}>
                  No tienes citas próximas. Reserva desde el formulario.
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ width: "100%", mb: 1 }}>
                  {citasProximas.map((cita, idx) => {
                    const cancelandoEsta = cancelandoId != null && String(cancelandoId) === String(cita.id);
                    return (
                      <Card
                        key={cita.id}
                        elevation={0}
                        sx={{
                          borderRadius: "14px",
                          border: `1px solid ${COLORS.border}`,
                          bgcolor: "#FAFBFC",
                          overflow: "visible"
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Typography
                            sx={{
                              color: COLORS.navy,
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              mb: 1.25
                            }}
                          >
                            Cita {idx + 1}
                            {idx === 0 ? " · la más próxima" : ""}
                          </Typography>
                          <Typography sx={{ color: COLORS.muted, fontSize: "0.8rem", mb: 0.25 }}>
                            Servicio
                          </Typography>
                          <Typography sx={{ color: COLORS.black, fontWeight: 600, mb: 1.5 }}>
                            {cita.serviciosLabel || "—"}
                          </Typography>
                          <Typography sx={{ color: COLORS.muted, fontSize: "0.8rem", mb: 0.25 }}>
                            Fecha y hora
                          </Typography>
                          <Typography sx={{ color: COLORS.black, fontWeight: 600, mb: 0.25 }}>
                            {formatFechaCita(cita.horaInicio)}
                          </Typography>
                          <Typography sx={{ color: COLORS.black, fontWeight: 600, mb: 1.5 }}>
                            {formatHoraCita(cita.horaInicio)}
                          </Typography>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={cancelandoEsta || cancelandoId != null}
                            onClick={() => handleCancelar(cita.id)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              py: 1,
                              borderRadius: "10px",
                              bgcolor: COLORS.gold,
                              color: "#FFFFFF",
                              boxShadow: "none",
                              "&:hover": { bgcolor: "#c49a2e", boxShadow: "none" },
                              "&.Mui-disabled": {
                                bgcolor: `${COLORS.border}`,
                                color: COLORS.muted
                              }
                            }}
                          >
                            {cancelandoEsta ? "Cancelando…" : "Cancelar esta cita"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Typography
            sx={{
              color: COLORS.black,
              fontWeight: 700,
              fontSize: "1.05rem",
              mb: 2
            }}
          >
            Promociones
          </Typography>
          <Grid container spacing={2}>
            {PROMOCIONES.map((p) => (
              <Grid item xs={12} sm={4} key={p.titulo}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    bgcolor: COLORS.navy,
                    boxShadow: "0 10px 28px rgba(30, 58, 90, 0.25)",
                    border: "none"
                  }}
                >
                  <Box sx={{ height: 4, bgcolor: COLORS.gold }} />
                  <CardContent sx={{ py: 2.5, px: 2.5 }}>
                    <Typography
                      sx={{
                        color: COLORS.gold,
                        fontWeight: 800,
                        fontSize: "1.25rem",
                        mb: 0.75
                      }}
                    >
                      {p.titulo}
                    </Typography>
                    <Typography sx={{ color: "#FFFFFF", fontSize: "0.95rem", fontWeight: 500 }}>
                      {p.subtitulo}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MisCitasCliente;
