import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip as MuiTooltip,
  Typography,
  Fade,
  Grow,
  Slide,
  Zoom
} from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";

// Icons
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Animaciones
const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

// Paleta de colores profesional
const PALETTE = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  primary: "#3B82F6",
  primaryLight: "#EFF6FF",
  success: "#22C55E",
  successLight: "#F0FDF4",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  error: "#EF4444",
  errorLight: "#FEF2F2",
  gold: "#D4AF37",
  goldLight: "#FEF9E7",
  purple: "#8B5CF6",
  purpleLight: "#F5F3FF"
};

// Componentes estilizados
const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(PALETTE.card, 0.95)} 0%, ${alpha(PALETTE.card, 0.85)} 100%)`,
  backdropFilter: "blur(20px)",
  borderRadius: 20,
  border: `1px solid ${alpha(PALETTE.border, 0.6)}`,
  boxShadow: `0 4px 24px ${alpha(PALETTE.text, 0.06)}, 0 1px 2px ${alpha(PALETTE.text, 0.04)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 12px 40px ${alpha(PALETTE.text, 0.1)}, 0 4px 12px ${alpha(PALETTE.text, 0.06)}`
  }
}));

const StatCard = styled(Paper)(({ theme, colorvariant = "primary" }) => {
  const colors = {
    primary: { bg: PALETTE.primaryLight, accent: PALETTE.primary },
    success: { bg: PALETTE.successLight, accent: PALETTE.success },
    warning: { bg: PALETTE.warningLight, accent: PALETTE.warning },
    gold: { bg: PALETTE.goldLight, accent: PALETTE.gold },
    purple: { bg: PALETTE.purpleLight, accent: PALETTE.purple }
  };
  const { bg, accent } = colors[colorvariant] || colors.primary;

  return {
    padding: "20px 24px",
    borderRadius: 16,
    background: `linear-gradient(135deg, ${bg} 0%, ${alpha(bg, 0.5)} 100%)`,
    border: `1px solid ${alpha(accent, 0.15)}`,
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: `linear-gradient(90deg, ${accent}, ${alpha(accent, 0.5)})`,
      borderRadius: "16px 16px 0 0"
    },
    "&:hover": {
      transform: "translateY(-2px) scale(1.01)",
      boxShadow: `0 8px 24px ${alpha(accent, 0.15)}`
    }
  };
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(PALETTE.border, 0.8)}`,
  background: PALETTE.card,
  overflow: "hidden",
  "& .MuiTable-root": {
    borderCollapse: "separate",
    borderSpacing: 0
  }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableCell-head": {
    background: `linear-gradient(180deg, ${PALETTE.bg} 0%, ${alpha(PALETTE.bg, 0.8)} 100%)`,
    color: PALETTE.textSecondary,
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom: `2px solid ${alpha(PALETTE.border, 0.8)}`,
    padding: "14px 16px"
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    background: `linear-gradient(90deg, ${alpha(PALETTE.primary, 0.04)} 0%, transparent 100%)`
  },
  "& .MuiTableCell-body": {
    borderBottom: `1px solid ${alpha(PALETTE.border, 0.5)}`,
    padding: "12px 16px",
    fontSize: 13,
    color: PALETTE.text
  },
  "&:last-child .MuiTableCell-body": {
    borderBottom: "none"
  }
}));

const LiveBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 14px",
  borderRadius: 50,
  background: `linear-gradient(135deg, ${alpha(PALETTE.success, 0.12)} 0%, ${alpha(PALETTE.success, 0.06)} 100%)`,
  border: `1px solid ${alpha(PALETTE.success, 0.25)}`,
  "& .dot": {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: PALETTE.success,
    animation: `${pulseAnimation} 1.5s ease-in-out infinite`
  }
}));

const IconWrapper = styled(Box)(({ theme, color = PALETTE.primary }) => ({
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
  color: color,
  transition: "all 0.3s ease",
  animation: `${floatAnimation} 3s ease-in-out infinite`
}));

