import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Link,
  LinearProgress,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import AdminPageShell from "../../../ui/admin/AdminPageShell";
import { GlassCard, IconWrapper } from "../../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../../ui/admin/adminTokens";

const RADIUS = 14;
const TABLE_RADIUS = 12;

function getInitials(name) {
  const cleaned = String(name || "")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/g).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (first + second).toUpperCase();
}

function Respaldo({ embedded = false }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState("");
  const inlineSuccessTimerRef = useRef(null);
  const [toast, setToast] = useState({
    open: false,
    severity: "info",
    message: ""
  });
  const [dbInfo, setDbInfo] = useState({
    dbName: "salonladybarber",
    lastBackupLabel: "—",
    sizeLabel: "—"
  });
  const [isFullHistory, setIsFullHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [scheduledTime, setScheduledTime] = useState("02:00");

  const fallbackRows = useMemo(
    () => [
      {
        id: "r1",
        dateTime: "24 May 2024 14:30:12",
        type: "BD + Archivos",
        user: "Admin_Itza",
        status: "completed"
      },
      {
        id: "r2",
        dateTime: "23 May 2024 09:15:44",
        type: "Solo BD",
        user: "Soporte_Gen",
        status: "in_progress"
      },
      {
        id: "r3",
        dateTime: "20 May 2024 22:45:01",
        type: "BD + Archivos",
        user: "Admin_Itza",
        status: "error"
      },
      {
        id: "r4",
        dateTime: "15 May 2024 11:00:00",
        type: "Solo BD",
        user: "Auto_System",
        status: "completed"
      }
    ],
    []
  );

  const [rows, setRows] = useState(fallbackRows);

  const API_BASE = useMemo(() => {
    try {
      // Vite projects
      if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
    } catch {
      // ignore
    }
    return "http://localhost:4000";
  }, []);

  const fetchInfo = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/respaldo/info`);
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || "No se pudo cargar la información del respaldo");

    setDbInfo({
      dbName: data.dbName || "salonladybarber",
      lastBackupLabel: data.lastBackupAtLabel || "Sin respaldos",
      sizeLabel: data.lastBackupSizeLabel || "0.00 GB"
    });
  }, [API_BASE]);

  const fetchHistory = useCallback(async () => {
    const limit = isFullHistory ? 10 : 5;
    const offset = isFullHistory ? historyPage * limit : 0;

    const res = await fetch(`${API_BASE}/api/respaldo/historial?limit=${limit}&offset=${offset}`);
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || "No se pudo cargar el historial de respaldos");

    const nextRows = Array.isArray(data.rows) ? data.rows : [];
    setHistoryTotal(Number.isFinite(Number(data.total)) ? Number(data.total) : nextRows.length);
    setRows(
      nextRows.length
        ? nextRows.map((r) => ({
            id: r.id,
            dateTime: r.dateTime,
            type: r.type,
            user: r.user,
            status: r.status,
            fileName: r.fileName
          }))
        : fallbackRows
    );
  }, [API_BASE, fallbackRows, historyPage, isFullHistory]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchInfo(), fetchHistory()]);
  }, [fetchHistory, fetchInfo]);

  useEffect(() => {
    refreshAll().catch((err) => console.error("[Respaldo] Error cargando datos", err));
  }, [refreshAll]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setInlineSuccess("");

    try {
      console.log("[Respaldo] Generar respaldo automático");
      setToast({ open: true, severity: "info", message: "Generando respaldo... por favor no cierres esta ventana." });
      const res = await fetch(`${API_BASE}/api/respaldo/generar`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Error al generar respaldo");

      await refreshAll();

      setInlineSuccess("Respaldo creado y subido a Drive correctamente.");
      if (inlineSuccessTimerRef.current) {
        window.clearTimeout(inlineSuccessTimerRef.current);
      }
      inlineSuccessTimerRef.current = window.setTimeout(() => setInlineSuccess(""), 5000);
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        severity: "error",
        message: err?.message ? `No se pudo generar el respaldo: ${err.message}` : "No se pudo generar el respaldo."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (inlineSuccessTimerRef.current) {
        window.clearTimeout(inlineSuccessTimerRef.current);
      }
    };
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      await refreshAll();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveSchedule = () => {
    // UI-only por ahora (el backend ya está programado a las 2:00 AM).
    // Más adelante podemos conectar esto a un endpoint de configuración.
    setToast({
      open: true,
      severity: "info",
      message: `Horario guardado (UI): ${scheduledTime}. Actualmente el servidor ejecuta limpieza/cron local a las 2:00 AM.`
    });
  };

  const statusChip = (status) => {
    if (status === "completed") {
      return (
        <Chip
          icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
          label="Completado"
          size="small"
          sx={{
            bgcolor: alpha(P.green, 0.12),
            color: P.green,
            fontWeight: 800,
            borderRadius: 999,
            height: 22,
            border: `1px solid ${alpha(P.green, 0.22)}`,
            "& .MuiChip-label": { px: 0.8, fontSize: 11.5 },
            "& .MuiChip-icon": { color: P.green, ml: 0.6 }
          }}
        />
      );
    }

    if (status === "in_progress") {
      return (
        <Chip
          icon={<HourglassTopRoundedIcon sx={{ fontSize: 16 }} />}
          label="En progreso"
          size="small"
          sx={{
            bgcolor: alpha(P.blue, 0.10),
            color: P.blue,
            fontWeight: 800,
            borderRadius: 999,
            height: 22,
            border: `1px solid ${alpha(P.blue, 0.22)}`,
            "& .MuiChip-label": { px: 0.8, fontSize: 11.5 },
            "& .MuiChip-icon": { color: P.blue, ml: 0.6 }
          }}
        />
      );
    }

    return (
      <Chip
        icon={<ErrorOutlineRoundedIcon sx={{ fontSize: 16 }} />}
        label="Error"
        size="small"
        sx={{
          bgcolor: alpha(P.red, 0.10),
          color: P.red,
          fontWeight: 800,
          borderRadius: 999,
          height: 22,
          border: `1px solid ${alpha(P.red, 0.22)}`,
          "& .MuiChip-label": { px: 0.8, fontSize: 11.5 },
          "& .MuiChip-icon": { color: P.red, ml: 0.6 }
        }}
      />
    );
  };

  const rowsPerPage = isFullHistory ? 10 : 5;
  const totalPages = Math.max(1, Math.ceil((historyTotal || 0) / rowsPerPage));

  const content = (
    <Box sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      {/* Header (como TSX) */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <ShieldRoundedIcon sx={{ color: P.blue, fontSize: 26 }} />
            <Typography className="pcDisplay" sx={{ color: P.primary, fontWeight: 800, fontSize: "1.45rem" }}>
              Sistema de Respaldo
            </Typography>
          </Stack>
          <Typography sx={{ color: P.secondary, mt: 0.6 }}>
            Administra y genera respaldos de la base de datos
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={handleRefresh}
          disabled={isRefreshing}
          startIcon={<RefreshRoundedIcon sx={{ ...(isRefreshing ? { animation: "spin 1s linear infinite" } : {}) }} />}
          sx={{
            alignSelf: { xs: "flex-start", sm: "auto" },
            borderColor: alpha(P.navy, 0.25),
            color: P.navy,
            "&:hover": { borderColor: alpha(P.navy, 0.4), bgcolor: alpha(P.navy, 0.05) }
          }}
        >
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        {/* Row 1: Información + Programación */}
        <Grid item xs={12} md={6}>
          <GlassCard elevation={0} sx={{ height: "100%" }}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
                <StorageRoundedIcon sx={{ color: P.navy }} />
                <Typography sx={{ color: P.primary, fontWeight: 900 }}>
                  Información de la Base
                </Typography>
              </Stack>
              <Typography sx={{ color: P.secondary, fontSize: "0.85rem", mb: 2 }}>
                Estado actual del sistema
              </Typography>

              <Stack spacing={1.25}>
                <Box sx={{ display: "flex", gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: alpha(P.border, 0.35) }}>
                  <IconWrapper bgcolor={P.blue}>
                    <StorageRoundedIcon sx={{ color: P.blue, fontSize: 18 }} />
                  </IconWrapper>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Nombre de la Base
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {dbInfo.dbName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: alpha(P.border, 0.35) }}>
                  <IconWrapper bgcolor={P.green}>
                    <AccessTimeRoundedIcon sx={{ color: P.green, fontSize: 18 }} />
                  </IconWrapper>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Último Respaldo
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900 }}>
                      {dbInfo.lastBackupLabel}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: alpha(P.border, 0.35) }}>
                  <IconWrapper bgcolor={P.accent}>
                    <StorageRoundedIcon sx={{ color: P.accent, fontSize: 18 }} />
                  </IconWrapper>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Tamaño Actual
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900 }}>
                      {dbInfo.sizeLabel}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassCard elevation={0} sx={{ height: "100%" }}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
                <ScheduleRoundedIcon sx={{ color: P.navy }} />
                <Typography sx={{ color: P.primary, fontWeight: 900 }}>
                  Programación
                </Typography>
              </Stack>
              <Typography sx={{ color: P.secondary, fontSize: "0.85rem", mb: 2 }}>
                Configura respaldos automáticos
              </Typography>

              <Stack spacing={1.5}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: P.secondary, fontSize: "0.82rem", mb: 0.75 }}>
                    Hora de respaldo automático
                  </Typography>
                  <TextField
                    type="time"
                    size="small"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2.5 }
                    }}
                  />
                </Box>
                <Typography sx={{ color: P.secondary, fontSize: "0.78rem" }}>
                  Nota: los respaldos locales con más de 30 días se eliminan automáticamente.
                </Typography>
                <Button variant="contained" color="primary" startIcon={<AccessTimeRoundedIcon />} onClick={handleSaveSchedule}>
                  Guardar horario
                </Button>
              </Stack>
            </Box>
          </GlassCard>
        </Grid>

        {/* Row 2: Aviso + Acción principal */}
        <Grid item xs={12} md={8}>
          <Alert
            severity="warning"
            icon={<WarningAmberRoundedIcon />}
            sx={{
              height: "100%",
              borderRadius: 3,
              border: `1px solid ${alpha(P.accent, 0.35)}`,
              bgcolor: "#FEF3C7",
              color: P.primary
            }}
          >
            <Typography sx={{ fontWeight: 900, mb: 0.35 }}>Importante</Typography>
            <Typography sx={{ color: alpha(P.primary, 0.8), fontSize: "0.9rem" }}>
              Los respaldos completos pueden tardar varios minutos dependiendo del tamaño de la galería de fotos.
              Por favor, no cierres esta ventana durante el proceso.
            </Typography>
          </Alert>
        </Grid>

        <Grid item xs={12} md={4}>
          <GlassCard elevation={0} sx={{ height: "100%", borderColor: alpha(P.blue, 0.25), bgcolor: `linear-gradient(145deg, ${P.card} 0%, ${alpha(P.blue, 0.06)} 100%)` }}>
            <Box sx={{ p: 2.5 }}>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                startIcon={isGenerating ? <HourglassTopRoundedIcon /> : <CloudUploadOutlinedIcon />}
                sx={{ py: 1.45, fontSize: "1rem" }}
              >
                {isGenerating ? "Generando..." : "Generar Respaldo Automático"}
              </Button>

              {isGenerating ? (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: alpha(P.border, 0.9),
                      "& .MuiLinearProgress-bar": { bgcolor: P.blue }
                    }}
                  />
                  <Typography sx={{ mt: 1, color: P.secondary, fontSize: "0.85rem", textAlign: "center" }}>
                    Generando y subiendo a Drive...
                  </Typography>
                </Box>
              ) : null}

              {!isGenerating && inlineSuccess ? (
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <CheckCircleRoundedIcon sx={{ color: P.green, fontSize: 18 }} />
                  <Typography sx={{ color: P.green, fontWeight: 800, fontSize: "0.9rem" }}>
                    {inlineSuccess}
                  </Typography>
                </Stack>
              ) : null}
            </Box>
          </GlassCard>
        </Grid>

        {/* Row 3: Historial a ancho completo */}
        <Grid item xs={12}>
          <GlassCard elevation={0}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.05rem" }}>
                    Historial de Respaldos
                  </Typography>
                  <Typography sx={{ color: P.secondary, fontSize: "0.85rem", mt: 0.25 }}>
                    {isFullHistory ? "Mostrando todos los registros" : "Últimos 5 respaldos"}
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  startIcon={<RefreshRoundedIcon />}
                  sx={{ color: P.blue, fontWeight: 900, alignSelf: { xs: "flex-start", sm: "auto" } }}
                >
                  {isRefreshing ? "Actualizando..." : "Actualizar lista"}
                </Button>
              </Stack>

            <TableContainer
              component={Box}
              sx={{
                borderRadius: `${TABLE_RADIUS}px`,
                overflow: "hidden",
                border: `1px solid ${alpha(P.border, 0.9)}`,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                maxHeight: isFullHistory ? { xs: 420, md: 520 } : "none",
                overflowY: isFullHistory ? "auto" : "hidden"
              }}
            >
              <Table size="small" aria-label="Historial de respaldos" stickyHeader={isFullHistory}>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(P.navy, 0.06) }}>
                    <TableCell
                      sx={{
                        color: P.secondary,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        fontSize: 12
                      }}
                    >
                      FECHA / HORA
                    </TableCell>
                    <TableCell
                      sx={{
                        color: P.secondary,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        fontSize: 12
                      }}
                    >
                      TIPO
                    </TableCell>
                    <TableCell
                      sx={{
                        color: P.secondary,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        fontSize: 12
                      }}
                    >
                      USUARIO
                    </TableCell>
                    <TableCell
                      sx={{
                        color: P.secondary,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        fontSize: 12
                      }}
                    >
                      ESTADO
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: P.secondary,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        fontSize: 12
                      }}
                    >
                      ACCIÓN
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => {
                    const initials = getInitials(row.user);
                    const isCompleted = row.status === "completed";
                    const isInProgress = row.status === "in_progress";

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          "&:hover td": { bgcolor: alpha(P.navy, 0.04) },
                          "& td": { transition: "background-color 120ms ease" }
                        }}
                      >
                        <TableCell
                          sx={{
                            color: P.primary,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            py: 0.9,
                            fontSize: 13
                          }}
                        >
                          {row.dateTime}
                        </TableCell>
                        <TableCell sx={{ color: P.secondary, fontWeight: 700, py: 0.9, fontSize: 13 }}>
                          {row.type}
                        </TableCell>
                        <TableCell sx={{ py: 0.9 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: alpha(P.blue, 0.14),
                                color: P.blue
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Typography variant="body2" sx={{ color: P.primary, fontWeight: 800, fontSize: 13.5 }}>
                              {row.user}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 0.9 }}>{statusChip(row.status)}</TableCell>
                        <TableCell align="right" sx={{ py: 0.9, whiteSpace: "nowrap" }}>
                          {isCompleted ? (
                            <Button
                              size="small"
                              startIcon={<DownloadRoundedIcon />}
                              onClick={() => {
                                if (row.fileName) {
                                  window.open(
                                    `${API_BASE}/api/respaldo/descargar/${encodeURIComponent(row.fileName)}`,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                  return;
                                }
                                console.log("[Respaldo] Descargar respaldo (sin fileName)", row.id);
                              }}
                              sx={{
                                borderRadius: `${RADIUS}px`,
                                textTransform: "none",
                                fontWeight: 800,
                                color: P.blue,
                                bgcolor: alpha(P.blue, 0.10),
                                minHeight: 30,
                                px: 1.5,
                                "&:hover": { bgcolor: alpha(P.blue, 0.16) }
                              }}
                            >
                              Descargar
                            </Button>
                          ) : isInProgress ? (
                            <Typography variant="body2" sx={{ color: P.secondary, fontWeight: 700, fontSize: 13 }}>
                              Preparando...
                            </Typography>
                          ) : (
                            <Tooltip title="Ver detalles del error" arrow>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => console.log("[Respaldo] Detalle de error (UI)", row.id)}
                                sx={{
                                  minWidth: 36,
                                  color: P.red,
                                  "&:hover": { bgcolor: alpha(P.red, 0.10) }
                                }}
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </Button>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              sx={{ mt: 1.25 }}
            >
              <Link
                component="button"
                onClick={() => {
                  setIsFullHistory((v) => {
                    const next = !v;
                    setHistoryPage(0);
                    return next;
                  });
                }}
                underline="hover"
                sx={{ color: P.secondary, fontWeight: 900, fontSize: 13 }}
              >
                {isFullHistory ? "← Volver a vista resumida" : "Ver historial completo (Más de 30 días) →"}
              </Link>

              {isFullHistory ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.85rem" }}>
                    Página {historyPage + 1} de {totalPages}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                    disabled={historyPage === 0}
                    sx={{ minWidth: 40, px: 1.1 }}
                  >
                    <ChevronLeftRoundedIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setHistoryPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={historyPage >= totalPages - 1}
                    sx={{ minWidth: 40, px: 1.1 }}
                  >
                    <ChevronRightRoundedIcon />
                  </Button>
                </Stack>
              ) : null}
            </Stack>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );

  const toastUi = (
    <Snackbar
      open={toast.open}
      autoHideDuration={4500}
      onClose={() => setToast((t) => ({ ...t, open: false }))}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        severity={toast.severity}
        variant="filled"
        sx={{ borderRadius: 2, fontWeight: 800 }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );

  if (embedded) {
    return (
      <>
        {content}
        {toastUi}
      </>
    );
  }

  return (
    <AdminPageShell maxWidth="lg">
      {content}
      {toastUi}
    </AdminPageShell>
  );
}

export default Respaldo;
