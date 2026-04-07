import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

function PaginaPrincipalAdministrativa() {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const COLORS = {
    bg: "#F1F5F9",
    surface: "#FFFFFF",
    surfaceAlt: "#F8FAFC",
    border: "#E2E8F0",
    textPrimary: "#1A252F",
    textSecondary: "#52606D",
    primary: "#2C3E50",
    accent: "#D4AF37"
  };

  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${API_URL}/api/dashboard/resumen`, { timeout: 8000 });
        setResumen(data || null);
      } catch (e) {
        setError(
          e?.response?.data?.error ||
            e?.message ||
            "No se pudo cargar el resumen del dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarResumen();
  }, [API_URL]);

  const stats = useMemo(() => [
    {
      label: "Citas de hoy",
      value: loading ? "..." : resumen?.citas?.hoy ?? 0,
      icon: <EventAvailableRoundedIcon />,
      color: COLORS.primary,
      helper: loading ? "Cargando..." : `${resumen?.citas?.pendientesHoy ?? 0} pendientes`
    },
    {
      label: "Clientes activos",
      value: loading ? "..." : resumen?.clientes?.activos ?? 0,
      icon: <PeopleAltRoundedIcon />,
      color: "#334155",
      helper: loading ? "Cargando..." : `${resumen?.clientes?.total ?? 0} clientes totales`
    },
    {
      label: "Servicios activos",
      value: loading ? "..." : resumen?.servicios?.activos ?? 0,
      icon: <StorefrontRoundedIcon />,
      color: COLORS.accent,
      helper: loading ? "Cargando..." : `${resumen?.servicios?.total ?? 0} en catálogo`
    }
  ], [COLORS.accent, COLORS.primary, loading, resumen]);

  const quickActions = [
    {
      label: "Gestionar citas",
      description: "Administra la agenda diaria y confirma turnos",
      onClick: () => navigate("/admin/citas")
    },
    {
      label: "Actualizar perfil",
      description: "Edita datos, logo e información de tu salón",
      onClick: () => navigate("/admin/perfil")
    },
    {
      label: "Gestionar servicios",
      description: "Actualiza precios, categorías y disponibilidad",
      onClick: () => navigate("/admin/servicios")
    }
  ];

  return (
    <Box
      sx={{
        bgcolor: COLORS.bg,
        py: 1
      }}
    >
      <Container maxWidth="lg" sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        {/* Encabezado de página */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap"
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(COLORS.primary, 0.1)
            }}
          >
            <DashboardCustomizeRoundedIcon sx={{ color: COLORS.primary, fontSize: 30 }} />
          </Box>

          <Box sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontFamily: "'Playfair Display', serif",
                color: COLORS.textPrimary,
                fontSize: { xs: "2rem", md: "2.3rem" }
              }}
            >
              Panel administrativo
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: COLORS.textSecondary, fontSize: { xs: "0.95rem", md: "1.05rem" } }}
            >
              Esta es la página principal del área administrativa de Lady Barber
              ID&apos;M.
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            label="Rol: PROPIETARIA"
            sx={{
              bgcolor: alpha(COLORS.primary, 0.08),
              color: COLORS.primary,
              fontWeight: 600,
              fontSize: "0.9rem"
            }}
          />
        </Box>

        {/* Resumen principal */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: 3.5,
                borderRadius: 3,
                border: `1px solid ${COLORS.border}`,
                background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceAlt} 100%)`
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 1.5, color: COLORS.textPrimary, fontSize: { xs: "1.15rem", md: "1.3rem" } }}
              >
                Bienvenida al panel
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 2.5, color: COLORS.textSecondary, fontSize: { xs: "0.95rem", md: "1.05rem" } }}
              >
                Visualiza el estado general del negocio con indicadores reales de la base de
                datos y enfoca tu operación diaria.
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: COLORS.textSecondary, fontSize: { xs: "0.9rem", md: "1rem" } }}
              >
                {loading
                  ? "Sincronizando datos del backend..."
                  : `Hoy tienes ${resumen?.citas?.pendientesHoy ?? 0} citas pendientes, ${resumen?.citas?.completadasHoy ?? 0} completadas y ${resumen?.clientes?.activos ?? 0} clientes activos.`}
              </Typography>

              <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/admin/citas")}
                  sx={{
                    bgcolor: COLORS.primary,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    px: 3,
                    py: 1.2,
                    "&:hover": { bgcolor: "#0F172A" }
                  }}
                >
                  Ir a gestión de citas
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/admin/perfil")}
                  sx={{
                    borderColor: COLORS.border,
                    color: COLORS.textPrimary,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    px: 3,
                    py: 1.2,
                    "&:hover": {
                      borderColor: COLORS.primary,
                      backgroundColor: alpha(COLORS.primary, 0.06)
                    }
                  }}
                >
                  Configurar datos de la empresa
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Tarjetas de resumen */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {stats.map((stat) => (
                <Grid item xs={12} key={stat.label}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.surface
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2
                      }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(stat.color, 0.12),
                          color: stat.color,
                          fontSize: 26
                        }}
                      >
                        {stat.icon}
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: COLORS.textSecondary, fontSize: "0.9rem" }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{ color: COLORS.textPrimary, fontSize: "1.3rem" }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                          {stat.helper}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {loading && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              gap: 1.25
            }}
          >
            <CircularProgress size={20} sx={{ color: COLORS.primary }} />
            <Typography sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
              Cargando indicadores del dashboard...
            </Typography>
          </Paper>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2, border: `1px solid ${alpha("#B91C1C", 0.2)}` }}
          >
            {error}
          </Alert>
        )}

        {/* Accesos rápidos */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2.5, color: COLORS.textPrimary, fontSize: { xs: "1.1rem", md: "1.25rem" } }}
          >
            Accesos rápidos
          </Typography>

          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid item xs={12} md={4} key={action.label}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${COLORS.border}`,
                    bgcolor: COLORS.surface,
                    transition: "all 180ms ease",
                    "&:hover": {
                      borderColor: alpha(COLORS.primary, 0.3),
                      boxShadow: "0 8px 24px rgba(26, 37, 47, 0.08)",
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ mb: 0.8, color: COLORS.textPrimary, fontSize: "1rem" }}
                  >
                    {action.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: COLORS.textSecondary, fontSize: "0.95rem" }}
                  >
                    {action.description}
                  </Typography>
                  <Button
                    variant="text"
                    onClick={action.onClick}
                    sx={{
                      mt: 1.5,
                      px: 0,
                      minWidth: "auto",
                      color: COLORS.primary,
                      fontWeight: 700,
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: COLORS.accent
                      }
                    }}
                  >
                    Ir al módulo
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default PaginaPrincipalAdministrativa;