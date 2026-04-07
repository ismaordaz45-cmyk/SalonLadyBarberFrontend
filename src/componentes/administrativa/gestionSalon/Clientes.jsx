import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

function Clientes() {
  return (
    <Box sx={{ bgcolor: "#FFFFFF", py: 5 }}>
      <Container maxWidth="lg" sx={{ fontFamily: "'Geist Sans', Arial, sans-serif" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha("#2C3E50", 0.1)
            }}
          >
            <PeopleAltRoundedIcon sx={{ color: "#2C3E50", fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#2C3E50">
            Clientes
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${alpha("#2C3E50", 0.12)}`, borderRadius: 2 }}>
          <Typography color="text.secondary">
            Contenido del módulo Clientes (Gestión del salón). Aquí se gestionará el listado de clientes.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Clientes;
