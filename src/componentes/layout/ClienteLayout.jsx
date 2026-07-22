import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import EncabezadoCliente from "./EncabezadoCliente";
import MigasDePan from "../compartidos/MigasDePan";
import PieDePaginaCliente from "../compartidos/PieDePaginaCliente";

function ClienteLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#F1F5F9"
      }}
    >
      <EncabezadoCliente />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0
        }}
      >
        <MigasDePan />
        <Box sx={{ p: { xs: 2.5, md: 4 }, flex: 1 }}>
          <Outlet />
        </Box>
        <PieDePaginaCliente />
      </Box>
    </Box>
  );
}

export default ClienteLayout;
