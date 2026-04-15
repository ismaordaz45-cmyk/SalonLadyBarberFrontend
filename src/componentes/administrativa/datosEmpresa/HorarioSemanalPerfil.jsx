import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
const MySwal = withReactContent(Swal);

export const DIAS_SEMANA_CONFIG = [
  { diaSemana: "LUNES", label: "Lunes" },
  { diaSemana: "MARTES", label: "Martes" },
  { diaSemana: "MIERCOLES", label: "Miércoles" },
  { diaSemana: "JUEVES", label: "Jueves" },
  { diaSemana: "VIERNES", label: "Viernes" },
  { diaSemana: "SABADO", label: "Sábado" },
  { diaSemana: "DOMINGO", label: "Domingo" }
];

function toMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== "string") return NaN;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

function normalizeTimeValue(v) {
  if (v == null || v === "") return "";
  const s = String(v).trim();
  return s.length >= 5 ? s.slice(0, 5) : s;
}

/**
 * @param {object} props
 * @param {string} props.apiBaseUrl
 * @param {object} props.palette - PALETA del padre (principal, acento, oscuro, borde, fondoIcono)
 * @param {string} props.horarioResumen - texto sincronizado (perfil.horarioAtencion), solo lectura
 * @param {(texto: string) => void} props.onHorarioAtencionUpdated
 */
