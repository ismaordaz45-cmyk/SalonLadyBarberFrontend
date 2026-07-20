import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Alert
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";

import AdminPageShell from "../../../ui/admin/AdminPageShell";
import AdminHeader from "../../../ui/admin/AdminHeader";
import { GlassCard } from "../../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../../ui/admin/adminTokens";

const API_URL = process.env.REACT_APP_API_URL || "https://salonladybarberbackend.onrender.com";

const PALETA = {
  card: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B",
  primary: "#2563EB",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  oscuro: "#2C3E50",
  acento: "#D4AF37"
};

const RADIUS = 14;
const TABLE_RADIUS = 12;

const ROL_LABEL = {
  PROPIETARIA: "Propietaria",
  EMPLEADA: "Empleada / barbero",
  CLIENTE: "Cliente"
};

function rolChip(rol) {
  const label = ROL_LABEL[rol] || rol;
  let bg = `${PALETA.primary}1A`;
  let color = PALETA.primary;
  if (rol === "PROPIETARIA") {
    bg = `${PALETA.acento}22`;
    color = PALETA.oscuro;
  }
  if (rol === "CLIENTE") {
    bg = `${PALETA.success}1A`;
    color = PALETA.success;
  }
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: bg,
        color,
        fontWeight: 700,
        borderRadius: 999,
        height: 22,
        "& .MuiChip-label": { px: 1, fontSize: 11.5 }
      }}
    />
  );
}

function estadoChip(activo) {
  if (activo) {
    return (
      <Chip
        label="Activo"
        size="small"
        sx={{
          bgcolor: `${PALETA.success}1A`,
          color: PALETA.success,
          fontWeight: 700,
          borderRadius: 999,
          height: 22,
          "& .MuiChip-label": { px: 1, fontSize: 11.5 }
        }}
      />
    );
  }
  return (
    <Chip
      label="Inactivo"
      size="small"
      sx={{
        bgcolor: `${PALETA.textMuted}22`,
        color: PALETA.textMuted,
        fontWeight: 700,
        borderRadius: 999,
        height: 22,
        "& .MuiChip-label": { px: 1, fontSize: 11.5 }
      }}
    />
  );
}

function formatFechaRegistro(val) {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return "—";
  }
}

function segmentoChip(segmentoNombre = "", clusterId) {
  const str = String(segmentoNombre).toLowerCase();
  let color = PALETA.primary;
  let bg = `${PALETA.primary}15`;
  let icon = <CategoryRoundedIcon sx={{ fontSize: 14 }} />;

  if (str.includes("vip") || str.includes("frecuente")) {
    color = PALETA.acento;
    bg = `${PALETA.acento}22`;
    icon = <StarRoundedIcon sx={{ fontSize: 14, color: PALETA.acento }} />;
  } else if (str.includes("riesgo") || str.includes("inactivo") || str.includes("fuga")) {
    color = PALETA.error;
    bg = `${PALETA.error}15`;
    icon = <WarningRoundedIcon sx={{ fontSize: 14, color: PALETA.error }} />;
  }

  return (
    <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="center">
      <Chip
        label={`Cluster #${clusterId}`}
        size="small"
        sx={{
          bgcolor: `${PALETA.oscuro}15`,
          color: PALETA.oscuro,
          fontWeight: 800,
          fontSize: 10.5,
          height: 20
        }}
      />
      <Chip
        icon={icon}
        label={segmentoNombre}
        size="small"
        sx={{
          bgcolor: bg,
          color,
          fontWeight: 700,
          fontSize: 11,
          height: 22
        }}
      />
    </Stack>
  );
}

