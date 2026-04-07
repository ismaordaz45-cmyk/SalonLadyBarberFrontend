import React from "react";
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

function Topbar({ onOpenSidebar }) {
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
              Itza Dinora
            </Typography>
            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontWeight: 500,
                fontSize: "0.8rem"
              }}
            >
              Propietaria
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
            ID
          </Avatar>
        </Box>
      </Toolbar>
    </Box>
  );
}

export default Topbar;
