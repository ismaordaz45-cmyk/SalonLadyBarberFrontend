// ============================================
// COMPONENTE: EncabezadoAdministrativo.jsx
// ============================================

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  LogoutRounded,
  HomeRounded,
  DescriptionOutlined,
  StorefrontOutlined,
  StorageRounded,
  Menu as MenuIcon
} from "@mui/icons-material";

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const API_URL = "http://localhost:4000";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const EncabezadoAdministrativo = () => {

  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [active, setActive] = useState('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [anchorEmpresa, setAnchorEmpresa] = useState(null);
  const [anchorGestion, setAnchorGestion] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber ID'M");

  // ============================================
  // Cargar perfil empresa (backend limpio)
  // ============================================

  useEffect(() => {

    const fetchPerfil = async () => {
      try {

        const response = await axios.get(
          `${API_URL}/api/perfil-empresa`
        );

        const data = response.data;

        setNombreEmpresa(data?.nombre || "Lady Barber ID'M");

        setLogoUrl(
          data?.logo
            ? `data:image/jpeg;base64,${data.logo}`
            : ''
        );

      } catch (error) {
        console.error('❌ Error al obtener perfil de la empresa:', error);
      }
    };

    fetchPerfil();

  }, []);

  // ============================================
  // Manejo de menú
  // ============================================

  const handleClick = (option) => {
    setActive(option);
    setIsMobileMenuOpen(false);
    setAnchorEmpresa(null);
    setAnchorGestion(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // ============================================
  // Navegación
  // ============================================

  const handleMenuClick = (key) => {

    switch (key) {

      case "home":
        navigate('/admin/');
        break;

      case "perfil":
        navigate('/admin/perfil');
        break;

      case "terminos":
        navigate('/admin/terminos');
        break;

      case "politicas":
        navigate('/admin/politicas');
        break;

      case "mision":
        navigate('/admin/mision');
        break;

      case "vision":
        navigate('/admin/vision');
        break;

      case "citas":
        navigate('/admin/citas');
        break;

      case "servicios":
        navigate('/admin/servicios');
        break;

      case "barberos":
        navigate('/admin/barberos');
        break;

      case "clientes":
        navigate('/admin/clientes');
        break;

      case "inventario":
        navigate('/admin/inventario');
        break;

      case "estadisticas":
        navigate('/admin/estadisticas');
        break;

      case "promociones":
        navigate('/admin/promociones');
        break;

      case "adminDb":
        navigate('/admin/base-datos');
        break;

      case "cerrarSesion":
        handleLogout();
        break;

      default:
        console.warn(`⚠️ Acción de menú no reconocida: ${key}`);
    }
  };

  // ============================================
  // Logout
  // ============================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // ============================================
  // Click fuera del menú
  // ============================================

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMobileMenuOpen(false);
      setAnchorEmpresa(null);
      setAnchorGestion(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================
  // Render
  // ============================================

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleOpenEmpresa = (event) => {
    setAnchorEmpresa(event.currentTarget);
  };

  const handleOpenGestion = (event) => {
    setAnchorGestion(event.currentTarget);
  };

  const handleCloseMenus = () => {
    setAnchorEmpresa(null);
    setAnchorGestion(null);
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 0 }} ref={menuRef}>
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
        }}
      >
        <Toolbar
          sx={{
            minHeight: 84,
            px: { xs: 2.5, md: 4 },
            py: 2
          }}
        >
          {/* Logo y nombre */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            {logoUrl ? (
              <Box
                component="img"
                src={logoUrl}
                alt="Logo empresa"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  mr: 2,
                  border: "3px solid #D4AF37",
                  boxShadow: 2,
                  objectFit: "cover"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  mr: 2,
                  bgcolor: "#D4AF37",
                  color: "#2C3E50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  boxShadow: 2,
                  fontFamily: "'Geist Sans', Arial, sans-serif"
                }}
              >
                {nombreEmpresa?.trim()?.[0] || "LB"}
              </Box>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                color: "#F9FAFB",
                fontFamily: "'Playfair Display', serif",
                fontSize: { xs: "1.3rem", md: "1.6rem" }
              }}
            >
              {nombreEmpresa}
            </Typography>
          </Box>

          {/* Navegación escritorio */}
          {isDesktop ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                fontFamily: "'Geist Sans', Arial, sans-serif"
              }}
            >
              <Button
                color="inherit"
                onClick={() => handleMenuClick("home")}
                startIcon={
                  <HomeRounded sx={{ color: "#D4AF37", fontSize: 26 }} />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: active === "home" ? 700 : 500,
                  fontSize: "0.95rem",
                  bgcolor:
                    active === "home"
                      ? alpha("#FFFFFF", 0.08)
                      : "transparent",
                  "&:hover": {
                    bgcolor: alpha("#FFFFFF", 0.12)
                  }
                }}
              >
                Inicio
              </Button>

              {/* Datos de la empresa */}
              <Button
                color="inherit"
                onClick={handleOpenEmpresa}
                startIcon={
                  <DescriptionOutlined
                    sx={{ color: "#D4AF37", fontSize: 24 }}
                  />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  "&:hover": {
                    bgcolor: alpha("#FFFFFF", 0.12)
                  }
                }}
              >
                Datos de la Empresa
              </Button>
              <Menu
                anchorEl={anchorEmpresa}
                open={Boolean(anchorEmpresa)}
                onClose={handleCloseMenus}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left"
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClick("perfil");
                    handleMenuClick("perfil");
                  }}
                >
                  Perfil
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("terminos");
                    handleMenuClick("terminos");
                  }}
                >
                  Términos
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("politicas");
                    handleMenuClick("politicas");
                  }}
                >
                  Políticas
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("mision");
                    handleMenuClick("mision");
                  }}
                >
                  Misión
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("vision");
                    handleMenuClick("vision");
                  }}
                >
                  Visión
                </MenuItem>
              </Menu>

              {/* Gestión del salón */}
              <Button
                color="inherit"
                onClick={handleOpenGestion}
                startIcon={
                  <StorefrontOutlined
                    sx={{ color: "#4ADE80", fontSize: 24 }}
                  />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  "&:hover": {
                    bgcolor: alpha("#FFFFFF", 0.12)
                  }
                }}
              >
                Gestión del Salón
              </Button>
              <Menu
                anchorEl={anchorGestion}
                open={Boolean(anchorGestion)}
                onClose={handleCloseMenus}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left"
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleClick("citas");
                    handleMenuClick("citas");
                  }}
                >
                  Citas
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("servicios");
                    handleMenuClick("servicios");
                  }}
                >
                  Servicios
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("barberos");
                    handleMenuClick("barberos");
                  }}
                >
                  Barberos
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("clientes");
                    handleMenuClick("clientes");
                  }}
                >
                  Clientes
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("inventario");
                    handleMenuClick("inventario");
                  }}
                >
                  Inventario
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("estadisticas");
                    handleMenuClick("estadisticas");
                  }}
                >
                  Estadísticas
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClick("promociones");
                    handleMenuClick("promociones");
                  }}
                >
                  Promociones
                </MenuItem>
              </Menu>

              <Button
                color="inherit"
                onClick={() => handleMenuClick("adminDb")}
                startIcon={
                  <StorageRounded sx={{ color: "#D4AF37", fontSize: 24 }} />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  "&:hover": {
                    bgcolor: alpha("#FFFFFF", 0.12)
                  }
                }}
              >
                Admin Base de datos
              </Button>

              <Button
                color="inherit"
                onClick={() => handleMenuClick("cerrarSesion")}
                startIcon={
                  <LogoutRounded sx={{ color: "#F97373", fontSize: 26 }} />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  ml: 1,
                  "&:hover": {
                    bgcolor: alpha("#F97373", 0.16)
                  }
                }}
              >
                Cerrar sesión
              </Button>
            </Box>
          ) : (
            <IconButton
              color="inherit"
              edge="end"
              onClick={toggleMobileMenu}
              aria-label="Abrir menú"
              sx={{ "& svg": { fontSize: 30 } }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Menú móvil */}
      {!isDesktop && isMobileMenuOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "75%",
            height: "100%",
            bgcolor: "#0F172A",
            color: "#F9FAFB",
            zIndex: 1200,
            pt: 8,
            px: 2
          }}
        >
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                p: 0,
                m: 0,
                fontFamily: "'Geist Sans', Arial, sans-serif"
              }}
            >
            <Box
              component="li"
              sx={{
                py: 1.5,
                px: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: alpha("#22C55E", 0.15) },
                fontSize: "1rem"
              }}
              onClick={() => handleMenuClick("home")}
            >
              <HomeRounded sx={{ color: "#D4AF37" }} /> Inicio
            </Box>

            <Box
              component="li"
              sx={{
                py: 1.5,
                px: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: alpha("#22C55E", 0.15) },
                fontSize: "1rem"
              }}
              onClick={handleOpenEmpresa}
            >
              <DescriptionOutlined sx={{ color: "#FACC6B", mr: 1 }} />
              Datos de la Empresa
            </Box>

            <Box
              component="li"
              sx={{
                py: 1.5,
                px: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: alpha("#22C55E", 0.15) },
                fontSize: "1rem"
              }}
              onClick={handleOpenGestion}
            >
              <StorefrontOutlined sx={{ color: "#4ADE80", mr: 1 }} />
              Gestión del Salón
            </Box>

            <Box
              component="li"
              sx={{
                py: 1.5,
                px: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: alpha("#22C55E", 0.15) },
                fontSize: "1rem"
              }}
              onClick={() => handleMenuClick("adminDb")}
            >
              <StorageRounded sx={{ color: "#D4AF37", mr: 1 }} />
              Admin Base de datos
            </Box>

            <Box
              component="li"
              sx={{
                py: 1.5,
                px: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: alpha("#F97373", 0.25) },
                fontSize: "1rem"
              }}
              onClick={() => handleMenuClick("cerrarSesion")}
            >
              <LogoutRounded sx={{ color: "#F97373", mr: 1 }} />
              Cerrar sesión
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default EncabezadoAdministrativo;