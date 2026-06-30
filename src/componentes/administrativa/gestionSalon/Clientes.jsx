import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
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

const API_URL = "https://salonladybarberbackend.onrender.com";

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

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const offset = page * rowsPerPage;
      const { data } = await axios.get(`${API_URL}/api/admin/usuarios`, {
        params: { limit: rowsPerPage, offset },
        barberHeadline: "Usuarios",
        barberMessage: "Cargando listado de usuarios…"
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

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

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
        eyebrow="Usuarios"
        title="Usuarios"
        subtitle={
          <>
            Total en base de datos y rol de cada cuenta (tabla <b>usuario</b>).
          </>
        }
        icon={<GroupRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        right={
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => fetchUsuarios()}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        }
      />

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
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch"
                }}
              >
                <Table size="small" aria-label="Usuarios del sistema">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12, letterSpacing: 0.4 }}>
                        ID
                      </TableCell>
                      <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12, letterSpacing: 0.4 }}>
                        NOMBRE
                      </TableCell>
                      <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12, letterSpacing: 0.4 }}>
                        CORREO
                      </TableCell>
                      <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12, letterSpacing: 0.4 }}>
                        TELÉFONO
                      </TableCell>
                      <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12, letterSpacing: 0.4 }}>
                        ROL
                      </TableCell>
                      <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12, letterSpacing: 0.4 }}>
                        ESTADO
                      </TableCell>
                      <TableCell sx={{ color: PALETA.textMuted, fontWeight: 600, fontSize: 12, letterSpacing: 0.4 }}>
                        REGISTRO
                      </TableCell>
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
