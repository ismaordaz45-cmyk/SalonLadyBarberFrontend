import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography
} from "@mui/material";
import {
  Menu as MenuIcon,
  NotificationsNoneRounded
} from "@mui/icons-material";

const COLORS = {
  topbarBg: "#FFFFFF",
  border: "#E5E7EB",
  textPrimary: "#1E293B",
  textSecondary: "#64748B"
};

const API_URL = process.env.REACT_APP_API_URL || "https://salonladybarberbackend.onrender.com";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatRolLabel(rol) {
  if (!rol) return "Administración";
  const s = String(rol).replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] || "A";
  const b = parts.length > 1 ? parts[1][0] : "";
  return (a + b).toUpperCase();
}

function Topbar({ onOpenSidebar }) {
  const storedUser = useMemo(() => readStoredUser(), []);

  const [perfil, setPerfil] = useState(() => ({
    nombreCompleto: storedUser?.nombre || storedUser?.correo || "Administración",
    rol: storedUser?.rol || "PROPIETARIA"
  }));

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
        if (!token) return;

        const { data } = await axios.get(`${API_URL}/api/admin/usuarios/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000
        });

        if (cancel) return;
        if (data?.nombreCompleto || data?.rol) {
          setPerfil({
            nombreCompleto: data?.nombreCompleto || perfil.nombreCompleto,
            rol: data?.rol || perfil.rol
          });
        }
      } catch {
        // fallback: se queda con storedUser
      }
    };
    load();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        height: 70,
        backgroundColor: COLORS.topbarBg,
        borderBottom: `1px solid ${COLORS.border}`,
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >
      <Toolbar
        sx={{
          minHeight: "70px !important",
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <IconButton
          onClick={onOpenSidebar}
          sx={{ display: { md: "none" }, color: COLORS.textPrimary }}
          aria-label="Abrir menú administrativo"
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.2 }}>
          <IconButton sx={{ color: COLORS.textSecondary }} aria-label="Notificaciones">
            <Badge variant="dot" color="error">
              <NotificationsNoneRounded />
            </Badge>
          </IconButton>

          <Box sx={{ textAlign: "right", lineHeight: 1.15 }}>
            <Typography
              sx={{
                color: COLORS.textPrimary,
                fontWeight: 600,
                fontSize: "0.95rem"
              }}
            >
              {perfil.nombreCompleto}
            </Typography>
            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontWeight: 500,
                fontSize: "0.8rem"
              }}
            >
              {formatRolLabel(perfil.rol)}
            </Typography>
          </Box>

          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#F1F5F9",
              color: COLORS.textPrimary,
              fontSize: "0.85rem",
              fontWeight: 700
            }}
          >
            {initialsFromName(perfil.nombreCompleto)}
          </Avatar>
        </Box>
      </Toolbar>
    </Box>
  );
}

export default Topbar;
