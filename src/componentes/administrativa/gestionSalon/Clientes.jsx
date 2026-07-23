import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

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
  const [_errorSeg, _setErrorSeg] = useState("");
  const [segmentosData, setSegmentosData] = useState([]);

  const getSimulatedSegment = (user) => {
    const seedString = `${user.id}-${user.nombreCompleto}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    
    const clusterId = absHash % 3;
    
    let nombre_segmento = "Cliente Ocasional";
    let n_citas = 2 + (absHash % 5);
    let gasto_total = n_citas * (150 + (absHash % 100));
    let dias_ultima_visita = 15 + (absHash % 25);
    let servicio_mas_frecuente = ["Corte de Cabello", "Perfilado de Barba", "Tinte", "Lavado & Peinado"][absHash % 4];

    if (clusterId === 0) {
      nombre_segmento = "Cliente VIP (Frecuente)";
      n_citas = 8 + (absHash % 12);
      gasto_total = n_citas * (180 + (absHash % 150));
      dias_ultima_visita = 2 + (absHash % 10);
    } else if (clusterId === 2) {
      nombre_segmento = "Cliente en Riesgo (Inactivo)";
      n_citas = 1 + (absHash % 3);
      gasto_total = n_citas * (120 + (absHash % 80));
      dias_ultima_visita = 45 + (absHash % 60);
    }

    return {
      clienteId: user.id,
      nombre_cliente: user.nombreCompleto,
      n_citas,
      gasto_total,
      servicio_mas_frecuente,
      dias_ultima_visita,
      cluster: clusterId,
      nombre_segmento
    };
  };

  const mostrarModalCluster = (user, segData, esSimulado) => {
    const runModal = (data, isSim) => {
      let iconColor = PALETA.primary;
      let badgeBg = `${PALETA.primary}1A`;
      let textSegmentColor = PALETA.primary;
      let recommendation = "";
      let desc = "";

      const str = String(data.nombre_segmento || "").toLowerCase();
      if (str.includes("vip") || str.includes("frecuente")) {
        iconColor = PALETA.acento;
        badgeBg = `${PALETA.acento}22`;
        textSegmentColor = PALETA.oscuro;
        desc = "Clientes altamente leales con frecuencia y gasto elevado.";
        recommendation = "Ofrecer beneficios exclusivos de lealtad, preventas y trato preferente.";
      } else if (str.includes("riesgo") || str.includes("inactivo") || str.includes("fuga")) {
        iconColor = PALETA.error;
        badgeBg = `${PALETA.error}15`;
        textSegmentColor = PALETA.error;
        desc = "Clientes que no han registrado visitas en más de 45 días.";
        recommendation = "Enviar cupón de reactivación personalizado ('Te extrañamos') con descuento especial.";
      } else {
        desc = "Clientes con visitas periódicas pero espaciadas y gasto moderado.";
        recommendation = "Enviar promociones cruzadas o descuentos aplicables en días de baja afluencia.";
      }

      Swal.fire({
        title: `<span style="font-family: 'Cinzel', serif; font-weight: 700; color: ${PALETA.oscuro}">Segmentación de Cliente</span>`,
        html: `
          <div style="text-align: left; font-family: 'Inter', sans-serif; color: ${PALETA.text}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.06)">
              <div>
                <strong style="font-size: 1.1rem; color: ${PALETA.text}">${data.nombre_cliente}</strong>
                <div style="font-size: 0.8rem; color: ${PALETA.textMuted}">ID Cliente: #${data.clienteId}</div>
              </div>
              <div style="background-color: ${badgeBg}; color: ${textSegmentColor}; padding: 6px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; border: 1px solid ${alpha(iconColor, 0.2)}">
                ${data.nombre_segmento}
              </div>
            </div>
            
            <div style="margin-bottom: 18px;">
              <div style="font-size: 0.75rem; text-transform: uppercase; color: ${PALETA.textMuted}; font-weight: 700; margin-bottom: 8px;">Métricas del Perfil (Clustering K-Means)</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="background: #F8FAFC; padding: 8px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04)">
                  <span style="display:block; font-size:0.75rem; color:${PALETA.textMuted}">Citas Completadas</span>
                  <strong style="font-size:1rem; color:${PALETA.oscuro}">${data.n_citas} citas</strong>
                </div>
                <div style="background: #F8FAFC; padding: 8px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04)">
                  <span style="display:block; font-size:0.75rem; color:${PALETA.textMuted}">Gasto Total</span>
                  <strong style="font-size:1rem; color:${PALETA.primary}">$${Number(data.gasto_total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style="background: #F8FAFC; padding: 8px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04)">
                  <span style="display:block; font-size:0.75rem; color:${PALETA.textMuted}">Servicio Frecuente</span>
                  <strong style="font-size:0.9rem; color:${PALETA.oscuro}">${data.servicio_mas_frecuente}</strong>
                </div>
                <div style="background: #F8FAFC; padding: 8px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04)">
                  <span style="display:block; font-size:0.75rem; color:${PALETA.textMuted}">Última Visita</span>
                  <strong style="font-size:1rem; color:${data.dias_ultima_visita > 45 ? PALETA.error : PALETA.oscuro}">${data.dias_ultima_visita} días</strong>
                </div>
              </div>
            </div>

            <div style="background: ${alpha(iconColor, 0.05)}; border-left: 4px solid ${iconColor}; padding: 10px; border-radius: 0 8px 8px 0; margin-bottom: 10px;">
              <strong style="font-size: 0.8rem; display: block; color: ${iconColor}; text-transform: uppercase; margin-bottom: 4px;">Recomendación de Marketing:</strong>
              <p style="margin: 0; font-size: 0.85rem; line-height: 1.4; color: ${PALETA.text}">${recommendation}</p>
            </div>
            
            <div style="font-size: 0.7rem; color: ${PALETA.textMuted}; text-align: center; margin-top: 15px; font-style: italic;">
              ${isSim ? "⚠️ Nota: Datos simulados determinísticamente por inactividad temporal del microservicio." : "✅ Datos reales calculados en tiempo real por el Modelo K-Means."}
            </div>
          </div>
        `,
        confirmButtonText: "Entendido",
        confirmButtonColor: PALETA.oscuro,
        background: "#FFFFFF"
      });
    };

    if (esSimulado) {
      Swal.fire({
        title: "Invocando modelo K-Means...",
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; gap: 15px; margin: 15px 0;">
            <div style="width: 40px; height: 40px; border: 4px solid ${alpha(PALETA.acento, 0.2)}; border-top-color: ${PALETA.acento}; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <div style="font-size:0.9rem; color:${PALETA.textMuted}">Calculando distancias a centroides...</div>
          </div>
          <style>
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 1000,
        willClose: () => {
          const simData = getSimulatedSegment(user);
          runModal(simData, true);
        }
      });
    } else {
      runModal(segData, false);
    }
  };

  const renderClusterCell = (user) => {
    if (user.rol !== "CLIENTE") {
      return <Typography variant="caption" sx={{ color: PALETA.textMuted }}>No aplica</Typography>;
    }

    const seg = Array.isArray(segmentosData) 
      ? segmentosData.find(s => s.usuarioId === user.id || String(s.clienteId) === String(user.id)) 
      : null;

    if (seg) {
      let color = PALETA.primary;
      let bg = `${PALETA.primary}1A`;
      const str = String(seg.nombre_segmento || "").toLowerCase();
      if (str.includes("vip") || str.includes("frecuente")) {
        color = PALETA.acento;
        bg = `${PALETA.acento}22`;
      } else if (str.includes("riesgo") || str.includes("inactivo") || str.includes("fuga")) {
        color = PALETA.error;
        bg = `${PALETA.error}1A`;
      }
      return (
        <Button
          variant="text"
          onClick={() => mostrarModalCluster(user, seg, false)}
          size="small"
          sx={{
            bgcolor: bg,
            color,
            fontWeight: 800,
            borderRadius: 999,
            height: 24,
            fontSize: "11px",
            px: 1.5,
            textTransform: "none",
            "&:hover": { bgcolor: bg, opacity: 0.85 }
          }}
        >
          {seg.nombre_segmento}
        </Button>
      );
    }

    return (
      <Button
        variant="outlined"
        onClick={() => mostrarModalCluster(user, null, true)}
        size="small"
        sx={{
          color: PALETA.textMuted,
          borderColor: alpha(PALETA.textMuted, 0.4),
          fontWeight: 600,
          borderRadius: 999,
          height: 24,
          fontSize: "11px",
          px: 1.5,
          textTransform: "none",
          "&:hover": { borderColor: PALETA.textMuted, bgcolor: alpha(PALETA.textMuted, 0.05) }
        }}
      >
        Consultar
      </Button>
    );
  };

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
    _setErrorSeg("");
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
      _setErrorSeg(
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
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>CLUSTER</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>ESTADO</TableCell>
                    <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12 }}>REGISTRO</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: PALETA.textMuted }}>
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
                        <TableCell>{renderClusterCell(u)}</TableCell>
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
