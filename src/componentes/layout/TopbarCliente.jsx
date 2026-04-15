import React, { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";

const COLORS = {
  topbarBg: "#FFFFFF",
  border: "#E5E7EB",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  online: "#22C55E"
};

/**
 * Barra superior del área cliente: acciones a la derecha y menú móvil a la izquierda.
 * Notificaciones: badge rojo (mock hasta exista API); carrito preparado para futura ruta.
 */
function TopbarCliente({ onOpenSidebar }) {
  /** Sustituir por datos reales cuando exista API de notificaciones */
  const [notifCount] = useState(0);

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

  return (
    <Box
      sx={{
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
          height: 70,
          px: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          boxSizing: "border-box"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            flex: { xs: 1, md: "0 1 auto" }
          }}
        >
          <IconButton
            onClick={onOpenSidebar}
            sx={{ display: { md: "none" }, color: COLORS.textPrimary }}
            aria-label="Abrir menú cliente"
          >
            <MenuIcon />
          </IconButton>

          <Typography
            sx={{
              color: COLORS.textPrimary,
              fontWeight: 800,
              fontSize: { xs: "0.9rem", sm: "0.95rem" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: "55vw", sm: "52vw", md: 520 }
            }}
          >
            Bienvenid@:{" "}
            <Box component="span" sx={{ color: COLORS.textSecondary, fontWeight: 800 }}>
              {displayName}
            </Box>
          </Typography>
        </Box>

        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 }
          }}
        >
          <IconButton
            sx={{ color: COLORS.textSecondary }}
            aria-label="Notificaciones"
          >
            <Badge
              color="error"
              variant={notifCount > 0 ? "dot" : "standard"}
              invisible={notifCount === 0}
              overlap="circular"
            >
              <NotificationsNoneRounded />
            </Badge>
          </IconButton>

          <IconButton
            sx={{ color: COLORS.textSecondary, display: { xs: "none", sm: "inline-flex" } }}
            aria-label="Carrito"
            title="Próximamente"
            onClick={() => {}}
          >
            <ShoppingCartOutlined />
          </IconButton>

          <Box
            sx={{
              textAlign: "right",
              lineHeight: 1.15,
              display: { xs: "none", sm: "block" },
              mr: 0.5
            }}
          >
            <Typography
              sx={{
                color: COLORS.textPrimary,
                fontWeight: 600,
                fontSize: "0.95rem"
              }}
            >
              {displayName}
            </Typography>
            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontWeight: 500,
                fontSize: "0.8rem"
              }}
            >
              Cliente
            </Typography>
          </Box>

          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#F1F5F9",
                color: COLORS.textPrimary,
                fontSize: "0.9rem",
                fontWeight: 700
              }}
              aria-hidden
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
              aria-label="En línea"
            />
          </Box>
        </Box>
      </Toolbar>
    </Box>
  );
}

export default TopbarCliente;
