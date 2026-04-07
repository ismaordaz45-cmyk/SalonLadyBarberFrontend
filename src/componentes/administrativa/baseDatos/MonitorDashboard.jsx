import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(k)), sizes.length - 1);
  const value = n / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function formatUptime(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "—";
  const total = Math.floor(s);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (x) => String(x).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function MonitorDashboard({ apiUrl }) {
  const API_URL = apiUrl || process.env.REACT_APP_API_URL || "http://localhost:4000";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(false);
  const intervalRef = useRef(null);

  const cargar = async ({ mostrarLoader = false } = {}) => {
    try {
      if (mostrarLoader) setLoading(true);
      else setActualizando(true);
      setError("");

      const res = await axios.get(`${API_URL}/api/monitor`, { timeout: 8000 });
      setData(res.data || null);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cargar la información de monitoreo.";
      setError(msg);
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargar({ mostrarLoader: true });

    intervalRef.current = setInterval(() => {
      cargar({ mostrarLoader: false });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const dbStatus = data?.dbStatus || {};
  const server = data?.server || {};
  const queries = Array.isArray(data?.queries) ? data.queries : [];
  const usuarios = Array.isArray(data?.usuarios) ? data.usuarios : [];
  const tablas = Array.isArray(data?.tablas) ? data.tablas : [];

  const estadoDb = String(dbStatus?.estado || "").toLowerCase();
  const dbConectada = estadoDb === "conectado";

  const queriesRecientes = useMemo(() => {
    const arr = [...queries];
    arr.sort((a, b) => new Date(b?.fecha).getTime() - new Date(a?.fecha).getTime());
    return arr.slice(0, 50);
  }, [queries]);

  const chartSeries = useMemo(() => {
    // Orden ascendente para que la línea vaya izquierda->derecha en el tiempo
    const asc = [...queriesRecientes].sort(
      (a, b) => new Date(a?.fecha).getTime() - new Date(b?.fecha).getTime()
    );

    const labels = asc.map((q) => {
      const d = new Date(q?.fecha);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    });

    const valores = asc.map((q) => {
      const n = Number(q?.tiempo ?? q?.ms ?? q?.timeMs);
      return Number.isFinite(n) ? n : null;
    });

    const data = {
      labels,
      datasets: [
        {
          label: "Tiempo (ms)",
          data: valores,
          borderColor: "#D4AF37",
          backgroundColor: alpha("#D4AF37", 0.18),
          tension: 0.28,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
          spanGaps: true
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed?.y ?? "—"} ms`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: alpha("#1A252F", 0.7),
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          }
        },
        y: {
          grid: { color: alpha("#2C3E50", 0.08) },
          ticks: { color: alpha("#1A252F", 0.7) }
        }
      }
    };

    const lastFecha = asc.length ? String(asc[asc.length - 1]?.fecha || "") : "";
    const key = `${asc.length}-${lastFecha}`;

    return { data, options, key, count: asc.length };
  }, [queriesRecientes]);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Typography variant="h6" fontWeight={900} sx={{ color: "#1A252F" }}>
          Monitoreo
        </Typography>

        <Chip
          size="small"
          label={actualizando ? "Actualizando…" : "En vivo (5s)"}
          sx={{
            bgcolor: alpha("#2C3E50", 0.08),
            color: alpha("#1A252F", 0.85),
            fontWeight: 800
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha("#2C3E50", 0.12)}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5
          }}
        >
          <CircularProgress size={20} />
          <Typography sx={{ color: alpha("#1A252F", 0.8), fontWeight: 700 }}>
            Cargando monitoreo…
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.25}>
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha("#2C3E50", 0.12)}`
              }}
            >
              <CardContent>
                <Typography fontWeight={900} sx={{ mb: 1.25, color: "#1A252F" }}>
                  Estado de la base de datos
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
                  <Chip
                    label={dbConectada ? "Conectado" : "Desconectado"}
                    sx={{
                      fontWeight: 900,
                      bgcolor: dbConectada ? alpha("#22C55E", 0.12) : alpha("#c62828", 0.08),
                      color: dbConectada ? "#15803D" : "#c62828",
                      border: `1px solid ${
                        dbConectada ? alpha("#22C55E", 0.35) : alpha("#c62828", 0.35)
                      }`
                    }}
                  />
                  <Typography sx={{ color: alpha("#1A252F", 0.8) }}>
                    {dbStatus?.tiempoRespuesta || "—"}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: alpha("#1A252F", 0.7) }}>
                  Endpoint: <b>{API_URL}/api/monitor</b>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha("#2C3E50", 0.12)}`
              }}
            >
              <CardContent>
                <Typography fontWeight={900} sx={{ mb: 1.25, color: "#1A252F" }}>
                  Información del servidor
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: alpha("#1A252F", 0.7) }}>
                      Uptime
                    </Typography>
                    <Typography fontWeight={900} sx={{ color: "#1A252F" }}>
                      {formatUptime(server?.uptime)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: alpha("#1A252F", 0.7) }}>
                      Memoria libre
                    </Typography>
                    <Typography fontWeight={900} sx={{ color: "#1A252F" }}>
                      {formatBytes(server?.memoriaLibre)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" sx={{ color: alpha("#1A252F", 0.7) }}>
                      Memoria total
                    </Typography>
                    <Typography fontWeight={900} sx={{ color: "#1A252F" }}>
                      {formatBytes(server?.memoriaTotal)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha("#2C3E50", 0.12)}`
              }}
            >
              <CardContent>
                <Typography fontWeight={900} sx={{ mb: 1.25, color: "#1A252F" }}>
                  Usuarios activos
                </Typography>

                {usuarios.length === 0 ? (
                  <Typography sx={{ color: alpha("#1A252F", 0.75) }}>
                    Sin usuarios activos.
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 280, overflow: "auto", borderRadius: 2 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 900 }}>id</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>rol</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>activo</TableCell>
                          <TableCell sx={{ fontWeight: 900 }}>última conexión</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usuarios.slice(0, 50).map((u, idx) => {
                          const id = u?.id ?? u?.usuarioId ?? idx;
                          const rol = u?.rol ?? u?.role ?? "—";
                          const activo =
                            typeof u?.activo === "boolean"
                              ? u.activo
                              : typeof u?.active === "boolean"
                                ? u.active
                                : null;
                          const ultima = u?.ultimaConexion ?? u?.ultima_conexion ?? u?.lastConnection ?? u?.last_login;
                          return (
                            <TableRow key={String(id)} hover>
                              <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                                {id ?? "—"}
                              </TableCell>
                              <TableCell>{rol}</TableCell>
                              <TableCell>
                                {activo === null ? (
                                  "—"
                                ) : (
                                  <Chip
                                    size="small"
                                    label={activo ? "Sí" : "No"}
                                    sx={{
                                      fontWeight: 900,
                                      bgcolor: activo ? alpha("#22C55E", 0.12) : alpha("#c62828", 0.08),
                                      color: activo ? "#15803D" : "#c62828",
                                      border: `1px solid ${
                                        activo ? alpha("#22C55E", 0.35) : alpha("#c62828", 0.35)
                                      }`
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>{formatDate(ultima)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha("#2C3E50", 0.12)}`
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25 }}>
                  <Typography fontWeight={900} sx={{ color: "#1A252F" }}>
                    Tablas y registros
                  </Typography>
                  <Chip
                    size="small"
                    label={`${tablas.length} tablas`}
                    sx={{
                      bgcolor: alpha("#D4AF37", 0.12),
                      color: "#1A252F",
                      fontWeight: 900
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {tablas.length === 0 ? (
                  <Typography sx={{ color: alpha("#1A252F", 0.75) }}>
                    No hay información de tablas disponible.
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 360, overflow: "auto", borderRadius: 2 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 900 }}>Tabla</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 900, whiteSpace: "nowrap" }}>
                            Registros
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tablas.map((t, idx) => {
                          const nombre = t?.tabla ?? t?.nombre ?? "";
                          const registros = t?.registros ?? t?.count ?? 0;
                          return (
                            <TableRow key={`${idx}-${String(nombre)}`} hover>
                              <TableCell
                                sx={{
                                  maxWidth: 520,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                  color: alpha("#1A252F", 0.85)
                                }}
                                title={nombre}
                              >
                                {nombre || "—"}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 900 }}>
                                {Number.isFinite(Number(registros)) ? Number(registros) : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha("#2C3E50", 0.12)}`
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25 }}>
                  <Typography fontWeight={900} sx={{ color: "#1A252F" }}>
                    Métricas de queries (gráfica)
                  </Typography>
                  <Chip
                    size="small"
                    label={`${queries.length} total`}
                    sx={{
                      bgcolor: alpha("#D4AF37", 0.12),
                      color: "#1A252F",
                      fontWeight: 900
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: `1px solid ${alpha("#2C3E50", 0.12)}`,
                    bgcolor: alpha("#2C3E50", 0.02)
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
                    <Typography sx={{ fontWeight: 900, color: "#2C3E50" }}>
                      Gráfica (últimas {Math.min(50, queries.length)})
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Typography
                      variant="caption"
                      sx={{ color: alpha("#1A252F", 0.7), fontWeight: 800 }}
                    >
                      Refresco: 5s
                    </Typography>
                  </Box>

                  {chartSeries.count === 0 ? (
                    <Typography sx={{ color: alpha("#1A252F", 0.75) }}>
                      No hay datos para graficar todavía.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 200 }}>
                      <Line
                        key={chartSeries.key}
                        data={chartSeries.data}
                        options={chartSeries.options}
                      />
                    </Box>
                  )}
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default MonitorDashboard;

