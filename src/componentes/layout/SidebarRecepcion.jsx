import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import {
  DashboardRounded,
  EventAvailableRounded,
  PeopleRounded,
  ShoppingCartOutlined,
  PersonRounded,
  AccessTimeRounded,
  LogoutRounded,
  AssessmentRounded
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const COLORS = {
  sidebarBg: "#F8FAFC",
  border: "#E2E8F0",
  navy: "#1E3A5F",
  gold: "#D4AF37",
  textPrimary: "#1E3A5F",
  textSecondary: "#64748B",
  active: "#1E3A5F",
  white: "#FFFFFF"
};

const menuItems = [
  { label: "Inicio", path: "/recepcion", icon: <DashboardRounded />, exact: true },
  { label: "Gestión de Citas", path: "/recepcion/citas", icon: <EventAvailableRounded /> },
  { label: "Horario Estilistas", path: "/recepcion/estilistas", icon: <AccessTimeRounded /> },
  { label: "Venta Productos", path: "/recepcion/ventas", icon: <ShoppingCartOutlined /> },
  { label: "Auditoría Caja Hoy", path: "/recepcion/auditoria", icon: <AssessmentRounded /> },
  { label: "Clientes", path: "/recepcion/clientes", icon: <PeopleRounded /> }
];

const API_URL = "https://salonladybarberbackend.onrender.com";

function SidebarRecepcion({ drawerWidth = 240, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();
  const [nombreEmpresa, setNombreEmpresa] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchNombre = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/perfil-empresa`, {
          barberOverlay: false
        });
        if (!cancelled && data?.nombre) {
          setNombreEmpresa(String(data.nombre).trim());
        }
      } catch {
        if (!cancelled) setNombreEmpresa("Lady Barber");
      }
    };
    fetchNombre();
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar la sesión de Recepción?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      background: COLORS.sidebarBg,
      color: COLORS.navy,
      iconColor: COLORS.navy,
      confirmButtonColor: COLORS.active,
      cancelButtonColor: COLORS.textSecondary
    });

    if (!result.isConfirmed) return;

    await runWithOverlay(
      async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        await new Promise((resolve) => setTimeout(resolve, 320));
      },
      "Has cerrado sesión de forma segura.",
      { headline: "Cerrando sesión", minMs: 800 }
    );

    if (onNavigate) onNavigate();
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: "100vh",
        maxHeight: "100vh",
        bgcolor: COLORS.sidebarBg,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0
      }}
    >
      <Box sx={{ px: 2.5, py: 3, flexShrink: 0 }}>
        <Typography
          sx={{
            fontWeight: 900,
            color: COLORS.navy,
            fontSize: "1.2rem",
            fontFamily: '"Cinzel", ui-serif, Georgia, serif',
            letterSpacing: "0.02em"
          }}
        >
          {nombreEmpresa || "Lady Barber"}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: COLORS.gold,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            mt: 0.5
          }}
        >
          Panel Recepción
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          px: 1.5,
          py: 2,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { width: 0 }
        }}
      >
        <List disablePadding>
          {menuItems.map((item) => {
            const active = isActive(item);
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                onClick={onNavigate}
                sx={{
                  borderRadius: "10px",
                  mb: 0.6,
                  py: 1.1,
                  px: 1.5,
                  color: active ? COLORS.white : COLORS.textSecondary,
                  backgroundColor: active ? COLORS.active : "transparent",
                  "&:hover": {
                    backgroundColor: active ? COLORS.active : "rgba(30, 58, 95, 0.04)"
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: active ? COLORS.white : COLORS.textSecondary
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.88rem",
                    fontWeight: active ? 800 : 600
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Typography
          sx={{
            mt: 3,
            mb: 0.8,
            px: 1.5,
            color: "#94A3B8",
            fontWeight: 800,
            fontSize: "0.68rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          Cuenta
        </Typography>

        <List disablePadding>
          <ListItemButton
            component={Link}
            to="/recepcion/perfil"
            onClick={onNavigate}
            sx={{
              borderRadius: "10px",
              mb: 0.6,
              py: 1.1,
              px: 1.5,
              color: location.pathname.startsWith("/recepcion/perfil") ? COLORS.white : COLORS.textSecondary,
              backgroundColor: location.pathname.startsWith("/recepcion/perfil") ? COLORS.active : "transparent",
              "&:hover": {
                backgroundColor: location.pathname.startsWith("/recepcion/perfil") ? COLORS.active : "rgba(30, 58, 95, 0.04)"
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: location.pathname.startsWith("/recepcion/perfil") ? COLORS.white : COLORS.textSecondary
              }}
            >
              <PersonRounded />
            </ListItemIcon>
            <ListItemText
              primary="Mi Perfil"
              primaryTypographyProps={{
                fontSize: "0.88rem",
                fontWeight: location.pathname.startsWith("/recepcion/perfil") ? 800 : 600
              }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              py: 1.1,
              px: 1.5,
              color: COLORS.textSecondary,
              "&:hover": {
                backgroundColor: "rgba(185, 28, 28, 0.06)",
                color: "#DC2626",
                "& .MuiListItemIcon-root": { color: "#DC2626" }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: COLORS.textSecondary }}>
              <LogoutRounded />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar sesión"
              primaryTypographyProps={{
                fontSize: "0.88rem",
                fontWeight: 600
              }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}

export default SidebarRecepcion;