function HorarioSemanalPerfil({
  apiBaseUrl,
  palette: PALETA,
  horarioResumen,
  onHorarioAtencionUpdated
}) {
  const [dias, setDias] = useState(() =>
    DIAS_SEMANA_CONFIG.map((c) => ({
      diaSemana: c.diaSemana,
      activo: c.diaSemana !== "DOMINGO",
      horaApertura: c.diaSemana !== "DOMINGO" ? "09:00" : "",
      horaCierre: c.diaSemana !== "DOMINGO" ? "18:00" : ""
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/horario-negocio`);
      const list = Array.isArray(data?.dias) ? data.dias : [];
      if (list.length === 7) {
        setDias(
          list.map((d) => ({
            diaSemana: d.diaSemana,
            activo: !!(d.activo === true || d.activo === 1),
            horaApertura: d.activo ? normalizeTimeValue(d.horaApertura) || "09:00" : "",
            horaCierre: d.activo ? normalizeTimeValue(d.horaCierre) || "18:00" : ""
          }))
        );
      }
    } catch (err) {
      if (err.response?.status === 503) {
        await MySwal.fire({
          icon: "warning",
          title: "Horario no disponible",
          text:
            err.response?.data?.error ||
            "Crea la tabla horario_negocio en la base de datos y reinicia el backend.",
          confirmButtonColor: PALETA.principal
        });
      } else {
        console.warn("GET horario-negocio:", err?.message);
      }
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, PALETA.principal]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const setDia = (diaSemana, patch) => {
    setDias((prev) =>
      prev.map((d) => (d.diaSemana === diaSemana ? { ...d, ...patch } : d))
    );
  };

  const validar = () => {
    for (const d of dias) {
      if (!d.activo) continue;
      const ini = d.horaApertura?.trim();
      const fin = d.horaCierre?.trim();
      if (!ini || !fin) {
        return `En ${DIAS_SEMANA_CONFIG.find((x) => x.diaSemana === d.diaSemana)?.label}: indique hora de inicio y fin.`;
      }
      const mi = toMinutes(ini);
      const mf = toMinutes(fin);
      if (Number.isNaN(mi) || Number.isNaN(mf) || mi >= mf) {
        return `En ${DIAS_SEMANA_CONFIG.find((x) => x.diaSemana === d.diaSemana)?.label}: la hora de inicio debe ser menor que la de fin.`;
      }
    }
    return null;
  };

  const handleGuardarHorario = async () => {
    const err = validar();
    if (err) {
      await MySwal.fire({
        icon: "warning",
        title: "Revisa el horario",
        text: err,
        confirmButtonColor: PALETA.principal,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro
      });
      return;
    }

    const payload = {
      dias: dias.map((d) => ({
        diaSemana: d.diaSemana,
        activo: d.activo,
        horaApertura: d.activo ? d.horaApertura : null,
        horaCierre: d.activo ? d.horaCierre : null
      }))
    };

    setSaving(true);
    try {
      const { data } = await axios.put(`${apiBaseUrl}/api/horario-negocio`, payload, {
        barberHeadline: "Horario del salón",
        barberMessage: "Guardando cambios y actualizando el resumen público…"
      });
      if (typeof data?.horarioAtencion === "string" && onHorarioAtencionUpdated) {
        onHorarioAtencionUpdated(data.horarioAtencion);
      }
    } catch (err) {
      await MySwal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err.response?.data?.error || err.message || "Error al guardar el horario",
        confirmButtonColor: PALETA.principal,
        background: PALETA.fondoIcono(0.2),
        color: PALETA.oscuro
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <ScheduleRoundedIcon sx={{ color: PALETA.principal, fontSize: 22 }} />
        <Typography variant="subtitle2" fontWeight={700} color={PALETA.principal}>
          Horario de atención
        </Typography>
      </Box>

      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1.5, maxWidth: 640 }}>
        Marque los días abiertos y las horas. El texto que verán los clientes en el perfil público se genera solo al
        guardar aquí.
      </Typography>

      {horarioResumen ? (
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            p: 1.25,
            borderRadius: 1,
            bgcolor: PALETA.fondoIcono(0.06),
            border: `1px solid ${PALETA.borde(0.2)}`,
            color: PALETA.oscuro
          }}
        >
          <strong>Resumen en perfil público:</strong> {horarioResumen}
        </Typography>
      ) : null}

      {loading ? (
        <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={32} sx={{ color: PALETA.acento }} />
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: `1px solid ${PALETA.borde(0.25)}`, borderRadius: 1, mb: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: PALETA.fondoIcono(0.06) }}>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.principal, width: 140 }}>Día</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: PALETA.principal, width: 100 }}>
                    Abierto
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.principal }}>Inicio</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: PALETA.principal }}>Cierre</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DIAS_SEMANA_CONFIG.map((cfg) => {
                  const row = dias.find((d) => d.diaSemana === cfg.diaSemana);
                  const activo = row?.activo ?? false;
                  return (
                    <TableRow key={cfg.diaSemana} hover sx={{ "&:hover": { bgcolor: PALETA.fondoIcono(0.03) } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{cfg.label}</TableCell>
                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={activo}
                              onChange={(e) => {
                                const on = e.target.checked;
                                setDia(cfg.diaSemana, {
                                  activo: on,
                                  horaApertura: on ? row?.horaApertura || "09:00" : "",
                                  horaCierre: on ? row?.horaCierre || "18:00" : ""
                                });
                              }}
                              size="small"
                              sx={{
                                color: PALETA.borde(0.6),
                                "&.Mui-checked": { color: PALETA.principal }
                              }}
                            />
                          }
                          label=""
                          sx={{ mr: 0 }}
                        />
                      </TableCell>
                      <TableCell>
                        {activo ? (
                          <TextField
                            type="time"
                            size="small"
                            value={row?.horaApertura || "09:00"}
                            onChange={(e) => setDia(cfg.diaSemana, { horaApertura: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            sx={{ maxWidth: 140, "& fieldset": { borderColor: PALETA.borde(0.3) } }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Cerrado
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {activo ? (
                          <TextField
                            type="time"
                            size="small"
                            value={row?.horaCierre || "18:00"}
                            onChange={(e) => setDia(cfg.diaSemana, { horaCierre: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            sx={{ maxWidth: 140, "& fieldset": { borderColor: PALETA.borde(0.3) } }}
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            type="button"
            variant="outlined"
            onClick={handleGuardarHorario}
            disabled={saving}
            sx={{
              borderColor: PALETA.principal,
              color: PALETA.principal,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { borderColor: PALETA.acento, bgcolor: PALETA.fondoIcono(0.06) }
            }}
          >
            {saving ? "Guardando horario..." : "Guardar horario"}
          </Button>
        </>
      )}
    </Box>
  );
}

export default HorarioSemanalPerfil;
