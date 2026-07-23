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
  CategoryRounded,
  BusinessRounded,
  Inventory2Rounded,
  AssessmentRounded,
  AutoGraphRounded,
  GroupRounded,
  EventAvailableRounded,
  BackupRounded,
  UploadFileRounded,
  MonitorHeartRounded,
  SettingsRounded,
  LogoutRounded
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const COLORS = {
  sidebarBg: "#F8FAFC",
  border: "#1E3A5F",
  textPrimary: "#1E3A5F",
  textSecondary: "#64748B",
  hover: "#1E3A5F",
  active: "#1E3A5F",
  white: "#FFFFFF"
};

const menuPrincipal = [
  { label: "Dashboard", path: "/admin", icon: <DashboardRounded /> },
  { label: "Catálogo", path: "/admin/servicios", icon: <CategoryRounded /> },
  { label: "Perfil de la empresa", path: "/admin/perfil", icon: <BusinessRounded /> },
  { label: "Inventario", path: "/admin/inventario", icon: <Inventory2Rounded /> },
  { label: "Auditoría de Caja Hoy", path: "/admin/auditoria", icon: <AssessmentRounded /> },
  {
    label: "Predicción de citas",
    path: "/admin/proyeccion-citas",
    icon: <AutoGraphRounded />
  },
  {
    label: "Segmentación de clientes",
    path: "/admin/segmentacion-clientes",
    icon: <GroupRounded />
  },
  { label: "Usuarios", path: "/admin/clientes", icon: <GroupRounded /> },

  {
    label: "Gestión de citas",
    path: "/admin/citas",
    icon: <EventAvailableRounded />
  },
  { label: "Respaldo automático", path: "/admin/base-datos/respaldo", icon: <BackupRounded /> },
  { label: "Importación / Exportación", path: "/admin/base-datos/import-export", icon: <UploadFileRounded /> },
  { label: "Monitoreo", path: "/admin/base-datos/monitoreo", icon: <MonitorHeartRounded /> }
];

const menuSecundario = [
  { label: "Configuración", path: "/admin/configuracion", icon: <SettingsRounded /> }
];

const API_URL = "https://salonladybarberbackend.onrender.com";

function Sidebar({ drawerWidth = 240, onNavigate }) {
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
        if (!cancelled) setNombreEmpresa("");
      }
    };
    fetchNombre();
    return () => {
      cancelled = true;
    };
  }, []);

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

    await runWithOverlay(
      async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        await new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        });
        await new Promise((resolve) => setTimeout(resolve, 320));
      },
      "Has salido del panel administrativo.",
      { headline: "Sesión cerrada", minMs: 900 }
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
      <Box sx={{ px: 2, py: 2.25, flexShrink: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: COLORS.textPrimary,
            fontSize: "1.12rem",
            lineHeight: 1.35,
            wordBreak: "break-word"
          }}
        >
          {nombreEmpresa || "\u00a0"}
        </Typography>
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          // Scrollbar invisible (look pro, pero mantiene scroll)
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge legacy
          "&::-webkit-scrollbar": { width: 0, height: 0 } // Chrome/Safari
        }}
      >
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