// Funciones de utilidad
function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length - 1);
  const value = n / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function formatUptime(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "—";
  const total = Math.floor(s);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (x) => String(x).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function getMemoryPercentage(free, total) {
  const f = Number(free);
  const t = Number(total);
  if (!Number.isFinite(f) || !Number.isFinite(t) || t === 0) return 0;
  return Math.round(((t - f) / t) * 100);
}

function MonitorDashboard({ apiUrl }) {
  const API_URL = apiUrl || process.env.REACT_APP_API_URL || "http://localhost:4000";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const cargar = async ({ mostrarLoader = false } = {}) => {
    try {
      if (mostrarLoader) setLoading(true);
      else setActualizando(true);
      setError("");

      const res = await axios.get(`${API_URL}/api/monitor`, {
        timeout: 8000,
        ...(mostrarLoader ? {} : { barberOverlay: false })
      });
      setData(res.data || null);
      setLastUpdate(new Date());
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cargar la información de monitoreo.";
      setError(msg);
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargar({ mostrarLoader: true });

    intervalRef.current = setInterval(() => {
      cargar({ mostrarLoader: false });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [API_URL]);

  const dbStatus = data?.dbStatus || {};
  const server = data?.server || {};
  const queries = Array.isArray(data?.queries) ? data.queries : [];
  const usuarios = Array.isArray(data?.usuarios) ? data.usuarios : [];
  const tablas = Array.isArray(data?.tablas) ? data.tablas : [];

  const estadoDb = String(dbStatus?.estado || "").toLowerCase();
  const dbConectada = estadoDb === "conectado";

  const memoryUsage = getMemoryPercentage(server?.memoriaLibre, server?.memoriaTotal);

  const queriesRecientes = useMemo(() => {
    const arr = [...queries];
    arr.sort((a, b) => new Date(b?.fecha).getTime() - new Date(a?.fecha).getTime());
    return arr.slice(0, 50);
  }, [queries]);

  const chartSeries = useMemo(() => {
    const asc = [...queriesRecientes].sort(
      (a, b) => new Date(a?.fecha).getTime() - new Date(b?.fecha).getTime()
    );

    const labels = asc.map((q) => {
      const d = new Date(q?.fecha);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    });

    const valores = asc.map((q) => {
      const n = Number(q?.tiempo ?? q?.ms ?? q?.timeMs);
      return Number.isFinite(n) ? n : null;
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: "Tiempo (ms)",
          data: valores,
          borderColor: PALETTE.primary,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 180);
            gradient.addColorStop(0, alpha(PALETTE.primary, 0.25));
            gradient.addColorStop(1, alpha(PALETTE.primary, 0.02));
            return gradient;
          },
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: PALETTE.card,
          pointBorderColor: PALETTE.primary,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: PALETTE.primary,
          pointHoverBorderColor: PALETTE.card,
          pointHoverBorderWidth: 2,
          spanGaps: true,
          borderWidth: 2.5
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500,
        easing: "easeOutQuart"
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: PALETTE.text,
          titleColor: PALETTE.card,
          bodyColor: PALETTE.card,
          borderColor: alpha(PALETTE.card, 0.1),
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          titleFont: { weight: "bold", size: 12 },
          bodyFont: { size: 13 },
          callbacks: {
            label: (ctx) => ` ${ctx.parsed?.y ?? "—"} ms`
          }
        }
      },
      scales: {
        x: {
          grid: { 
            display: false
          },
          title: {
            display: true,
            text: "Hora (en tiempo real)",
            color: PALETTE.textSecondary,
            font: { size: 12, weight: "600" },
            padding: { top: 10 }
          },
          ticks: {
            color: PALETTE.textMuted,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
            font: { size: 11 }
          },
          border: { display: false }
        },
        y: {
          grid: { 
            color: alpha(PALETTE.border, 0.5),
            drawBorder: false
          },
          title: {
            display: true,
            text: "Tiempo de respuesta (ms)",
            color: PALETTE.textSecondary,
            font: { size: 12, weight: "600" },
            padding: { bottom: 6 }
          },
          ticks: { 
            color: PALETTE.textMuted,
            font: { size: 11 },
            padding: 8
          },
          border: { display: false }
        }
      }
    };

    const lastFecha = asc.length ? String(asc[asc.length - 1]?.fecha || "") : "";
    const key = `${asc.length}-${lastFecha}`;

    return { data: chartData, options, key, count: asc.length };
  }, [queriesRecientes]);

  // Skeleton loader
  const LoadingSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton 
              variant="rounded" 
              height={120} 
              sx={{ borderRadius: 4, animation: `${shimmerAnimation} 1.5s infinite linear`, backgroundSize: "200% 100%" }} 
            />
          </Grid>
        ))}
        <Grid item xs={12} md={5}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 4 }} />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: PALETTE.bg,
      p: { xs: 2, md: 3 }
    }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${PALETTE.primary} 0%, ${alpha(PALETTE.primary, 0.8)} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${alpha(PALETTE.primary, 0.35)}`
            }}>
              <SpeedRoundedIcon sx={{ color: PALETTE.card, fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                color: PALETTE.text,
                letterSpacing: "-0.02em"
              }}>
                Panel de Monitoreo
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.textSecondary }}>
                Estado del sistema en tiempo real
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LiveBadge>
              <span className="dot" />
              <Typography variant="caption" sx={{ 
                fontWeight: 700, 
                color: PALETTE.success,
                fontSize: 12
              }}>
                {actualizando ? "Actualizando..." : "En vivo"}
              </Typography>
            </LiveBadge>

            <MuiTooltip title="Actualizar ahora" arrow>
              <IconButton 
                onClick={() => cargar({ mostrarLoader: false })}
                disabled={actualizando}
                sx={{
                  bgcolor: PALETTE.card,
                  border: `1px solid ${PALETTE.border}`,
                  "&:hover": { bgcolor: alpha(PALETTE.primary, 0.08) },
                  transition: "all 0.2s"
                }}
              >
                <RefreshRoundedIcon sx={{ 
                  color: PALETTE.textSecondary,
                  animation: actualizando ? `${pulseAnimation} 1s infinite` : "none"
                }} />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Grow in timeout={400}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              bgcolor: PALETTE.errorLight,
              border: `1px solid ${alpha(PALETTE.error, 0.2)}`,
              "& .MuiAlert-icon": { color: PALETTE.error }
            }}
          >
            {error}
          </Alert>
        </Grow>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} lg={3}>
            <Grow in timeout={500}>
              <StatCard elevation={0} colorvariant="success">
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: PALETTE.textMuted, 
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: 11
                    }}>
                      Estado de BD
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
                      <Chip
                        icon={dbConectada ? 
                          <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> : 
                          <ErrorRoundedIcon sx={{ fontSize: 16 }} />
                        }
                        label={dbConectada ? "Conectado" : "Desconectado"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 12,
                          height: 28,
                          bgcolor: dbConectada ? alpha(PALETTE.success, 0.12) : alpha(PALETTE.error, 0.12),
                          color: dbConectada ? PALETTE.success : PALETTE.error,
                          border: `1px solid ${dbConectada ? alpha(PALETTE.success, 0.3) : alpha(PALETTE.error, 0.3)}`,
                          animation: dbConectada ? `${glowAnimation} 2s ease-in-out infinite` : "none",
                          "& .MuiChip-icon": {
                            color: "inherit"
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: PALETTE.textSecondary, 
                      mt: 1,
                      fontSize: 12
                    }}>
                      Respuesta: {dbStatus?.tiempoRespuesta || "—"}
                    </Typography>
                  </Box>
                  <IconWrapper color={PALETTE.success}>
                    <StorageRoundedIcon sx={{ fontSize: 22 }} />
                  </IconWrapper>
                </Box>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Grow in timeout={600}>
              <StatCard elevation={0} colorvariant="primary">
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: PALETTE.textMuted, 
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: 11
                    }}>
                      Uptime
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800, 
                      color: PALETTE.text,
                      mt: 0.5,
                      letterSpacing: "-0.02em",
                      fontFamily: "monospace"
                    }}>
                      {formatUptime(server?.uptime)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: PALETTE.textSecondary, 
                      mt: 0.5,
                      fontSize: 12
                    }}>
                      Tiempo activo
                    </Typography>
                  </Box>
                  <IconWrapper color={PALETTE.primary}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 22 }} />
                  </IconWrapper>
                </Box>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Grow in timeout={700}>
              <StatCard elevation={0} colorvariant="purple">
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ 
                      color: PALETTE.textMuted, 
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: 11
                    }}>
                      Memoria
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800, 
                      color: PALETTE.text,
                      mt: 0.5,
                      letterSpacing: "-0.02em"
                    }}>
                      {memoryUsage}%
                    </Typography>
                    <Box sx={{ 
                      mt: 1.25,
                      height: 6,
                      bgcolor: alpha(PALETTE.purple, 0.15),
                      borderRadius: 10,
                      overflow: "hidden"
                    }}>
                      <Box sx={{
                        width: `${memoryUsage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${PALETTE.purple}, ${alpha(PALETTE.purple, 0.7)})`,
                        borderRadius: 10,
                        transition: "width 0.5s ease"
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ 
                      color: PALETTE.textMuted,
                      mt: 0.5,
                      display: "block",
                      fontSize: 11
                    }}>
                      {formatBytes(server?.memoriaLibre)} libre de {formatBytes(server?.memoriaTotal)}
                    </Typography>
                  </Box>
                  <IconWrapper color={PALETTE.purple}>
                    <MemoryRoundedIcon sx={{ fontSize: 22 }} />
                  </IconWrapper>
                </Box>
              </StatCard>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Grow in timeout={800}>
              <StatCard elevation={0} colorvariant="gold">
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: PALETTE.textMuted, 
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: 11
                    }}>
                      Total Queries
                    </Typography>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800, 
                      color: PALETTE.text,
                      mt: 0.5,
                      letterSpacing: "-0.02em"
                    }}>
                      {queries.length}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <TrendingUpRoundedIcon sx={{ fontSize: 14, color: PALETTE.success }} />
                      <Typography variant="body2" sx={{ 
                        color: PALETTE.success,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        Últimas 24h
                      </Typography>
                    </Box>
                  </Box>
                  <IconWrapper color={PALETTE.gold}>
                    <QueryStatsRoundedIcon sx={{ fontSize: 22 }} />
                  </IconWrapper>
                </Box>
              </StatCard>
            </Grow>
          </Grid>

          {/* Usuarios Activos */}
          <Grid item xs={12} lg={5}>
            <Slide direction="up" in timeout={600}>
              <GlassCard elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        bgcolor: alpha(PALETTE.primary, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <PeopleAltRoundedIcon sx={{ color: PALETTE.primary, fontSize: 20 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: PALETTE.text, fontSize: 16 }}>
                        Usuarios Activos
                      </Typography>
                    </Box>
                    <Chip
                      label={`${usuarios.length} usuarios`}
                      size="small"
                      sx={{
                        bgcolor: alpha(PALETTE.primary, 0.1),
                        color: PALETTE.primary,
                        fontWeight: 700,
                        fontSize: 11
                      }}
                    />
                  </Box>

                  {usuarios.length === 0 ? (
                    <Box sx={{ 
                      py: 6, 
                      textAlign: "center",
                      bgcolor: alpha(PALETTE.bg, 0.5),
                      borderRadius: 3
                    }}>
                      <PeopleAltRoundedIcon sx={{ fontSize: 40, color: PALETTE.textMuted, mb: 1 }} />
                      <Typography sx={{ color: PALETTE.textMuted, fontWeight: 500 }}>
                        Sin usuarios activos
                      </Typography>
                    </Box>
                  ) : (
                    <StyledTableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <StyledTableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Última conexión</TableCell>
                          </TableRow>
                        </StyledTableHead>
                        <TableBody>
                          {usuarios.slice(0, 50).map((u, idx) => {
                            const id = u?.id ?? u?.usuarioId ?? idx;
                            const rol = u?.rol ?? u?.role ?? "—";
                            const activo =
                              typeof u?.activo === "boolean"
                                ? u.activo
                                : typeof u?.active === "boolean"
                                  ? u.active
                                  : null;
                            const ultima = u?.ultimaConexion ?? u?.ultima_conexion ?? u?.lastConnection ?? u?.last_login;
                            return (
                              <Fade in timeout={300 + idx * 50} key={String(id)}>
                                <StyledTableRow hover>
                                  <TableCell sx={{ 
                                    fontFamily: "monospace", 
                                    fontSize: 12,
                                    fontWeight: 600
                                  }}>
                                    #{id ?? "—"}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={rol}
                                      size="small"
                                      sx={{
                                        height: 22,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        bgcolor: alpha(PALETTE.textMuted, 0.1),
                                        color: PALETTE.textSecondary
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {activo === null ? (
                                      "—"
                                    ) : (
                                      <Chip
                                        size="small"
                                        label={activo ? "Activo" : "Inactivo"}
                                        sx={{
                                          height: 22,
                                          fontSize: 11,
                                          fontWeight: 700,
                                          bgcolor: activo ? alpha(PALETTE.success, 0.12) : alpha(PALETTE.error, 0.1),
                                          color: activo ? PALETTE.success : PALETTE.error
                                        }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ fontSize: 12, color: PALETTE.textSecondary }}>
                                    {formatDate(ultima)}
                                  </TableCell>
                                </StyledTableRow>
                              </Fade>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </StyledTableContainer>
                  )}
                </CardContent>
              </GlassCard>
            </Slide>
          </Grid>

          {/* Tablas y Registros */}
          <Grid item xs={12} lg={7}>
            <Slide direction="up" in timeout={700}>
              <GlassCard elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        bgcolor: alpha(PALETTE.gold, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <TableChartRoundedIcon sx={{ color: PALETTE.gold, fontSize: 20 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: PALETTE.text, fontSize: 16 }}>
                        Tablas y Registros
                      </Typography>
                    </Box>
                    <Chip
                      label={`${tablas.length} tablas`}
                      size="small"
                      sx={{
                        bgcolor: alpha(PALETTE.gold, 0.12),
                        color: PALETTE.gold,
                        fontWeight: 700,
                        fontSize: 11
                      }}
                    />
                  </Box>

                  {tablas.length === 0 ? (
                    <Box sx={{ 
                      py: 6, 
                      textAlign: "center",
                      bgcolor: alpha(PALETTE.bg, 0.5),
                      borderRadius: 3
                    }}>
                      <TableChartRoundedIcon sx={{ fontSize: 40, color: PALETTE.textMuted, mb: 1 }} />
                      <Typography sx={{ color: PALETTE.textMuted, fontWeight: 500 }}>
                        No hay información de tablas disponible
                      </Typography>
                    </Box>
                  ) : (
                    <StyledTableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <StyledTableHead>
                          <TableRow>
                            <TableCell>Tabla</TableCell>
                            <TableCell align="right">Registros</TableCell>
                          </TableRow>
                        </StyledTableHead>
                        <TableBody>
                          {tablas.map((t, idx) => {
                            const nombre = t?.tabla ?? t?.nombre ?? "";
                            const registros = t?.registros ?? t?.count ?? 0;
                            return (
                              <Fade in timeout={300 + idx * 30} key={`${idx}-${String(nombre)}`}>
                                <StyledTableRow hover>
                                  <TableCell
                                    sx={{
                                      maxWidth: 280,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap"
                                    }}
                                    title={nombre}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        bgcolor: alpha(PALETTE.primary, 0.5)
                                      }} />
                                      <Typography sx={{ 
                                        fontFamily: "monospace", 
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: PALETTE.text
                                      }}>
                                        {nombre || "—"}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography sx={{ 
                                      fontWeight: 700, 
                                      color: PALETTE.text,
                                      fontSize: 13
                                    }}>
                                      {Number.isFinite(Number(registros)) 
                                        ? Number(registros).toLocaleString() 
                                        : "—"}
                                    </Typography>
                                  </TableCell>
                                </StyledTableRow>
                              </Fade>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </StyledTableContainer>
                  )}
                </CardContent>
              </GlassCard>
            </Slide>
          </Grid>

          {/* Gráfica de Queries */}
          <Grid item xs={12}>
            <Zoom in timeout={800}>
              <GlassCard elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        bgcolor: alpha(PALETTE.primary, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <TrendingUpRoundedIcon sx={{ color: PALETTE.primary, fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: PALETTE.text, fontSize: 16 }}>
                          Métricas de Queries
                        </Typography>
                        <Typography variant="caption" sx={{ color: PALETTE.textMuted }}>
                          Tiempo de respuesta en milisegundos
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Chip
                        label={`${queries.length} total`}
                        size="small"
                        sx={{
                          bgcolor: alpha(PALETTE.primary, 0.1),
                          color: PALETTE.primary,
                          fontWeight: 700,
                          fontSize: 11
                        }}
                      />
                      <Chip
                        label="Refresco: 5s"
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: PALETTE.border,
                          color: PALETTE.textSecondary,
                          fontWeight: 600,
                          fontSize: 11
                        }}
                      />
                    </Box>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      bgcolor: alpha(PALETTE.bg, 0.5),
                      border: `1px solid ${alpha(PALETTE.border, 0.5)}`
                    }}
                  >
                    {chartSeries.count === 0 ? (
                      <Box sx={{ 
                        py: 8, 
                        textAlign: "center" 
                      }}>
                        <QueryStatsRoundedIcon sx={{ fontSize: 48, color: PALETTE.textMuted, mb: 1.5 }} />
                        <Typography sx={{ color: PALETTE.textMuted, fontWeight: 500 }}>
                          No hay datos para graficar todavía
                        </Typography>
                        <Typography variant="caption" sx={{ color: PALETTE.textMuted }}>
                          Los datos aparecerán cuando el servidor procese queries
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ height: 220 }}>
                        <Line
                          key={chartSeries.key}
                          data={chartSeries.data}
                          options={chartSeries.options}
                        />
                      </Box>
                    )}
                  </Paper>

                  {/* Footer con última actualización */}
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${alpha(PALETTE.border, 0.5)}`
                  }}>
                    <Typography variant="caption" sx={{ color: PALETTE.textMuted }}>
                      Endpoint: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{API_URL}/api/monitor</span>
                    </Typography>
                    {lastUpdate && (
                      <Typography variant="caption" sx={{ color: PALETTE.textMuted }}>
                        Última actualización: {lastUpdate.toLocaleTimeString()}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </GlassCard>
            </Zoom>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default MonitorDashboard;