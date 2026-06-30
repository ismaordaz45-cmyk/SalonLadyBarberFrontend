import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  CardContent,
  Skeleton,
  Alert
} from "@mui/material";
import {
  CalendarMonthRounded,
  EventAvailableRounded,
  PeopleAltRounded,
  StorefrontRounded,
  HistoryRounded
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import AdminPageShell from "../ui/admin/AdminPageShell";
import AdminHeader from "../ui/admin/AdminHeader";
import { GlassCard, IconWrapper } from "../ui/admin/components";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import ConectarAlexa from "../componentes/autenticacion/ConectarAlexa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function readStoredUser() {
  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function PaginaPrincipalAdministrativa() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = useMemo(() => readStoredUser(), []);
  const nombreMostrar =
    storedUser?.nombre ||
    storedUser?.correo ||
    "Administración";
  const rolLabel = storedUser?.rol
    ? String(storedUser.rol).replace(/_/g, " ")
    : "PROPIETARIA";

  useEffect(() => {
    let cancel = false;
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get(`${API_URL}/api/dashboard/resumen`, {
          timeout: 8000,
          headers
        });
        if (!cancel) setResumen(data || null);
      } catch (e) {
        if (!cancel) {
          setError(
            e?.response?.data?.error ||
              e?.message ||
              "No se pudo cargar el resumen del dashboard."
          );
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    cargar();
    return () => {
      cancel = true;
    };
  }, []);

  const citas = resumen?.citas || {};
  const clientes = resumen?.clientes || {};
  const servicios = resumen?.servicios || {};

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Panel administrativo"
        title={loading ? <Skeleton width={320} /> : `Hola, ${nombreMostrar}`}
        subtitle={`Rol: ${rolLabel}`}
        icon={<EventAvailableRounded sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        right={
          <Button variant="contained" color="primary" onClick={() => navigate("/admin/citas")}>
            Gestión de citas
          </Button>
        }
      />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <GlassCard elevation={0}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: P.secondary,
                        fontWeight: 700,
                        fontSize: "0.85rem"
                      }}
                    >
                      Citas hoy
                    </Typography>
                    <Typography
                      sx={{
                        color: P.primary,
                        fontWeight: 900,
                        fontSize: "2rem",
                        mt: 0.5
                      }}
                    >
                      {loading ? <Skeleton width={56} /> : citas.hoy ?? 0}
                    </Typography>
                    <Typography sx={{ color: P.secondary, fontSize: "0.8rem", mt: 0.5 }}>
                      {loading ? (
                        <Skeleton width={200} />
                      ) : (
                        <>
                          {citas.pendientesHoy ?? 0} pendientes · {citas.completadasHoy ?? 0}{" "}
                          completadas
                        </>
                      )}
                    </Typography>
                  </Box>
                  <IconWrapper bgcolor={P.navy}>
                    <EventAvailableRounded sx={{ color: P.navy }} />
                  </IconWrapper>
                </Box>
                <Button
                  onClick={() => navigate("/admin/citas")}
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Gestión de citas
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard elevation={0}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: P.secondary,
                        fontWeight: 700,
                        fontSize: "0.85rem"
                      }}
                    >
                      Clientes activos
                    </Typography>
                    <Typography
                      sx={{
                        color: P.primary,
                        fontWeight: 900,
                        fontSize: "2rem",
                        mt: 0.5
                      }}
                    >
                      {loading ? <Skeleton width={56} /> : clientes.activos ?? 0}
                    </Typography>
                    <Typography sx={{ color: P.secondary, fontSize: "0.8rem", mt: 0.5 }}>
                      {loading ? (
                        <Skeleton width={160} />
                      ) : (
                        <>{clientes.total ?? 0} registros en total</>
                      )}
                    </Typography>
                  </Box>
                  <IconWrapper bgcolor={P.accent}>
                    <PeopleAltRounded sx={{ color: P.accent }} />
                  </IconWrapper>
                </Box>
                <Button
                  onClick={() => navigate("/admin/clientes")}
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderColor: P.navy,
                    color: P.navy,
                    "&:hover": { borderColor: P.navy, bgcolor: alpha(P.navy, 0.06) }
                  }}
                >
                  Ver usuarios
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard elevation={0}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: P.secondary,
                        fontWeight: 700,
                        fontSize: "0.85rem"
                      }}
                    >
                      Servicios activos
                    </Typography>
                    <Typography
                      sx={{
                        color: P.primary,
                        fontWeight: 900,
                        fontSize: "2rem",
                        mt: 0.5
                      }}
                    >
                      {loading ? <Skeleton width={56} /> : servicios.activos ?? 0}
                    </Typography>
                    <Typography sx={{ color: P.secondary, fontSize: "0.8rem", mt: 0.5 }}>
                      {loading ? (
                        <Skeleton width={140} />
                      ) : (
                        <>{servicios.total ?? 0} en catálogo</>
                      )}
                    </Typography>
                  </Box>
                  <IconWrapper bgcolor={P.green}>
                    <StorefrontRounded sx={{ color: P.green }} />
                  </IconWrapper>
                </Box>
                <Button
                  onClick={() => navigate("/admin/servicios")}
                  variant="text"
                  fullWidth
                  startIcon={<CalendarMonthRounded />}
                  sx={{
                    mt: 2,
                    fontWeight: 800,
                    color: P.primary,
                    "&:hover": { bgcolor: alpha(P.primary, 0.06) }
                  }}
                >
                  Ir al catálogo
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        {!loading && resumen && (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <GlassCard elevation={0}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CalendarMonthRounded sx={{ color: P.navy, fontSize: 36 }} />
                  <Box>
                    <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                      Citas en agenda (hoy o futuras, activas)
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.5rem" }}>
                      {citas.agendaActivas ?? 0}
                    </Typography>
                  </Box>
                </CardContent>
              </GlassCard>
            </Grid>
            <Grid item xs={12} sm={6}>
              <GlassCard elevation={0}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <HistoryRounded sx={{ color: P.secondary, fontSize: 36 }} />
                  <Box>
                    <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                      Citas cerradas (completadas, canceladas, no asistió)
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.5rem" }}>
                      {citas.historialCerradas ?? 0}
                    </Typography>
                  </Box>
                </CardContent>
              </GlassCard>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <ConectarAlexa />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
    </AdminPageShell>
  );
}

export default PaginaPrincipalAdministrativa;
