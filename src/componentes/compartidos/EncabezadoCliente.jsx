import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import {
  Menu as MenuIcon,
  EventNoteRounded,
  HomeRounded,
  StorefrontRounded,
  PersonRounded,
  LogoutRounded
} from "@mui/icons-material";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const COLORS = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#1E293B",
  secondary: "#64748B",
  border: "#E2E8F0",
  accent: "#D4AF37"
};

function EncabezadoCliente() {
  const location = useLocation();
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorUser, setAnchorUser] = useState(null);

  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const displayName = storedUser?.nombre || storedUser?.correo || "Cliente";

  const navItems = [
    { key: "inicio", label: "Inicio", to: "/cliente", icon: <HomeRounded /> },
    { key: "servicios", label: "Servicios", to: "/cliente", icon: <StorefrontRounded /> },
    { key: "mis-citas", label: "Mis citas", to: "/cliente", icon: <EventNoteRounded /> },
    { key: "perfil", label: "Mi perfil", to: "/cliente", icon: <PersonRounded /> }
  ];

  const isActive = (itemPath) => location.pathname === itemPath;

  const handleLogout = async () => {
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
      "Has salido de forma segura. Gracias por tu visita.",
      { headline: "Sesión cerrada", minMs: 880 }
    );
    navigate("/", { replace: true });
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          boxShadow: "none",
          color: COLORS.primary
        }}
      >
        <Toolbar
          sx={{
            minHeight: 72,
            px: { xs: 2, md: 4 },
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700
              }}
            >
              LB
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                Lady Barber ID&apos;M
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: COLORS.secondary }}>
                Espacio Cliente
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
            {navItems.map((item) => (
              <Button
                key={item.key}
                component={Link}
                to={item.to}
                startIcon={item.icon}
                sx={{
                  textTransform: "none",
                  fontWeight: isActive(item.to) ? 700 : 600,
                  borderRadius: 2,
                  px: 1.6,
                  color: isActive(item.to) ? COLORS.primary : COLORS.secondary,
                  backgroundColor: isActive(item.to) ? `${COLORS.accent}33` : "transparent",
                  "&:hover": {
                    backgroundColor: `${COLORS.accent}22`,
                    color: COLORS.primary
                  }
                }}
              >
                {item.label}
              </Button>
            ))}

            <Button
              variant="contained"
              onClick={() => navigate("/cliente")}
              sx={{
                ml: 1,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: COLORS.primary,
                "&:hover": { backgroundColor: "#0F172A" }
              }}
            >
              Reservar cita
            </Button>

            <IconButton onClick={(e) => setAnchorUser(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: COLORS.accent,
                  color: COLORS.primary,
                  fontWeight: 700
                }}
              >
                {String(displayName).trim()[0]?.toUpperCase() || "C"}
              </Avatar>
            </IconButton>
          </Box>

          <IconButton
            sx={{ display: { xs: "inline-flex", md: "none" }, color: COLORS.primary }}
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu cliente"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorUser}
        open={Boolean(anchorUser)}
        onClose={() => setAnchorUser(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled>{displayName}</MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorUser(null);
            navigate("/cliente");
          }}
        >
          Mi perfil
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorUser(null);
            handleLogout();
          }}
        >
          <LogoutRounded sx={{ fontSize: 20, mr: 1, color: "#DC2626" }} />
          Cerrar sesion
        </MenuItem>
      </Menu>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 285,
            backgroundColor: COLORS.surface,
            borderLeft: `1px solid ${COLORS.border}`
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 0.5 }}>
            Panel del cliente
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.secondary, mb: 2 }}>
            {displayName}
          </Typography>

          <List disablePadding>
            {navItems.map((item) => (
              <ListItemButton
                key={item.key}
                component={Link}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: isActive(item.to) ? COLORS.primary : COLORS.secondary,
                  backgroundColor: isActive(item.to) ? `${COLORS.accent}33` : "transparent"
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}

            <ListItemButton
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              sx={{
                borderRadius: 2,
                mt: 1,
                color: "#DC2626",
                backgroundColor: "#FEE2E2"
              }}
            >
              <ListItemText primary="Cerrar sesion" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default EncabezadoCliente;
