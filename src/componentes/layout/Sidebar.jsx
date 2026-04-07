import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  CategoryRounded,
  BusinessRounded,
  Inventory2Rounded,
  PaymentsRounded,
  AssessmentRounded,
  BarChartRounded,
  GroupRounded,
  StorageRounded,
  PrecisionManufacturingRounded,
  SettingsRounded,
  LogoutRounded
} from "@mui/icons-material";
import Swal from "sweetalert2";

const COLORS = {
  sidebarBg: "#F8FAFC",
  border: "#E5E7EB",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  hover: "#E2E8F0",
  active: "#1E293B",
  white: "#FFFFFF"
};

const menuPrincipal = [
  { label: "Dashboard", path: "/admin", icon: <DashboardRounded /> },
  { label: "Catálogo", path: "/admin/servicios", icon: <CategoryRounded /> },
  { label: "Perfil de la empresa", path: "/admin/perfil", icon: <BusinessRounded /> },
  { label: "Inventario", path: "/admin/inventario", icon: <Inventory2Rounded /> },
  { label: "Pagos", path: "/admin/pagos", icon: <PaymentsRounded /> },
  { label: "Reportes", path: "/admin/reportes", icon: <AssessmentRounded /> },
  { label: "Estadísticas", path: "/admin/estadisticas", icon: <BarChartRounded /> },
  { label: "Usuarios", path: "/admin/clientes", icon: <GroupRounded /> },
  { label: "Base de datos", path: "/admin/base-datos", icon: <StorageRounded /> }
];

const menuSecundario = [
  { label: "Operación técnica", path: "/admin/base-datos", icon: <PrecisionManufacturingRounded /> },
  { label: "Configuración", path: "/admin/configuracion", icon: <SettingsRounded /> }
];

function Sidebar({ drawerWidth = 240, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const renderItem = (item) => {
    const active = isActive(item.path);
    return (
      <ListItemButton
        key={`${item.label}-${item.path}`}
        component={Link}
        to={item.path}
        onClick={onNavigate}
        sx={{
          borderRadius: "10px",
          mb: 0.6,
          py: 1,
          px: 1.2,
          color: active ? COLORS.white : COLORS.textSecondary,
          backgroundColor: active ? COLORS.active : "transparent",
          "&:hover": {
            backgroundColor: active ? COLORS.active : COLORS.hover
          }
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 34,
            color: active ? COLORS.white : COLORS.textSecondary
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: "0.95rem",
            fontWeight: active ? 600 : 500
          }}
        />
      </ListItemButton>
    );
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar la sesión actual?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      background: COLORS.sidebarBg,
      color: COLORS.textPrimary,
      iconColor: COLORS.textPrimary,
      confirmButtonColor: COLORS.active,
      cancelButtonColor: COLORS.textSecondary
    });

    if (!result.isConfirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    await Swal.fire({
      title: "Sesión cerrada",
      text: "Has salido correctamente.",
      icon: "success",
      timer: 1400,
      showConfirmButton: false,
      background: COLORS.sidebarBg,
      color: COLORS.textPrimary,
      iconColor: COLORS.textPrimary
    });

    if (onNavigate) onNavigate();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: "100vh",
        bgcolor: COLORS.sidebarBg,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Box sx={{ px: 2, py: 2.25 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: COLORS.textPrimary,
            fontSize: "1.12rem",
            lineHeight: 1.2
          }}
        >
          Lady Barber Itza
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            color: COLORS.textPrimary,
            fontSize: "1.12rem",
            lineHeight: 1.2
          }}
        >
          D&apos;M
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ px: 1.5, py: 1.5, overflowY: "auto" }}>
        <List disablePadding>{menuPrincipal.map(renderItem)}</List>

        <Typography
          sx={{
            mt: 1.8,
            mb: 0.8,
            px: 1,
            color: "#94A3B8",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          Sistema
        </Typography>

        <List disablePadding>{menuSecundario.map(renderItem)}</List>

        <List disablePadding sx={{ mt: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              py: 1,
              px: 1.2,
              color: COLORS.textSecondary,
              "&:hover": {
                backgroundColor: COLORS.hover
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: COLORS.textSecondary }}>
              <LogoutRounded />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar sesión"
              primaryTypographyProps={{
                fontSize: "0.95rem",
                fontWeight: 600
              }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}

export default Sidebar;
