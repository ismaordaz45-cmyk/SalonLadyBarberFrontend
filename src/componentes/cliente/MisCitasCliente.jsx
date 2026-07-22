import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api";
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
  Typography,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  Avatar
} from "@mui/material";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import BarberPole from "../compartidos/BarberPole";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const COLORS = {
  navy: "#1E3A5A",
  black: "#000000",
  gold: "#D4AF37",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  muted: "#64748B",
  blue: "#2563EB",
  grey: "#94A3B8",
  goldConfirm: "#D4AF37"
};

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

const cardSx = {
  borderRadius: "16px",
  bgcolor: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)"
};

function getMinFechaReserva() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  let habiles = 0;
  const cursor = new Date(base);
  while (habiles < 2) {
    cursor.setDate(cursor.getDate() + 1);
    const wd = cursor.getDay();
    if (wd !== 0 && wd !== 6) habiles += 1;
  }
  const y = cursor.getFullYear();
  const m = String(cursor.getMonth() + 1).padStart(2, "0");
  const d = String(cursor.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

// Subcomponente temporizador para citas apartadas en la lista de reservas
const CitaApartadaTimer = ({ creadoEn, onExpire }) => {
  const getRemainingSeconds = useCallback(() => {
    if (!creadoEn) return 0;
    const elapsed = Math.floor((Date.now() - new Date(creadoEn).getTime()) / 1000);
    return Math.max(0, 1800 - elapsed); // 30 minutos = 1800s
  }, [creadoEn]);

  const [secLeft, setSecLeft] = useState(getRemainingSeconds());

  useEffect(() => {
    setSecLeft(getRemainingSeconds());
    const interval = setInterval(() => {
      const rem = getRemainingSeconds();
      setSecLeft(rem);
      if (rem <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [creadoEn, getRemainingSeconds, onExpire]);

  if (secLeft <= 0) {
    return (
      <Typography color="error" variant="caption" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
        <AccessTimeRounded sx={{ fontSize: 14 }} /> Expirado
      </Typography>
    );
  }

  const minutes = Math.floor(secLeft / 60);
  const seconds = secLeft % 60;
  return (
    <Typography color="error" variant="caption" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5 }}>
      <AccessTimeRounded sx={{ fontSize: 14 }} /> Pagar en: {minutes}:{String(seconds).padStart(2, "0")}
    </Typography>
  );
};

function MisCitasCliente() {
  const [searchParams] = useSearchParams();
  const { runWithOverlay } = useBarberActionOverlay();

  // Estados Generales
  const [tabIndex, setTabIndex] = useState(0); // 0 = Agendar Cita, 1 = Mis Reservas Activas
  const [activeStep, setActiveStep] = useState(0); // Stepper: 0, 1, 2

  // Catálogos e Informacion de la BD
  const [serviciosApi, setServiciosApi] = useState([]);
  const [diasHorarioNegocio, setDiasHorarioNegocio] = useState([]);
  const [empleadasApi, setEmpleadasApi] = useState([]);
  const [citasApi, setCitasApi] = useState([]);
  const [ocupacionApi, setOcupacionApi] = useState([]);

  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [cargandoEstilistas, setCargandoEstilistas] = useState(false);
  const [cargandoCitas, setCargandoCitas] = useState(true);
  const [cargandoOcupacion, setCargandoOcupacion] = useState(false);

  // Selecciones del cliente (Wizard)
  const [serviciosSel, setServiciosSel] = useState([]);
  const [empleadaId, setEmpleadaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [citaCreadaId, setCitaCreadaId] = useState("");
  const [citaCreadaTimestamp, setCitaCreadaTimestamp] = useState(null);
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  // Temporizador y Estados Auxiliares
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos de apartado
  const [guardando, setGuardando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);

  // Parámetro preseleccionado de catálogo
  const preselectedServiceId = searchParams.get("preselectedServiceId");

  // --- Cargar Citas del Cliente ---
  const cargarCitas = useCallback(async (silent = false) => {
    try {
      if (!silent) setCargandoCitas(true);
      const reqCfg = {};
      if (!silent) {
        reqCfg.barberHeadline = "Mis citas";
        reqCfg.barberMessage = "Cargando tus citas…";
      } else {
        reqCfg.barberOverlay = false;
      }
      const { data } = await api.get("/api/cliente/citas", reqCfg);
      setCitasApi(Array.isArray(data) ? data : []);
    } catch {
      setCitasApi([]);
    } finally {
      setCargandoCitas(false);
    }
  }, []);

  // --- Cargar Catálogos Iniciales ---
  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setCargandoCatalogo(true);
        const [srvRes, horRes] = await Promise.all([
          api.get("/api/servicios", {
            barberHeadline: "Catálogo",
            barberMessage: "Cargando servicios…"
          }),
          api
            .get("/api/horario-negocio", {
              barberHeadline: "Horario",
              barberMessage: "Cargando horario del salón…"
            })
            .catch(() => ({ data: null }))
        ]);
        if (!cancel) {
          setServiciosApi(Array.isArray(srvRes.data) ? srvRes.data : []);
          const dias = horRes?.data?.dias;
          setDiasHorarioNegocio(Array.isArray(dias) ? dias : []);

          // Manejar servicio pre-seleccionado
          if (preselectedServiceId) {
            setServiciosSel([Number(preselectedServiceId)]);
            setActiveStep(0);
          }
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
  }, [preselectedServiceId]);

  // --- Cargar Citas en Mount ---
  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  // --- Filtrar Estilistas por Servicios elegidos ---
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
        const results = await Promise.all(
          serviciosSel.map((sid) =>
            api.get(`/api/empleadas/por-servicio/${Number(sid)}`)
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

  // --- Cargar Ocupación en tiempo real ---
  const cargarOcupacion = useCallback(async () => {
    if (!fecha || !empleadaId) {
      setOcupacionApi([]);
      return;
    }
    try {
      setCargandoOcupacion(true);
      const { data } = await api.get(
        `/api/citas/ocupacion?fecha=${fecha}&empleadaId=${empleadaId}`
      );
      setOcupacionApi(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setOcupacionApi([]);
    } finally {
      setCargandoOcupacion(false);
    }
  }, [fecha, empleadaId]);

  useEffect(() => {
    cargarOcupacion();
  }, [cargarOcupacion]);

  // --- Cálculos de Resumen ---
  const duracionYPrecioTotal = useMemo(() => {
    let duracion = 0;
    let precio = 0;
    serviciosSel.forEach((id) => {
      const s = serviciosApi.find((srv) => srv.id === id);
      if (s) {
        duracion += Number(s.duracionMinutos) || 0;
        precio += Number(s.precio) || 0;
      }
    });
    return { duracion, precio };
  }, [serviciosSel, serviciosApi]);

  // --- Calcular slots y sus estados de color ---
  const slotsConEstado = useMemo(() => {
    if (!fecha || diasHorarioNegocio.length === 0) return [];
    const clave = fechaYmdToDiaSemanaBackend(fecha);
    if (!clave) return [];
    const dia = diasHorarioNegocio.find((d) => d.diaSemana === clave);
    if (!dia || dia.activo === false || !dia.horaApertura || !dia.horaCierre) {
      return [];
    }

    const slots = construirSlotsCadaHora(dia.horaApertura, dia.horaCierre);
    const durTotal = duracionYPrecioTotal.duracion;

    return slots.map((hStr) => {
      const parts = hStr.split(":");
      const slotMin = Number(parts[0]) * 60 + Number(parts[1]);
      const slotEndMin = slotMin + durTotal;

      let estadoSlot = "disponible"; // disponible, apartado, confirmado
      let citaIdConflicto = null;

      for (const cita of ocupacionApi) {
        const dInicio = new Date(cita.horaInicio);
        const dFin = new Date(cita.horaFin);
        const cStartMin = dInicio.getHours() * 60 + dInicio.getMinutes();
        const cEndMin = dFin.getHours() * 60 + dFin.getMinutes();

        // Verificar traslape: StartA < EndB && EndA > StartB
        if (slotMin < cEndMin && slotEndMin > cStartMin) {
          citaIdConflicto = cita.id;
          if (cita.estado === "APARTADA") {
            estadoSlot = "apartado";
          } else {
            estadoSlot = "confirmado";
          }
          break;
        }
      }

      return {
        hora: hStr,
        estado: estadoSlot,
        citaId: citaIdConflicto
      };
    });
  }, [fecha, diasHorarioNegocio, ocupacionApi, duracionYPrecioTotal.duracion]);

  // --- Temporizador del Apartado ---
  useEffect(() => {
    if (activeStep !== 2 || !citaCreadaTimestamp) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - citaCreadaTimestamp) / 1000);
      const remaining = 1800 - elapsed; // 30 minutos = 1800s

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        Swal.fire({
          icon: "warning",
          title: "Apartado Expirado",
          text: "El tiempo límite de 30 minutos para confirmar tu pago ha expirado. Por favor reserva nuevamente.",
          confirmButtonColor: COLORS.navy
        }).then(() => {
          setActiveStep(1);
          setHorario("");
          setCitaCreadaId("");
          setCitaCreadaTimestamp(null);
        });
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStep, citaCreadaTimestamp]);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  };

  // --- Acciones de Stepper ---
  const handleNextStep1 = () => {
    if (serviciosSel.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Selecciona un servicio",
        text: "Por favor elige al menos un servicio del catálogo para continuar.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }
    setActiveStep(1);
  };

  const handleNextStep2 = async () => {
    if (!fecha || !empleadaId || !horario) {
      Swal.fire({
        icon: "info",
        title: "Datos incompletos",
        text: "Asegúrate de haber seleccionado una estilista, la fecha y un horario disponible (en azul).",
        confirmButtonColor: COLORS.navy
      });
      return;
    }

    // Comprobar si el horario seleccionado está libre
    const slot = slotsConEstado.find((s) => s.hora === horario);
    if (!slot || slot.estado !== "disponible") {
      Swal.fire({
        icon: "error",
        title: "Horario no disponible",
        text: "El horario elegido ya se encuentra apartado o confirmado. Elige otro.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }

    try {
      setGuardando(true);
      // Crear la cita en estado 'APARTADA' para bloquear el horario en el servidor
      const { data } = await api.post(
        "/api/citas",
        {
          empleadaId: Number(empleadaId),
          fecha,
          horaInicio: horario,
          servicios: serviciosSel.map(Number)
        },
        {
          barberHeadline: "Apartando horario",
          barberMessage: "Bloqueando tu horario reservado en el sistema…"
        }
      );

      setCitaCreadaId(data.citaId);
      setCitaCreadaTimestamp(Date.now());
      setTimeLeft(1800);
      setActiveStep(2);
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "No se pudo apartar el horario.";
      Swal.fire({
        icon: "error",
        title: "Conflicto de reservación",
        text: msg,
        confirmButtonColor: COLORS.navy
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 2) {
      Swal.fire({
        icon: "warning",
        title: "¿Volver al paso anterior?",
        text: "Si regresas, perderás tu apartado actual sobre este horario.",
        showCancelButton: true,
        confirmButtonText: "Sí, regresar",
        cancelButtonText: "Mantener apartado",
        confirmButtonColor: COLORS.navy,
        cancelButtonColor: COLORS.muted
      }).then((result) => {
        if (result.isConfirmed) {
          // Cancelar borrador/apartado en backend
          api.delete(`/api/citas/${citaCreadaId}`).catch(() => {});
          setCitaCreadaId("");
          setCitaCreadaTimestamp(null);
          setActiveStep(1);
        }
      });
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  // --- Proceder al Pago del 50% ---
  const handlePagarAnticipo = async () => {
    if (!terminosAceptados) {
      Swal.fire({
        icon: "info",
        title: "Políticas requeridas",
        text: "Debes aceptar las políticas de reservación y abono para continuar.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }

    try {
      setGuardando(true);
      const { data } = await api.post(
        "/api/mercado-pago/crear-preferencia-cita",
        { citaId: citaCreadaId },
        {
          barberHeadline: "Conectando con Mercado Pago",
          barberMessage: "Generando link de cobro seguro..."
        }
      );

      // Redirigir al Checkout de Mercado Pago
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se pudo obtener el punto de inicio de pago.");
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error de Checkout",
        text: e?.response?.data?.error || "Ocurrió un problema al procesar el enlace de cobro.",
        confirmButtonColor: COLORS.navy
      });
    } finally {
      setGuardando(false);
    }
  };

  // --- Apartar y pagar más tarde ---
  const handleApartarMasTarde = () => {
    if (!terminosAceptados) {
      Swal.fire({
        icon: "info",
        title: "Políticas requeridas",
        text: "Debes aceptar las políticas de reservación y abono para continuar.",
        confirmButtonColor: COLORS.navy
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "¡Horario Apartado!",
      text: "Tu cita se guardó en la sección 'Tus Reservas'. Recuerda liquidar el 50% antes de 30 minutos para evitar que se libere.",
      confirmButtonColor: COLORS.navy
    }).then(() => {
      // Limpiar wizard
      setActiveStep(0);
      setServiciosSel([]);
      setEmpleadaId("");
      setFecha("");
      setHorario("");
      setCitaCreadaId("");
      setCitaCreadaTimestamp(null);
      setTerminosAceptados(false);
      
      // Mover a la pestaña de reservas
      setTabIndex(1);
      cargarCitas(true);
    });
  };

  // --- Pagar desde la lista de reservas ---
  const handlePagarReservaLista = async (citaId) => {
    try {
      setGuardando(true);
      const { data } = await api.post(
        "/api/mercado-pago/crear-preferencia-cita",
        { citaId },
        {
          barberHeadline: "Conectando con Mercado Pago",
          barberMessage: "Generando link de cobro seguro..."
        }
      );

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se pudo obtener el punto de inicio de pago.");
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error de Checkout",
        text: e?.response?.data?.error || "Ocurrió un problema al procesar el enlace de cobro.",
        confirmButtonColor: COLORS.navy
      });
    } finally {
      setGuardando(false);
    }
  };

  // --- Descargar PDF desde la Lista de Reservas ---
  const handleDescargarComprobante = async (citaId) => {
    try {
      // 1. Obtener detalles de la cita con servicios
      const { data: cita } = await api.get(
        `/api/citas/${citaId}`,
        {
          barberHeadline: "Comprobante",
          barberMessage: "Generando tu comprobante de pago..."
        }
      );

      // 2. Generar PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter"
      });

      const total = Number(cita.precioFinal) || 0;
      const anticipo = total / 2;
      const restante = total - anticipo;

      // Colores corporativos (Lady Barber Theme: Navy & Gold)
      const navyColor = [30, 58, 90]; // #1E3A5A
      const goldColor = [212, 175, 55]; // #D4AF37

      // --- Header ---
      doc.setFillColor(...navyColor);
      doc.rect(0, 0, 216, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SALÓN LADY BARBER", 15, 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Comprobante de Anticipo de Reservación", 15, 26);

      doc.setTextColor(...goldColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("50% PAGADO", 160, 20);

      // --- Detalles Cita ---
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(11);
      
      let y = 48;

      doc.setFont("helvetica", "bold");
      doc.text("DATOS DE LA RESERVACIÓN", 15, y);
      doc.setDrawColor(229, 231, 235);
      doc.line(15, y + 2, 201, y + 2);
      
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Folio Cita (ID):", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(cita.id), 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Cliente:", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(cita.clienteNombre || "Cliente Registrado", 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Estilista:", 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(cita.empleadaNombre || "Sin asignar", 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Fecha:", 15, y);
      doc.setFont("helvetica", "normal");
      const f = new Date(cita.fecha ? cita.fecha.replace(/-/g, "/") : Date.now()).toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(f, 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Horario:", 15, y);
      doc.setFont("helvetica", "normal");
      const hInicio = new Date(cita.horaInicio).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit', hour12: true });
      const hFin = new Date(cita.horaFin).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit', hour12: true });
      doc.text(`${hInicio} a ${hFin}`, 50, y);

      y += 12;

      // --- Tabla de Servicios ---
      doc.setFont("helvetica", "bold");
      doc.text("SERVICIOS RESERVADOS", 15, y);
      y += 4;

      const tableHeaders = [["Servicio", "Duración Aprox.", "Costo"]];
      const tableRows = (cita.servicios || []).map(s => [
        s.nombre || "Servicio",
        `${s.duracionMinutos || 0} min`,
        `$${(Number(s.precio) || 0).toFixed(2)} MXN`
      ]);

      autoTable(doc, {
        startY: y,
        head: tableHeaders,
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: navyColor, textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40, halign: "center" },
          2: { cellWidth: 46, halign: "right" }
        }
      });

      y = doc.previousAutoTable.finalY + 12;

      // --- Desglose de Pago ---
      doc.setDrawColor(229, 231, 235);
      doc.line(120, y, 201, y);

      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Total Servicios:", 120, y);
      doc.setFont("helvetica", "normal");
      doc.text(`$${total.toFixed(2)} MXN`, 201, y, { align: "right" });

      y += 6;
      doc.setFillColor(244, 244, 245);
      doc.rect(118, y - 4, 85, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Anticipo Pagado (50%):", 120, y);
      doc.text(`$${anticipo.toFixed(2)} MXN`, 201, y, { align: "right" });

      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Resta por Liquidar:", 120, y);
      doc.setFont("helvetica", "normal");
      doc.text(`$${restante.toFixed(2)} MXN`, 201, y, { align: "right" });

      y += 18;

      // --- Nota Aclaratoria Box ---
      doc.setFillColor(254, 252, 242);
      doc.setDrawColor(...goldColor);
      doc.setLineWidth(0.5);
      doc.rect(15, y, 186, 28, "FD");

      doc.setTextColor(...navyColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("POLÍTICA Y RECOMENDACIÓN DE RESERVACIÓN:", 20, y + 6);

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      const lines = [
        "- El abono del 50% realizado como anticipo para asegurar tu lugar NO TIENE DEVOLUCIÓN.",
        "- Se recomienda asistir 20 minutos antes de la hora programada a tu cita para evitar contratiempos.",
        "¡Gracias por confiar en la barbería y permitirnos consentirte!"
      ];

      doc.text(lines[0], 20, y + 12);
      doc.text(lines[1], 20, y + 17);
      doc.text(lines[2], 20, y + 22);

      // --- Footer ---
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Salón Lady Barber - Generado digitalmente de forma segura", 108, 265, { align: "center" });

      doc.save(`Comprobante_Cita_${citaId.slice(0, 8)}.pdf`);
    } catch (e) {
      console.error("Error generating PDF:", e);
      const detail = e.response?.data?.error || e.message || e;
      Swal.fire({
        icon: "error",
        title: "Error de descarga",
        text: `No pudimos generar el comprobante PDF. Detalle: ${detail}`,
        confirmButtonColor: COLORS.navy
      });
    }
  };

  // --- Cancelar Citas en la lista de reservas (Frees the slot immediately) ---
  const handleCancelarCitaLista = async (citaId, label) => {
    const ok = await Swal.fire({
      icon: "question",
      title: "¿Cancelar reservación?",
      text: `¿Seguro que deseas cancelar tu cita para: ${label || "esta cita"}? Al cancelar, el horario quedará inmediatamente disponible para otros clientes.`,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: COLORS.navy,
      cancelButtonColor: COLORS.muted
    });
    if (!ok.isConfirmed) return;

    try {
      setCancelandoId(citaId);
      await api.patch(`/api/cliente/citas/${citaId}/cancelar`);
      await runWithOverlay(
        () => new Promise((resolve) => setTimeout(resolve, 300)),
        "Tu cita ha sido cancelada y el horario liberado.",
        { headline: "Cancelado", minMs: 500 }
      );
      await cargarCitas(true);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.response?.data?.error || "No se pudo cancelar.",
        confirmButtonColor: COLORS.navy
      });
    } finally {
      setCancelandoId(null);
    }
  };

  const getStatusBadgeStyles = (estado) => {
    switch (estado) {
      case "CONFIRMADA":
        return { bg: "rgba(212, 175, 55, 0.15)", color: COLORS.goldConfirm, label: "Confirmada" };
      case "APARTADA":
        return { bg: "rgba(37, 99, 235, 0.12)", color: COLORS.blue, label: "Apartada" };
      case "COMPLETADA":
        return { bg: "rgba(34, 197, 94, 0.12)", color: "#166534", label: "Completada" };
      case "CANCELADA":
        return { bg: "rgba(239, 68, 68, 0.12)", color: "#991B1B", label: "Cancelada" };
      default:
        return { bg: "rgba(148, 163, 184, 0.15)", color: COLORS.muted, label: estado };
    }
  };

  const nombreEstilista = (e) =>
    [e.nombre, e.apellidoPaterno, e.apellidoMaterno].filter(Boolean).join(" ").trim() ||
    `Estilista #${e.id}`;

  return (
    <Box sx={{ bgcolor: "transparent", minHeight: "100%", pb: 4 }}>
      {/* Título */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography
          component="h1"
          sx={{
            color: COLORS.black,
            fontWeight: 900,
            fontSize: { xs: "1.85rem", sm: "2.25rem" },
            letterSpacing: "-0.02em",
            m: 0
          }}
        >
          Mis Citas y Reservas
        </Typography>
        <BarberPole size={42} width={11} sx={{ display: { xs: "none", sm: "flex" } }} />
      </Box>

      {/* Tabs Principales */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 800,
              textTransform: "none",
              fontSize: "0.95rem",
              color: COLORS.muted
            },
            "& .Mui-selected": { color: `${COLORS.navy} !important` },
            "& .MuiTabs-indicator": { bgcolor: COLORS.navy }
          }}
        >
          <Tab label="Agendar Nueva Cita" />
          <Tab label={`Tus Reservas (${citasApi.length})`} />
        </Tabs>
      </Box>

      {/* ==============================================================
          TAB 1: WIZARD DE RESERVACIÓN EN 3 PASOS
          ============================================================== */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Stepper Premium */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: "18px", border: `1px solid ${COLORS.border}` }}>
              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  "& .MuiStepIcon-root.Mui-active": { color: COLORS.navy },
                  "& .MuiStepIcon-root.Mui-completed": { color: COLORS.gold },
                  "& .MuiStepLabel-label.Mui-active": { fontWeight: 800, color: COLORS.navy },
                  "& .MuiStepLabel-label.Mui-completed": { fontWeight: 700, color: COLORS.gold }
                }}
              >
                <Step>
                  <StepLabel>1. Selecciona tu servicio</StepLabel>
                </Step>
                <Step>
                  <StepLabel>2. Elige fecha y hora</StepLabel>
                </Step>
                <Step>
                  <StepLabel>3. Confirma tu cita</StepLabel>
                </Step>
              </Stepper>
            </Paper>
          </Grid>

          {/* Área de Pasos */}
          <Grid item xs={12} md={8}>
            {cargandoCatalogo ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: COLORS.navy }} />
              </Box>
            ) : (
              <Box>
                {/* --- PASO 1: SELECCIÓN DE SERVICIOS --- */}
                {activeStep === 0 && (
                  <Paper elevation={0} sx={{ p: 4, ...cardSx }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.navy, mb: 1.5 }}>
                      Paso 1: Elige uno o más servicios
                    </Typography>
                    <Typography sx={{ color: COLORS.muted, mb: 3, fontSize: "0.9rem" }}>
                      Puedes seleccionar múltiples servicios. El sistema recalculará la duración total y te mostrará los estilistas aptos para realizar todo tu combo.
                    </Typography>

                    <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                      <InputLabel id="reserva-servicios-label">Servicios</InputLabel>
                      <Select
                        labelId="reserva-servicios-label"
                        multiple
                        value={serviciosSel}
                        onChange={(e) => {
                          const v = e.target.value;
                          setServiciosSel(typeof v === "string" ? v.split(",").map(Number) : v.map(Number));
                        }}
                        input={<OutlinedInput label="Servicios" sx={{ borderRadius: "12px" }} />}
                        renderValue={(selected) =>
                          selected.map((id) => serviciosApi.find((s) => s.id === id)?.nombre || id).join(", ")
                        }
                        sx={{ borderRadius: "12px" }}
                      >
                        {serviciosApi.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.nombre} — ${s.precio} ({s.duracionMinutos} min)
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Haz clic sobre los servicios que deseas añadir a tu cita.</FormHelperText>
                    </FormControl>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleNextStep1}
                      disabled={serviciosSel.length === 0}
                      sx={{
                        py: 1.5,
                        borderRadius: "12px",
                        bgcolor: COLORS.navy,
                        fontWeight: 800,
                        textTransform: "none",
                        fontSize: "1rem",
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#152a41", boxShadow: "none" }
                      }}
                    >
                      Siguiente
                    </Button>
                  </Paper>
                )}

                {/* --- PASO 2: SELECCIÓN DE FECHA Y HORARIO --- */}
                {activeStep === 1 && (
                  <Paper elevation={0} sx={{ p: 4, ...cardSx }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.navy, mb: 1 }}>
                      Paso 2: Elige fecha y hora
                    </Typography>
                    <Typography sx={{ color: COLORS.muted, mb: 3, fontSize: "0.9rem" }}>
                      Se requiere un mínimo de 2 días hábiles de anticipación. Los horarios ocupados en tiempo real se mostrarán según el estado de bloqueo.
                    </Typography>

                    {/* Selector de Estilista */}
                    <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                      <InputLabel id="reserva-estilista-label">Estilista disponible</InputLabel>
                      <Select
                        labelId="reserva-estilista-label"
                        value={empleadaId}
                        label="Estilista disponible"
                        onChange={(e) => setEmpleadaId(e.target.value)}
                        sx={{ borderRadius: "12px" }}
                        disabled={cargandoEstilistas || empleadasApi.length === 0}
                      >
                        <MenuItem value="">
                          <em>Selecciona una estilista...</em>
                        </MenuItem>
                        {empleadasApi.map((e) => (
                          <MenuItem key={e.id} value={String(e.id)}>
                            {nombreEstilista(e)} ({e.especialidad || "Estilista"})
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText sx={{ mx: 0 }}>
                        {cargandoEstilistas
                          ? "Cargando estilistas..."
                          : empleadasApi.length === 0
                          ? "No disponemos de estilistas registradas para este combo."
                          : "Sólo se muestran las estilistas capacitadas para los servicios elegidos."}
                      </FormHelperText>
                    </FormControl>

                    {/* Selector de Fecha */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Fecha de la Cita"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinFechaReserva() }}
                      sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px"
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <CalendarTodayOutlined sx={{ color: COLORS.muted, fontSize: 20 }} />
                          </InputAdornment>
                        )
                      }}
                      disabled={!empleadaId}
                    />

                    {/* Selector de Horarios (Grid Color Coded) */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.black, mb: 1.5 }}>
                      Horarios Disponibles
                    </Typography>

                    {!empleadaId || !fecha ? (
                      <Paper elevation={0} sx={{ p: 3, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px dashed rgba(229, 231, 235, 1)", textAlign: "center", mb: 3 }}>
                        <Typography sx={{ color: COLORS.muted, fontSize: "0.85rem" }}>
                          Elige una estilista y una fecha para desplegar los turnos del día.
                        </Typography>
                      </Paper>
                    ) : cargandoOcupacion ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 3, mb: 3 }}>
                        <CircularProgress size={24} sx={{ color: COLORS.navy }} />
                      </Box>
                    ) : slotsConEstado.length === 0 ? (
                      <Typography sx={{ color: COLORS.muted, fontSize: "0.9rem", mb: 3, fontStyle: "italic" }}>
                        El salón está cerrado en este día o no se definió horario. Elige otra fecha.
                      </Typography>
                    ) : (
                      <Box sx={{ mb: 4 }}>
                        <Grid container spacing={1.5}>
                          {slotsConEstado.map((slot) => {
                            const isSel = horario === slot.hora;
                            
                            // Configuración de colores
                            let borderCol = COLORS.border;
                            let textCol = COLORS.black;
                            let bgCol = "transparent";
                            let disabled = false;

                            if (slot.estado === "confirmado") {
                              borderCol = COLORS.goldConfirm;
                              textCol = COLORS.goldConfirm;
                              bgCol = "rgba(212, 175, 55, 0.08)";
                              disabled = true;
                            } else if (slot.estado === "apartado") {
                              borderCol = COLORS.grey;
                              textCol = COLORS.grey;
                              bgCol = "rgba(148, 163, 184, 0.08)";
                              disabled = true;
                            } else {
                              // Disponible (Azul)
                              borderCol = isSel ? COLORS.navy : COLORS.blue;
                              textCol = isSel ? COLORS.navy : COLORS.blue;
                              bgCol = isSel ? "rgba(30, 58, 90, 0.08)" : "transparent";
                            }

                            return (
                              <Grid item xs={6} sm={3} key={slot.hora}>
                                <Button
                                  fullWidth
                                  onClick={() => setHorario(slot.hora)}
                                  variant="outlined"
                                  disabled={disabled}
                                  sx={{
                                    py: 1,
                                    borderRadius: "10px",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    borderColor: borderCol,
                                    color: textCol,
                                    bgcolor: bgCol,
                                    textTransform: "none",
                                    borderWidth: isSel ? "2px" : "1px",
                                    "&:hover": {
                                      borderColor: borderCol,
                                      bgcolor: isSel ? "rgba(30, 58, 90, 0.08)" : "rgba(37, 99, 235, 0.04)"
                                    },
                                    "&.Mui-disabled": {
                                      borderColor: borderCol,
                                      color: textCol,
                                      bgcolor: bgCol
                                    }
                                  }}
                                >
                                  {slot.hora}
                                </Button>
                              </Grid>
                            );
                          })}
                        </Grid>

                        {/* Leyenda de Colores */}
                        <Stack direction="row" spacing={3} sx={{ mt: 3, justifyContent: "center" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: COLORS.blue }} />
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: COLORS.muted }}>Disponible</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: COLORS.grey }} />
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: COLORS.muted }}>Apartado</Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: COLORS.goldConfirm }} />
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: COLORS.muted }}>Confirmado</Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    )}

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        onClick={handleBack}
                        sx={{
                          flex: 1,
                          py: 1.25,
                          borderRadius: "12px",
                          color: COLORS.navy,
                          borderColor: COLORS.navy,
                          fontWeight: 800,
                          textTransform: "none"
                        }}
                      >
                        Atrás
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNextStep2}
                        disabled={!horario || guardando}
                        sx={{
                          flex: 2,
                          py: 1.25,
                          borderRadius: "12px",
                          bgcolor: COLORS.navy,
                          fontWeight: 800,
                          textTransform: "none",
                          boxShadow: "none",
                          "&:hover": { bgcolor: "#152a41", boxShadow: "none" }
                        }}
                      >
                        Apartar Horario
                      </Button>
                    </Stack>
                  </Paper>
                )}

                {/* --- PASO 3: CONFIRMACIÓN Y PAGO DEL 50% --- */}
                {activeStep === 2 && (
                  <Paper elevation={0} sx={{ p: 4, ...cardSx }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.navy, mb: 1 }}>
                      Paso 3: Confirma tu reservación
                    </Typography>
                    <Typography sx={{ color: COLORS.muted, mb: 3, fontSize: "0.9rem" }}>
                      Tu horario está apartado temporalmente. Por favor realiza el pago del anticipo de seguridad (50%) para confirmar definitivamente.
                    </Typography>

                    {/* Cuenta regresiva en pantalla */}
                    <Box
                      sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: "rgba(239, 68, 68, 0.05)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        color: "#B91C1C"
                      }}
                    >
                      <AccessTimeRounded />
                      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        Tiempo restante para pagar y confirmar: {formatTimeLeft()}
                      </Typography>
                    </Box>

                    {/* Desglose de Pago */}
                    <Paper elevation={0} sx={{ p: 3, bgcolor: "#F8FAFC", borderRadius: "14px", border: `1px solid ${COLORS.border}`, mb: 3.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.navy, mb: 2 }}>
                        Resumen de Reservación
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Combo Servicios:</Typography>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, textAlign: "right" }}>
                            {serviciosSel.map(id => serviciosApi.find(s => s.id === id)?.nombre).join(", ")}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Duración Total:</Typography>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>{duracionYPrecioTotal.duracion} minutos</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Estilista:</Typography>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            {empleadasApi.find(e => String(e.id) === String(empleadaId))?.nombre || "Asignada"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Fecha y hora:</Typography>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            {fecha} a las {horario}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.9rem", color: COLORS.black, fontWeight: 700 }}>Costo Total:</Typography>
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 800 }}>${duracionYPrecioTotal.precio.toFixed(2)} MXN</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.9rem", color: "#15803D", fontWeight: 700 }}>Anticipo a pagar hoy (50%):</Typography>
                          <Typography sx={{ fontSize: "0.9rem", color: "#15803D", fontWeight: 900 }}>${(duracionYPrecioTotal.precio / 2).toFixed(2)} MXN</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>Resto a pagar en el salón:</Typography>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>${(duracionYPrecioTotal.precio / 2).toFixed(2)} MXN</Typography>
                        </Box>
                      </Stack>
                    </Paper>

                    {/* Checkbox Políticas */}
                    <Box sx={{ mb: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={terminosAceptados}
                            onChange={(e) => setTerminosAceptados(e.target.checked)}
                            sx={{ color: COLORS.navy, "&.Mui-checked": { color: COLORS.navy } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted, lineHeight: 1.5 }}>
                            Entiendo y acepto que el anticipo del 50% <strong>no tiene devolución</strong> bajo ninguna circunstancia. Me comprometo a llegar <strong>20 minutos antes</strong> de la hora indicada.
                          </Typography>
                        }
                      />
                    </Box>

                    {/* Botones Paso 3 */}
                    <Stack spacing={2} sx={{ mt: 3 }}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleApartarMasTarde}
                          disabled={!terminosAceptados || guardando}
                          sx={{
                            py: 1.25,
                            borderRadius: "12px",
                            color: COLORS.navy,
                            borderColor: COLORS.navy,
                            fontWeight: 800,
                            textTransform: "none",
                            "&.Mui-disabled": { borderColor: COLORS.border, color: COLORS.muted }
                          }}
                        >
                          Apartar y pagar más tarde
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handlePagarAnticipo}
                          disabled={!terminosAceptados || guardando}
                          sx={{
                            py: 1.25,
                            borderRadius: "12px",
                            bgcolor: COLORS.gold,
                            color: "#FFFFFF",
                            fontWeight: 800,
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#c49a2e", boxShadow: "none" },
                            "&.Mui-disabled": { bgcolor: COLORS.border, color: COLORS.muted }
                          }}
                        >
                          Pagar y confirmar cita
                        </Button>
                      </Stack>
                      <Button
                        fullWidth
                        variant="text"
                        onClick={handleBack}
                        sx={{
                          py: 1,
                          color: COLORS.muted,
                          fontWeight: 700,
                          textTransform: "none"
                        }}
                      >
                        Atrás / Cancelar apartado
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Box>
            )}
          </Grid>

          {/* Panel Lateral: Detalle de Selección Actual */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, ...cardSx, bgcolor: "#F8FAFC", position: "sticky", top: 24 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.navy, mb: 2 }}>
                Tu Selección Actual
              </Typography>

              {serviciosSel.length === 0 ? (
                <Typography sx={{ color: COLORS.muted, fontSize: "0.85rem", fontStyle: "italic" }}>
                  Aún no has seleccionado ningún servicio.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: COLORS.muted, fontWeight: 700 }}>SERVICIOS:</Typography>
                    <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                      {serviciosSel.map((id) => {
                        const s = serviciosApi.find((srv) => srv.id === id);
                        return s ? (
                          <Box key={id} sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>{s.nombre}</Typography>
                            <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted }}>${s.precio}</Typography>
                          </Box>
                        ) : null;
                      })}
                    </Stack>
                  </Box>

                  <Divider />

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted, fontWeight: 700 }}>DURACIÓN:</Typography>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 800 }}>{duracionYPrecioTotal.duracion} min (aprox.)</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted, fontWeight: 700 }}>SUBTOTAL:</Typography>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 900, color: COLORS.navy }}>
                      ${duracionYPrecioTotal.precio.toFixed(2)} MXN
                    </Typography>
                  </Box>

                  {fecha && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" sx={{ color: COLORS.muted, fontWeight: 700 }}>DETALLES TURNOS:</Typography>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, mt: 0.5 }}>Fecha: {fecha}</Typography>
                        {horario && (
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>Horario: {horario} (Seleccionado)</Typography>
                        )}
                      </Box>
                    </>
                  )}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ==============================================================
          TAB 2: LISTADO DE RESERVAS Y CITAS ACTIVAS
          ============================================================== */}
      {tabIndex === 1 && (
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, ...cardSx }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.navy, mb: 1 }}>
            Tus próximas citas
          </Typography>
          <Typography sx={{ color: COLORS.muted, mb: 3.5, fontSize: "0.9rem" }}>
            Aquí puedes ver el historial de reservas activas o confirmadas asociadas a tu cuenta. Liquidar reservas apartadas antes de expirar.
          </Typography>

          {cargandoCitas ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={36} sx={{ color: COLORS.navy }} />
            </Box>
          ) : citasApi.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <InfoOutlined sx={{ fontSize: 48, color: COLORS.muted, opacity: 0.5, mb: 2 }} />
              <Typography sx={{ color: COLORS.muted, fontWeight: 700 }}>
                No tienes citas registradas. ¡Agenda una nueva desde la primera pestaña!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {citasApi.map((cita, idx) => {
                const cancelandoEsta = cancelandoId != null && String(cancelandoId) === String(cita.id);
                const badge = getStatusBadgeStyles(cita.estado);

                // Obtener urls de imagenes de servicios adquiridos
                const imagenesServicios = (cita.serviciosImagenes || "")
                  .split(",")
                  .filter(Boolean);

                return (
                  <Grid item xs={12} sm={6} key={cita.id}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: "20px",
                        border: `1px solid ${COLORS.border}`,
                        bgcolor: "#FFFFFF",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.02)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 10px 25px rgba(30, 58, 90, 0.08)",
                          transform: "translateY(-2px)"
                        },
                        position: "relative"
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography sx={{ color: COLORS.navy, fontWeight: 900, fontSize: "0.8rem", letterSpacing: "0.05em" }}>
                            CITA #{idx + 1}
                          </Typography>
                          <Box
                            sx={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              px: 1.5,
                              py: 0.6,
                              borderRadius: "20px",
                              bgcolor: badge.bg,
                              color: badge.color,
                              textTransform: "uppercase",
                              letterSpacing: "0.02em"
                            }}
                          >
                            {badge.label}
                          </Box>
                        </Stack>

                        {/* Fila de Imágenes de Servicios Adquiridos */}
                        <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: "auto", py: 0.5 }}>
                          {imagenesServicios.map((url, imgIdx) => (
                            <Avatar
                              key={imgIdx}
                              src={url}
                              variant="rounded"
                              sx={{
                                width: 48,
                                height: 48,
                                border: `2px solid ${COLORS.navy}`,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                              }}
                            >
                              ✂️
                            </Avatar>
                          ))}
                          {imagenesServicios.length === 0 && (
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: "rgba(30,58,90,0.05)",
                                color: COLORS.navy,
                                border: `1px dashed ${COLORS.border}`
                              }}
                            >
                              ✂️
                            </Avatar>
                          )}
                        </Stack>

                        <Typography sx={{ color: COLORS.muted, fontSize: "0.78rem", mb: 0.25, fontWeight: 700 }}>SERVICIOS:</Typography>
                        <Typography sx={{ color: COLORS.black, fontWeight: 800, mb: 2, fontSize: "0.95rem" }}>
                          {cita.serviciosLabel || "—"}
                        </Typography>

                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography sx={{ color: COLORS.muted, fontSize: "0.75rem", fontWeight: 700 }}>FECHA:</Typography>
                            <Typography sx={{ color: COLORS.black, fontWeight: 800, fontSize: "0.85rem" }}>
                              {formatFechaCita(cita.horaInicio)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography sx={{ color: COLORS.muted, fontSize: "0.75rem", fontWeight: 700 }}>HORARIO:</Typography>
                            <Typography sx={{ color: COLORS.black, fontWeight: 800, fontSize: "0.85rem" }}>
                              {formatHoraCita(cita.horaInicio)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Mostrar temporizador si el estado es APARTADA */}
                        {cita.estado === "APARTADA" && (
                          <Box
                            sx={{
                              p: 1.5,
                              mb: 2,
                              bgcolor: "rgba(239, 68, 68, 0.04)",
                              border: "1px solid rgba(239, 68, 68, 0.15)",
                              borderRadius: "10px"
                            }}
                          >
                            <CitaApartadaTimer creadoEn={cita.creadoEn} onExpire={() => cargarCitas(true)} />
                          </Box>
                        )}

                        {/* Botones de acción según estado */}
                        {cita.estado === "APARTADA" && (
                          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                            <Button
                              variant="outlined"
                              onClick={() => handleCancelarCitaLista(cita.id, cita.serviciosLabel)}
                              disabled={cancelandoEsta || cancelandoId != null || guardando}
                              sx={{
                                flex: 1,
                                py: 1.1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 800,
                                borderColor: "#EF4444",
                                color: "#EF4444",
                                "&:hover": { borderColor: "#DC2626", bgcolor: "rgba(239, 68, 68, 0.04)" }
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              variant="contained"
                              onClick={() => handlePagarReservaLista(cita.id)}
                              disabled={cancelandoEsta || cancelandoId != null || guardando}
                              sx={{
                                flex: 1.2,
                                py: 1.1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 800,
                                bgcolor: COLORS.gold,
                                color: "#FFFFFF",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#c49a2e", boxShadow: "none" }
                              }}
                            >
                              Pagar Cita
                            </Button>
                          </Stack>
                        )}

                        {cita.estado === "CONFIRMADA" && (
                          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => handleDescargarComprobante(cita.id)}
                              startIcon={<DownloadRoundedIcon />}
                              sx={{
                                py: 1.1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 800,
                                bgcolor: COLORS.navy,
                                color: "#FFFFFF",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#152a41", boxShadow: "none" }
                              }}
                            >
                              Comprobante
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => handleCancelarCitaLista(cita.id, cita.serviciosLabel)}
                              disabled={cancelandoEsta || cancelandoId != null}
                              sx={{
                                py: 1.1,
                                px: 2,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 800,
                                borderColor: "#EF4444",
                                color: "#EF4444",
                                "&:hover": { borderColor: "#DC2626", bgcolor: "rgba(239, 68, 68, 0.04)" }
                              }}
                            >
                              {cancelandoEsta ? "…" : "Cancelar"}
                            </Button>
                          </Stack>
                        )}

                        {cita.estado === "COMPLETADA" && (
                          <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={() => handleDescargarComprobante(cita.id)}
                              startIcon={<DownloadRoundedIcon />}
                              sx={{
                                py: 1.1,
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 800,
                                borderColor: COLORS.navy,
                                color: COLORS.navy,
                                "&:hover": { bgcolor: "rgba(30, 58, 90, 0.04)" }
                              }}
                            >
                              Descargar Comprobante
                            </Button>
                          </Stack>
                        )}

                        {["CANCELADA", "NO_ASISTIO"].includes(cita.estado) && (
                          <Box sx={{ mt: 2.5, p: 1.5, bgcolor: "#F8FAFC", borderRadius: "10px", textAlign: "center", border: "1px dashed rgba(229, 231, 235, 1)" }}>
                            <Typography variant="caption" sx={{ color: COLORS.muted, fontWeight: 700 }}>
                              Esta cita fue finalizada con estado: {cita.estado}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default MisCitasCliente;
