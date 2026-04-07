import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Papa from "papaparse";

import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

function CsvImportExport({ mostrarTitulo = true }) {

  const API_URL = "http://localhost:4000";

  const [tipo, setTipo] = useState("servicios");
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Exportación avanzada (preview + selección)
  const [previewCargando, setPreviewCargando] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewRows, setPreviewRows] = useState([]);

  const [camposCargando, setCamposCargando] = useState(false);
  const [camposError, setCamposError] = useState("");
  const [camposExportables, setCamposExportables] = useState([]);
  const [camposPorDefecto, setCamposPorDefecto] = useState([]);
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);

  const [idsSeleccionados, setIdsSeleccionados] = useState([]);

  // Importación: preview CSV + validación
  const [importCamposCargando, setImportCamposCargando] = useState(false);
  const [importCamposError, setImportCamposError] = useState("");
  const [importPlantillaCampos, setImportPlantillaCampos] = useState([]);
  const [importRequeridas, setImportRequeridas] = useState([]);

  const [importPreviewHeaders, setImportPreviewHeaders] = useState([]);
  const [importPreviewRows, setImportPreviewRows] = useState([]);
  const [importPreviewTotal, setImportPreviewTotal] = useState(0);
  const [importPreviewError, setImportPreviewError] = useState("");
  const [importPreviewWarn, setImportPreviewWarn] = useState([]);
  const [importPreviewFaltantes, setImportPreviewFaltantes] = useState([]);
  const [importPreviewExtras, setImportPreviewExtras] = useState([]);
  const [importPreviewDuplicados, setImportPreviewDuplicados] = useState([]);

  // Resultado global de operaciones (éxito / error)
  const [resultado, setResultado] = useState(null);

  const nombreTipo = useMemo(() => {
    const map = {
      servicios: "Servicios",
      barberos: "Barberos",
      insumos: "Insumos",
      citas: "Citas"
    };
    return map[tipo] || "Datos";
  }, [tipo]);

  const puedeImportar = tipo !== "citas";

  const puedeEjecutarImportacion =
    puedeImportar &&
    archivo &&
    !cargando &&
    !importPreviewError &&
    importPreviewFaltantes.length === 0 &&
    importPreviewTotal > 0;

  const previewEndpoint = useMemo(() => {
    const map = {
      servicios: `${API_URL}/api/servicios?incluirInactivos=1`,
      insumos: `${API_URL}/api/insumos?incluirInactivos=1`,
      citas: `${API_URL}/api/citas`,
      barberos: `${API_URL}/api/barberos?incluirInactivos=1`
    };
    return map[tipo] || "";
  }, [API_URL, tipo]);

  const puedePrevisualizar = Boolean(previewEndpoint);

  useEffect(() => {
    // Reset selección al cambiar tipo
    setIdsSeleccionados([]);
    setPreviewError("");
    setCamposError("");

    // Cargar campos exportables/por defecto desde backend
    const cargarCampos = async () => {
      try {
        setCamposCargando(true);
        const res = await fetch(`${API_URL}/api/exportar/${tipo}/campos`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "No se pudieron cargar los campos");
        const exportables = Array.isArray(data.exportables) ? data.exportables : [];
        const porDefecto = Array.isArray(data.porDefecto) ? data.porDefecto : [];
        setCamposExportables(exportables);
        setCamposPorDefecto(porDefecto);
        setCamposSeleccionados(porDefecto);
      } catch (e) {
        setCamposExportables([]);
        setCamposPorDefecto([]);
        setCamposSeleccionados([]);
        setCamposError(e.message || "Error cargando campos");
      } finally {
        setCamposCargando(false);
      }
    };

    // Cargar vista previa de registros
    const cargarPreview = async () => {
      if (!puedePrevisualizar) {
        setPreviewRows([]);
        return;
      }
      try {
        setPreviewCargando(true);
        const res = await fetch(previewEndpoint);
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.error || "No se pudo cargar la vista previa");
        const rows = Array.isArray(data) ? data : [];
        setPreviewRows(rows.slice(0, 50));
      } catch (e) {
        setPreviewRows([]);
        setPreviewError(e.message || "Error cargando vista previa");
      } finally {
        setPreviewCargando(false);
      }
    };

    cargarCampos();
    cargarPreview();
  }, [API_URL, tipo, previewEndpoint, puedePrevisualizar]);

  useEffect(() => {
    // Cargar columnas esperadas para importación (plantilla + requeridas)
    const cargarCamposImport = async () => {
      if (!puedeImportar) {
        setImportPlantillaCampos([]);
        setImportRequeridas([]);
        setImportCamposError("");
        return;
      }
      try {
        setImportCamposCargando(true);
        setImportCamposError("");
        const res = await fetch(`${API_URL}/api/importar/${tipo}/campos`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "No se pudieron cargar campos de importación");
        setImportPlantillaCampos(Array.isArray(data.plantilla) ? data.plantilla : []);
        setImportRequeridas(Array.isArray(data.requeridas) ? data.requeridas : []);
      } catch (e) {
        setImportPlantillaCampos([]);
        setImportRequeridas([]);
        setImportCamposError(e.message || "Error cargando campos de importación");
      } finally {
        setImportCamposCargando(false);
      }
    };
    cargarCamposImport();
  }, [API_URL, tipo, puedeImportar]);

  const limpiarPreviewImport = () => {
    setImportPreviewHeaders([]);
    setImportPreviewRows([]);
    setImportPreviewTotal(0);
    setImportPreviewError("");
    setImportPreviewWarn([]);
    setImportPreviewFaltantes([]);
    setImportPreviewExtras([]);
    setImportPreviewDuplicados([]);
  };

  const parsearCsvParaPreview = async (file) => {
    limpiarPreviewImport();
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setImportPreviewError("El archivo debe ser formato CSV.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = Array.isArray(results?.meta?.fields) ? results.meta.fields : [];
        const data = Array.isArray(results?.data) ? results.data : [];
        const errors = Array.isArray(results?.errors) ? results.errors : [];

        if (errors.length > 0) {
          setImportPreviewError(errors[0]?.message || "Error parseando CSV");
          return;
        }

        const total = data.length;
        if (total === 0) {
          setImportPreviewError("El CSV está vacío.");
          setImportPreviewTotal(0);
          return;
        }

        setImportPreviewHeaders(headers);
        setImportPreviewTotal(total);
        setImportPreviewRows(data.slice(0, 30));

        // Validación columnas
        const faltantes = (importRequeridas || []).filter((c) => !headers.includes(c));
        setImportPreviewFaltantes(faltantes);

        const extras = headers.filter(
          (h) => !(importPlantillaCampos || []).includes(h)
        );
        setImportPreviewExtras(extras);

        const warns = [];
        if (faltantes.length > 0) {
          warns.push(`Faltan columnas requeridas: ${faltantes.join(", ")}`);
        }
        if (extras.length > 0) {
          warns.push(`Columnas extra (se ignorarán en backend): ${extras.join(", ")}`);
        }

        // Duplicados dentro del CSV (Insumos por nombre+unidad, solo informativo)
        if (tipo === "insumos" && headers.includes("nombre") && headers.includes("unidad")) {
          const seen = new Set();
          const dups = new Set();
          for (const row of data) {
            const n = String(row?.nombre ?? "").trim().toLowerCase();
            const u = String(row?.unidad ?? "").trim().toLowerCase();
            if (!n || !u) continue;
            const key = `${n}|${u}`;
            if (seen.has(key)) dups.add(key);
            else seen.add(key);
          }
          const dupArr = Array.from(dups).slice(0, 20);
          setImportPreviewDuplicados(dupArr);
          if (dupArr.length > 0) {
            warns.push(
              `Hay productos repetidos (mismo nombre+unidad) en el CSV; sus movimientos de stock se aplicarán fila por fila.`
            );
          }
        }

        setImportPreviewWarn(warns);
      }
    });
  };

  /* =========================
     EXPORTAR CSV
  ========================= */

  const manejarExportacion = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/api/exportar/${tipo}/csv`);

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "Error al exportar");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipo}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error("Error exportando:", error);
      setResultado({
        tipo: "error",
        titulo: "Error al exportar CSV",
        mensaje: error.message || "No se pudo exportar el archivo."
      });

    } finally {
      setCargando(false);
    }
  };

  const toggleCampo = (campo) => {
    setCamposSeleccionados((prev) => {
      if (prev.includes(campo)) return prev.filter((c) => c !== campo);
      return [...prev, campo];
    });
  };

  const seleccionarTodosPreview = () => {
    const ids = previewRows
      .map((r) => r?.id)
      .filter((id) => id !== undefined && id !== null && String(id) !== "");
    setIdsSeleccionados(ids);
  };

  const limpiarSeleccionPreview = () => {
    setIdsSeleccionados([]);
  };

  const toggleId = (id) => {
    setIdsSeleccionados((prev) => {
      const s = new Set(prev.map((x) => String(x)));
      const key = String(id);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return Array.from(s);
    });
  };

  const manejarExportarSeleccionados = async () => {
    if (idsSeleccionados.length === 0) {
      setResultado({
        tipo: "error",
        titulo: "No hay registros seleccionados",
        mensaje: "Selecciona al menos un registro para exportar."
      });
      return;
    }
    try {
      setCargando(true);
      const res = await fetch(`${API_URL}/api/exportar/${tipo}/csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: idsSeleccionados,
          campos: camposSeleccionados
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al exportar seleccionados");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tipo}-seleccion.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error exportando seleccionados:", e);
      setResultado({
        tipo: "error",
        titulo: "Error al exportar selección",
        mensaje: e.message || "No se pudo exportar la selección."
      });
    } finally {
      setCargando(false);
    }
  };

  /** Descarga plantilla CSV (encabezados + fila vacía) para el tipo seleccionado. */
  const manejarDescargarPlantilla = async () => {
    if (!puedeImportar) return; // citas no tiene plantilla
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/api/exportar/${tipo}/plantilla`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Error al descargar plantilla");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plantilla-${tipo}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando plantilla:", error);
      setResultado({
        tipo: "error",
        titulo: "Error al descargar plantilla",
        mensaje: error.message || "No se pudo descargar la plantilla."
      });
    } finally {
      setCargando(false);
    }
  };

  /* =========================
     IMPORTAR CSV
  ========================= */

  const manejarImportacion = async () => {

    if (!archivo) {
      setResultado({
        tipo: "error",
        titulo: "Archivo requerido",
        mensaje: "Selecciona un archivo CSV primero."
      });
      return;
    }

    if (!archivo.name.toLowerCase().endsWith(".csv")) {
      setResultado({
        tipo: "error",
        titulo: "Formato no válido",
        mensaje: "El archivo debe ser formato CSV."
      });
      return;
    }

    if (importPreviewTotal === 0) {
      setResultado({
        tipo: "error",
        titulo: "CSV vacío",
        mensaje: "El archivo CSV no contiene filas para importar."
      });
      return;
    }

    if (importPreviewFaltantes.length > 0) {
      setResultado({
        tipo: "error",
        titulo: "Columnas faltantes",
        mensaje: `No se puede importar. Faltan columnas: ${importPreviewFaltantes.join(", ")}.`
      });
      return;
    }

    try {

      setCargando(true);

      const formData = new FormData();
      formData.append("archivo", archivo);

      const response = await fetch(`${API_URL}/api/importar/${tipo}/csv`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al importar");
      }

      if (tipo === "insumos") {
        const errs = Array.isArray(data.errores) ? data.errores : [];
        setResultado({
          tipo: "success",
          titulo: "Importación de insumos completada",
          mensaje: `Procesados: ${data.registros ?? "-"} · Insertados: ${data.insertados ?? 0} · Actualizados (stock): ${
            data.actualizadosStock ?? 0
          } · Omitidos (delta 0): ${data.omitidos ?? 0} · Errores: ${errs.length}`
        });
      } else {
        setResultado({
          tipo: "success",
          titulo: "Importación completada",
          mensaje: `Registros procesados: ${data.registros}`
        });
      }

      setArchivo(null);
      limpiarPreviewImport();

    } catch (error) {

      console.error("Error importando:", error);
      setResultado({
        tipo: "error",
        titulo: "Error al importar CSV",
        mensaje: error.message || "No se pudo importar el archivo."
      });

    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ mt: 3.5 }}>

      {mostrarTitulo && (
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ color: "#1A252F", mb: 1.5 }}
        >
          Importar / Exportar CSV (Excel)
        </Typography>
      )}

      <Typography
        variant="body1"
        sx={{ color: alpha("#1A252F", 0.85), mb: 3 }}
      >
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 4,
          border: `1px solid ${alpha("#2C3E50", 0.12)}`
        }}
      >

        <Stack spacing={2.25}>

          {resultado && (
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                bgcolor:
                  resultado.tipo === "success"
                    ? alpha("#D4AF37", 0.08)
                    : alpha("#c62828", 0.06),
                border: `1px solid ${
                  resultado.tipo === "success"
                    ? alpha("#D4AF37", 0.6)
                    : alpha("#c62828", 0.5)
                }`
              }}
            >
              <Box sx={{ mt: "2px" }}>
                {resultado.tipo === "success" ? (
                  <CheckCircleOutlineIcon
                    sx={{ color: "#2C3E50", fontSize: 22 }}
                  />
                ) : (
                  <ErrorOutlineIcon sx={{ color: "#c62828", fontSize: 22 }} />
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: resultado.tipo === "success" ? "#2C3E50" : "#c62828",
                    mb: 0.5
                  }}
                >
                  {resultado.titulo}
                </Typography>
                {resultado.mensaje && (
                  <Typography
                    variant="body2"
                    sx={{ color: alpha("#1A252F", 0.85) }}
                  >
                    {resultado.mensaje}
                  </Typography>
                )}
              </Box>
              <Button
                size="small"
                onClick={() => setResultado(null)}
                sx={{
                  minWidth: "auto",
                  color: alpha("#1A252F", 0.7),
                  fontWeight: 700,
                  textTransform: "none"
                }}
              >
                Cerrar
              </Button>
            </Box>
          )}

          <Alert
            icon={<InfoOutlinedIcon fontSize="inherit" />}
            severity="info"
            sx={{
              borderRadius: 3,
              bgcolor: alpha("#2C3E50", 0.06),
              "& .MuiAlert-icon": { color: "#2C3E50" }
            }}
          >
            Recomendación: exporta primero una plantilla CSV, edítala en Excel y luego impórtala.
          </Alert>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* EXPORTAR */}

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: `1px solid ${alpha("#2C3E50", 0.12)}`
              }}
            >

              <Stack spacing={1.75}>

                <Typography fontWeight={800}>
                  Exportar a CSV
                </Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel>Tipo de datos</InputLabel>

                  <Select
                    label="Tipo de datos"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <MenuItem value="servicios">Servicios</MenuItem>
                    <MenuItem value="barberos">Barberos</MenuItem>
                    <MenuItem value="insumos">Insumos</MenuItem>
                    <MenuItem value="citas">Citas</MenuItem>
                  </Select>

                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={manejarExportacion}
                  disabled={cargando}
                  sx={{
                    backgroundColor: "#D4AF37",
                    color: "#1A252F",
                    fontWeight: 800,
                    borderRadius: 3
                  }}
                >
                  Exportar {nombreTipo}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon />}
                  onClick={manejarDescargarPlantilla}
                  disabled={!puedeImportar || cargando}
                  sx={{
                    borderRadius: 3,
                    fontWeight: 700,
                    color: "#2C3E50",
                    borderColor: "rgba(44, 62, 80, 0.35)",
                    "&:hover": {
                      borderColor: "rgba(44, 62, 80, 0.6)",
                      bgcolor: "rgba(44, 62, 80, 0.04)"
                    }
                  }}
                >
                  Descargar plantilla
                </Button>

                <Box
                  sx={{
                    mt: 1.25,
                    p: 1.5,
                    borderRadius: 3,
                    border: `1px solid ${alpha("#2C3E50", 0.12)}`,
                    bgcolor: alpha("#2C3E50", 0.02)
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 1, color: "#2C3E50" }}>
                    Campos a incluir en CSV
                  </Typography>

                  {camposCargando ? (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" sx={{ color: alpha("#1A252F", 0.75) }}>
                        Cargando campos…
                      </Typography>
                    </Stack>
                  ) : camposError ? (
                    <Typography variant="body2" sx={{ color: "error.main" }}>
                      {camposError}
                    </Typography>
                  ) : (
                    <FormGroup>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 0.5
                        }}
                      >
                        {camposExportables
                          .filter((c) => c !== "id")
                          .map((campo) => (
                            <FormControlLabel
                              key={campo}
                              control={
                                <Checkbox
                                  checked={camposSeleccionados.includes(campo)}
                                  onChange={() => toggleCampo(campo)}
                                  size="small"
                                />
                              }
                              label={campo}
                            />
                          ))}
                      </Box>
                      <Typography variant="caption" sx={{ color: alpha("#1A252F", 0.7), mt: 0.5 }}>
                      </Typography>
                    </FormGroup>
                  )}
                </Box>

                <Box
                  sx={{
                    mt: 1.25,
                    p: 1.5,
                    borderRadius: 3,
                    border: `1px solid ${alpha("#2C3E50", 0.12)}`,
                    bgcolor: alpha("#FFFFFF", 0.7)
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 1, color: "#2C3E50" }}>
                    Vista previa y selección de registros
                  </Typography>

                  {!puedePrevisualizar ? (
                    <Typography variant="body2" sx={{ color: alpha("#1A252F", 0.75) }}>
                      Para <b>Barberos</b> aún no hay una ruta de listado en el backend; por eso la vista previa está
                      deshabilitada. Puedes seguir usando “Exportar {nombreTipo}”.
                    </Typography>
                  ) : previewCargando ? (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" sx={{ color: alpha("#1A252F", 0.75) }}>
                        Cargando vista previa…
                      </Typography>
                    </Stack>
                  ) : previewError ? (
                    <Typography variant="body2" sx={{ color: "error.main" }}>
                      {previewError}
                    </Typography>
                  ) : (
                    <>
                      <Stack direction={{ xs: "column", sm: "row" }} gap={1} sx={{ mb: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={seleccionarTodosPreview}
                          disabled={previewRows.length === 0 || cargando}
                          startIcon={<PlaylistAddCheckRoundedIcon />}
                          sx={{
                            borderRadius: 3,
                            fontWeight: 800,
                            color: "#2C3E50",
                            borderColor: alpha("#2C3E50", 0.35)
                          }}
                        >
                          Seleccionar todos (vista)
                        </Button>
                        <Button
                          variant="text"
                          onClick={limpiarSeleccionPreview}
                          disabled={idsSeleccionados.length === 0 || cargando}
                          sx={{ borderRadius: 3, fontWeight: 800, color: alpha("#2C3E50", 0.85) }}
                        >
                          Limpiar selección
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button
                          variant="contained"
                          onClick={manejarExportarSeleccionados}
                          disabled={idsSeleccionados.length === 0 || cargando}
                          sx={{
                            borderRadius: 3,
                            fontWeight: 900,
                            bgcolor: "#2C3E50",
                            "&:hover": { bgcolor: alpha("#2C3E50", 0.92) }
                          }}
                        >
                          Exportar seleccionados ({idsSeleccionados.length})
                        </Button>
                      </Stack>

                      <Box sx={{ maxHeight: 260, overflow: "auto", borderRadius: 2 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={
                                    previewRows.length > 0 &&
                                    idsSeleccionados.length > 0 &&
                                    idsSeleccionados.length ===
                                      previewRows.filter((r) => r?.id != null && String(r.id) !== "").length
                                  }
                                  indeterminate={
                                    idsSeleccionados.length > 0 &&
                                    idsSeleccionados.length <
                                      previewRows.filter((r) => r?.id != null && String(r.id) !== "").length
                                  }
                                  onChange={() => {
                                    const allCount = previewRows.filter((r) => r?.id != null && String(r.id) !== "")
                                      .length;
                                    if (idsSeleccionados.length === allCount) limpiarSeleccionPreview();
                                    else seleccionarTodosPreview();
                                  }}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>id</TableCell>
                              <TableCell sx={{ fontWeight: 900 }}>Resumen</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {previewRows.map((r) => {
                              const id = r?.id;
                              const key = id != null ? String(id) : Math.random().toString(36);
                              const checked = id != null && idsSeleccionados.map(String).includes(String(id));
                              const resumen =
                                tipo === "servicios"
                                  ? `${r.nombre ?? ""} ${r.categoria ? `(${r.categoria})` : ""}`.trim()
                                  : tipo === "insumos"
                                    ? `${r.nombre ?? ""} ${r.unidad ? `(${r.unidad})` : ""}`.trim()
                                    : tipo === "citas"
                                      ? `${r.fecha ?? ""} ${r.horaInicio ?? ""} - ${r.estado ?? ""}`.trim()
                                      : "";
                              return (
                                <TableRow
                                  key={key}
                                  hover
                                  sx={{ cursor: id != null ? "pointer" : "default" }}
                                  onClick={() => {
                                    if (id == null) return;
                                    toggleId(id);
                                  }}
                                >
                                  <TableCell padding="checkbox">
                                    <Checkbox checked={checked} size="small" />
                                  </TableCell>
                                  <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                                    {id ?? "-"}
                                  </TableCell>
                                  <TableCell sx={{ color: alpha("#1A252F", 0.85) }}>
                                    {resumen || "(sin resumen)"}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Box>

                      <Typography variant="caption" sx={{ color: alpha("#1A252F", 0.7), mt: 0.75, display: "block" }}>
                      </Typography>
                    </>
                  )}
                </Box>

              </Stack>

            </Paper>

            {/* IMPORTAR */}

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: `1px solid ${alpha("#2C3E50", 0.12)}`
              }}
            >

              <Stack spacing={1.75}>

                <Typography fontWeight={800}>
                  Importar desde CSV
                </Typography>

                <FormControl size="small" fullWidth>

                  <InputLabel>Tipo de datos</InputLabel>

                  <Select
                    label="Tipo de datos"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <MenuItem value="servicios">Servicios</MenuItem>
                    <MenuItem value="barberos">Barberos</MenuItem>
                    <MenuItem value="insumos">Insumos</MenuItem>
                    <MenuItem value="citas" disabled>
                      Citas (no se puede importar)
                    </MenuItem>
                  </Select>

                </FormControl>

                <Box>

                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFileRoundedIcon />}
                    disabled={!puedeImportar}
                  >

                    Seleccionar CSV

                    <input
                      type="file"
                      accept=".csv,text/csv"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setArchivo(f);
                        parsearCsvParaPreview(f);
                      }}
                    />

                  </Button>

                  <Typography sx={{ mt: 1 }}>
                    {archivo ? `Archivo: ${archivo.name}` : "Ningún archivo seleccionado."}
                  </Typography>

                </Box>

                <Box
                  sx={{
                    mt: 1.25,
                    p: 1.5,
                    borderRadius: 3,
                    border: `1px solid ${alpha("#2C3E50", 0.12)}`,
                    bgcolor: alpha("#2C3E50", 0.02)
                  }}
                >
                  <Typography sx={{ fontWeight: 800, mb: 1, color: "#2C3E50" }}>
                    Vista previa de importación
                  </Typography>

                  {importCamposCargando ? (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <CircularProgress size={18} />
                      <Typography variant="body2" sx={{ color: alpha("#1A252F", 0.75) }}>
                        Cargando configuración de importación…
                      </Typography>
                    </Stack>
                  ) : importCamposError ? (
                    <Typography variant="body2" sx={{ color: "error.main" }}>
                      {importCamposError}
                    </Typography>
                  ) : !archivo ? (
                    <Typography variant="body2" sx={{ color: alpha("#1A252F", 0.75) }}>
                      Selecciona un CSV para ver qué se va a importar.
                    </Typography>
                  ) : importPreviewError ? (
                    <Typography variant="body2" sx={{ color: "error.main" }}>
                      {importPreviewError}
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ color: alpha("#1A252F", 0.75), mb: 1 }}>
                        Filas detectadas: <b>{importPreviewTotal}</b> (mostrando 30)
                      </Typography>

                      {importPreviewWarn.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          {importPreviewWarn.map((w, idx) => (
                            <Typography key={idx} variant="caption" sx={{ display: "block", color: alpha("#1A252F", 0.75) }}>
                              - {w}
                            </Typography>
                          ))}
                        </Box>
                      )}

                      {importPreviewFaltantes.length > 0 && (
                        <Typography variant="body2" sx={{ color: "error.main", mb: 1 }}>
                          No se puede importar: faltan columnas requeridas ({importPreviewFaltantes.join(", ")}).
                        </Typography>
                      )}

                      <Box sx={{ maxHeight: 220, overflow: "auto", borderRadius: 2 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {(importPreviewHeaders.slice(0, 6)).map((h) => (
                                <TableCell key={h} sx={{ fontWeight: 900 }}>
                                  {h}
                                </TableCell>
                              ))}
                              {importPreviewHeaders.length > 6 && (
                                <TableCell sx={{ fontWeight: 900 }}>…</TableCell>
                              )}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {importPreviewRows.map((r, idx) => (
                              <TableRow key={idx} hover>
                                {(importPreviewHeaders.slice(0, 6)).map((h) => (
                                  <TableCell key={h} sx={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {r?.[h] ?? ""}
                                  </TableCell>
                                ))}
                                {importPreviewHeaders.length > 6 && <TableCell>…</TableCell>}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>

                      <Typography variant="caption" sx={{ color: alpha("#1A252F", 0.7), mt: 0.75, display: "block" }}>
                        Recomendación: usa “Descargar plantilla” para evitar problemas de columnas.
                      </Typography>
                    </>
                  )}
                </Box>

                <Button
                  variant="contained"
                  onClick={manejarImportacion}
                  disabled={!puedeEjecutarImportacion}
                  sx={{
                    backgroundColor: "#2C3E50",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    borderRadius: 3
                  }}
                >
                  Importar {nombreTipo}
                </Button>

              </Stack>

            </Paper>

          </Box>

        </Stack>

      </Paper>

    </Box>
  );
}

export default CsvImportExport;