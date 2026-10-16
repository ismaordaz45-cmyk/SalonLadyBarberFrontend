// ============================================
// COMPONENTE: EncabezadoPublico.jsx
// ============================================

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { logoBase64ToDataUrl } from "../../utils/logoDataUrl";
import BarberPole from "./BarberPole";

import {
  Menu as MenuIcon,
  Search as SearchIcon
} from "@mui/icons-material";

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";

/* ============================
   API
============================ */

const API_BASE_URL = "https://salonladybarberbackend.onrender.com";

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
  const navigate = useNavigate();

  const [active, setActive] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Nombre por defecto consistente oficial
  const DEFAULT_NOMBRE = "Salón Lady Barber Itza D´M";

  // Intentar leer nombre persistido en caché para evitar parpadeo al recargar
  const [nombreEmpresa, setNombreEmpresa] = useState(() => {
    try {
      return localStorage.getItem("slb_nombre_empresa") || DEFAULT_NOMBRE;
    } catch {
      return DEFAULT_NOMBRE;
    }
  });

  const [logoUrl, setLogoUrl] = useState(() => {
    try {
      return localStorage.getItem("slb_logo_url") || "";
    } catch {
      return "";
    }
  });

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = searchValue.trim();
    if (query) {
      navigate(`/catalogo?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/catalogo");
    }
    setMobileOpen(false);
  };

  /* ============================
     Ruta activa
  ============================ */

  useEffect(() => {
    const path = location.pathname;

    if (path === "/" || path === "") setActive("inicio");
    else if (path.includes("/catalogo")) setActive("servicios");
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
        const { data } = await axios.get(`${API_BASE_URL}/api/perfil-empresa`, {
          barberOverlay: false
        });

        if (data?.nombre) {
          setNombreEmpresa(data.nombre);
          try {
            localStorage.setItem("slb_nombre_empresa", data.nombre);
          } catch {
            /* storage limit */
          }
        }

        if (data?.logo) {
          const formattedLogo = logoBase64ToDataUrl(data.logo);
          setLogoUrl(formattedLogo);
          try {
            localStorage.setItem("slb_logo_url", formattedLogo);
          } catch {
            /* storage limit */
          }
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
                  width: 56,
                  height: 56,
                  borderRadius: 1.5,
                  border: `1px solid ${COLORS.border}`,
                  objectFit: "contain",
                  objectPosition: "center",
                  bgcolor: "#F8FAFC",
                  p: 0.1,
                  boxSizing: "border-box"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 56,
                  height: 56,
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

            <BarberPole size={38} width={11} sx={{ display: { xs: "none", md: "flex" } }} />

            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: COLORS.text,
                fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: { xs: 180, sm: 280, md: 360 }
              }}
            >
              {nombreEmpresa}
            </Box>
          </Box>

          {/* Input de búsqueda compacto */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: { xs: "none", md: "block" },
              ml: 4,
              mr: 2,
              width: 220
            }}
          >
            <TextField
              size="small"
              fullWidth
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar servicio..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearch} edge="end" sx={{ color: COLORS.text }}>
                      <SearchIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  backgroundColor: "#FFFFFF",
                  color: COLORS.text,
                  pr: 1,
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
                borderRadius: "10px",
                px: 1.7,
                py: 0.7,
                fontWeight: 600,
                fontSize: "0.86rem",
                minHeight: 36,
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

          <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar servicio..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearch} edge="end" sx={{ color: COLORS.text }}>
                      <SearchIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999
                }
              }}
            />
          </Box>

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
