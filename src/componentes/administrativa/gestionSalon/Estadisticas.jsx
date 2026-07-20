import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Alert,
  Button,
  CircularProgress,
  IconButton,
  Tooltip as MuiTooltip
} from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend
} from "chart.js";
import api from "../../../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartTooltip,
  Legend
);

const PALETTE = {
  pageBg: "#F8FAFC",
  card: "#FFFFFF",
  primary: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  accent: "#D4AF38",      // Dorado elegante
  navy: "#0B1220",        // Azul marino profundo
  green: "#16A34A",
  greenLight: "#DCFCE7",
  red: "#EF4444",
  blue: "#3B82F6",
  cream: "#FDF8E8",
  darkGold: "#B8972E"
};

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const GlassCard = styled(Card)(() => ({
  background: `linear-gradient(145deg, ${PALETTE.card} 0%, ${alpha(PALETTE.cream, 0.3)} 100%)`,
  backdropFilter: "blur(20px)",
  border: `1px solid ${alpha(PALETTE.accent, 0.15)}`,
  borderRadius: 20,
  boxShadow: `0 8px 32px ${alpha(PALETTE.navy, 0.06)}, 0 2px 8px ${alpha(PALETTE.accent, 0.04)}`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  position: "relative",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `0 16px 44px ${alpha(PALETTE.navy, 0.10)}, 0 4px 16px ${alpha(PALETTE.accent, 0.08)}`,
    borderColor: alpha(PALETTE.accent, 0.3)
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
    animation: `${shimmer} 3s ease-in-out infinite`
  }
}));

