import React, { useState } from "react";
import { Box, Drawer } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DRAWER_WIDTH = 240;

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F1F5F9" }}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Sidebar drawerWidth={DRAWER_WIDTH} />
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
        <Sidebar drawerWidth={DRAWER_WIDTH} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLayout;
