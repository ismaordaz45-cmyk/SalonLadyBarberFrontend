import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Chip,
  Alert,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  PeopleRounded,
  AddRounded,
  SearchRounded,
  RefreshRounded,
  EmailRounded,
  LocalPhoneRounded
} from "@mui/icons-material";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import Swal from "sweetalert2";
import api from "../../api";

export default function ClientesRecepcion() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Paginación y búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal Registro
  const [registroOpen, setRegistroOpen] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  // Campos Formulario
  const [formNombre, setFormNombre] = useState("");
  const [formApPaterno, setFormApPaterno] = useState("");
  const [formApMaterno, setFormApMaterno] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [formTelefono, setFormTelefono] = useState("");

  // Cargar lista de clientes
  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const offset = page * rowsPerPage;
      
      const { data } = await api.get("/api/admin/usuarios", {
        params: { limit: rowsPerPage, offset }
      });

      const list = Array.isArray(data?.usuarios) ? data.usuarios : [];
      // Filtrar clientes
      const filtered = list.filter((u) => u.rol === "CLIENTE");

      setUsuarios(filtered);
      setTotal(Number(data?.total) || filtered.length);
    } catch (e) {
      setError("No se pudieron cargar los usuarios del salón.");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes, refreshCount]);

  // Filtrado adicional local por texto de búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return usuarios;
    const q = searchQuery.toLowerCase().trim();
    return usuarios.filter(
      (u) =>
        u.nombreCompleto?.toLowerCase().includes(q) ||
        u.correo?.toLowerCase().includes(q) ||
        u.telefono?.includes(q)
    );
  }, [usuarios, searchQuery]);

  // Registrar cliente
  const handleRegistrarCliente = async () => {
    if (!formNombre || !formCorreo) {
      Swal.fire("Campos Requeridos", "Nombre y Correo Electrónico son obligatorios.", "warning");
      return;
    }

    try {
      setRegistrando(true);
      
      // Llamar POST /api/registro
      await api.post("/api/registro", {
        nombre: formNombre,
        apellidoPaterno: formApPaterno,
        apellidoMaterno: formApMaterno,
        correo: formCorreo,
        telefono: formTelefono,
        password: "Cliente123*", // Contraseña por defecto
        rol: "CLIENTE"
      });

      Swal.fire({
        title: "Cliente Registrado",
        text: "Se ha registrado el nuevo cliente con la contraseña temporal: Cliente123*",
        icon: "success"
      });

      setRegistroOpen(false);
      // Limpiar formulario
      setFormNombre("");
      setFormApPaterno("");
      setFormApMaterno("");
      setFormCorreo("");
      setFormTelefono("");
      setRefreshCount((prev) => prev + 1);
    } catch (e) {
      Swal.fire({
        title: "Error de Registro",
        text: e?.response?.data?.error || e?.message || "No se pudo registrar al cliente.",
        icon: "error"
      });
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease" }}>
      {/* Cabecera */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#1E3A5F",
              fontFamily: '"Cinzel", ui-serif, Georgia, serif',
              letterSpacing: "-0.01em"
            }}
          >
            Clientes Registrados
          </Typography>
          <Typography sx={{ color: "#64748B", mt: 0.5, fontSize: "0.9rem", fontWeight: 650 }}>
            Directorio de clientes y registro express en mostrador.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setRegistroOpen(true)}
          startIcon={<AddRounded />}
          sx={{
            bgcolor: "#1E3A5F",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(30, 58, 95, 0.15)",
            "&:hover": { bgcolor: "#152a41" }
          }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* Panel de Filtros */}
      <GlassCard elevation={0} sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar cliente por nombre, correo o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchRounded sx={{ color: P.secondary, mr: 1, fontSize: 20 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setRefreshCount((prev) => prev + 1)}
              startIcon={<RefreshRounded />}
              sx={{
                fontWeight: 800,
                borderColor: P.border,
                color: P.navy,
                textTransform: "none",
                borderRadius: "8px",
                "&:hover": { borderColor: P.navy, bgcolor: alpha(P.navy, 0.04) }
              }}
            >
              Recargar
            </Button>
          </Grid>
        </Grid>
      </GlassCard>

      {/* Listado de Clientes */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <GlassCard elevation={0} sx={{ p: 0, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <RefreshRounded sx={{ fontSize: 40, color: P.navy, animation: "spin 1.5s linear infinite" }} />
          </Box>
        ) : clientesFiltrados.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <PeopleRounded sx={{ fontSize: 52, color: P.secondary, opacity: 0.4, mb: 1.5 }} />
            <Typography sx={{ color: P.secondary, fontWeight: 800 }}>
              No se encontraron clientes registrados en este bloque.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: P.navy }}>Nombre del Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: P.navy }}>Correo Electrónico</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: P.navy }}>Teléfono</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: P.navy }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientesFiltrados.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell sx={{ fontWeight: 900, color: P.navy }}>
                        {u.nombreCompleto}
                      </TableCell>
                      <TableCell sx={{ color: P.secondary, fontWeight: 700 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmailRounded sx={{ fontSize: 16, color: P.secondary }} />
                          <span>{u.correo}</span>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: P.secondary, fontWeight: 700 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocalPhoneRounded sx={{ fontSize: 16, color: P.secondary }} />
                          <span>{u.telefono || "—"}</span>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.estaActivo ? "Activo" : "Inactivo"}
                          size="small"
                          sx={{
                            bgcolor: u.estaActivo ? alpha("#22C55E", 0.12) : alpha("#64748B", 0.12),
                            color: u.estaActivo ? "#15803D" : "#475569",
                            fontWeight: 800
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
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
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </GlassCard>

      {/* MODAL: REGISTRAR NUEVO CLIENTE */}
      <Dialog open={registroOpen} onClose={() => setRegistroOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: P.navy, fontFamily: '"Cinzel", serif' }}>
          Registrar Nuevo Cliente
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Nombre *"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Apellido Paterno"
              value={formApPaterno}
              onChange={(e) => setFormApPaterno(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Apellido Materno"
              value={formApMaterno}
              onChange={(e) => setFormApMaterno(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              type="email"
              label="Correo Electrónico *"
              value={formCorreo}
              onChange={(e) => setFormCorreo(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              type="tel"
              label="Teléfono"
              value={formTelefono}
              onChange={(e) => setFormTelefono(e.target.value)}
            />
            <Box sx={{ mt: 1, p: 1.5, bgcolor: alpha(P.accent, 0.08), borderRadius: 2, border: `1px solid ${alpha(P.accent, 0.25)}` }}>
              <Typography sx={{ fontSize: "0.75rem", color: P.navy, fontWeight: 700 }}>
                🔑 Cuenta de Usuario
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: P.secondary, mt: 0.5, lineHeight: 1.4 }}>
                Se creará un usuario de rol <strong>Cliente</strong> con la contraseña provisional: <strong>Cliente123*</strong>
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRegistroOpen(false)} sx={{ fontWeight: 800, color: "#64748B" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleRegistrarCliente}
            variant="contained"
            disabled={registrando}
            sx={{ bgcolor: P.navy, fontWeight: 900, "&:hover": { bgcolor: "#152a41" } }}
          >
            {registrando ? "Registrando..." : "Registrar Cliente"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
