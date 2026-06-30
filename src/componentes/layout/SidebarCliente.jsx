import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import FormatListBulletedRounded from "@mui/icons-material/FormatListBulletedRounded";
import HomeRounded from "@mui/icons-material/HomeRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import Swal from "sweetalert2";
import { logoBase64ToDataUrl } from "../../utils/logoDataUrl";
import BarberPole from "../compartidos/BarberPole";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

/** Misma API que Perfil / Encabezado público (logo y nombre empresa). */
const API_BASE_URL = "https://salonladybarberbackend.onrender.com";

/**
 * Tokens del sidebar oscuro (alineado a Figma: slate profundo).
 */
const THEME = {
  sidebarBg: "#1E3A5F",
  borderSubtle: "rgba(148, 163, 184, 0.2)",
  text: "#F8FAFC",
  brandGold: "#D4AF38",
  textMuted: "#94A3B8",
  itemHover: "rgba(255, 255, 255, 0.06)",
  itemActiveBg: "rgba(255, 255, 255, 0.14)",
  logout: "#EF4444",
  logoutHover: "rgba(239, 68, 68, 0.12)",
  swalBg: "#1E293B",
  swalText: "#F8FAFC"
};

const MENU_NAV = [
  {
    label: "Inicio",
    path: "/cliente",
    icon: <HomeRounded />
  },
  {
    label: "Servicios",
    path: "/cliente/servicios",
    icon: <StorefrontRounded />
  },
  {
    label: "Mis citas",
    path: "/cliente/citas",
    icon: <FormatListBulletedRounded />
  },
  {
    label: "Perfil",
    path: "/cliente/perfil",
    icon: <PersonRounded />
  }
];

function SidebarCliente({ drawerWidth = 280, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();
  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber Itza D'M");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/perfil-empresa`, {
          barberOverlay: false
        });
        if (data?.nombre) setNombreEmpresa(data.nombre);
        if (data?.logo) setLogoUrl(logoBase64ToDataUrl(data.logo));
      } catch {
        /* fallback: texto por defecto arriba */
      }
    };
    fetchPerfil();
  }, []);

  const isActive = (path) =>
    path === "/cliente"
      ? location.pathname === "/cliente"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderNavItem = (item) => {
    const active = isActive(item.path);
    return (
      <ListItemButton
        key={item.path}
        component={Link}
        to={item.path}
        onClick={onNavigate}
        sx={{
          borderRadius: "10px",
          mb: 0.5,
          py: 1.1,
          px: 1.25,
          color: active ? THEME.text : THEME.textMuted,
          backgroundColor: active ? THEME.itemActiveBg : "transparent",
          "&:hover": {
            backgroundColor: active ? THEME.itemActiveBg : THEME.itemHover
          }
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: active ? THEME.text : THEME.textMuted
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
      background: THEME.swalBg,
      color: THEME.swalText,
      iconColor: THEME.swalText,
      confirmButtonColor: "#334155",
      cancelButtonColor: THEME.textMuted
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
      "Has salido de forma segura. Te esperamos pronto.",
      { headline: "Sesión cerrada", minMs: 900 }
    );

    if (onNavigate) onNavigate();
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        bgcolor: THEME.sidebarBg,
        borderRight: `1px solid ${THEME.borderSubtle}`,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        minHeight: 0
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0
        }}
      >
      {/* Marca + logo: clic lleva al inicio del área cliente (migas siguen reflejando la ruta). */}
      <Box
        component={Link}
        to="/cliente"
        onClick={onNavigate}
        sx={{
          px: 2,
          py: 2.25,
          textDecoration: "none",
          color: "inherit",
          display: "block",
          "&:hover": { opacity: 0.92 }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {logoUrl ? (
            <Box
              component="img"
              src={logoUrl}
              alt={nombreEmpresa}
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                objectFit: "contain",
                objectPosition: "center",
                bgcolor: "rgba(255,255,255,0.06)",
                p: 0.12,
                boxSizing: "border-box",
                border: `1px solid ${THEME.borderSubtle}`,
                flexShrink: 0
              }}
            />
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.08)",
                color: THEME.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.85rem",
                border: `1px solid ${THEME.borderSubtle}`,
                flexShrink: 0
              }}
            >
              LB
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                fontWeight: 700,
                color: THEME.brandGold,
                fontSize: "0.95rem",
                lineHeight: 1.25,
                wordBreak: "break-word"
              }}
            >
              {nombreEmpresa}
            </Box>
            <Box
              sx={{
                mt: 0.35,
                color: THEME.textMuted,
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase"
              }}
            >
              Barbería · salón
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: THEME.borderSubtle }} />

      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          WebkitOverflowScrolling: "touch",
          // Scrollbar invisible (look pro, pero mantiene scroll)
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge legacy
          "&::-webkit-scrollbar": { width: 0, height: 0 } // Chrome/Safari
        }}
      >
        <List disablePadding>{MENU_NAV.map(renderNavItem)}</List>

        <List disablePadding sx={{ mt: 1.5 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              py: 1.1,
              px: 1.25,
              color: THEME.logout,
              "&:hover": {
                backgroundColor: THEME.logoutHover
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: THEME.logout }}>
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
      <BarberPole fullHeight width={11} sx={{ flexShrink: 0, opacity: 0.95 }} />
    </Box>
  );
}

export default SidebarCliente;
