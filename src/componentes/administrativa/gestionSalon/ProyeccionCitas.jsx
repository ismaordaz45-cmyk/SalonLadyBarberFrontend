import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { motion, AnimatePresence } from "framer-motion";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from "chart.js";
import api from "../../../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTooltip, Legend, Filler);

// ─────────────────────────────────────────────────────────────
// PALETA DE COLORES - Barbería Elegante
// ─────────────────────────────────────────────────────────────
const PALETTE = {
  pageBg: "#F8FAFC",
  card: "#FFFFFF",
  primary: "#1E293B",
  secondary: "#64748B",
  border: "#E2E8F0",
  accent: "#D4AF38",      // Dorado elegante
  navy: "#1E3A5F",        // Azul marino profesional
  green: "#16A34A",
  violet: "#7C3AED",
  yellow: "#F59E0B",
  blue: "#3B82F6",
  red: "#EF4444",
  cream: "#FDF8E8",       // Crema suave
  darkGold: "#B8972E",    // Dorado oscuro
};

const FONTS = {
  display: 'Arial, "Segoe UI", Tahoma, sans-serif',
  body: 'Arial, "Segoe UI", Tahoma, sans-serif'
};

// ─────────────────────────────────────────────────────────────
// ANIMACIONES KEYFRAMES
// ─────────────────────────────────────────────────────────────
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// float animation removed (not used)

// ─────────────────────────────────────────────────────────────
// COMPONENTES STYLED
// ─────────────────────────────────────────────────────────────
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(145deg, ${PALETTE.card} 0%, ${alpha(PALETTE.cream, 0.4)} 100%)`,
  backdropFilter: "blur(20px)",
  border: `1px solid ${alpha(PALETTE.accent, 0.15)}`,
  borderRadius: 20,
  boxShadow: `0 8px 32px ${alpha(PALETTE.navy, 0.08)}, 0 2px 8px ${alpha(PALETTE.accent, 0.04)}`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  position: "relative",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 16px 48px ${alpha(PALETTE.navy, 0.12)}, 0 4px 16px ${alpha(PALETTE.accent, 0.08)}`,
    borderColor: alpha(PALETTE.accent, 0.3),
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${PALETTE.accent}, ${PALETTE.darkGold}, ${PALETTE.accent})`,
    backgroundSize: "200% 100%",
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const StatCard = styled(motion.div)(({ theme, accentColor = PALETTE.accent }) => ({
  background: PALETTE.card,
  borderRadius: 16,
  border: `1px solid ${PALETTE.border}`,
  padding: "20px 24px",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "default",
  "&:hover": {
    borderColor: alpha(accentColor, 0.4),
    boxShadow: `0 8px 24px ${alpha(accentColor, 0.15)}`,
    "& .stat-icon": {
      transform: "scale(1.1) rotate(-5deg)",
    },
    "& .stat-value": {
      color: accentColor,
    }
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover::after": {
    opacity: 1,
  }
}));

const IconWrapper = styled(Box)(({ bgcolor }) => ({
  width: 52,
  height: 52,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(145deg, ${alpha(bgcolor, 0.15)}, ${alpha(bgcolor, 0.08)})`,
  border: `1px solid ${alpha(bgcolor, 0.2)}`,
  transition: "all 0.3s ease",
}));

const StyledTableRow = styled(TableRow)(({ theme, rowType }) => {
  const colors = {
    historico: { bg: alpha(PALETTE.yellow, 0.12), hover: alpha(PALETTE.yellow, 0.2), accent: PALETTE.yellow },
    prediccion: { bg: alpha(PALETTE.blue, 0.08), hover: alpha(PALETTE.blue, 0.14), accent: PALETTE.blue },
    default: { bg: "transparent", hover: alpha(PALETTE.navy, 0.04), accent: PALETTE.navy }
  };
  const style = colors[rowType] || colors.default;
  
  return {
    backgroundColor: style.bg,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: style.hover,
      "& td:first-of-type": {
        borderLeft: `3px solid ${style.accent}`,
      }
    },
    "& td:first-of-type": {
      borderLeft: "3px solid transparent",
      transition: "border-color 0.2s ease",
    }
  };
});

const AnimatedButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 900,
  borderRadius: 12,
  padding: "10px 22px",
  background: PALETTE.blue,
  color: "#FFFFFF",
  boxShadow: `0 8px 22px ${alpha(PALETTE.blue, 0.28)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "& .MuiButton-startIcon": {
    color: "#FFFFFF"
  },
  "&:hover": {
    background: "#2563EB",
    color: "#FFFFFF",
    boxShadow: `0 10px 26px ${alpha(PALETTE.blue, 0.35)}`,
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&:disabled": {
    background: alpha(PALETTE.secondary, 0.3),
    color: alpha("#FFFFFF", 0.85),
    boxShadow: "none",
  }
}));

const TabButton = styled(Button)(({ active }) => ({
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 10,
  padding: "8px 18px",
  minWidth: "auto",
  transition: "all 0.25s ease",
  ...(active ? {
    background: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${alpha(PALETTE.navy, 0.9)} 100%)`,
    color: "#FFFFFF",
    boxShadow: `0 4px 12px ${alpha(PALETTE.navy, 0.25)}`,
    "&:hover": {
      background: `linear-gradient(135deg, ${PALETTE.navy} 0%, #0F2942 100%)`,
    }
  } : {
    background: alpha(PALETTE.navy, 0.06),
    color: PALETTE.navy,
    border: `1px solid ${alpha(PALETTE.navy, 0.15)}`,
    "&:hover": {
      background: alpha(PALETTE.navy, 0.12),
      borderColor: alpha(PALETTE.navy, 0.3),
    }
  })
}));