const IconWrapper = styled(Box)(({ bgcolor }) => ({
  width: 48,
  height: 48,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(145deg, ${alpha(bgcolor, 0.15)}, ${alpha(bgcolor, 0.08)})`,
  border: `1px solid ${alpha(bgcolor, 0.2)}`,
  transition: "all 0.3s ease"
}));

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_ES = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
  Sunday: "Domingo"
};

function fmtPct01(value01) {
  if (!Number.isFinite(value01)) return "0%";
  return `${Math.round(value01 * 100)}%`;
}

function kpiCard({ title, value, subtitle, icon, tint, loading }) {
  if (loading) {
    return (
      <GlassCard elevation={0} sx={{ height: "100%" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Skeleton width={120} height={16} />
              <Skeleton width={90} height={44} sx={{ my: 0.6 }} />
              <Skeleton width={170} height={14} />
            </Box>
            <Skeleton variant="rounded" width={48} height={48} />
          </Stack>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard elevation={0} sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography
              sx={{
                color: alpha(PALETTE.secondary, 0.92),
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em"
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ color: tint, fontWeight: 950, fontSize: { xs: "1.9rem", md: "2.1rem" }, mt: 0.5 }}>
              {value}
            </Typography>
            {subtitle ? (
              <Typography sx={{ color: PALETTE.secondary, fontSize: "0.78rem", mt: 0.35 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <IconWrapper bgcolor={tint}>
            {icon}
          </IconWrapper>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

function Estadisticas() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(() => now.getFullYear());
  const [month, setMonth] = useState(() => now.getMonth() + 1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // ── Estados de Machine Learning & Predicción
  const [mlLoading, setMlLoading]   = useState(true);
  const [mlError, setMlError]       = useState("");
  const [mlResult, setMlResult]     = useState(null);
  const [historico, setHistorico]   = useState([]);
  const [promedioMes, setPromedioMes] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  // Parámetros dinámicos / manuales para simulación
  const [predForm, setPredForm] = useState({
    dia_semana: "Monday",
    n_citas: 12,
    ingreso_actual: 2400,
    fecha: new Date().toISOString().split("T")[0]
  });

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();
    return [y - 2, y - 1, y, y + 1];
  }, [now]);

  // Carga de estadísticas generales del mes
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await api.get("/api/dashboard/citas-estadisticas-mes", {
        params: { year, month },
        timeout: 10000
      });
      setData(resp.data || null);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "No se pudieron cargar las estadísticas del mes."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Carga del histórico reciente y llamada al modelo ML de predicción
  const fetchMLPrediction = async (customParams = null) => {
    try {
      setMlLoading(true);
      setMlError("");

      // 1. Obtener histórico de los últimos días de la BD
      const histResp = await api.get("/api/prediccion/historico-reciente", { timeout: 10000 });
      const histData = histResp.data?.historico || [];
      const promMes  = histResp.data?.promedioDiario || 0;
      setHistorico(histData);
      setPromedioMes(promMes);

      // Usar el último día registrado o customParams para la predicción
      let payload = customParams;
      if (!payload && histData.length > 0) {
        const ult = histData[histData.length - 1];
        payload = {
          dia_semana: ult.diaSemana || "Monday",
          n_citas: ult.nCitas || 10,
          ingreso_actual: ult.ingreso || 2000,
          fecha: new Date().toISOString().split("T")[0],
          nServicios: ult.nServicios || 12,
          clientesDistintos: ult.clientesDistintos || 8
        };
        setPredForm(payload);
      } else if (!payload) {
        payload = predForm;
      }

      // 2. Ejecutar predicción en el backend proxy / ML service
      const predResp = await api.post("/api/prediccion/ingreso", {
        dia_semana: payload.dia_semana,
        n_citas: Number(payload.n_citas),
        ingreso_actual: Number(payload.ingreso_actual),
        fecha: payload.fecha
      }, { timeout: 20000 });

      setMlResult({
        ...predResp.data,
        nServicios: payload.nServicios ?? 14,
        clientesDistintos: payload.clientesDistintos ?? 9
      });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || "Servicio de predicción no disponible.";
      setMlError(msg);
    } finally {
      setMlLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMLPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const tot = useMemo(() => data?.totales || {}, [data?.totales]);
  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  const promedioDiarioMes = useMemo(() => {
    const total = Number(tot.total || 0);
    const dim = new Date(year, month, 0).getDate();
    if (!dim) return 0;
    return Math.round((total / dim) * 10) / 10;
  }, [tot.total, year, month]);

  // % de incremento de la predicción respecto al promedio mensual
  const pctVsPromedio = useMemo(() => {
    if (!mlResult?.prediccion || !promedioMes) return null;
    const diff = ((mlResult.prediccion - promedioMes) / promedioMes) * 100;
    return Math.round(diff);
  }, [mlResult, promedioMes]);

  // Formato de fecha del pronóstico en tiempo real (ej. "Lunes 27 de julio, 2026")
  const fechaPronosticoFormateada = useMemo(() => {
    const DIAS_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    const targetDow = DIAS_INDEX[predForm.dia_semana] ?? 1;

    // Usar fecha actual de hoy como ancla real
    const hoy = new Date();
    hoy.setHours(12, 0, 0, 0);

    let baseDate = hoy;
    if (predForm.fecha) {
      const [y, m, d] = predForm.fecha.split("-").map(Number);
      const parsedDate = new Date(y, m - 1, d, 12, 0, 0);
      // Si la fecha elegida es válida y cercana o futura a hoy, la tomamos como base
      if (!isNaN(parsedDate.getTime()) && parsedDate >= new Date(hoy.getFullYear(), hoy.getMonth(), 1)) {
        baseDate = parsedDate;
      }
    }

    const currentDow = baseDate.getDay();
    let diffDays = targetDow - currentDow;
    if (diffDays <= 0) {
      diffDays += 7; // Próxima semana para ese mismo día
    }

    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + diffDays);

    const diaNom = DIAS_ES[predForm.dia_semana] || "Día";
    const mesNom = MONTHS[targetDate.getMonth()].toLowerCase();
    return `${diaNom} ${targetDate.getDate()} de ${mesNom}, ${targetDate.getFullYear()}`;
  }, [predForm]);

  // Configuración de la gráfica comparativa ML (Histórico vs Pronóstico)
  const chartDataML = useMemo(() => {
    const labels = [];
    const values = [];
    const isForecast = [];

    // Agregar últimos días históricos
    for (const h of historico) {
      const parts = h.fecha.split("-");
      const labelShort = `${parseInt(parts[2], 10)} ${MONTHS[parseInt(parts[1], 10) - 1].slice(0, 3).toLowerCase()}`;
      labels.push(labelShort);
      values.push(h.ingreso);
      isForecast.push(false);
    }

    // Agregar barra de pronóstico
    if (mlResult?.prediccion) {
      const diaStr = mlResult.dia_semana_es ? mlResult.dia_semana_es.slice(0, 3).toLowerCase() : "prox";
      labels.push(`${diaStr} (pronóstico)`);
      values.push(mlResult.prediccion);
      isForecast.push(true);
    }

    return {
      labels,
      datasets: [
        {
          label: "Ingreso ($)",
          data: values,
          backgroundColor: (ctx) => {
            const idx = ctx.dataIndex;
            if (isForecast[idx]) return "rgba(212, 175, 56, 0.22)"; // Fondo dorado transparente para pronóstico
            return "rgba(59, 130, 246, 0.90)";                       // Azul sólido para histórico
          },
          borderColor: (ctx) => {
            const idx = ctx.dataIndex;
            if (isForecast[idx]) return "#D4AF38"; // Borde dorado
            return "#2563EB";                      // Borde azul
          },
          borderWidth: (ctx) => {
            const idx = ctx.dataIndex;
            return isForecast[idx] ? 2 : 1;
          },
          borderDash: (ctx) => {
            const idx = ctx.dataIndex;
            return isForecast[idx] ? [6, 4] : [];
          },
          borderRadius: 8,
          barThickness: 32
        }
      ]
    };
  }, [historico, mlResult]);

  const chartOptionsML = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const val = ctx.parsed.y;
              return ` $${val.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: PALETTE.secondary, font: { weight: "700", size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: alpha(PALETTE.border, 0.8) },
          ticks: {
            color: PALETTE.secondary,
            font: { size: 11 },
            callback(val) {
              return `$${val}`;
            }
          }
        }
      }
    }),
    []
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 2, md: 3 },
        background: `linear-gradient(180deg, ${PALETTE.pageBg} 0%, ${alpha(PALETTE.cream, 0.3)} 100%)`,
        fontFamily: 'Arial, "Segoe UI", Tahoma, sans-serif'
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 } }}>

        {/* ═══════════════════════════════════════════════════
            HEADER PRINCIPAL CON CONTROLES DE FECHA
        ═══════════════════════════════════════════════════ */}
        <GlassCard
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 4,
            color: "#fff",
            background: "linear-gradient(90deg, #0B1220 0%, #0F172A 40%, #0B1220 100%)",
            boxShadow: "0 20px 50px rgba(2,6,23,0.25)"
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)"
                  }}
                >
                  <BarChartRoundedIcon sx={{ color: PALETTE.accent, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontSize: "0.72rem",
                      color: PALETTE.accent
                    }}
                  >
                    Estadísticas & Inteligencia Predictiva
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.4rem", md: "1.8rem" },
                      lineHeight: 1.15,
                      color: "#fff",
                      mt: 0.2
                    }}
                  >
                    Dashboard Ejecutivo Salón Lady Barber
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip
                      icon={<ContentCutRoundedIcon sx={{ fontSize: 13 }} />}
                      label="Barbería"
                      size="small"
                      sx={{
                        bgcolor: alpha(PALETTE.accent, 0.15),
                        color: PALETTE.darkGold,
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        "& .MuiChip-icon": { color: PALETTE.accent }
                      }}
                    />
                    <Typography sx={{ color: alpha("#CBD5E1", 0.9), fontSize: "0.85rem" }}>
                      Mes seleccionado: <b style={{ color: "#fff" }}>{monthLabel}</b>
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
                <TextField
                  select
                  size="small"
                  label="Mes"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  sx={{
                    minWidth: 150,
                    "& .MuiInputBase-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2 },
                    "& .MuiInputLabel-root": { color: alpha("#E2E8F0", 0.8) },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" }
                  }}
                >
                  {MONTHS.map((m, idx) => (
                    <MenuItem key={m} value={idx + 1}>{m}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Año"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  sx={{
                    minWidth: 120,
                    "& .MuiInputBase-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2 },
                    "& .MuiInputLabel-root": { color: alpha("#E2E8F0", 0.8) },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" }
                  }}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </TextField>
                <Button
                  onClick={() => { fetchData(); fetchMLPrediction(); }}
                  disabled={loading || mlLoading}
                  variant="contained"
                  startIcon={
                    loading || mlLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <ReplayRoundedIcon />
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    bgcolor: PALETTE.blue,
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { bgcolor: "#2563EB" }
                  }}
                >
                  Actualizar
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </GlassCard>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>
        ) : null}

        {/* ═══════════════════════════════════════════════════
            TARJETAS KPI RESUMEN DE RENDIMIENTO
        ═══════════════════════════════════════════════════ */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard({
              title: "Total (mes)",
              value: tot.total ?? 0,
              subtitle: `${promedioDiarioMes} promedio / día`,
              icon: <CalendarMonthRoundedIcon />,
              tint: PALETTE.primary,
              loading
            })}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard({
              title: "Completadas",
              value: tot.completadas ?? 0,
              subtitle: "Estado: COMPLETADA",
              icon: <CheckCircleRoundedIcon />,
              tint: PALETTE.blue,
              loading
            })}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard({
              title: "Canceladas",
              value: tot.canceladas ?? 0,
              subtitle: "Estado: CANCELADA",
              icon: <HighlightOffRoundedIcon />,
              tint: PALETTE.red,
              loading
            })}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard({
              title: "% cancelación",
              value: fmtPct01(tot.tasaCancelacion || 0),
              subtitle: "Canceladas / total",
              icon: <PercentRoundedIcon />,
              tint: PALETTE.accent,
              loading
            })}
          </Grid>
        </Grid>

        {/* ═══════════════════════════════════════════════════
            SECCIÓN PRINCIPAL: PREDICCIÓN DE INGRESO CON MACHINE LEARNING
            (Basada exactamente en el diseño de referencia)
        ═══════════════════════════════════════════════════ */}
        <Box sx={{ mb: 4 }}>
          {/* Título de la sección de ML */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.25rem", md: "1.45rem" },
                  color: PALETTE.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                Predicción de ingreso con Machine Learning
              </Typography>
              <Typography sx={{ color: PALETTE.secondary, fontSize: "0.85rem", mt: 0.2 }}>
                Modelo: <b>Random Forest Regressor</b> · entrenado con histórico de citas, servicios, N.º de citas por día y clientes atendidos.
              </Typography>
            </Box>
            <MuiTooltip title="Personalizar parámetros de entrada del modelo">
              <IconButton
                onClick={() => setShowConfig(!showConfig)}
                sx={{
                  bgcolor: showConfig ? alpha(PALETTE.accent, 0.2) : "rgba(0,0,0,0.04)",
                  border: `1px solid ${alpha(PALETTE.accent, 0.3)}`,
                  color: PALETTE.darkGold
                }}
              >
                <TuneRoundedIcon />
              </IconButton>
            </MuiTooltip>
          </Stack>

          {/* Panel desplegable opcional para simular parámetros manuales */}
          {showConfig && (
            <GlassCard elevation={0} sx={{ p: 2.5, mb: 2, border: `1px dashed ${PALETTE.accent}` }}>
              <Typography sx={{ fontWeight: 800, color: PALETTE.primary, fontSize: "0.9rem", mb: 1.5 }}>
                ⚙️ Simulación Manual de Parámetros de Entrada
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Día de la semana"
                    value={predForm.dia_semana}
                    onChange={(e) => setPredForm((f) => ({ ...f, dia_semana: e.target.value }))}
                  >
                    {Object.entries(DIAS_ES).map(([val, label]) => (
                      <MenuItem key={val} value={val}>{label}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="N° de citas del día"
                    value={predForm.n_citas}
                    onChange={(e) => setPredForm((f) => ({ ...f, n_citas: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Ingreso del día ($)"
                    value={predForm.ingreso_actual}
                    onChange={(e) => setPredForm((f) => ({ ...f, ingreso_actual: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => fetchMLPrediction(predForm)}
                    disabled={mlLoading}
                    startIcon={mlLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <AutoGraphRoundedIcon />}
                    sx={{ bgcolor: PALETTE.accent, color: "#0B1220", fontWeight: 900, "&:hover": { bgcolor: PALETTE.darkGold } }}
                  >
                    Simular
                  </Button>
                </Grid>
              </Grid>
            </GlassCard>
          )}

          {mlError && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              {mlError}
            </Alert>
          )}

          {/* Tarjetas Principales del Pronóstico (Grid de 2 columnas como en la imagen) */}
          <Grid container spacing={2.5}>
            {/* TARJETA IZQUIERDA: PREDICCIÓN DESTACADA (NAVY DARK THEME) */}
            <Grid item xs={12} md={4.5}>
              <GlassCard
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 380,
                  background: "linear-gradient(145deg, #0B1220 0%, #0F172A 60%, #0B1220 100%)",
                  color: "#fff",
                  border: `1px solid ${alpha(PALETTE.accent, 0.3)}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: { xs: 2.5, md: 3 }
                }}
              >
                {/* Header de la tarjeta */}
                <Box>
                  <Typography
                    sx={{
                      color: alpha(PALETTE.accent, 0.95),
                      fontWeight: 800,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em"
                    }}
                  >
                    PREDICCIÓN PARA {DIAS_ES[predForm.dia_semana]?.toUpperCase() || "PRÓXIMO DÍA"}
                  </Typography>
                  <Typography sx={{ color: alpha("#CBD5E1", 0.9), fontSize: "0.85rem", mt: 0.2 }}>
                    {fechaPronosticoFormateada}
                  </Typography>

                  {/* Número Gigante de Predicción */}
                  {mlLoading ? (
                    <Box sx={{ my: 2 }}>
                      <Skeleton width={180} height={56} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                    </Box>
                  ) : (
                    <Box sx={{ my: 2.2 }}>
                      <Typography
                        sx={{
                          fontWeight: 950,
                          fontSize: { xs: "2.5rem", md: "3.2rem" },
                          lineHeight: 1,
                          color: "#FFFFFF",
                          letterSpacing: "-0.02em"
                        }}
                      >
                        ${mlResult?.prediccion ? mlResult.prediccion.toLocaleString("es-MX", { minimumFractionDigits: 2 }) : "0.00"}
                      </Typography>
                      <Typography sx={{ color: alpha("#CBD5E1", 0.8), fontSize: "0.82rem", mt: 0.5 }}>
                        MXN estimados de ingreso
                      </Typography>
                    </Box>
                  )}

                  {/* Pill / Badge comparativo % vs promedio */}
                  {pctVsPromedio !== null && (
                    <Chip
                      icon={<TrendingUpRoundedIcon sx={{ fontSize: 16, color: "#16A34A !important" }} />}
                      label={`${pctVsPromedio >= 0 ? `▲ +${pctVsPromedio}%` : `▼ ${pctVsPromedio}%`} vs. promedio del mes`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(22, 163, 74, 0.2)",
                        color: "#4ADE80",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        py: 0.2
                      }}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

                {/* Sección: Variables usadas por el modelo */}
                <Box>
                  <Typography sx={{ color: alpha("#94A3B8", 0.9), fontWeight: 700, fontSize: "0.8rem", mb: 1 }}>
                    Variables usadas por el modelo
                  </Typography>
                  <Stack spacing={0.6}>
                    <Typography sx={{ color: alpha("#E2E8F0", 0.9), fontSize: "0.82rem" }}>
                      • N.º de citas agendadas: <b>{predForm.n_citas}</b>
                    </Typography>
                    <Typography sx={{ color: alpha("#E2E8F0", 0.9), fontSize: "0.82rem" }}>
                      • N.º de citas del día (nueva variable): <b>{predForm.n_citas}</b>
                    </Typography>
                    <Typography sx={{ color: alpha("#E2E8F0", 0.9), fontSize: "0.82rem" }}>
                      • N.º de servicios: <b>{mlResult?.nServicios || 12}</b>
                    </Typography>
                    <Typography sx={{ color: alpha("#E2E8F0", 0.9), fontSize: "0.82rem" }}>
                      • Clientes distintos: <b>{mlResult?.clientesDistintos || 8}</b>
                    </Typography>
                    <Typography sx={{ color: alpha("#E2E8F0", 0.9), fontSize: "0.82rem" }}>
                      • Día de la semana: <b>{DIAS_ES[predForm.dia_semana]?.toLowerCase() || "lunes"}</b>
                    </Typography>
                  </Stack>
                </Box>
              </GlassCard>
            </Grid>

            {/* TARJETA DERECHA: GRÁFICO COMPARATIVO INGRESO REAL VS PRONÓSTICO */}
            <Grid item xs={12} md={7.5}>
              <GlassCard elevation={0} sx={{ height: "100%", p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: PALETTE.primary }}>
                    Ingreso real vs. pronóstico (últimos 7 días + pronóstico)
                  </Typography>
                  <Typography sx={{ color: PALETTE.secondary, fontSize: "0.82rem", mt: 0.3 }}>
                    El modelo aprende el patrón histórico de citas, servicios y N.º de citas por día para estimar el ingreso de días futuros.
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ height: 280, position: "relative", mt: 1 }}>
                  {mlLoading ? (
                    <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Bar data={chartDataML} options={chartOptionsML} />
                  )}
                </Box>
              </GlassCard>
            </Grid>
          </Grid>
        </Box>

      </Container>
    </Box>
  );
}

export default Estadisticas;
