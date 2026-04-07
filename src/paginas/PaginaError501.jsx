import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

function PaginaError501({ modulo = "Módulo", descripcion = "" }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${alpha("#E8DED2", 0.45)} 0%, ${alpha("#FFFFFF", 0.9)} 100%)`,
        px: 2,
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            textAlign: "center",
            border: `1px solid ${alpha("#2C3E50", 0.16)}`
          }}
        >
          <ConstructionRoundedIcon sx={{ fontSize: 62, color: "#D97706", mb: 1.5 }} />

          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: "#1A252F"
            }}
          >
            501
          </Typography>

          <Typography variant="h6" sx={{ mt: 1, color: "#1A252F", fontWeight: 600 }}>
            {modulo} no disponible aún
          </Typography>

          <Typography sx={{ mt: 1.5, color: "#4B5563" }}>
            {descripcion || "Esta sección todavía no está desarrollada."}
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin")}
            sx={{
              mt: 3,
              background: "linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1A252F 0%, #2C3E50 100%)"
              }
            }}
          >
            Volver al panel
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default PaginaError501;
