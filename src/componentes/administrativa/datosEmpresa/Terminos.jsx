import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
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

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const MySwal = withReactContent(Swal);
const API_URL = "http://localhost:4000";

const PALETA = {
  principal: "#2C3E50",
  acento: "#D4AF37",
  oscuro: "#1A252F",
  borde: (opacity = 0.12) => alpha("#2C3E50", opacity),
  fondoIcono: (opacity = 0.1) => alpha("#2C3E50", opacity)
};

const normalizarRegistro = (row) => ({
  id: row.id,
  titulo: row.titulo ?? "",
  contenido: row.contenido ?? "",
  version: row.version ?? "",
  fechaPublicacion: row.fechaPublicacion ? String(row.fechaPublicacion).slice(0, 16) : "",
  activo: row.activo !== 0 && row.activo !== false
});

function Terminos() {
  const [terminos, setTerminos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    contenido: "",
    version: "",
    fechaPublicacion: "",
    activo: true
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({
    titulo: "",
    contenido: "",
    version: "",
    fechaPublicacion: "",
    activo: true
  });

  const puedeGuardar = useMemo(() => {
    return (
      form.version.trim() !== "" &&
      form.titulo.trim() !== "" &&
      form.contenido.trim() !== "" &&
      !saving
    );
  }, [form, saving]);

  const puedeGuardarEdicion = useMemo(() => {
    return (
      formEdit.version.trim() !== "" &&
      formEdit.titulo.trim() !== "" &&
      formEdit.contenido.trim() !== "" &&
      !savingEdit
    );
  }, [formEdit, savingEdit]);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/terminos-condiciones?incluirInactivos=1`);
      setTerminos(Array.isArray(data) ? data.map(normalizarRegistro) : []);
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudieron cargar los términos",
        position: "center",
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
      setTerminos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleChange = (campo) => (e) => {
    const value = e?.target?.value;
    setForm((prev) => ({ ...prev, [campo]: value }));
  };

  const handleChangeEdit = (campo) => (e) => {
    const value = e?.target?.value;
    setFormEdit((prev) => ({ ...prev, [campo]: value }));
  };

  const handleGuardar = async () => {
    if (!puedeGuardar) return;
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        version: form.version.trim(),
        fechaPublicacion: form.fechaPublicacion || null,
        activo: form.activo ? 1 : 0
      };
      const { data } = await axios.post(`${API_URL}/api/terminos-condiciones`, payload);
      setTerminos((prev) => [
        {
          id: data.id,
          ...payload,
          fechaPublicacion: payload.fechaPublicacion ? String(payload.fechaPublicacion).slice(0, 16) : "",
          activo: payload.activo === 1
        },
        ...prev
      ]);
      setForm({ titulo: "", contenido: "", version: "", fechaPublicacion: "", activo: true });
      await MySwal.fire({
        icon: "success",
        title: "Agregado",
        text: "Los términos se guardaron correctamente",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudieron guardar los términos",
        position: "center",
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditar = (row) => {
    setEditando(row);
    setFormEdit({
      titulo: row.titulo || "",
      contenido: row.contenido || "",
      version: row.version || "",
      fechaPublicacion: row.fechaPublicacion || "",
      activo: row.activo !== false && row.activo !== 0
    });
    setModalOpen(true);
  };

  const closeEditar = () => {
    setModalOpen(false);
    setEditando(null);
    setFormEdit({ titulo: "", contenido: "", version: "", fechaPublicacion: "", activo: true });
  };

  const guardarEdicion = async () => {
    if (!editando || !puedeGuardarEdicion) return;
    setSavingEdit(true);
    try {
      const payload = {
        titulo: formEdit.titulo.trim(),
        contenido: formEdit.contenido.trim(),
        version: formEdit.version.trim(),
        fechaPublicacion: formEdit.fechaPublicacion || null,
        activo: formEdit.activo ? 1 : 0
      };
      await axios.put(`${API_URL}/api/terminos-condiciones/${editando.id}`, payload);
      setTerminos((prev) =>
        prev.map((t) =>
          t.id === editando.id
            ? {
                ...t,
                ...payload,
                fechaPublicacion: payload.fechaPublicacion ? String(payload.fechaPublicacion).slice(0, 16) : "",
                activo: payload.activo === 1
              }
            : t
        )
      );
      await MySwal.fire({
        icon: "success",
        title: "Actualizado",
        text: "Los cambios se guardaron correctamente",
        position: "center",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
      closeEditar();
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo actualizar",
        position: "center",
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const eliminar = async (row) => {
    const { isConfirmed } = await MySwal.fire({
      icon: "warning",
      title: "¿Eliminar términos?",
      text: "Esta acción no se puede deshacer",
      showCancelButton: true,
      confirmButtonColor: "#B91C1C",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Eliminar"
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/terminos-condiciones/${row.id}`);
      setTerminos((prev) => prev.filter((t) => t.id !== row.id));
      await MySwal.fire({
        icon: "success",
        title: "Eliminado",
        text: "Se eliminó correctamente",
        position: "center",
        timer: 1800,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.error || "No se pudo eliminar",
        position: "center",
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro,
        iconColor: PALETA.principal
      });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          py: 5,
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress sx={{ color: PALETA.acento }} size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#FFFFFF", py: 5, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: PALETA.fondoIcono()
            }}
          >
            <DescriptionOutlinedIcon sx={{ color: PALETA.principal, fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.oscuro }}>
              Términos y condiciones
            </Typography>
            <Typography variant="body2" sx={{ color: PALETA.borde(0.8), mt: 0.5 }}>
              Agrega, edita o elimina las versiones de tus términos.
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} color={PALETA.principal}>
              Agregar términos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleGuardar}
              disabled={!puedeGuardar}
              sx={{
                bgcolor: PALETA.acento,
                color: PALETA.oscuro,
                fontWeight: 700,
                "&:hover": { bgcolor: PALETA.oscuro, color: "#fff" },
                "&.Mui-disabled": { bgcolor: PALETA.borde(0.2), color: PALETA.borde(0.6) }
              }}
            >
              {saving ? "Guardando..." : "Agregar"}
            </Button>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 220px 220px" }, gap: 2 }}>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={handleChange("titulo")}
              fullWidth
              size="small"
              InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
            />
            <TextField
              label="Versión"
              value={form.version}
              onChange={handleChange("version")}
              fullWidth
              size="small"
              placeholder="Ej: 1.0"
              InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
            />
            <TextField
              label="Fecha de publicación (opcional)"
              type="datetime-local"
              value={form.fechaPublicacion}
              onChange={handleChange("fechaPublicacion")}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
            />
          </Box>

          <TextField
            label="Contenido"
            value={form.contenido}
            onChange={handleChange("contenido")}
            multiline
            rows={6}
            fullWidth
            sx={{ mt: 2 }}
            size="small"
            placeholder="Escribe aquí los términos y condiciones..."
            InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
          />

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.activo}
                  onChange={(e) => setForm((prev) => ({ ...prev, activo: e.target.checked }))}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: PALETA.acento },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: PALETA.acento }
                  }}
                />
              }
              label={
                <Chip
                  size="small"
                  label={form.activo ? "Activo" : "Inactivo"}
                  sx={{
                    ml: 1,
                    bgcolor: form.activo ? alpha("#22C55E", 0.15) : alpha("#94A3B8", 0.2),
                    color: form.activo ? "#15803D" : "#64748B",
                    fontWeight: 600
                  }}
                />
              }
              labelPlacement="end"
            />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: `1px solid ${PALETA.borde()}`,
            borderRadius: 2
          }}
        >
          <Typography variant="h6" fontWeight={700} color={PALETA.principal} sx={{ mb: 2 }}>
            Listado
          </Typography>

          {terminos.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                border: `1px dashed ${PALETA.borde(0.4)}`,
                borderRadius: 2,
                bgcolor: PALETA.fondoIcono(0.03)
              }}
            >
              <DescriptionOutlinedIcon sx={{ color: PALETA.borde(0.5), fontSize: 48 }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Aún no hay términos registrados.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.06) }}>
                    <TableCell sx={{ fontWeight: 700, color: PALETA.principal }}>Título</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: PALETA.principal }}>Versión</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: PALETA.principal }}>Publicación</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: PALETA.principal }}>
                      Estado
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: PALETA.principal }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {terminos.map((t) => (
                    <TableRow key={t.id} hover sx={{ "&:hover": { bgcolor: PALETA.fondoIcono(0.04) } }}>
                      <TableCell sx={{ fontWeight: 600, maxWidth: 380 }} title={t.titulo}>
                        {t.titulo}
                      </TableCell>
                      <TableCell>{t.version || "—"}</TableCell>
                      <TableCell>{t.fechaPublicacion || "—"}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={t.activo ? "Activo" : "Inactivo"}
                          sx={{
                            bgcolor: t.activo ? alpha("#22C55E", 0.15) : alpha("#94A3B8", 0.2),
                            color: t.activo ? "#15803D" : "#64748B",
                            fontWeight: 700
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => openEditar(t)}
                          sx={{ color: PALETA.principal, "&:hover": { bgcolor: PALETA.fondoIcono(0.1), color: PALETA.acento } }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => eliminar(t)}
                          sx={{ color: "#B91C1C", "&:hover": { bgcolor: alpha("#B91C1C", 0.08) } }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog
          open={modalOpen}
          onClose={closeEditar}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: `1px solid ${PALETA.borde()}`,
              boxShadow: "0 8px 32px rgba(44, 62, 80, 0.12)"
            }
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Playfair Display', serif", color: PALETA.principal, fontWeight: 700 }}>
            Editar términos
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 220px 220px" }, gap: 2, pt: 1 }}>
              <TextField
                label="Título"
                value={formEdit.titulo}
                onChange={handleChangeEdit("titulo")}
                fullWidth
                size="small"
                InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
              />
              <TextField
                label="Versión"
                value={formEdit.version}
                onChange={handleChangeEdit("version")}
                fullWidth
                size="small"
                InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
              />
              <TextField
                label="Fecha de publicación (opcional)"
                type="datetime-local"
                value={formEdit.fechaPublicacion}
                onChange={handleChangeEdit("fechaPublicacion")}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
              />
            </Box>

            <TextField
              label="Contenido"
              value={formEdit.contenido}
              onChange={handleChangeEdit("contenido")}
              multiline
              rows={8}
              fullWidth
              sx={{ mt: 2 }}
              size="small"
              InputProps={{ sx: { "& fieldset": { borderColor: PALETA.borde(0.3) } } }}
            />

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formEdit.activo}
                    onChange={(e) => setFormEdit((prev) => ({ ...prev, activo: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: PALETA.acento },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: PALETA.acento }
                    }}
                  />
                }
                label={
                  <Chip
                    size="small"
                    label={formEdit.activo ? "Activo" : "Inactivo"}
                    sx={{
                      ml: 1,
                      bgcolor: formEdit.activo ? alpha("#22C55E", 0.15) : alpha("#94A3B8", 0.2),
                      color: formEdit.activo ? "#15803D" : "#64748B",
                      fontWeight: 600
                    }}
                  />
                }
                labelPlacement="end"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
            <Button onClick={closeEditar} sx={{ color: PALETA.borde(0.9) }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={guardarEdicion}
              disabled={!puedeGuardarEdicion}
              sx={{
                bgcolor: PALETA.acento,
                color: PALETA.oscuro,
                fontWeight: 700,
                "&:hover": { bgcolor: PALETA.oscuro, color: "#fff" },
                "&.Mui-disabled": { bgcolor: PALETA.borde(0.2), color: PALETA.borde(0.6) }
              }}
            >
              {savingEdit ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Terminos;