// ─────────────────────────────────────────────────────────────
// FUNCIONES UTILITARIAS
// ─────────────────────────────────────────────────────────────
function fmtPct01(v) {
  if (!Number.isFinite(v)) return "—";
  return `${Math.round(v * 100)}%`;
}

function fmtFechaCorta(ymd) {
  if (!ymd) return "—";
  const d = new Date(`${String(ymd).slice(0, 10)}T12:00:00`);
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtRangoSemana(inicioYmd, finYmd) {
  if (!inicioYmd || !finYmd) return "—";
  const a = inicioYmd.slice(0, 10);
  const b = finYmd.slice(0, 10);
  const [y1, m1, d1] = a.split("-").map(Number);
  const [, m2, d2] = b.split("-").map(Number);
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${d1} ${meses[m1 - 1]} – ${d2} ${meses[m2 - 1]} ${y1}`;
}

function addDaysYmd(ymd, days) {
  const d = new Date(`${String(ymd).slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MONTHS_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

function ymdFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysInMonth(year, month1to12) {
  return new Date(year, month1to12, 0).getDate();
}

function fmtMonthLong(month1to12) {
  return MONTHS_LONG[month1to12 - 1] || "—";
}

function monthKeyFromYmd(ymd) {
  const s = String(ymd || "").slice(0, 10);
  const [yy, mm] = s.split("-").map(Number);
  if (!yy || !mm) return null;
  return { year: yy, month: mm };
}

function monthKeyToId(mk) {
  return `${mk.year}-${String(mk.month).padStart(2, "0")}`;
}

function buildMonthKeysInclusive({ startYear, startMonth, endYear, endMonth }) {
  const out = [];
  let y = startYear;
  let m = startMonth;
  while (y < endYear || (y === endYear && m <= endMonth)) {
    out.push({ year: y, month: m });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

// Fórmula exacta solicitada: CP promedio de diferencias mes a mes; predicción encadenada.
// Entrada esperada: [{ mes: "2026-01", citas: 120 }, ...]
function calcularPrediccion(historico) {
  const clean = (Array.isArray(historico) ? historico : [])
    .map((h) => ({
      mes: String(h?.mes || "").slice(0, 7),
      citas: Number(h?.citas || 0)
    }))
    .filter((h) => /^\d{4}-\d{2}$/.test(h.mes) && Number.isFinite(h.citas));

  if (clean.length < 2) {
    const last = clean.length ? clean[clean.length - 1].citas : 0;
    return { cp: 0, lastKnown: last, predichos: [] };
  }

  const diffs = [];
  for (let i = 1; i < clean.length; i += 1) {
    diffs.push(clean[i].citas - clean[i - 1].citas);
  }
  const cp = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const lastKnown = clean[clean.length - 1].citas;

  return { cp, lastKnown, predichos: [] };
}

function construirSerieMensualEneroJulio({ historicoReal, year = 2026 }) {
  // Enero–Julio del año dado.
  const monthKeys = buildMonthKeysInclusive({
    startYear: year,
    startMonth: 1,
    endYear: year,
    endMonth: 7
  });

  const histById = new Map();
  for (const h of historicoReal) {
    const mes = String(h?.mes || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mes)) continue;
    histById.set(mes, Number(h?.citas || 0));
  }

  // CP basado en histórico real (Ene–Mar).
  const { cp } = calcularPrediccion(historicoReal);
  const crecimiento = Math.round(cp); // CP debe ser 40 exacto con los datos base

  const labels = monthKeys.map((mk) => fmtMonthLong(mk.month));
  const real = [];
  const pred = [];

  // Último valor conocido: Marzo si existe; si no, último del histórico.
  const lastRealId = `${year}-03`;
  let lastKnown = histById.has(lastRealId)
    ? histById.get(lastRealId)
    : (historicoReal.length ? Number(historicoReal[historicoReal.length - 1].citas || 0) : 0);

  for (const mk of monthKeys) {
    const id = monthKeyToId(mk);
    const isReal = histById.has(id) && mk.month <= 3;
    if (isReal) {
      real.push(histById.get(id));
      pred.push(null);
      lastKnown = histById.get(id);
    } else {
      real.push(null);
      lastKnown = lastKnown + crecimiento;
      pred.push(lastKnown);
    }
  }

  // Ajuste: en meses reales, no encadenar predicción (ya está), y predicciones empiezan en Abril.
  // Resultado esperado con base Ene=120, Feb=170, Mar=200: Abril 240, Mayo 280, Junio 320, Julio 360.
  return { labels, real, pred, cp: crecimiento };
}

function buildChartSeries(historico, prediccion) {
  const n = historico.length;
  const fut = prediccion.length;
  if (n === 0 && fut === 0) {
    return { labels: [], real: [], pronostico: [] };
  }
  if (n === 0) {
    const labels = prediccion.map((p) => fmtRangoSemana(p.semanaInicio, p.semanaFin));
    return {
      labels,
      real: prediccion.map(() => null),
      pronostico: prediccion.map((p) => p.demandaPronosticada)
    };
  }

  const labels = [
    ...historico.map((h) => fmtRangoSemana(h.semanaInicio, addDaysYmd(h.semanaInicio, 6))),
    ...prediccion.map((p) => fmtRangoSemana(p.semanaInicio, p.semanaFin))
  ];

  const real = [...historico.map((h) => h.total), ...Array(fut).fill(null)];
  const last = historico[n - 1].total;
  const pronostico = [
    ...Array(Math.max(0, n - 1)).fill(null),
    last,
    ...prediccion.map((p) => p.demandaPronosticada)
  ];

  while (pronostico.length < labels.length) pronostico.push(null);
  while (real.length < labels.length) real.push(null);

  return { labels, real, pronostico };
}

function parseMonthKey(ymd) {
  if (!ymd) return null;
  const s = String(ymd).slice(0, 10);
  const [yy, mm] = s.split("-").map(Number);
  if (!yy || !mm) return null;
  return { year: yy, month: mm };
}

function monthKeyToString({ year, month }) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function buildMonthlySeries(historicoDiario, prediccionDiaria, monthsToShow = 7) {
  const hist = Array.isArray(historicoDiario) ? historicoDiario : [];
  const pred = Array.isArray(prediccionDiaria) ? prediccionDiaria : [];

  const histAgg = new Map();
  for (const row of hist) {
    const key = parseMonthKey(row?.dia);
    if (!key) continue;
    const k = monthKeyToString(key);
    histAgg.set(k, (histAgg.get(k) || 0) + Number(row?.totalCitas || 0));
  }

  const predAgg = new Map();
  for (const row of pred) {
    const key = parseMonthKey(row?.dia);
    if (!key) continue;
    const k = monthKeyToString(key);
    predAgg.set(k, (predAgg.get(k) || 0) + Number(row?.totalCitas || 0));
  }

  const allKeys = [...new Set([...histAgg.keys(), ...predAgg.keys()])].sort();
  if (allKeys.length === 0) return { labels: [], real: [], pronostico: [] };

  const windowKeys = allKeys.slice(-Math.max(1, monthsToShow));
  const labels = windowKeys.map((k) => {
    const [, mm] = k.split("-");
    const m = Number(mm);
    return MONTHS_LONG[m - 1] || k;
  });

  const real = windowKeys.map((k) => (histAgg.has(k) ? histAgg.get(k) : null));

  const pronostico = windowKeys.map((k) => {
    if (!predAgg.has(k)) return null;
    // Si hay real también en el mismo mes, dejamos que el pronóstico conviva (línea punteada).
    return predAgg.get(k);
  });

  return { labels, real, pronostico };
}

// ─────────────────────────────────────────────────────────────
// COMPONENTES DE ANIMACIÓN
// ─────────────────────────────────────────────────────────────
const MotionBox = motion(Box);
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  }
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
function ProyeccionCitas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [modoDemanda, setModoDemanda] = useState("mensual");
  const [tipoGrafico, setTipoGrafico] = useState("lineas"); // lineas | barras

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/api/dashboard/proyeccion-citas", { timeout: 15000 });
      setPayload(data || null);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "No se pudo cargar la predicción de citas.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const historico = useMemo(
    () => (Array.isArray(payload?.historicoSemanal) ? payload.historicoSemanal : []),
    [payload?.historicoSemanal]
  );
  const prediccion = useMemo(
    () => (Array.isArray(payload?.prediccionSemanas) ? payload.prediccionSemanas : []),
    [payload?.prediccionSemanas]
  );
  const serviciosTop = payload?.serviciosTop || [];
  const historicoDiario = payload?.historicoDiario || [];
  const prediccionDiaria = payload?.prediccionDiaria || [];
  const g = payload?.parametros?.crecimientoSemanalPromedio ?? 0;
  const dataDesde = payload?.parametros?.dataDesde || "2026-01-01";
  const hoy = useMemo(() => {
    const raw = payload?.parametros?.hoy;
    const d = raw ? new Date(raw) : new Date();
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }, [payload?.parametros?.hoy]);

  // Datos base (temporal) si aún no hay endpoint real de citas/mes.
  const historicoMensualReal = useMemo(() => {
    const fromApi = payload?.historicoMensual;
    if (Array.isArray(fromApi) && fromApi.length) return fromApi;
    return [
      { mes: "2026-01", citas: 120 },
      { mes: "2026-02", citas: 170 },
      { mes: "2026-03", citas: 200 }
    ];
  }, [payload?.historicoMensual]);

  const serieMensual = useMemo(
    () => construirSerieMensualEneroJulio({ historicoReal: historicoMensualReal, year: 2026 }),
    [historicoMensualReal]
  );

  const servicioDefault = useMemo(() => {
    const top = Array.isArray(serviciosTop) ? serviciosTop[0] : null;
    const nombre = top?.nombre || "Corte clásico";
    const pct = 0.24;
    return { nombre, pct };
  }, [serviciosTop]);

  const mensualRows = useMemo(() => {
    // Desde Abril en adelante (predicción)
    const year = 2026;
    const startMonth = 4;
    const out = [];
    let prev = serieMensual.real.findLast?.((v) => v != null);
    if (!Number.isFinite(prev)) prev = 200;

    // Encontrar el valor real de Marzo si existe en el histórico
    const marIdx = serieMensual.labels.findIndex((l) => l === "Marzo");
    if (marIdx >= 0 && Number.isFinite(serieMensual.real[marIdx])) prev = serieMensual.real[marIdx];

    for (let m = startMonth; m <= 7; m += 1) {
      const idx = m - 1;
      const citas = serieMensual.pred[idx];
      out.push({
        mes: fmtMonthLong(m),
        year,
        citas: Number.isFinite(citas) ? citas : null,
        crecimiento: `+${serieMensual.cp}`,
        servicio: servicioDefault.nombre,
        pct: servicioDefault.pct
      });
      if (Number.isFinite(citas)) prev = citas;
    }
    return out.filter((r) => r.citas != null);
  }, [serieMensual, servicioDefault]);

  const semanalRows = useMemo(() => {
    const out = [];
    const todayYmd = ymdFromDate(hoy);
    const todayDate = new Date(`${todayYmd}T12:00:00`);

    // Abril–Junio (las primeras 3 predicciones mensuales para el ejemplo)
    for (let m = 4; m <= 6; m += 1) {
      const predMes = serieMensual.pred[m - 1];
      if (!Number.isFinite(predMes)) continue;

      const year = 2026;
      const lastDay = daysInMonth(year, m);
      const buckets = [
        { start: 1, end: 7 },
        { start: 8, end: 14 },
        { start: 15, end: 21 },
        { start: 22, end: lastDay }
      ];
      const demandaSemana = Math.round(predMes / 4);

      for (const b of buckets) {
        const ini = `${year}-${String(m).padStart(2, "0")}-${String(b.start).padStart(2, "0")}`;
        const fin = `${year}-${String(m).padStart(2, "0")}-${String(b.end).padStart(2, "0")}`;
        const finDate = new Date(`${fin}T12:00:00`);
        if (finDate < todayDate) continue;

        out.push({
          semanaInicio: ini,
          semanaFin: fin,
          demanda: demandaSemana,
          servicio: servicioDefault.nombre,
          pct: servicioDefault.pct
        });
      }
    }

    return out.slice(0, 8);
  }, [serieMensual, hoy, servicioDefault]);

  const diariaRows = useMemo(() => {
    const out = [];
    const today = new Date(hoy);
    const maxDays = 18;

    for (let i = 0; i < maxDays; i += 1) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const mk = { year: d.getFullYear(), month: d.getMonth() + 1 };

      // Solo predicción desde Abril 2026 en adelante (según reglas dadas)
      if (mk.year < 2026 || (mk.year === 2026 && mk.month < 4)) continue;
      if (mk.year !== 2026 || mk.month > 7) continue;

      const predMes = serieMensual.pred[mk.month - 1];
      if (!Number.isFinite(predMes)) continue;

      const dim = daysInMonth(mk.year, mk.month);
      const demandaDia = Math.round(predMes / dim);
      out.push({
        dia: ymdFromDate(d),
        totalCitas: demandaDia,
        serviciosMasProbables: [servicioDefault.nombre]
      });
    }

    return out;
  }, [serieMensual, hoy, servicioDefault]);

  // Tarjeta "Histórico y Predicción" solo en vista mensual
  const { labels, real, pronostico } = useMemo(
    () => ({ labels: serieMensual.labels, real: serieMensual.real, pronostico: serieMensual.pred }),
    [serieMensual.labels, serieMensual.real, serieMensual.pred]
  );

  const chartData = useMemo(() => {
    const dark = "#2563EB"; // azul oscuro
    const light = "#93C5FD"; // azul claro

    return {
      labels,
      datasets: [
        {
          label: "Demanda real",
          data: real,
          borderColor: dark,
          backgroundColor:
            tipoGrafico === "barras"
              ? (ctx) => {
                  const chart = ctx.chart;
                  const { ctx: c2d, chartArea } = chart;
                  if (!chartArea) return alpha(dark, 0.9);
                  const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                  g.addColorStop(0, alpha(dark, 0.98));
                  g.addColorStop(1, alpha(dark, 0.72));
                  return g;
                }
              : (ctx) => {
                  const chart = ctx.chart;
                  const { ctx: c2d, chartArea } = chart;
                  if (!chartArea) return alpha(dark, 0.18);
                  const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                  g.addColorStop(0, alpha(dark, 0.28));
                  g.addColorStop(1, alpha(dark, 0.04));
                  return g;
                },
          borderWidth: 0,
          borderRadius: tipoGrafico === "barras" ? 10 : 0,
          tension: 0.25,
          fill: tipoGrafico !== "barras",
          pointRadius: 4,
          pointBackgroundColor: tipoGrafico === "barras" ? "transparent" : dark,
          pointBorderColor: dark,
          pointBorderWidth: 2.5,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 3,
          spanGaps: false
        },
        {
          label: "Predicción",
          data: pronostico,
          borderColor: light,
          backgroundColor:
            tipoGrafico === "barras"
              ? (ctx) => {
                  const chart = ctx.chart;
                  const { ctx: c2d, chartArea } = chart;
                  if (!chartArea) return alpha(light, 0.85);
                  const g2 = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                  g2.addColorStop(0, alpha(light, 0.95));
                  g2.addColorStop(1, alpha(light, 0.55));
                  return g2;
                }
              : (ctx) => {
                  const chart = ctx.chart;
                  const { ctx: c2d, chartArea } = chart;
                  if (!chartArea) return alpha(light, 0.22);
                  const g2 = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                  g2.addColorStop(0, alpha(light, 0.26));
                  g2.addColorStop(1, alpha(light, 0.04));
                  return g2;
                },
          borderWidth: 0,
          borderRadius: tipoGrafico === "barras" ? 10 : 0,
          borderDash: tipoGrafico === "barras" ? undefined : [8, 4],
          tension: 0.25,
          fill: tipoGrafico !== "barras",
          pointRadius: 4,
          pointBackgroundColor: PALETTE.card,
          pointBorderColor: light,
          pointBorderWidth: 2.5,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 3,
          spanGaps: true
        }
      ]
    };
  }, [labels, real, pronostico, tipoGrafico]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    // Animación de barras solo al montar o al cambiar a "Barras" (se remonta por `key`)
    animation:
      tipoGrafico === "barras"
        ? { duration: 800, easing: "easeOutQuart" }
        : false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: PALETTE.primary,
          font: { weight: "600", size: 12 },
          boxWidth: 16,
          boxHeight: 8,
          borderRadius: 4,
          padding: 20,
          usePointStyle: true,
          pointStyle: "rectRounded"
        }
      },
      tooltip: {
        backgroundColor: PALETTE.card,
        titleColor: PALETTE.primary,
        bodyColor: PALETTE.secondary,
        borderColor: PALETTE.border,
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        boxPadding: 6,
        titleFont: { weight: "700", size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label(ctx) {
            const v = ctx.parsed.y;
            if (v == null) return "";
            return ` ${ctx.dataset.label}: ${v} citas`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: PALETTE.secondary,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
          font: { size: 11, weight: "800" }
        },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        suggestedMax: 400,
        max: 400,
        title: {
          display: true,
          text: "Citas",
          color: PALETTE.secondary,
          font: { size: 12, weight: "700" },
          padding: { bottom: 10 }
        },
        grid: {
          color: alpha(PALETTE.border, 0.95),
          drawBorder: false
        },
        ticks: {
          color: PALETTE.secondary,
          precision: 0,
          font: { size: 11, weight: "700" },
          padding: 8
        },
        border: { display: false }
      }
    }
  }), [tipoGrafico]);

  const ultimaReal = historico.length > 0 ? historico[historico.length - 1].total : null;
  const promedioHistoricoSemanal = useMemo(() => {
    // Promedio histórico semanal derivado del histórico mensual real
    const rows = Array.isArray(historicoMensualReal) ? historicoMensualReal : [];
    if (rows.length === 0) return null;
    const avgMonthly = rows.reduce((a, r) => a + Number(r?.citas || 0), 0) / rows.length;
    return Math.round((avgMonthly / 4) * 10) / 10; // 40.8 con los datos base
  }, [historicoMensualReal]);

  const tasaCrecimientoSemanalPct = useMemo(() => {
    const cpMensual = Number(serieMensual.cp || 0); // 40
    const crecimientoSemanal = cpMensual / 4; // 10
    const promSemanal = Number(promedioHistoricoSemanal || 0); // ~40.8
    if (!promSemanal) return 0;
    return Math.round((crecimientoSemanal / promSemanal) * 100); // ~24%
  }, [serieMensual.cp, promedioHistoricoSemanal]);

  const statsData = [
    {
      icon: <TrendingUpRoundedIcon sx={{ fontSize: 26, color: PALETTE.green }} />,
      iconBg: PALETTE.green,
      label: "Tasa de crecimiento semanal",
      value: `${tasaCrecimientoSemanalPct}%`,
      subtitle: `≈ ${Math.round(Number(serieMensual.cp || 0) / 4)} citas/semana (CP/4)`,
      accentColor: PALETTE.green
    },
    {
      icon: <CalendarMonthRoundedIcon sx={{ fontSize: 26, color: PALETTE.navy }} />,
      iconBg: PALETTE.navy,
      label: "Última semana",
      value: ultimaReal ?? "—",
      subtitle: "Citas completadas",
      accentColor: PALETTE.navy
    },
    {
      icon: <BarChartRoundedIcon sx={{ fontSize: 26, color: PALETTE.accent }} />,
      iconBg: PALETTE.accent,
      label: "Promedio Histórico",
      value: promedioHistoricoSemanal ?? "—",
      subtitle: "Citas por semana",
      accentColor: PALETTE.accent
    }
  ];

  return (
    <Box
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        py: { xs: 3, md: 4 },
        background: `linear-gradient(180deg, ${PALETTE.pageBg} 0%, ${alpha(PALETTE.cream, 0.3)} 100%)`,
        fontFamily: FONTS.body,
        fontSize: "12px",
        "& .MuiTypography-root": { fontFamily: FONTS.body, fontSize: "12px" },
        "& .pcDisplay": { fontFamily: FONTS.display }
      }}
    >
      <Container maxWidth="lg">
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ═══════════════════════════════════════════════════════════════════
              HEADER PRINCIPAL
              ═══════════════════════════════════════════════════════════════════ */}
        <MotionBox variants={itemVariants}>       <GlassCard
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 4,
                border: "0px solid transparent",
                color: "#fff",
                background:
                  "linear-gradient(90deg, #0B1220 0%, #0F172A 35%, #0B1220 100%)",
                boxShadow: "0 26px 70px rgba(2,6,23,0.28)"
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 }, position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(900px 260px at 20% 0%, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 62%), radial-gradient(900px 260px at 90% 25%, rgba(212,175,56,0.18) 0%, rgba(212,175,56,0) 58%)"
                  }}
                  aria-hidden
                />
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={3}
                  alignItems={{ md: "center" }}
                  justifyContent="space-between"
                  sx={{ position: "relative" }}
                >
                  <Stack direction="row" spacing={2.5} alignItems="flex-start">
                    <Box
                      component={motion.div}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(255,255,255,0.10)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 10px 26px rgba(2,6,23,0.25)"
                      }}
                    >
                      <AutoGraphRoundedIcon sx={{ color: alpha(PALETTE.accent, 0.95), fontSize: 34 }} />
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography
                          variant="h4"
                          className="pcDisplay"
                          sx={{
                            fontWeight: 800,
                            color: "#FFFFFF",
                            letterSpacing: "-0.02em",
                            fontSize: { xs: "16px", md: "16px" }
                          }}
                        >
                          Predicción de Citas
                        </Typography>
                        <Chip
                          icon={<ContentCutRoundedIcon sx={{ fontSize: 14 }} />}
                          label="Barbería"
                          size="small"
                          sx={{
                            bgcolor: alpha(PALETTE.accent, 0.15),
                            color: alpha(PALETTE.accent, 0.95),
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            "& .MuiChip-icon": { color: PALETTE.accent }
                          }}
                        />
                      </Stack>
                      <Typography
                        sx={{
                          color: alpha("#CBD5E1", 0.92),
                          maxWidth: 600,
                          lineHeight: 1.6,
                          fontSize: "0.95rem"
                        }}
                      >
                        Análisis predictivo basado en histórico de citas, tendencias de crecimiento
                        y servicios más solicitados.
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: PALETTE.green,
                            animation: `${pulse} 2s infinite`
                          }}
                        />
                        <Typography sx={{ color: alpha("#CBD5E1", 0.92), fontSize: "0.82rem" }}>
                          Datos desde <strong style={{ color: "#FFFFFF" }}>{fmtFechaCorta(dataDesde)}</strong>
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <AnimatedButton
                    startIcon={<ReplayRoundedIcon />}
                    onClick={fetchData}
                    disabled={loading}
                    sx={{
                      bgcolor: PALETTE.blue,
                      "&:hover": { bgcolor: "#2563EB" }
                    }}
                  >
                    {loading ? "Actualizando..." : "Actualizar datos"}
                  </AnimatedButton>
                </Stack>
              </CardContent>
            </GlassCard>
          </MotionBox>

          {/* ALERTA DE ERROR */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: `1px solid ${alpha("#EF4444", 0.3)}`
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════════════════════════════
              TARJETAS DE ESTADÍSTICAS
              ═══════════════════════════════════════════════════════════════════ */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {statsData.map((stat, idx) => (
              <Grid item xs={12} sm={4} key={stat.label}>
                <StatCard
                  variants={itemVariants}
                  accentColor={stat.accentColor}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <IconWrapper className="stat-icon" bgcolor={stat.iconBg}>
                      {stat.icon}
                    </IconWrapper>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: PALETTE.secondary,
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 0.5
                        }}
                      >
                        {stat.label}
                      </Typography>
                      {loading ? (
                        <Skeleton width={80} height={44} sx={{ borderRadius: 2 }} />
                      ) : (
                        <Typography
                          className="stat-value"
                          sx={{
                            color: PALETTE.primary,
                            fontWeight: 800,
                            fontSize: "2rem",
                            lineHeight: 1.1,
                            transition: "color 0.3s ease"
                          }}
                        >
                          {stat.value}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          color: alpha(PALETTE.secondary, 0.8),
                          fontSize: "0.78rem",
                          mt: 0.5
                        }}
                      >
                        {stat.subtitle}
                      </Typography>
                    </Box>
                  </Stack>
                </StatCard>
              </Grid>
            ))}
          </Grid>

          {/* ═══════════════════════════════════════════════════════════════════
              GRÁFICO PRINCIPAL
              ═══════════════════════════════════════════════════════════════════ */}
          <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
            <GlassCard elevation={0}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(PALETTE.navy, 0.1)
                      }}
                    >
                      <ShowChartRoundedIcon sx={{ color: PALETTE.navy, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: PALETTE.primary, fontSize: "1.1rem" }}>
                        Histórico y predicción mensual
                      </Typography>
                      <Typography sx={{ color: PALETTE.secondary, fontSize: "0.82rem" }}>
                        Vista mensual (Enero–Julio 2026)
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                    <ButtonGroup size="small" variant="outlined" sx={{ "& .MuiButton-root": { fontWeight: 800 } }}>
                      <Button
                        onClick={() => setTipoGrafico("lineas")}
                        variant={tipoGrafico === "lineas" ? "contained" : "outlined"}
                        sx={{
                          bgcolor: tipoGrafico === "lineas" ? alpha(PALETTE.accent, 0.95) : "transparent",
                          color: tipoGrafico === "lineas" ? "#111827" : PALETTE.darkGold,
                          borderColor: alpha(PALETTE.accent, 0.35),
                          "&:hover": { bgcolor: tipoGrafico === "lineas" ? alpha(PALETTE.accent, 0.98) : alpha(PALETTE.accent, 0.10) }
                        }}
                      >
                        Líneas
                      </Button>
                      <Button
                        onClick={() => setTipoGrafico("barras")}
                        variant={tipoGrafico === "barras" ? "contained" : "outlined"}
                        sx={{
                          bgcolor: tipoGrafico === "barras" ? alpha(PALETTE.accent, 0.95) : "transparent",
                          color: tipoGrafico === "barras" ? "#111827" : PALETTE.darkGold,
                          borderColor: alpha(PALETTE.accent, 0.35),
                          "&:hover": { bgcolor: tipoGrafico === "barras" ? alpha(PALETTE.accent, 0.98) : alpha(PALETTE.accent, 0.10) }
                        }}
                      >
                        Barras
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Stack>
                <Divider sx={{ my: 2, borderColor: alpha(PALETTE.border, 0.6) }} />

                <MotionBox
                  variants={chartVariants}
                  sx={{
                    height: { xs: 300, md: 380 },
                    position: "relative",
                    bgcolor: alpha(PALETTE.pageBg, 0.5),
                    borderRadius: 3,
                    p: 2
                  }}
                >
                  {loading ? (
                    <Box sx={{ position: "relative", height: "100%" }}>
                      <Skeleton variant="rounded" height="100%" sx={{ borderRadius: 2 }} />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)"
                        }}
                      >
                        <Typography sx={{ color: PALETTE.secondary }}>
                          Cargando gráfico...
                        </Typography>
                      </Box>
                    </Box>
                  ) : labels.length === 0 ? (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Typography sx={{ color: PALETTE.secondary }}>
                        No hay datos suficientes para graficar.
                      </Typography>
                    </Box>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`mensual-${tipoGrafico}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        style={{ height: "100%" }}
                      >
                        {tipoGrafico === "barras" ? (
                          <Bar data={chartData} options={chartOptions} />
                        ) : (
                          <Line data={chartData} options={chartOptions} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </MotionBox>
              </CardContent>
            </GlassCard>
          </MotionBox>

          {/* ═══════════════════════════════════════════════════════════════════
              TABLAS DE PREDICCIÓN Y SERVICIOS
              ═══════════════════════════════════════════════════════════════════ */}
          <Grid container spacing={3}>
            {/* Tabla de Predicción */}
            <Grid item xs={12}>
              <MotionBox variants={itemVariants}>
                <GlassCard elevation={0} sx={{ height: "100%" }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                      sx={{ mb: 2 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: alpha(PALETTE.accent, 0.12)
                          }}
                        >
                          <TableChartRoundedIcon sx={{ color: PALETTE.accent, fontSize: 22 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: PALETTE.primary, fontSize: "1.05rem" }}>
                          Predicción de Demanda
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <TabButton
                          active={modoDemanda === "mensual"}
                          onClick={() => setModoDemanda("mensual")}
                        >
                          Mensual
                        </TabButton>
                        <TabButton
                          active={modoDemanda === "semanal"}
                          onClick={() => setModoDemanda("semanal")}
                        >
                          Semanal
                        </TabButton>
                        <TabButton
                          active={modoDemanda === "diaria"}
                          onClick={() => setModoDemanda("diaria")}
                        >
                          Diaria
                        </TabButton>
                      </Stack>
                    </Stack>

                    <Typography sx={{ color: PALETTE.secondary, fontSize: "0.85rem", mb: 2 }}>
                      {modoDemanda === "mensual"
                        ? `Predicción mensual con CP=${serieMensual.cp} citas/mes (desde Abril 2026)`
                        : modoDemanda === "semanal"
                          ? "Demanda semanal derivada de la predicción mensual (≈ 4 semanas/mes)"
                          : "Demanda diaria derivada de la predicción mensual (días del mes)"}
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: alpha(PALETTE.border, 0.6) }} />

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={modoDemanda}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableContainer
                          sx={{
                            border: `1px solid ${PALETTE.border}`,
                            borderRadius: 3,
                            overflow: "hidden"
                          }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow
                                sx={{
                                  bgcolor: alpha(PALETTE.navy, 0.06),
                                  "& th": {
                                    fontWeight: 700,
                                    color: PALETTE.primary,
                                    fontSize: "0.82rem",
                                    py: 1.5,
                                    borderBottom: `2px solid ${alpha(PALETTE.navy, 0.1)}`
                                  }
                                }}
                              >
                                {modoDemanda === "mensual" ? (
                                  <>
                                    <TableCell>Mes</TableCell>
                                    <TableCell>Año</TableCell>
                                    <TableCell align="center">Citas predichas</TableCell>
                                    <TableCell align="center">Crecimiento</TableCell>
                                    <TableCell>Servicio Principal</TableCell>
                                    <TableCell align="center">%</TableCell>
                                  </>
                                ) : modoDemanda === "diaria" ? (
                                  <>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell align="center">Citas</TableCell>
                                    <TableCell>Servicios</TableCell>
                                  </>
                                ) : (
                                  <>
                                    <TableCell>Semana</TableCell>
                                    <TableCell>Rango</TableCell>
                                    <TableCell align="center">Demanda</TableCell>
                                    <TableCell>Servicio Principal</TableCell>
                                    <TableCell align="center">%</TableCell>
                                  </>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {loading ? (
                                <TableRow>
                                  <TableCell colSpan={modoDemanda === "mensual" ? 6 : modoDemanda === "diaria" ? 4 : 5}>
                                    <Skeleton height={160} sx={{ borderRadius: 2 }} />
                                  </TableCell>
                                </TableRow>
                              ) : modoDemanda === "mensual" ? (
                                <>
                                  {mensualRows.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={6} sx={{ py: 4, textAlign: "center" }}>
                                        <Typography sx={{ color: PALETTE.secondary }}>
                                          Sin predicción mensual disponible
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    mensualRows.map((r) => (
                                      <StyledTableRow key={`${r.year}-${r.mes}`} rowType="prediccion">
                                        <TableCell sx={{ fontWeight: 800 }}>{r.mes}</TableCell>
                                        <TableCell sx={{ color: PALETTE.secondary, fontWeight: 700 }}>{r.year}</TableCell>
                                        <TableCell align="center">
                                          <Box
                                            sx={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              bgcolor: alpha("#93C5FD", 0.22),
                                              color: "#2563EB",
                                              fontWeight: 900,
                                              fontSize: "0.95rem",
                                              px: 1.5,
                                              py: 0.55,
                                              borderRadius: 2,
                                              border: `1px solid ${alpha("#2563EB", 0.18)}`
                                            }}
                                          >
                                            {r.citas}
                                          </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 900, color: PALETTE.green }}>
                                          {r.crecimiento}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{r.servicio}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                                          {fmtPct01(r.pct)}
                                        </TableCell>
                                      </StyledTableRow>
                                    ))
                                  )}
                                </>
                              ) : modoDemanda === "diaria" ? (
                                <>
                                  {diariaRows.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={4} sx={{ py: 4, textAlign: "center" }}>
                                        <Typography sx={{ color: PALETTE.secondary }}>
                                          Sin datos diarios suficientes
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    <>
                                      {diariaRows.map((d) => (
                                        <StyledTableRow key={`p-${d.dia}`} rowType="prediccion">
                                          <TableCell sx={{ fontWeight: 700 }}>{fmtFechaCorta(d.dia)}</TableCell>
                                          <TableCell>
                                            <Chip
                                              label="Predicción"
                                              size="small"
                                              sx={{
                                                bgcolor: alpha("#93C5FD", 0.25),
                                                color: "#2563EB",
                                                fontWeight: 800,
                                                fontSize: "0.72rem"
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell align="center" sx={{ fontWeight: 900, fontSize: "1rem", color: "#2563EB" }}>
                                            {d.totalCitas ?? 0}
                                          </TableCell>
                                          <TableCell sx={{ color: PALETTE.secondary, fontSize: "0.82rem" }}>
                                            {(d.serviciosMasProbables || []).join(" · ") || "—"}
                                          </TableCell>
                                        </StyledTableRow>
                                      ))}
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  {semanalRows.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={5} sx={{ py: 4, textAlign: "center" }}>
                                        <Typography sx={{ color: PALETTE.secondary }}>
                                          Sin predicción semanal disponible
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    semanalRows.map((row) => (
                                      <StyledTableRow key={row.semanaInicio} rowType="default">
                                        <TableCell sx={{ fontWeight: 700 }}>
                                          Semana
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "0.85rem" }}>
                                          {fmtRangoSemana(row.semanaInicio, row.semanaFin)}
                                        </TableCell>
                                        <TableCell align="center">
                                          <Box
                                            sx={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              bgcolor: alpha("#93C5FD", 0.22),
                                              color: "#2563EB",
                                              fontWeight: 800,
                                              fontSize: "0.95rem",
                                              px: 1.5,
                                              py: 0.5,
                                              borderRadius: 2
                                            }}
                                          >
                                            {row.demanda}
                                          </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                          {row.servicio || "—"}
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                                          {fmtPct01(row.pct)}
                                        </TableCell>
                                      </StyledTableRow>
                                    ))
                                  )}
                                </>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </GlassCard>
              </MotionBox>
            </Grid>

            {/* Tabla de Servicios Top */}
            <Grid item xs={12}>
              <MotionBox variants={itemVariants}>
                <GlassCard elevation={0} sx={{ height: "100%" }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(PALETTE.green, 0.12)
                        }}
                      >
                        <ContentCutRoundedIcon sx={{ color: PALETTE.green, fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: PALETTE.primary, fontSize: "1.05rem" }}>
                          Servicios Más Solicitados
                        </Typography>
                        <Typography sx={{ color: PALETTE.secondary, fontSize: "0.8rem" }}>
                          Ranking por frecuencia de uso
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 2, borderColor: alpha(PALETTE.border, 0.6) }} />

                    <TableContainer
                      sx={{
                        border: `1px solid ${PALETTE.border}`,
                        borderRadius: 3,
                        overflow: "hidden"
                      }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow
                            sx={{
                              bgcolor: alpha(PALETTE.green, 0.08),
                              "& th": {
                                fontWeight: 700,
                                color: PALETTE.primary,
                                fontSize: "0.82rem",
                                py: 1.5,
                                borderBottom: `2px solid ${alpha(PALETTE.green, 0.15)}`
                              }
                            }}
                          >
                            <TableCell width={50}>#</TableCell>
                            <TableCell>Servicio</TableCell>
                            <TableCell align="center">Usos</TableCell>
                            <TableCell align="right">Participación</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={4}>
                                <Skeleton height={200} sx={{ borderRadius: 2 }} />
                              </TableCell>
                            </TableRow>
                          ) : serviciosTop.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} sx={{ py: 4, textAlign: "center" }}>
                                <Typography sx={{ color: PALETTE.secondary }}>
                                  Sin datos de servicios
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            serviciosTop.slice(0, 6).map((s, idx) => (
                              <TableRow
                                key={s.servicioId}
                                sx={{
                                  transition: "background 0.2s ease",
                                  "&:hover": { bgcolor: alpha(PALETTE.green, 0.04) }
                                }}
                              >
                                <TableCell>
                                  {idx < 3 ? (
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: idx === 0
                                          ? alpha(PALETTE.accent, 0.2)
                                          : idx === 1
                                            ? alpha(PALETTE.secondary, 0.15)
                                            : alpha("#CD7F32", 0.2),
                                        color: idx === 0
                                          ? PALETTE.accent
                                          : idx === 1
                                            ? PALETTE.secondary
                                            : "#CD7F32",
                                        fontWeight: 800,
                                        fontSize: "0.8rem"
                                      }}
                                    >
                                      {idx + 1}
                                    </Box>
                                  ) : (
                                    <Typography sx={{ fontWeight: 600, color: PALETTE.secondary, pl: 0.8 }}>
                                      {idx + 1}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography sx={{ fontWeight: 600, color: PALETTE.primary }}>
                                      {s.nombre}
                                    </Typography>
                                    {idx === 0 && (
                                      <StarRoundedIcon sx={{ fontSize: 16, color: PALETTE.accent }} />
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography sx={{ fontWeight: 700 }}>{s.usos}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                                    <Box sx={{ width: 60 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={s.participacion * 100}
                                        sx={{
                                          height: 6,
                                          borderRadius: 3,
                                          bgcolor: alpha(PALETTE.green, 0.1),
                                          "& .MuiLinearProgress-bar": {
                                            bgcolor: PALETTE.green,
                                            borderRadius: 3
                                          }
                                        }}
                                      />
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, color: PALETTE.green, minWidth: 40 }}>
                                      {fmtPct01(s.participacion)}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </GlassCard>
              </MotionBox>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default ProyeccionCitas;