function Clientes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [porRol, setPorRol] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para la Segmentación K-Means (.pkl)
  const [loadingSeg, setLoadingSeg] = useState(true);
  const [errorSeg, setErrorSeg] = useState("");
  const [segmentosData, setSegmentosData] = useState([]);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const offset = page * rowsPerPage;
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.get(`${API_URL}/api/admin/usuarios`, {
        params: { limit: rowsPerPage, offset },
        headers
      });
      setTotal(Number(data?.total) || 0);
      setPorRol(Array.isArray(data?.porRol) ? data.porRol : []);
      setUsuarios(Array.isArray(data?.usuarios) ? data.usuarios : []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "No se pudieron cargar los usuarios");
      setUsuarios([]);
      setTotal(0);
      setPorRol([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  const fetchSegmentacion = useCallback(async () => {
    setLoadingSeg(true);
    setErrorSeg("");
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.get(`${API_URL}/api/prediccion/segmentacion-clientes`, {
        headers,
        timeout: 25000
      });

      const list = Array.isArray(data?.clientes) ? data.clientes : Array.isArray(data) ? data : [];
      setSegmentosData(list);
    } catch (e) {
      setErrorSeg(
        e.response?.data?.error ||
          e.message ||
          "El modelo de clustering K-Means en Render está iniciando o no respondió a tiempo."
      );
      setSegmentosData([]);
    } finally {
      setLoadingSeg(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
    fetchSegmentacion();
  }, [fetchUsuarios, fetchSegmentacion]);

  const resumenChips = useMemo(() => {
    const map = Object.fromEntries(porRol.map((r) => [r.rol, r.total]));
    const orden = ["PROPIETARIA", "EMPLEADA", "CLIENTE"];
    return orden.map((rol) => ({
      rol,
      total: map[rol] ?? 0,
      label: ROL_LABEL[rol] || rol
    }));
  }, [porRol]);

  const conteoClusters = useMemo(() => {
    const counts = { vip: 0, ocasional: 0, riesgo: 0 };
    segmentosData.forEach((c) => {
      const str = String(c.nombre_segmento || "").toLowerCase();
      if (str.includes("vip") || str.includes("frecuente")) counts.vip += 1;
      else if (str.includes("riesgo") || str.includes("inactivo") || str.includes("fuga")) counts.riesgo += 1;
      else counts.ocasional += 1;
    });
    return counts;
  }, [segmentosData]);

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Usuarios y Clientes"
        title="Gestión de Usuarios y Segmentación ML"
        subtitle={
          <>
            Administración de cuentas y análisis de grupos de clientes con el modelo entrenado <b>K-Means (.pkl)</b>.
          </>
        }
        icon={<GroupRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        right={
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => {
              fetchUsuarios();
              fetchSegmentacion();
            }}
            disabled={loading || loadingSeg}
          >
            {loading || loadingSeg ? "Actualizando..." : "Actualizar datos"}
          </Button>
        }
      />

      {/* TARJETA DE SEGMENTACIÓN DE CLIENTES (MODELO K-MEANS .PKL) */}
      <GlassCard
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: `${RADIUS}px`,
          border: `1px solid ${alpha(P.accent, 0.3)}`,
          background: `linear-gradient(145deg, #FFFFFF 0%, ${alpha(P.accent, 0.05)} 100%)`
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: PALETA.text, fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
              <AutoGraphRoundedIcon sx={{ color: PALETA.acento }} />
              Segmentación Inteligente de Clientes (Modelo K-Means .pkl)
            </Typography>
            <Typography variant="body2" sx={{ color: PALETA.textMuted }}>
              Resultados en tiempo real calculados por el microservicio de Machine Learning en Render.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`VIP: ${conteoClusters.vip}`}
              sx={{ bgcolor: `${PALETA.acento}22`, color: PALETA.oscuro, fontWeight: 800 }}
            />
            <Chip
              label={`Ocasionales: ${conteoClusters.ocasional}`}
              sx={{ bgcolor: `${PALETA.primary}1A`, color: PALETA.primary, fontWeight: 800 }}
            />
            <Chip
              label={`En Riesgo: ${conteoClusters.riesgo}`}
              sx={{ bgcolor: `${PALETA.error}1A`, color: PALETA.error, fontWeight: 800 }}
            />
          </Stack>
        </Stack>

        {errorSeg && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            {errorSeg}
          </Alert>
        )}

        {loadingSeg ? (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
            <CircularProgress size={28} sx={{ color: PALETA.acento }} />
            <Typography variant="body2" sx={{ color: PALETA.textMuted, fontWeight: 600 }}>
              Ejecutando inferencia en el modelo `kmeans_clientes.pkl`...
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Box}
            sx={{
              borderRadius: `${TABLE_RADIUS}px`,
              overflow: "hidden",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              overflowX: "auto"
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ color: PALETA.textMuted, fontWeight: 700, fontSize: 11.5 }}>CLIENTE</TableCell>
                  <TableCell align="center" sx={{ color: PALETA.textMuted, fontWeight: 700, fontSize: 11.5 }}>CITAS COMPLETADAS (X1)</TableCell>
                  <TableCell align="center" sx={{ color: PALETA.textMuted, fontWeight: 700, fontSize: 11.5 }}>GASTO TOTAL (X2)</TableCell>
                  <TableCell align="center" sx={{ color: PALETA.textMuted, fontWeight: 700, fontSize: 11.5 }}>DÍAS DESDE ÚLTIMA VISITA (X4)</TableCell>
                  <TableCell align="center" sx={{ color: PALETA.textMuted, fontWeight: 700, fontSize: 11.5 }}>SERVICIO FRECUENTE (X3)</TableCell>
                  <TableCell align="center" sx={{ color: PALETA.textMuted, fontWeight: 700, fontSize: 11.5 }}>CLUSTER / PREDICCIÓN .PKL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {segmentosData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: PALETA.textMuted }}>
                      No hay clientes con citas completadas para segmentar.
                    </TableCell>
                  </TableRow>
                ) : (
                  segmentosData.map((c, i) => (
                    <TableRow key={c.clienteId || i} hover>
                      <TableCell sx={{ fontWeight: 700, color: PALETA.text }}>
                        {c.nombre_cliente}
                        <Typography variant="caption" display="block" sx={{ color: PALETA.textMuted, fontSize: 10 }}>
                          ID Cliente: #{c.clienteId}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{c.n_citas}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: PALETA.primary }}>
                        ${Number(c.gasto_total || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: c.dias_ultima_visita > 45 ? PALETA.error : PALETA.text
                          }}
                        >
                          {c.dias_ultima_visita} días
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ color: PALETA.textMuted }}>
                        {c.servicio_mas_frecuente || "Sin registro"}
                      </TableCell>
                      <TableCell align="center">
                        {segmentoChip(c.nombre_segmento, c.cluster)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </GlassCard>

      {/* RESUMEN POR ROL */}
      <GlassCard
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2.5,
          borderRadius: `${RADIUS}px`
        }}
      >
        <Typography sx={{ color: PALETA.text, fontWeight: 800, mb: 1.5, letterSpacing: -0.2 }}>
          Resumen por rol
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.25} alignItems="center">
          <Chip
            label={`Total: ${total}`}
            sx={{
              fontWeight: 800,
              bgcolor: `${PALETA.oscuro}12`,
              color: PALETA.oscuro,
              borderRadius: 999
            }}
          />
          {resumenChips.map(({ rol, total: t, label }) => (
            <Chip
              key={rol}
              label={`${label}: ${t}`}
              variant="outlined"
              sx={{
                fontWeight: 700,
                borderColor: alpha(PALETA.oscuro, 0.2),
                color: PALETA.text
              }}
            />
          ))}
        </Stack>
      </GlassCard>

      {/* LISTADO GENERAL DE USUARIOS */}
      <GlassCard
        elevation={0}
        sx={{
          borderRadius: `${RADIUS}px`,
          p: { xs: 2, md: 2.5 },
          mb: 0
        }}
      >
        <Typography variant="h6" sx={{ color: PALETA.text, fontWeight: 700, letterSpacing: -0.2, mb: 1.5 }}>
          Listado de usuarios
        </Typography>

        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        {loading && !usuarios.length ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress sx={{ color: PALETA.primary }} />
          </Box>
        ) : (
          <>
            <TableContainer
              component={Box}
              sx={{
                borderRadius: `${TABLE_RADIUS}px`,
                overflow: "hidden",
                border: "1px solid rgba(15, 23, 42, 0.08)",
                overflowX: "auto"
              }}
            >
              <Table size="small" aria-label="Usuarios del sistema">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>ID</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>NOMBRE</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>CORREO</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>TELÉFONO</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>ROL</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>ESTADO</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>REGISTRO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: PALETA.textMuted }}>
                        No hay usuarios para mostrar en esta página.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuarios.map((u) => (
                      <TableRow key={u.id} hover sx={{ "&:hover": { bgcolor: "rgba(148, 163, 184, 0.08)" } }}>
                        <TableCell sx={{ fontWeight: 600, color: PALETA.text }}>{u.id}</TableCell>
                        <TableCell sx={{ color: PALETA.text, maxWidth: 200 }}>{u.nombreCompleto}</TableCell>
                        <TableCell sx={{ color: PALETA.textMuted, maxWidth: 220 }}>{u.correo}</TableCell>
                        <TableCell sx={{ color: PALETA.textMuted }}>{u.telefono || "—"}</TableCell>
                        <TableCell>{rolChip(u.rol)}</TableCell>
                        <TableCell>{estadoChip(u.estaActivo)}</TableCell>
                        <TableCell sx={{ color: PALETA.textMuted, whiteSpace: "nowrap" }}>
                          {formatFechaRegistro(u.creadoEn)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
              sx={{
                borderTop: "1px solid rgba(15, 23, 42, 0.08)",
                mt: 0,
                ".MuiTablePagination-toolbar": { flexWrap: "wrap", gap: 1 }
              }}
            />
          </>
        )}
      </GlassCard>
    </AdminPageShell>
  );
}

export default Clientes;
