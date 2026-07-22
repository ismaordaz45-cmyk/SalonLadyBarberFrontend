import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import ShoppingBagRounded from "@mui/icons-material/ShoppingBagRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import AdminPageShell from "../../ui/admin/AdminPageShell";
import AdminHeader from "../../ui/admin/AdminHeader";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import ConectarAlexa from "../autenticacion/ConectarAlexa";
import api from "../../api";
import Swal from "sweetalert2";
import { useCart } from "../../context/CartContext";
import { descargarTicketInsumosPDF } from "../../utils/ticketInsumosPDF";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";

const MotionBox = motion.create(Box);

const springIn = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { type: "spring", stiffness: 260, damping: 24 }
};

function MiPerfilCliente() {
  const { addToCart } = useCart();
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const initialForm = useMemo(() => {
    const nombreCompleto = user?.nombreCompleto || user?.nombre || "";
    return {
      nombreCompleto,
      telefono: user?.telefono || "",
      correo: user?.correo || "",
      notas: user?.notas || ""
    };
  }, [user]);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [lastSaved, setLastSaved] = useState(initialForm);
  const [toast, setToast] = useState({ open: false, message: "" });

  const [compras, setCompras] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(false);

  useEffect(() => {
    let cancel = false;
    const fetchCompras = async () => {
      try {
        setCargandoCompras(true);
        const { data } = await api.get("/api/cliente/compras");
        if (!cancel) setCompras(data || []);
      } catch (e) {
        console.error("Error al cargar historial de compras:", e);
      } finally {
        if (!cancel) setCargandoCompras(false);
      }
    };
    fetchCompras();
    return () => {
      cancel = true;
    };
  }, []);

  function moneyMXN(value) {
    if (value == null || value === "") return "$0.00";
    const n = Number(value);
    if (!Number.isFinite(n)) return "$0.00";
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
  }

  const handleVerComprobanteCompra = (compra) => {
    const total = Number(compra.total || 0);
    const dateStr = compra.fecha ? new Date(compra.fecha).toLocaleDateString("es-MX", { dateStyle: "long" }) : "—";
    const timeStr = compra.fecha ? new Date(compra.fecha).toLocaleTimeString("es-MX", { hour12: false }) : "—";

    Swal.fire({
      title: "Comprobante de Pago",
      html: `
        <div style="text-align: left; font-family: monospace; font-size: 0.85rem; line-height: 1.6; color: #334155;">
          <div style="text-align: center; margin-bottom: 15px;">
            <h3 style="margin: 0; font-family: 'Cinzel', serif; font-weight: 900; font-size: 1.15rem; color: #1E3A5F;">LADY BARBER</h3>
            <span style="font-size: 0.75rem; color: #64748B; font-weight: 700;">ITZA D'M SALÓN</span>
            <div style="font-size: 0.7rem; color: #64748B; margin-top: 4px;">TICKET COMPRA PRODUCTO</div>
            <div style="font-size: 0.68rem; color: #94A3B8;">Pedido ID: #${compra.id}</div>
          </div>

          <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 12px 0;" />

          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>FECHA:</strong></span>
            <span>${dateStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>HORA:</strong></span>
            <span>${timeStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>ESTADO:</strong></span>
            <span style="color: #15803D; font-weight: 800; text-transform: uppercase;">PAGADO</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span><strong>REF MP:</strong></span>
            <span style="font-size: 0.72rem;">${compra.mp_payment_id || "—"}</span>
          </div>

          <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 12px 0;" />

          <div style="font-weight: bold; margin-bottom: 8px; font-size: 0.75rem;">PRODUCTOS ADQUIRIDOS:</div>
          ${compra.items.map(it => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>• ${it.nombre} x${it.cantidad}</span>
              <span>${moneyMXN(it.precio_unitario * it.cantidad)}</span>
            </div>
          `).join('')}

          <hr style="border: 0; border-top: 1px dashed #CBD5E1; margin: 12px 0;" />

          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem; margin-top: 8px;">
            <span>TOTAL PAGADO:</span>
            <span>${moneyMXN(total)}</span>
          </div>
          <div style="font-size: 0.7rem; color: #64748B; margin-top: 4px;">Método de Pago: Tarjeta (Online / Mercado Pago)</div>

          <div style="text-align: center; margin-top: 25px; font-size: 0.72rem; color: #64748B; font-style: italic;">
            ¡Gracias por apoyar el salón Lady Barber!
          </div>
        </div>
      `,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#1E3A5F"
    });
  };

  const handleComprarDeNuevo = (compra) => {
    try {
      (compra.items || []).forEach((item) => {
        addToCart({
          id: item.insumo_id,
          nombre: item.nombre,
          precioVenta: item.precio_unitario,
          imagen: item.imagen
        });
      });
      Swal.fire({
        icon: "success",
        title: "Productos Agregados",
        text: "Se han agregado todos los productos de este pedido a tu carrito de compras.",
        timer: 1800,
        showConfirmButton: false
      });
    } catch (e) {
      console.error("Error al volver a comprar:", e);
    }
  };

  const nombre = form.nombreCompleto?.trim() || "Cliente";
  const correo = form.correo?.trim() || "—";
  const telefono = form.telefono?.trim() || "—";

  const canSave = useMemo(() => {
    const same =
      (form.nombreCompleto || "") === (lastSaved.nombreCompleto || "") &&
      (form.telefono || "") === (lastSaved.telefono || "") &&
      (form.correo || "") === (lastSaved.correo || "") &&
      (form.notas || "") === (lastSaved.notas || "");
    const minValid =
      (form.nombreCompleto || "").trim().length >= 2 &&
      (form.correo || "").trim().length >= 5;
    return modoEdicion && !same && minValid;
  }, [form, lastSaved, modoEdicion]);

  const perfilRows = useMemo(
    () => [
      { campo: "Nombre completo", valor: nombre },
      { campo: "Correo", valor: correo },
      { campo: "Teléfono", valor: telefono },
      {
        campo: "Notas / preferencias",
        valor: (form.notas || "").trim() || "—"
      }
    ],
    [nombre, correo, telefono, form.notas]
  );

  const openToast = (message) => setToast({ open: true, message });

  const handleStartEdit = () => {
    setModoEdicion(true);
    // Solo activa el modo edición (sin toast “demo”)
  };

  const handleCancel = () => {
    setForm(lastSaved);
    setModoEdicion(false);
    openToast("Cambios descartados.");
  };

  const handleSave = () => {
    // Simula guardado: persiste solo en localStorage para que “se vea real”
    try {
      const raw = localStorage.getItem("user");
      const current = raw ? JSON.parse(raw) : {};
      const next = {
        ...current,
        nombreCompleto: form.nombreCompleto,
        nombre: current?.nombre || form.nombreCompleto,
        correo: form.correo,
        telefono: form.telefono,
        notas: form.notas
      };
      localStorage.setItem("user", JSON.stringify(next));
    } catch {
      // Si falla storage, igual se refleja en UI (estado)
    }
    setLastSaved(form);
    setModoEdicion(false);
    openToast("Cambios guardados (demo, sin base de datos).");
  };

  const handleRowEdit = (campo) => {
    setModoEdicion(true);
    openToast(`Editando: ${campo}`);
  };

  const handleRowClear = (campo) => {
    setModoEdicion(true);
    setForm((prev) => {
      if (campo === "Nombre completo") return { ...prev, nombreCompleto: "" };
      if (campo === "Correo") return { ...prev, correo: "" };
      if (campo === "Teléfono") return { ...prev, telefono: "" };
      if (campo === "Notas / preferencias") return { ...prev, notas: "" };
      return prev;
    });
    openToast(`Campo limpiado: ${campo}`);
  };

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Área cliente"
        title="Mi perfil"
        subtitle="Edita tu información y simula un guardado real (sin base de datos)."
        icon={<PersonRounded sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        showBarberiaChip={true}
        right={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<EditRounded />}
              onClick={handleStartEdit}
              disabled={modoEdicion}
              sx={{
                fontWeight: 800,
                bgcolor: P.navy,
                boxShadow: `0 16px 36px ${alpha(P.navy, 0.22)}`,
                "&:hover": { bgcolor: "#122947" }
              }}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveRounded />}
              onClick={handleSave}
              disabled={!canSave}
              sx={{
                fontWeight: 800,
                bgcolor: canSave ? P.green : alpha(P.primary, 0.18),
                color: canSave ? "#FFFFFF" : alpha(P.primary, 0.55),
                boxShadow: canSave ? `0 16px 36px ${alpha(P.green, 0.18)}` : "none",
                "&:hover": { bgcolor: canSave ? alpha(P.green, 0.92) : alpha(P.primary, 0.18) }
              }}
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloseRounded />}
              onClick={handleCancel}
              disabled={!modoEdicion}
              sx={{
                fontWeight: 800,
                borderColor: modoEdicion ? alpha(P.primary, 0.22) : alpha(P.primary, 0.12),
                color: modoEdicion ? P.primary : alpha(P.primary, 0.5),
                "&:hover": { borderColor: alpha(P.primary, 0.26), bgcolor: alpha(P.primary, 0.04) }
              }}
            >
              Cancelar
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <MotionBox {...springIn}>
            <GlassCard
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 3,
                boxShadow: `0 22px 50px ${alpha("#0B1220", 0.12)}`
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(800px 220px at -10% 0%, ${alpha(P.accent, 0.28)} 0%, transparent 60%),
                               radial-gradient(700px 260px at 120% 20%, ${alpha(P.navy, 0.20)} 0%, transparent 60%)`
                }}
              />
              <CardContent sx={{ position: "relative" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha(P.accent, 0.85),
                      color: P.primary,
                      fontWeight: 900,
                      boxShadow: `0 14px 26px ${alpha(P.accent, 0.22)}`
                    }}
                  >
                    {String(nombre).trim()?.[0]?.toUpperCase() || "C"}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900, color: P.primary, letterSpacing: -0.3 }} noWrap>
                      {nombre}
                    </Typography>
                    <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.9rem" }} noWrap>
                      {correo}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                  <Chip
                    label="CLIENTE"
                    size="small"
                    sx={{
                      bgcolor: `${P.green}1A`,
                      color: P.green,
                      fontWeight: 800,
                      borderRadius: 999
                    }}
                  />
                  <Chip
                    label="Perfil verificado (demo)"
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: alpha(P.primary, 0.16),
                      color: P.secondary,
                      fontWeight: 700,
                      borderRadius: 999
                    }}
                  />
                </Stack>

                <Divider sx={{ my: 2, borderColor: alpha(P.primary, 0.08) }} />

                <Typography sx={{ color: P.secondary, fontWeight: 800, fontSize: "0.82rem" }}>
                  Acciones
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={handleSave}
                    disabled={!canSave}
                    sx={{
                      fontWeight: 800,
                      bgcolor: canSave ? P.green : alpha(P.primary, 0.2),
                      color: canSave ? "#FFFFFF" : alpha(P.primary, 0.6),
                      boxShadow: canSave ? `0 16px 36px ${alpha(P.green, 0.18)}` : "none",
                      "&:hover": { bgcolor: canSave ? alpha(P.green, 0.92) : alpha(P.primary, 0.2) }
                    }}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CloseRounded />}
                    onClick={handleCancel}
                    disabled={!modoEdicion}
                    sx={{
                      fontWeight: 800,
                      borderColor: modoEdicion ? alpha(P.primary, 0.22) : alpha(P.primary, 0.18),
                      color: modoEdicion ? P.primary : alpha(P.primary, 0.55),
                      "&:hover": { borderColor: alpha(P.primary, 0.22), bgcolor: alpha(P.primary, 0.04) }
                    }}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </CardContent>
            </GlassCard>
          </MotionBox>
          <Box sx={{ mt: 3 }}>
            <ConectarAlexa />
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.05 }}
          >
            <GlassCard
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: `0 22px 50px ${alpha("#0B1220", 0.10)}`
              }}
            >
              <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 900, color: P.primary, letterSpacing: -0.3 }}>
                      Editar información
                    </Typography>
                    <Typography sx={{ color: P.secondary, mt: 0.35 }}>
                      Puedes escribir y simular guardado (solo en tu navegador).
                    </Typography>
                  </Box>
                  <Chip
                    label={modoEdicion ? "Edición" : "Solo vista"}
                    size="small"
                    sx={{
                      bgcolor: modoEdicion ? `${P.accent}22` : `${P.secondary}18`,
                      color: modoEdicion ? P.primary : P.secondary,
                      fontWeight: 800,
                      borderRadius: 999
                    }}
                  />
                </Stack>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Nombre completo"
                      value={form.nombreCompleto}
                      onChange={(e) => setForm((p) => ({ ...p, nombreCompleto: e.target.value }))}
                      fullWidth
                      size="small"
                      disabled={!modoEdicion}
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: 2,
                          transition: "transform 160ms ease, box-shadow 160ms ease",
                          boxShadow: `0 14px 28px ${alpha("#0B1220", 0.06)}`
                        },
                        "& .MuiInputBase-root:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: `0 18px 34px ${alpha("#0B1220", 0.10)}`
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Teléfono"
                      value={form.telefono}
                      onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                      fullWidth
                      size="small"
                      disabled={!modoEdicion}
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: 2,
                          transition: "transform 160ms ease, box-shadow 160ms ease",
                          boxShadow: `0 14px 28px ${alpha("#0B1220", 0.06)}`
                        },
                        "& .MuiInputBase-root:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: `0 18px 34px ${alpha("#0B1220", 0.10)}`
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Correo"
                      value={form.correo}
                      onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
                      fullWidth
                      size="small"
                      disabled={!modoEdicion}
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: 2,
                          transition: "transform 160ms ease, box-shadow 160ms ease",
                          boxShadow: `0 14px 28px ${alpha("#0B1220", 0.06)}`
                        },
                        "& .MuiInputBase-root:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: `0 18px 34px ${alpha("#0B1220", 0.10)}`
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Notas / preferencias"
                      placeholder="Ej: me gusta la navaja, ceja ligera, sin gel."
                      value={form.notas}
                      onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                      fullWidth
                      size="small"
                      disabled={!modoEdicion}
                      multiline
                      minRows={3}
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: 2,
                          transition: "transform 160ms ease, box-shadow 160ms ease",
                          boxShadow: `0 14px 28px ${alpha("#0B1220", 0.06)}`
                        },
                        "& .MuiInputBase-root:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: `0 18px 34px ${alpha("#0B1220", 0.10)}`
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: alpha(P.primary, 0.08) }} />

              <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                <Typography sx={{ fontWeight: 900, color: P.primary, letterSpacing: -0.3, mb: 1.5 }}>
                  Registro de datos (estilo CRUD)
                </Typography>

                <TableContainer
                  component={Box}
                  sx={{
                    borderRadius: 2.5,
                    overflow: "hidden",
                    border: `1px solid ${alpha(P.primary, 0.08)}`,
                    boxShadow: `0 18px 42px ${alpha("#0B1220", 0.08)}`
                  }}
                >
                  <Table size="small" aria-label="Tabla perfil cliente (demo)">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(P.primary, 0.03) }}>
                        <TableCell sx={{ color: P.secondary, fontWeight: 800, fontSize: 12, letterSpacing: 0.4 }}>
                          CAMPO
                        </TableCell>
                        <TableCell sx={{ color: P.secondary, fontWeight: 800, fontSize: 12, letterSpacing: 0.4 }}>
                          VALOR
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: P.secondary, fontWeight: 800, fontSize: 12, letterSpacing: 0.4 }}
                        >
                          ACCIONES
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {perfilRows.map((r) => (
                        <TableRow
                          key={r.campo}
                          hover
                          sx={{
                            "&:hover": { bgcolor: alpha(P.primary, 0.03) },
                            transition: "background-color 160ms ease"
                          }}
                        >
                          <TableCell sx={{ fontWeight: 800, color: P.primary, whiteSpace: "nowrap" }}>
                            {r.campo}
                          </TableCell>
                          <TableCell sx={{ color: P.secondary }}>{r.valor}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleRowEdit(r.campo)}
                              sx={{
                                color: modoEdicion ? alpha(P.primary, 0.9) : alpha(P.primary, 0.55),
                                "&:hover": { bgcolor: alpha(P.primary, 0.06) }
                              }}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRowClear(r.campo)}
                              sx={{
                                color: modoEdicion ? alpha("#DC2626", 0.9) : alpha("#DC2626", 0.45),
                                "&:hover": { bgcolor: alpha("#DC2626", 0.06) }
                              }}
                            >
                              <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="caption" sx={{ display: "block", mt: 1.25, color: P.secondary }}>
                  Esto es una simulación: se guarda en tu navegador (localStorage), no en la base de datos.
                </Typography>
              </Box>
            </GlassCard>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.1 }}
            sx={{ mt: 3 }}
          >
            <GlassCard
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: `0 22px 50px ${alpha("#0B1220", 0.08)}`
              }}
            >
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: P.primary, letterSpacing: -0.3, fontFamily: '"Cinzel", serif' }}>
                      Mis Compras
                    </Typography>
                    <Typography sx={{ color: P.secondary, mt: 0.35, fontSize: "0.82rem" }}>
                      Administra tus pedidos y descarga tus comprobantes para recogerlos en sucursal.
                    </Typography>
                  </Box>
                  <ShoppingBagRounded sx={{ color: alpha(P.accent, 0.8), fontSize: 28 }} />
                </Stack>

                {cargandoCompras ? (
                  <Box sx={{ py: 6, display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5 }}>
                    <RefreshRounded sx={{ fontSize: 26, color: P.navy, animation: "spin 1.5s linear infinite" }} />
                    <Typography sx={{ color: P.secondary, fontSize: "0.88rem", fontWeight: 700 }}>Cargando tus compras...</Typography>
                  </Box>
                ) : compras.length === 0 ? (
                  <Box sx={{ py: 8, textAlign: "center" }}>
                    <ShoppingBagRounded sx={{ fontSize: 50, color: P.secondary, opacity: 0.3, mb: 1.5 }} />
                    <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.95rem" }}>
                      Aún no has realizado ninguna compra de productos.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {compras.map((compra) => {
                      const dateStr = compra.fecha ? new Date(compra.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "—";
                      const timeStr = compra.fecha ? new Date(compra.fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "";
                      const firstItem = compra.items?.[0];

                      return (
                        <Box
                          key={compra.id}
                          sx={{
                            borderRadius: 3,
                            border: `1px solid ${alpha(P.border, 0.95)}`,
                            bgcolor: "#FFFFFF",
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                              borderColor: alpha(P.accent, 0.45)
                            }
                          }}
                        >
                          {/* ML Header: Status & Fecha */}
                          <Box
                            sx={{
                              px: 2.5,
                              py: 1.5,
                              bgcolor: "#F8FAFC",
                              borderBottom: `1px solid ${alpha(P.border, 0.8)}`,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 1
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CheckCircleRounded sx={{ color: "#15803D", fontSize: 18 }} />
                              <Typography sx={{ color: "#15803D", fontWeight: 800, fontSize: "0.82rem" }}>
                                Pago aprobado
                              </Typography>
                            </Stack>
                            <Typography sx={{ color: P.secondary, fontSize: "0.78rem", fontWeight: 700 }}>
                              Comprado el {dateStr} {timeStr && `a las ${timeStr}`}
                            </Typography>
                          </Box>

                          {/* ML Body: Products Preview & Actions */}
                          <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={3} alignItems="center">
                              {/* Left: Product Thumbnail */}
                              <Grid item xs={12} sm={2} sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-start" } }}>
                                <Box
                                  component="img"
                                  src={resolveServicioImagenUrl(firstItem?.imagen, api.defaults.baseURL)}
                                  alt={firstItem?.nombre || "Producto"}
                                  sx={{
                                    width: 72,
                                    height: 72,
                                    objectFit: "contain",
                                    borderRadius: 2,
                                    bgcolor: "#F8FAFC",
                                    border: `1px solid ${alpha(P.border, 0.8)}`,
                                    p: 0.5
                                  }}
                                />
                              </Grid>

                              {/* Middle: Details */}
                              <Grid item xs={12} sm={6}>
                                <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "0.95rem", mb: 0.5 }}>
                                  {firstItem?.nombre || "Producto"}
                                  {compra.items.length > 1 && ` y ${compra.items.length - 1} producto(s) más`}
                                </Typography>
                                <Typography sx={{ color: P.secondary, fontSize: "0.8rem", fontWeight: 700, mb: 1.5 }}>
                                  {compra.items.map((it) => `${it.cantidad} u.`).join(" + ")}
                                </Typography>
                                <Typography sx={{ color: P.primary, fontWeight: 800, fontSize: "1rem" }}>
                                  Total: {moneyMXN(compra.total)}
                                </Typography>
                              </Grid>

                              {/* Right: Actions */}
                              <Grid item xs={12} sm={4}>
                                <Stack spacing={1}>
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleComprarDeNuevo(compra)}
                                    sx={{
                                      bgcolor: P.navy,
                                      color: "#FFFFFF",
                                      fontWeight: 800,
                                      fontSize: "0.78rem",
                                      textTransform: "none",
                                      borderRadius: "8px",
                                      py: 1,
                                      "&:hover": { bgcolor: "#152a41" }
                                    }}
                                  >
                                    Volver a comprar
                                  </Button>
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => descargarTicketInsumosPDF(compra)}
                                    sx={{
                                      borderColor: P.border,
                                      color: P.navy,
                                      fontWeight: 800,
                                      fontSize: "0.78rem",
                                      textTransform: "none",
                                      borderRadius: "8px",
                                      py: 1,
                                      "&:hover": { borderColor: P.navy, bgcolor: "rgba(30, 58, 90, 0.04)" }
                                    }}
                                  >
                                    Descargar Comprobante
                                  </Button>
                                  <Button
                                    fullWidth
                                    variant="text"
                                    onClick={() => handleVerComprobanteCompra(compra)}
                                    sx={{
                                      color: P.secondary,
                                      fontWeight: 800,
                                      fontSize: "0.75rem",
                                      textTransform: "none",
                                      "&:hover": { color: P.navy, bgcolor: "transparent" }
                                    }}
                                  >
                                    Ver recibo de compra
                                  </Button>
                                </Stack>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </GlassCard>
          </MotionBox>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={1800}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        message={toast.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AdminPageShell>
  );
}

export default MiPerfilCliente;
