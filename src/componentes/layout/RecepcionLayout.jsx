import React, { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Stack
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SidebarRecepcion from "./SidebarRecepcion";
import Swal from "sweetalert2";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const DRAWER_WIDTH = 250;

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function RecepcionLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();

  const user = useMemo(() => readStoredUser(), []);
  const name = user?.nombre || user?.correo || "Recepción";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar la sesión de Recepción?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#64748B"
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

    navigate("/", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#F8FAFC", overflow: "hidden" }}>
      {/* Sidebar - Desktop */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
          height: "100vh",
          flexShrink: 0
        }}
      >
        <SidebarRecepcion drawerWidth={DRAWER_WIDTH} />
      </Box>

      {/* Sidebar - Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box"
          }
        }}
      >
        <SidebarRecepcion drawerWidth={DRAWER_WIDTH} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden"
        }}
      >
        {/* Top Header Panel */}
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            zIndex: 10
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ display: { md: "none" }, mr: 1 }}
              >
                <MenuRoundedIcon />
              </IconButton>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1rem", sm: "1.15rem" },
                  color: "#1E3A5F",
                  fontFamily: '"Cinzel", ui-serif, Georgia, serif',
                  letterSpacing: "-0.01em"
                }}
              >
                Lady Barber Itza D&apos;M
              </Typography>
            </Stack>

            {/* Profile Detail Block */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Profile Meta (Desktop) */}
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#1E3A5F" }}>
                  {name}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "0.7rem", color: "#64748B", mt: 0.1 }}>
                  Recepción
                </Typography>
              </Box>

              {/* Avatar with active green status */}
              <Box sx={{ position: "relative" }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#1E3A5F",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    border: "2px solid #E2E8F0"
                  }}
                >
                  {name.charAt(0).toUpperCase()}
                </Avatar>
                {/* Status Indicator */}
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#22C55E",
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    border: "2px solid #FFFFFF"
                  }}
                />
              </Box>

              {/* Logout Button (Quick Access Mobile) */}
              <IconButton
                onClick={handleLogout}
                sx={{
                  display: { xs: "flex", sm: "none" },
                  color: "#64748B",
                  "&:hover": { color: "#EF4444" }
                }}
              >
                <LogoutRoundedIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Dynamic Nested Content */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: { xs: 2, md: 3 }
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default RecepcionLayout;
