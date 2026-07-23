import React, { useMemo, useState } from "react";
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
import AdminPageShell from "../../ui/admin/AdminPageShell";
import AdminHeader from "../../ui/admin/AdminHeader";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import ConectarAlexa from "../autenticacion/ConectarAlexa";

const MotionBox = motion.create(Box);

const springIn = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { type: "spring", stiffness: 260, damping: 24 }
};

function MiPerfilCliente() {
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
