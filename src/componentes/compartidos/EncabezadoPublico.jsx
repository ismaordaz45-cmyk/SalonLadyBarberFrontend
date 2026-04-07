// ============================================
// COMPONENTE: EncabezadoPublico.jsx
// ============================================

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

import {
  Menu as MenuIcon
} from "@mui/icons-material";

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  TextField,
  Drawer,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";

/* ============================
   API
============================ */

const API_BASE_URL = "http://localhost:4000";

/* ============================
   Paleta
============================ */

const COLORS = {
  background: "#FFFFFF",
  text: "#1E293B",
  hover: "#1E293B",
  border: "#E2E8F0",
  loginBg: "#1E293B",
  white: "#FFFFFF"
};

const headerStyle = {
  background: COLORS.background,
  color: COLORS.text,
  boxShadow: "none",
  borderBottom: `1px solid ${COLORS.border}`,
  position: "sticky",
  top: 0,
  zIndex: 1100
};

const EncabezadoPublico = () => {
  const location = useLocation();

  const [active, setActive] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber ID'M");
  const [logoUrl, setLogoUrl] = useState("");

  /* ============================
     Ruta activa
  ============================ */

  useEffect(() => {
    const path = location.pathname;

    if (path === "/" || path === "") setActive("inicio");
    else if (path.includes("/catalogo")) setActive("catalogo");
    else if (path.includes("/login")) setActive("login");
    else if (path.includes("/nosotros") || path.includes("/contacto")) setActive("nosotros");
    else if (path.includes("/servicios")) setActive("servicios");
    else if (path.includes("/novedades") || path.includes("/precios")) setActive("novedades");
    else setActive("");
  }, [location.pathname]);

  /* ============================
     Perfil público empresa
     GET /api/perfil-empresa (tabla perfil_empresa: nombre, logo)
  ============================ */

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/perfil-empresa`
        );

        if (data?.nombre) {
          setNombreEmpresa(data.nombre);
        }

        if (data?.logo) {
          setLogoUrl(`data:image/jpeg;base64,${data.logo}`);
        }
      } catch (error) {
        console.warn("Perfil público no disponible:", error?.message);
      }
    };

    fetchPerfil();
  }, []);

  const getPath = (key) => {
    const paths = {
      inicio: "/",
      catalogo: "/catalogo",
      servicios: "/servicios",
      nosotros: "/nosotros",
      novedades: "/novedades",
      login: "/login"
    };

    return paths[key] || "/";
  };

  const navItems = [
    {
      key: "inicio",
      label: "Inicio"
    },
    {
      key: "catalogo",
      label: "Catálogo"
    },
    {
      key: "servicios",
      label: "Servicios"
    },
    {
      key: "nosotros",
      label: "Nosotros"
    },
    {
      key: "novedades",
      label: "Novedades"
    }
  ];

  return (
    <>
      <AppBar position="sticky" sx={{ ...headerStyle }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2.5, md: 8 },
            py: 0,
            minHeight: 70
          }}
        >
          {/* Logo y nombre */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flex: { xs: 1, md: "0 0 auto" },
              minWidth: 0
            }}
          >
            {logoUrl ? (
              <Box
                component="img"
                src={logoUrl}
                alt="Logo"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  border: `1px solid ${COLORS.border}`,
                  objectFit: "cover"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                  color: COLORS.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "1rem",
                  border: `1px solid ${COLORS.border}`
                }}
              >
                LB
              </Box>
            )}

            <Box
              component="span"
              sx={{
                fontWeight: 600,
                color: COLORS.text,
                fontSize: { xs: "1rem", md: "1.15rem" },
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: { xs: 130, sm: 220, md: 280 }
              }}
            >
              {nombreEmpresa}
            </Box>
          </Box>

          {/* Input de búsqueda compacto */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              ml: 4,
              mr: 2,
              width: 210
            }}
          >
            <TextField
              size="small"
              fullWidth
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Búsqueda"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  backgroundColor: "#FFFFFF",
                  color: COLORS.text,
                  "& fieldset": {
                    borderColor: COLORS.border
                  },
                  "&:hover fieldset": {
                    borderColor: COLORS.hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: COLORS.hover
                  }
                }
              }}
            />
          </Box>

          {/* Menú desktop */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.25,
              flex: 1,
              justifyContent: "center"
            }}
          >
            {navItems.map(({ key, label }) => (
              <Button
                key={key}
                component={Link}
                to={getPath(key)}
                onClick={() => {
                  setActive(key);
                  setMobileOpen(false);
                }}
                sx={{
                  color: COLORS.text,
                  fontWeight: 500,
                  fontSize: "0.82rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: 0,
                  px: 1.4,
                  py: 1.3,
                  borderBottom: "3px solid transparent",
                  textDecoration: "none",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: COLORS.hover
                  },
                  ...(active === key
                    ? {
                        color: COLORS.loginBg,
                        fontWeight: 700,
                        backgroundColor: "transparent",
                        borderBottom: `3px solid ${COLORS.loginBg}`
                    }
                    : {})
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Login desktop */}
          <Box sx={{ display: { xs: "none", md: "block" }, ml: 2 }}>
            <Button
              component={Link}
              to={getPath("login")}
              onClick={() => setActive("login")}
              sx={{
                backgroundColor: COLORS.loginBg,
                color: COLORS.white,
                borderRadius: "12px",
                px: 2.1,
                py: 0.9,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#0F172A"
                }
              }}
            >
              Iniciar sesión
            </Button>
          </Box>

          {/* Botón móvil */}
          <IconButton
            sx={{ display: { md: "none" }, color: COLORS.text }}
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: COLORS.background,
            color: COLORS.text,
            borderLeft: `1px solid ${COLORS.border}`
          }
        }}
      >
        <Box sx={{ pt: 3, pb: 2, px: 2 }}>
          <Box
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: COLORS.text,
              mb: 2
            }}
          >
            {nombreEmpresa}
          </Box>

          <TextField
            size="small"
            fullWidth
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Búsqueda"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999
              }
            }}
          />

          <List disablePadding>
            {navItems.map(({ key, label }) => (
              <ListItemButton
                key={key}
                component={Link}
                to={getPath(key)}
                onClick={() => {
                  setActive(key);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(37,99,235,0.08)",
                    color: COLORS.hover
                  },
                  ...(active === key
                    ? {
                      backgroundColor: "rgba(37,99,235,0.08)",
                      color: COLORS.hover
                    }
                    : {})
                }}
              >
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            ))}

            <ListItemButton
              component={Link}
              to={getPath("login")}
              onClick={() => {
                setActive("login");
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mt: 1,
                backgroundColor: COLORS.loginBg,
                color: COLORS.white,
                "&:hover": {
                  backgroundColor: "#0F172A"
                }
              }}
            >
              <ListItemText
                primary="Iniciar sesión"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default EncabezadoPublico;