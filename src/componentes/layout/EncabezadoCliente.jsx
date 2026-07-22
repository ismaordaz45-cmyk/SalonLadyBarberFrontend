import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeRounded from "@mui/icons-material/HomeRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import FormatListBulletedRounded from "@mui/icons-material/FormatListBulletedRounded";
import InfoRounded from "@mui/icons-material/InfoRounded";
import AnnouncementRounded from "@mui/icons-material/AnnouncementRounded";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import PersonRounded from "@mui/icons-material/PersonRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingBagRounded from "@mui/icons-material/ShoppingBagRounded";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../api";
import { logoBase64ToDataUrl } from "../../utils/logoDataUrl";
import BarberPole from "../compartidos/BarberPole";
import { useCart } from "../../context/CartContext";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";
import { resolveServicioImagenUrl } from "../../utils/resolveServicioImagenUrl";



const COLORS = {
  background: "#FFFFFF",
  textPrimary: "#1E293B", // Navy/slate oscuro
  textSecondary: "#64748B", // Slate gris
  lightBlue: "#0284C7", // Azul claro para rol
  border: "#E2E8F0",
  online: "#22C55E"
};

function moneyMXN(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function EncabezadoCliente() {
  const location = useLocation();
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  // Estados locales
  const [active, setActive] = useState("inicio");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber ID'M");
  const [logoUrl, setLogoUrl] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Menú de Perfil
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  // Cargar perfil de la empresa (Nombre + Logo)
  useEffect(() => {
    let cancel = false;
    const fetchPerfil = async () => {
      try {
        const { data } = await api.get("/api/perfil-empresa", {
          barberOverlay: false
        });
        if (!cancel) {
          if (data?.nombre) setNombreEmpresa(data.nombre);
          if (data?.logo) setLogoUrl(logoBase64ToDataUrl(data.logo));
        }
      } catch {
        /* fallback */
      }
    };
    fetchPerfil();
    return () => {
      cancel = true;
    };
  }, []);

  // Determinar ruta activa
  useEffect(() => {
    const path = location.pathname;
    if (path === "/cliente") setActive("inicio");
    else if (path.includes("/cliente/servicios")) setActive("servicios");
    else if (path.includes("/cliente/citas")) setActive("citas");
    else if (path.includes("/nosotros")) setActive("nosotros");
    else if (path.includes("/novedades")) setActive("novedades");
    else setActive("");
  }, [location.pathname]);

  // Leer datos de usuario autenticado
  const { displayName, initial } = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return { displayName: "Cliente", initial: "C" };
      const u = JSON.parse(raw);
      const name = u?.nombre || u?.correo || "Cliente";
      const letter = String(name).trim()[0]?.toUpperCase() || "C";
      return { displayName: name, initial: letter };
    } catch {
      return { displayName: "Cliente", initial: "C" };
    }
  }, []);

  // Cerrar Sesión Seguro
  const handleLogout = async () => {
    setProfileAnchorEl(null);
    const result = await Swal.fire({
      title: "Cerrar sesión",
      text: "¿Deseas cerrar la sesión actual?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      background: "#1E293B",
      color: "#F8FAFC",
      iconColor: "#F8FAFC",
      confirmButtonColor: "#334155",
      cancelButtonColor: "#94A3B8"
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

    navigate("/", { replace: true });
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const navItems = [
    { key: "inicio", label: "Inicio", path: "/cliente", icon: <HomeRounded /> },
    { key: "servicios", label: "Servicios", path: "/cliente/servicios", icon: <StorefrontRounded /> },
    { key: "citas", label: "Mis citas", path: "/cliente/citas", icon: <FormatListBulletedRounded /> },
    { key: "nosotros", label: "Nosotros", path: "/nosotros", icon: <InfoRounded /> },
    { key: "novedades", label: "Novedades", path: "/novedades", icon: <AnnouncementRounded /> }
  ];

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: COLORS.background,
          color: COLORS.textPrimary,
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          borderBottom: `1px solid ${COLORS.border}`,
          zIndex: 1100
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 5 },
            minHeight: 75,
            height: 75
          }}
        >
          {/* LOGO Y MARCA */}
          <Box
            component={Link}
            to="/cliente"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
              mr: 2
            }}
          >
            {logoUrl ? (
              <Box
                component="img"
                src={logoUrl}
                alt="Logo"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  border: `1px solid ${COLORS.border}`,
                  objectFit: "contain",
                  bgcolor: "#F8FAFC",
                  p: 0.1,
                  boxSizing: "border-box"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: "#F8FAFC",
                  color: COLORS.textPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  border: `1px solid ${COLORS.border}`
                }}
              >
                LB
              </Box>
            )}

            <BarberPole size={34} width={9} sx={{ display: { xs: "none", sm: "flex" } }} />

            <Box
              component="span"
              sx={{
                fontWeight: 800,
                color: COLORS.textPrimary,
                fontSize: { xs: "0.95rem", md: "1.1rem" },
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: { xs: 130, sm: 200, md: 240 }
              }}
            >
              {nombreEmpresa}
            </Box>
          </Box>

          {/* MENÚ DE ENLACES (DESKTOP) */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.5,
              flex: 1,
              justifyContent: "center"
            }}
          >
            {navItems.map((item) => {
              const isAct = active === item.key;
              return (
                <Button
                  key={item.key}
                  component={Link}
                  to={item.path}
                  startIcon={React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                  sx={{
                    color: isAct ? COLORS.textPrimary : COLORS.textSecondary,
                    fontWeight: isAct ? 800 : 600,
                    fontSize: "0.82rem",
                    letterSpacing: "0.02em",
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 2,
                    py: 1,
                    "&:hover": {
                      backgroundColor: "rgba(30, 58, 90, 0.04)",
                      color: COLORS.textPrimary
                    },
                    ...(isAct
                      ? {
                          backgroundColor: "rgba(30, 58, 90, 0.06)",
                          color: COLORS.textPrimary
                        }
                      : {})
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* ACCIONES Y PERFIL (DERECHA) */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: "auto" }}>
            {/* Campana de Notificaciones (mock limpio de captura) */}
            <IconButton
              sx={{ color: COLORS.textSecondary, p: 1 }}
              aria-label="Notificaciones"
            >
              <NotificationsNoneRounded sx={{ fontSize: 24 }} />
            </IconButton>

            {/* Icono de Carrito con Conteo Global */}
            <IconButton
              sx={{ color: COLORS.textSecondary, p: 1 }}
              aria-label="Carrito"
              onClick={() => setCartOpen(true)}
            >
              <Badge badgeContent={totalItems} color="error" overlap="rectangular">
                <ShoppingCartOutlined sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>

            <Divider orientation="vertical" variant="middle" flexItem sx={{ display: { xs: "none", sm: "block" } }} />

            {/* Perfil del Usuario (Exacto de tu captura) */}
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                p: 0.5,
                borderRadius: "12px",
                transition: "background-color 0.2s",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.03)"
                }
              }}
            >
              {/* Nombre y Rol */}
              <Box
                sx={{
                  textAlign: "right",
                  lineHeight: 1.15,
                  display: { xs: "none", sm: "block" }
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.textPrimary,
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    letterSpacing: "-0.01em"
                  }}
                >
                  {displayName}
                </Typography>
                <Typography
                  sx={{
                    color: COLORS.lightBlue,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    mt: 0.15
                  }}
                >
                  Cliente
                </Typography>
              </Box>

              {/* Avatar con punto de conexión verde */}
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: "rgba(30, 58, 90, 0.05)",
                    color: COLORS.textPrimary,
                    fontSize: "0.95rem",
                    fontWeight: 900
                  }}
                >
                  {initial}
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: COLORS.online,
                    border: "2px solid #FFFFFF",
                    boxSizing: "border-box"
                  }}
                />
              </Box>
            </Box>
          </Stack>

          {/* Menú Móvil Hamburger */}
          <IconButton
            sx={{ display: { md: "none" }, color: COLORS.textPrimary, ml: 1 }}
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* DROPDOWN MENU DE PERFIL */}
      <Menu
        anchorEl={profileAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 5px 15px rgba(0,0,0,0.08))",
            mt: 1.5,
            borderRadius: "14px",
            border: `1px solid ${COLORS.border}`,
            minWidth: 180,
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 18,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          component={Link}
          to="/cliente/perfil"
          sx={{
            py: 1.2,
            px: 2.2,
            fontWeight: 700,
            fontSize: "0.88rem",
            color: COLORS.textPrimary,
            "&:hover": { bgcolor: "rgba(30, 58, 90, 0.04)" }
          }}
        >
          <ListItemIcon sx={{ minWidth: "30px !important" }}>
            <PersonRounded sx={{ fontSize: 18, color: COLORS.textSecondary }} />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>

        <Divider sx={{ my: 1, borderColor: COLORS.border }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.2,
            px: 2.2,
            fontWeight: 800,
            fontSize: "0.88rem",
            color: "#EF4444",
            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.04)" }
          }}
        >
          <ListItemIcon sx={{ minWidth: "30px !important" }}>
            <LogoutRounded sx={{ fontSize: 18, color: "#EF4444" }} />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>

      {/* DRAWER DE NAVEGACIÓN MÓVIL */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            background: COLORS.background,
            color: COLORS.textPrimary,
            borderLeft: `1px solid ${COLORS.border}`,
            p: 3
          }
        }}
      >
        {/* Cabecera Drawer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography sx={{ fontWeight: 900, color: COLORS.textPrimary, fontSize: "1.05rem" }}>
            {nombreEmpresa}
          </Typography>
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <List disablePadding>
          {navItems.map((item) => {
            const isAct = active === item.key;
            return (
              <ListItemButton
                key={item.key}
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: "10px",
                  mb: 1,
                  py: 1.2,
                  px: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(30, 58, 90, 0.04)"
                  },
                  ...(isAct
                    ? {
                        backgroundColor: "rgba(30, 58, 90, 0.06)",
                        color: COLORS.textPrimary
                      }
                    : {})
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: isAct ? COLORS.textPrimary : COLORS.textSecondary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isAct ? 800 : 600,
                    fontSize: "0.92rem",
                    color: isAct ? COLORS.textPrimary : COLORS.textSecondary
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* DIÁLOGO DEL CARRITO GLOBAL */}
      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px" } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: COLORS.textPrimary, display: "flex", alignItems: "center", gap: 1.5 }}>
          <ShoppingBagRounded /> Mi Carrito
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: COLORS.border }}>
          {cart.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography sx={{ color: COLORS.textSecondary, fontWeight: 700 }}>
                Tu carrito está vacío. ¡Agrega insumos o productos desde el catálogo!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {cart.map((item) => (
                <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    component="img"
                    src={resolveServicioImagenUrl(item.imagen, api.defaults.baseURL)}
                    alt={item.nombre}
                    sx={{
                      width: 50,
                      height: 50,
                      objectFit: "contain",
                      borderRadius: "10px",
                      bgcolor: "#F8FAFC",
                      border: `1px solid ${COLORS.border}`,
                      p: 0.5
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                      {moneyMXN(item.precioVenta)} c/u
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 28, height: 28, p: 0, borderRadius: "6px", borderColor: COLORS.border, color: COLORS.textSecondary }}
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    >-</Button>
                    <Typography sx={{ fontWeight: 800, minWidth: 20, textAlign: "center", fontSize: "0.85rem", color: COLORS.textPrimary }}>
                      {item.cantidad}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ minWidth: 28, height: 28, p: 0, borderRadius: "6px", borderColor: COLORS.border, color: COLORS.textSecondary }}
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      disabled={item.cantidad >= (item.stockActual || 0)}
                    >+</Button>
                  </Stack>
                  <IconButton color="error" onClick={() => removeFromCart(item.id)} size="small">
                    <DeleteOutlineRounded sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: "column", gap: 2 }}>
          <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontWeight: 900, fontSize: "1rem", color: COLORS.textPrimary }}>Total:</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: COLORS.textPrimary }}>
              {moneyMXN(totalPrice)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCartOpen(false)}
              sx={{
                borderRadius: "10px",
                fontWeight: 800,
                textTransform: "none",
                color: COLORS.textSecondary,
                borderColor: COLORS.border,
                "&:hover": { borderColor: COLORS.textSecondary }
              }}
            >
              Seguir comprando
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={cart.length === 0}
              onClick={async () => {
                try {
                  const user = JSON.parse(localStorage.getItem("user") || "{}");
                  const { data } = await api.post("/api/mercado-pago/crear-preferencia", {
                    items: cart,
                    clienteId: user.id
                  });

                  if (data.init_point) {
                    window.location.href = data.init_point;
                  }
                } catch (err) {
                  console.error("Error al iniciar pago:", err);
                  Swal.fire({
                    icon: "error",
                    title: "Error de Pago",
                    text: "Hubo un problema al procesar el pago. Intenta de nuevo.",
                    confirmButtonColor: COLORS.textPrimary
                  });
                }
              }}
              sx={{
                bgcolor: COLORS.textPrimary,
                color: "#FFFFFF",
                borderRadius: "10px",
                fontWeight: 900,
                textTransform: "none",
                "&:hover": { bgcolor: "#0F172A" }
              }}
            >
              Pagar ahora
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EncabezadoCliente;
