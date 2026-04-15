import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Drawer } from "@mui/material";
import SidebarCliente from "./SidebarCliente";
import TopbarCliente from "./TopbarCliente";
import MigasDePan from "../compartidos/MigasDePan";
import PieDePaginaCliente from "../compartidos/PieDePaginaCliente";

const DRAWER_WIDTH = 280;

function ClienteLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "#F1F5F9"
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexShrink: 0,
          alignSelf: "stretch",
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        <SidebarCliente drawerWidth={DRAWER_WIDTH} />
      </Box>

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
        <SidebarCliente drawerWidth={DRAWER_WIDTH} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

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
        <MigasDePan />
        <TopbarCliente onOpenSidebar={() => setMobileOpen(true)} />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Outlet />
          </Box>
          <Box sx={{ mt: "auto" }}>
            <PieDePaginaCliente />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ClienteLayout;
