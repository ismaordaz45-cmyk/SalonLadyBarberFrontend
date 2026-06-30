import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  CardContent,
  Typography,
  Button,
  Box,
  Skeleton
} from "@mui/material";
import {
  CalendarMonthRounded,
  FormatListBulletedRounded,
  PersonRounded,
  AccessTimeRounded,
  CheckCircleRounded
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import AdminPageShell from "../ui/admin/AdminPageShell";
import AdminHeader from "../ui/admin/AdminHeader";
import { GlassCard, IconWrapper } from "../ui/admin/components";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import VistaPreviaServiciosCliente from "../componentes/cliente/VistaPreviaServiciosCliente";
import VistaPreviaProductosInventarioCliente from "../componentes/cliente/VistaPreviaProductosInventarioCliente";
import ConectarAlexa from "../componentes/autenticacion/ConectarAlexa";

const API_URL = "http://localhost:4000";

// --------------------------------------------------
// Página principal cliente
// --------------------------------------------------
function PaginaPrincipalCliente() {
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const token = useMemo(() => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      ""
    );
  }, []);

  const storedUserName = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "Cliente";
      const u = JSON.parse(raw);
      return u?.nombre || u?.correo || "Cliente";
    } catch {
      return "Cliente";
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        setCargando(true);
        setError("");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/api/cliente/resumen`, {
          headers
        });
        if (!cancel) setData(res.data);
      } catch (e) {
        const msg =
          e?.response?.data?.error ||
          e?.message ||
          "No se pudo cargar el resumen del cliente.";
        if (!cancel) setError(msg);
      } finally {
        if (!cancel) setCargando(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [token]);

  const nombreMostrar =
    data?.user?.nombreCompleto ||
    data?.user?.nombre ||
    storedUserName ||
    "Cliente";

  const stats = data?.stats || { total: 0, pendientes: 0, completadas: 0 };

  const nextCitaLabel = useMemo(() => {
    if (!data?.nextCita) return "Sin citas próximas";
    const c = data.nextCita;
    const fecha = c.fecha ? String(c.fecha).slice(0, 10) : "—";
    const hora = c.horaInicio ? String(c.horaInicio).slice(0, 5) : "—";
    return `${fecha} · ${hora}`;
  }, [data?.nextCita]);

  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Área cliente"
        title={cargando ? <Skeleton width={300} /> : `Bienvenid@, ${nombreMostrar}`}
        subtitle="Administra tus citas, revisa tu perfil y reserva tu próxima visita de forma rápida."
        icon={<PersonRounded sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        showBarberiaChip={true}
        right={
          <Button variant="contained" color="primary" onClick={() => navigate("/cliente/servicios")}>
            Reservar cita
          </Button>
        }
      />

        {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <GlassCard elevation={0}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                      Próxima cita
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "1.15rem", mt: 0.5 }}>
                      {cargando ? <Skeleton width={180} /> : nextCitaLabel}
                    </Typography>
                  </Box>
                  <IconWrapper bgcolor={P.navy}>
                    <AccessTimeRounded sx={{ color: P.navy }} />
                  </IconWrapper>
                </Box>
                <Button
                  onClick={() => navigate("/cliente/citas")}
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    borderColor: P.navy,
                    color: P.navy,
                    "&:hover": { borderColor: P.navy, bgcolor: alpha(P.navy, 0.06) }
                  }}
                >
                  Ver mis citas
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard elevation={0}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                      Citas pendientes
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "2rem", mt: 0.5 }}>
                      {cargando ? <Skeleton width={60} /> : stats.pendientes}
                    </Typography>
                  </Box>
                  <IconWrapper bgcolor={P.accent}>
                    <FormatListBulletedRounded sx={{ color: P.accent }} />
                  </IconWrapper>
                </Box>
                <Button
                  onClick={() => navigate("/cliente/servicios")}
                  variant="contained"
                  fullWidth
                  startIcon={<CalendarMonthRounded />}
                  sx={{
                    mt: 2,
                    fontWeight: 800,
                    bgcolor: P.navy,
                    "&:hover": { bgcolor: "#122947" }
                  }}
                >
                  Reservar cita
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <GlassCard elevation={0}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography sx={{ color: P.secondary, fontWeight: 700, fontSize: "0.85rem" }}>
                      Completadas
                    </Typography>
                    <Typography sx={{ color: P.primary, fontWeight: 900, fontSize: "2rem", mt: 0.5 }}>
                      {cargando ? <Skeleton width={60} /> : stats.completadas}
                    </Typography>
                  </Box>
                  <IconWrapper bgcolor={P.green}>
                    <CheckCircleRounded sx={{ color: P.green }} />
                  </IconWrapper>
                </Box>
                <Button
                  onClick={() => navigate("/cliente/perfil")}
                  variant="text"
                  fullWidth
                  startIcon={<PersonRounded />}
                  sx={{
                    mt: 2,
                    fontWeight: 800,
                    color: P.primary,
                    "&:hover": { bgcolor: alpha(P.primary, 0.06) }
                  }}
                >
                  Ir a mi perfil
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        {error && (
          <GlassCard elevation={0} sx={{ mt: 2 }}>
            <CardContent>
            <Typography sx={{ color: "#B91C1C", fontWeight: 800 }}>
              No se pudo cargar información real.
            </Typography>
            <Typography sx={{ color: P.secondary, mt: 0.5 }}>
              {error}
            </Typography>
            </CardContent>
          </GlassCard>
        )}

        <VistaPreviaServiciosCliente maxItems={3} />
        <VistaPreviaProductosInventarioCliente maxItems={3} />

        <Box sx={{ mt: 4 }}>
          <ConectarAlexa />
        </Box>
    </AdminPageShell>
  );
}

export default PaginaPrincipalCliente;