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
  CircularProgress
} from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DonutSmallRoundedIcon from "@mui/icons-material/DonutSmallRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import api from "../../../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const PALETTE = {
  pageBg: "#F8FAFC",
  card: "#FFFFFF",
  primary: "#1E293B",
  secondary: "#64748B",
  border: "#E2E8F0",
  accent: "#D4AF38",      // Dorado elegante
  navy: "#1E3A5F",        // Azul marino profesional
  green: "#16A34A",
  red: "#EF4444",
  blue: "#3B82F6",
  blueLight: "#93C5FD",
  redLight: "#FCA5A5",
  cream: "#FDF8E8",
  darkGold: "#B8972E"
};

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const GlassCard = styled(Card)(() => ({
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
  width: 52,
  height: 52,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(145deg, ${alpha(bgcolor, 0.15)}, ${alpha(bgcolor, 0.08)})`,
  border: `1px solid ${alpha(bgcolor, 0.2)}`,
  transition: "all 0.3s ease"
}));

const MONTHS = [
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

function fmtPct01(value01) {
  if (!Number.isFinite(value01)) return "0%";
  return `${Math.round(value01 * 100)}%`;
}

function kpiCard({ title, value, subtitle, icon, tint, loading }) {
  if (loading) {
    return (
      <GlassCard elevation={0} sx={{ height: "100%" }}>
        <CardContent sx={{ p: 2.75 }}>
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
      <CardContent sx={{ p: 2.75 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography
              sx={{
                color: alpha(PALETTE.secondary, 0.92),
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em"
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ color: tint, fontWeight: 950, fontSize: { xs: "2rem", md: "2.15rem" }, mt: 0.5 }}>
              {value}
            </Typography>
            {subtitle ? (
              <Typography sx={{ color: PALETTE.secondary, fontSize: "0.8rem", mt: 0.35 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <IconWrapper className="kpiIcon" bgcolor={tint}>
            {icon}
          </IconWrapper>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

function ChartCard({ title, subtitle, children, right }) {
  return (
    <GlassCard elevation={0} sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography className="pcDisplay" sx={{ color: PALETTE.primary, fontWeight: 800, fontSize: "1.05rem" }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography sx={{ color: PALETTE.secondary, fontSize: "0.82rem", mt: 0.35 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {right || null}
        </Stack>
        <Divider sx={{ my: 1.6 }} />
        <Box className="chartZoom" sx={{ transition: "transform 260ms ease" }}>
          {children}
        </Box>
      </CardContent>
    </GlassCard>
  );
}

function daysInMonth(year, month1to12) {
  return new Date(year, month1to12, 0).getDate();
}

function Estadisticas() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(() => now.getFullYear());
  const [month, setMonth] = useState(() => now.getMonth() + 1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();
    return [y - 2, y - 1, y, y + 1];
  }, [now]);

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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const porDia = useMemo(() => data?.porDia || [], [data?.porDia]);
  const tot = useMemo(() => data?.totales || {}, [data?.totales]);

  const diasMes = useMemo(() => daysInMonth(year, month), [year, month]);

  const seriePorDia = useMemo(() => {
    const map = new Map();
    for (const row of porDia) {
      map.set(Number(row.dia), row);
    }
    const full = [];
    for (let dia = 1; dia <= diasMes; dia += 1) {
      const r = map.get(dia);
      const c = Number(r?.completadas || 0);
      const x = Number(r?.canceladas || 0);
      full.push({
        dia,
        label: String(dia),
        completadas: c,
        canceladas: x,
        hasGreen: c > 0,
        hasRed: x > 0
      });
    }
    return full;
  }, [porDia, diasMes]);

  const labels = useMemo(() => seriePorDia.map((x) => x.label), [seriePorDia]);
  const completadas = useMemo(() => seriePorDia.map((x) => x.completadas), [seriePorDia]);
  const canceladas = useMemo(() => seriePorDia.map((x) => x.canceladas), [seriePorDia]);

  const barGradients = useMemo(
    () => ({
      completadas(ctx) {
        const chart = ctx.chart;
        const { ctx: c2d, chartArea } = chart;
        if (!chartArea) return alpha(PALETTE.blue, 0.9);
        const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, alpha(PALETTE.blue, 0.98));
        g.addColorStop(1, alpha(PALETTE.blue, 0.70));
        return g;
      },
      canceladas(ctx) {
        const chart = ctx.chart;
        const { ctx: c2d, chartArea } = chart;
        if (!chartArea) return alpha(PALETTE.red, 0.9);
        const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, alpha(PALETTE.red, 0.98));
        g.addColorStop(1, alpha(PALETTE.red, 0.72));
        return g;
      }
    }),
    []
  );

  const barData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Completadas",
          data: completadas,
          backgroundColor: barGradients.completadas,
          borderColor: PALETTE.blue,
          borderWidth: 0,
          borderRadius: 10,
          maxBarThickness: 22
        },
        {
          label: "Canceladas",
          data: canceladas,
          backgroundColor: barGradients.canceladas,
          borderColor: PALETTE.red,
          borderWidth: 0,
          borderRadius: 10,
          maxBarThickness: 22
        }
      ]
    }),
    [labels, completadas, canceladas, barGradients]
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        // Reservar espacio para etiquetas de ejes personalizadas
        padding: { left: 26, right: 10, top: 6, bottom: 34 }
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 14, color: PALETTE.secondary, font: { weight: "700" } }
        },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: PALETTE.secondary,
            maxRotation: 0,
            autoSkip: false,
            font: { weight: "800" }
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 20,
          max: 20,
          grid: { color: alpha(PALETTE.border, 0.95) },
          ticks: {
            color: PALETTE.secondary,
            stepSize: 1,
            precision: 0,
            callback(value) {
              // Ocultar el 0 para que quede 1..20 como referencia visual
              if (Number(value) === 0) return "";
              return String(value);
            }
          }
        }
      }
    }),
    []
  );

  const areaSeries = useMemo(() => {
    let accC = 0;
    let accX = 0;
    return seriePorDia.map((row) => {
      accC += row.completadas || 0;
      accX += row.canceladas || 0;
      return { dia: String(row.dia), completadas: accC, canceladas: accX };
    });
  }, [seriePorDia]);

  const areaGradients = useMemo(
    () => ({
      completadas(ctx) {
        const chart = ctx.chart;
        const { ctx: c2d, chartArea } = chart;
        if (!chartArea) return alpha(PALETTE.blue, 0.25);
        const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, alpha(PALETTE.blue, 0.35));
        g.addColorStop(1, alpha(PALETTE.blue, 0.05));
        return g;
      },
      canceladas(ctx) {
        const chart = ctx.chart;
        const { ctx: c2d, chartArea } = chart;
        if (!chartArea) return alpha(PALETTE.red, 0.22);
        const g = c2d.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, alpha(PALETTE.red, 0.30));
        g.addColorStop(1, alpha(PALETTE.red, 0.05));
        return g;
      }
    }),
    []
  );

  const areaData = useMemo(
    () => ({
      labels: areaSeries.map((x) => x.dia),
      datasets: [
        {
          label: "Completadas",
          data: areaSeries.map((x) => x.completadas),
          borderColor: PALETTE.blue,
          backgroundColor: areaGradients.completadas,
          tension: 0.25,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5
        },
        {
          label: "Canceladas",
          data: areaSeries.map((x) => x.canceladas),
          borderColor: PALETTE.red,
          backgroundColor: areaGradients.canceladas,
          tension: 0.25,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5
        }
      ]
    }),
    [areaSeries, areaGradients]
  );

  const areaOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, color: PALETTE.secondary, font: { weight: "700" } }
        },
        tooltip: { enabled: true }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: PALETTE.secondary, maxRotation: 0, autoSkip: true } },
        y: { grid: { color: alpha(PALETTE.border, 0.95) }, ticks: { color: PALETTE.secondary, precision: 0 } }
      }
    }),
    []
  );

  const donutData = useMemo(
    () => ({
      labels: ["Atendidas", "Canceladas"],
      datasets: [
        {
          data: [tot.completadas || 0, tot.canceladas || 0],
          backgroundColor: [alpha(PALETTE.blue, 0.92), alpha(PALETTE.red, 0.88)],
          borderColor: [PALETTE.blue, PALETTE.red],
          borderWidth: 1.5
        }
      ]
    }),
    [tot.completadas, tot.canceladas]
  );

  const donutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 14, color: PALETTE.secondary, font: { weight: "600" } }
        }
      },
      cutout: "70%"
    }),
    []
  );


  const monthLabel = `${MONTHS[month - 1]} ${year}`;
  const promedioDiario = useMemo(() => {
    const total = Number(tot.total || 0);
    const days = Number(diasMes || 0);
    if (!days) return 0;
    return Math.round((total / days) * 10) / 10;
  }, [tot.total, diasMes]);

  const pctCompletadas = useMemo(() => {
    const t = Number(tot.total || 0);
    if (!t) return 0;
    return Math.round((Number(tot.completadas || 0) / t) * 100);
  }, [tot.total, tot.completadas]);

  const pctCanceladas = useMemo(() => {
    const t = Number(tot.total || 0);
    if (!t) return 0;
    return Math.round((Number(tot.canceladas || 0) / t) * 100);
  }, [tot.total, tot.canceladas]);

  const headerCardSx = useMemo(
    () => ({
      mb: 2.75,
      borderRadius: 4,
      border: "0px solid transparent",
      color: "#fff",
      overflow: "hidden",
      position: "relative",
      background:
        "linear-gradient(90deg, #0B1220 0%, #0F172A 35%, #0B1220 100%)",
      boxShadow: "0 26px 70px rgba(2,6,23,0.28)"
    }),
    []
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 2, md: 4 },
        background:
          `linear-gradient(180deg, ${PALETTE.pageBg} 0%, ${alpha(PALETTE.cream, 0.3)} 100%)`,
        fontFamily: 'Arial, "Segoe UI", Tahoma, sans-serif',
        fontSize: "12px",
        "& .MuiTypography-root": { fontFamily: 'Arial, "Segoe UI", Tahoma, sans-serif', fontSize: "12px" },
        "& .pcDisplay": { fontFamily: 'Arial, "Segoe UI", Tahoma, sans-serif' }
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        <GlassCard elevation={0} sx={headerCardSx}>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
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
              spacing={2.5}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
              sx={{ position: "relative" }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    backdropFilter: "blur(10px)"
                  }}
                >
                  <BarChartRoundedIcon sx={{ color: alpha(PALETTE.accent, 0.95), fontSize: 30 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontSize: "0.72rem",
                      color: alpha(PALETTE.accent, 0.95)
                    }}
                  >
                    Estadísticas
                  </Typography>
                  <Typography
                    className="pcDisplay"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.45rem", md: "2rem" },
                      lineHeight: 1.12,
                      mt: 0.35
                    }}
                  >
                    Citas atendidas vs canceladas
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Chip
                      icon={<ContentCutRoundedIcon sx={{ fontSize: 14 }} />}
                      label="Barbería"
                      size="small"
                      sx={{
                        bgcolor: alpha(PALETTE.accent, 0.15),
                        color: PALETTE.darkGold,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        "& .MuiChip-icon": { color: PALETTE.accent }
                      }}
                    />
                    <Typography sx={{ color: alpha("#CBD5E1", 0.92), lineHeight: 1.55, fontSize: "0.92rem" }}>
                      Mes seleccionado: <b style={{ color: "#fff" }}>{monthLabel}</b>
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 0.6, color: alpha("#CBD5E1", 0.92), lineHeight: 1.55, fontSize: "0.92rem" }}>
                    Agrupado por <b style={{ color: "#fff" }}>día agendado</b>.
                  </Typography>
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
                    minWidth: 180,
                    "& .MuiInputBase-root": {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.10)",
                      borderRadius: 2,
                      backdropFilter: "blur(10px)"
                    },
                    "& .MuiInputLabel-root": { color: alpha("#E2E8F0", 0.9) },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.20)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.34)" }
                  }}
                >
                  {MONTHS.map((m, idx) => (
                    <MenuItem key={m} value={idx + 1}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Año"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  sx={{
                    minWidth: 140,
                    "& .MuiInputBase-root": {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.10)",
                      borderRadius: 2,
                      backdropFilter: "blur(10px)"
                    },
                    "& .MuiInputLabel-root": { color: alpha("#E2E8F0", 0.9) },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.20)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.34)" }
                  }}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  onClick={fetchData}
                  disabled={loading}
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <ReplayRoundedIcon />
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    bgcolor: PALETTE.blue,
                    borderRadius: 2,
                    px: 2.1,
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
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Grid container spacing={2.25}>
          <Grid item xs={12} sm={6} md={3}>
            {kpiCard({
              title: "Total (mes)",
              value: tot.total ?? 0,
              subtitle: `${promedioDiario} promedio / día`,
              icon: <CalendarMonthRoundedIcon />,
              tint: PALETTE.navy,
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

          <Grid item xs={12}>
            <ChartCard
              title="Citas por día del mes"
              subtitle="Cada día del mes (incluye fines de semana)"
              right={
                <Box
                  sx={{
                    px: 1.6,
                    py: 0.6,
                    borderRadius: 999,
                    bgcolor: alpha(PALETTE.border, 0.55),
                    color: PALETTE.secondary,
                    fontWeight: 800,
                    fontSize: "0.85rem"
                  }}
                >
                  {monthLabel}
                </Box>
              }
            >
              <Box
                sx={{
                  height: 370,
                  position: "relative",
                  pl: 4.5, // espacio visual para etiqueta Y
                  pb: 5.5  // espacio visual para etiqueta X + leyenda
                }}
              >
                {/* Etiquetas de ejes (integradas a la gráfica) */}
                {!loading && (
                  <>
                    <Typography
                      sx={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%) rotate(-90deg)",
                        transformOrigin: "left top",
                        color: alpha(PALETTE.secondary, 0.9),
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                        zIndex: 2
                      }}
                    >
                    · Cantidad de citas
                    </Typography>
                    <Typography
                      sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 44, // arriba de la leyenda
                        textAlign: "center",
                        color: alpha(PALETTE.secondary, 0.9),
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                        zIndex: 2
                      }}
                    >
                      · Día agendado
                    </Typography>
                  </>
                )}

                {loading ? (
                  <Skeleton variant="rounded" height={370} />
                ) : (
                  <Bar data={barData} options={barOptions} />
                )}
              </Box>
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <ChartCard
              title="Distribución total"
              subtitle="Proporción de completadas vs canceladas"
              right={
                <DonutSmallRoundedIcon
                  className="cardRightIcon"
                  sx={{ color: alpha(PALETTE.secondary, 0.7), transition: "transform 260ms ease" }}
                />
              }
            >
              <Box sx={{ height: 290, position: "relative" }}>
                {loading ? (
                  <Box sx={{ height: 290, display: "grid", placeItems: "center" }}>
                    <Skeleton variant="circular" width={220} height={220} />
                  </Box>
                ) : (
                  <>
                    <Doughnut data={donutData} options={donutOptions} />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        pointerEvents: "none"
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 950, color: PALETTE.primary, fontSize: "2.1rem", lineHeight: 1 }}>
                          {tot.total ?? 0}
                        </Typography>
                        <Typography sx={{ color: PALETTE.secondary, fontWeight: 700, fontSize: "0.9rem", mt: 0.4 }}>
                          Total citas
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <ChartCard
              title="Porcentajes"
              subtitle="Tasa de completadas y canceladas"
              right={
                <TrendingUpRoundedIcon
                  className="cardRightIcon"
                  sx={{ color: alpha(PALETTE.secondary, 0.7), transition: "transform 260ms ease" }}
                />
              }
            >
              {loading ? (
                <Box sx={{ height: 290, display: "grid", placeItems: "center" }}>
                  <Skeleton variant="rounded" width="100%" height={220} />
                </Box>
              ) : (
                <Stack spacing={2.25} sx={{ pt: 0.5 }}>
                  <Stack direction="row" spacing={2.25} alignItems="center">
                    <Box sx={{ position: "relative", width: 86, height: 86 }}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={86}
                        thickness={6}
                        sx={{ color: alpha(PALETTE.border, 0.7) }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={pctCompletadas}
                        size={86}
                        thickness={6}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          color: PALETTE.blue,
                          "& .MuiCircularProgress-circle": { strokeLinecap: "round" }
                        }}
                      />
                      <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                        <Typography sx={{ fontWeight: 950, color: PALETTE.primary }}>{pctCompletadas}%</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleRoundedIcon sx={{ color: PALETTE.blue }} />
                        <Typography sx={{ fontWeight: 900, color: PALETTE.primary }}>Completadas</Typography>
                      </Stack>
                      <Typography sx={{ color: PALETTE.secondary, mt: 0.4 }}>
                        {tot.completadas ?? 0} citas · {fmtPct01((tot.total ? (tot.completadas || 0) / tot.total : 0))}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={2.25} alignItems="center">
                    <Box sx={{ position: "relative", width: 86, height: 86 }}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={86}
                        thickness={6}
                        sx={{ color: alpha(PALETTE.border, 0.7) }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={pctCanceladas}
                        size={86}
                        thickness={6}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          color: PALETTE.red,
                          "& .MuiCircularProgress-circle": { strokeLinecap: "round" }
                        }}
                      />
                      <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                        <Typography sx={{ fontWeight: 950, color: PALETTE.primary }}>{pctCanceladas}%</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <HighlightOffRoundedIcon sx={{ color: PALETTE.red }} />
                        <Typography sx={{ fontWeight: 900, color: PALETTE.primary }}>Canceladas</Typography>
                      </Stack>
                      <Typography sx={{ color: PALETTE.secondary, mt: 0.4 }}>
                        {tot.canceladas ?? 0} citas · {fmtPct01((tot.total ? (tot.canceladas || 0) / tot.total : 0))}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12}>
            <ChartCard
              title="Tendencia acumulada"
              subtitle="Evolución acumulada de citas durante el mes"
              right={
                <TimelineRoundedIcon
                  className="cardRightIcon"
                  sx={{ color: alpha(PALETTE.secondary, 0.7), transition: "transform 260ms ease" }}
                />
              }
            >
              <Box sx={{ height: 320 }}>
                {loading ? <Skeleton variant="rounded" height={320} /> : <Line data={areaData} options={areaOptions} />}
              </Box>
            </ChartCard>
          </Grid>

          <Grid item xs={12}>
            <ChartCard
              title="Comparación directa"
              subtitle="Totales por estado (barra de progreso)"
              right={
                <TrendingUpRoundedIcon
                  className="cardRightIcon"
                  sx={{ color: alpha(PALETTE.secondary, 0.7), transition: "transform 260ms ease" }}
                />
              }
            >
              {loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="rounded" height={44} />
                  <Skeleton variant="rounded" height={44} />
                </Stack>
              ) : (
                <Stack spacing={2.25}>
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircleRoundedIcon sx={{ color: PALETTE.blue }} />
                        <Typography sx={{ fontWeight: 900, color: PALETTE.primary }}>Completadas</Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 950, color: PALETTE.blue, fontSize: "1.2rem" }}>
                        {tot.completadas ?? 0}
                      </Typography>
                    </Stack>
                    <Box sx={{ mt: 1.1, height: 14, borderRadius: 999, bgcolor: alpha(PALETTE.border, 0.75), overflow: "hidden" }}>
                      <Box
                        sx={{
                          height: "100%",
                          width: `${tot.total ? (Number(tot.completadas || 0) / Number(tot.total || 1)) * 100 : 0}%`,
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${PALETTE.blue} 0%, #2563EB 100%)`,
                          transition: "width 900ms ease"
                        }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <HighlightOffRoundedIcon sx={{ color: PALETTE.red }} />
                        <Typography sx={{ fontWeight: 900, color: PALETTE.primary }}>Canceladas</Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 950, color: PALETTE.red, fontSize: "1.2rem" }}>
                        {tot.canceladas ?? 0}
                      </Typography>
                    </Stack>
                    <Box sx={{ mt: 1.1, height: 14, borderRadius: 999, bgcolor: alpha(PALETTE.border, 0.75), overflow: "hidden" }}>
                      <Box
                        sx={{
                          height: "100%",
                          width: `${tot.total ? (Number(tot.canceladas || 0) / Number(tot.total || 1)) * 100 : 0}%`,
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${PALETTE.red} 0%, #DC2626 100%)`,
                          transition: "width 900ms ease"
                        }}
                      />
                    </Box>
                  </Box>
                </Stack>
              )}
            </ChartCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Estadisticas;
