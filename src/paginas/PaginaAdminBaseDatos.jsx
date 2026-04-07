import React, { useState } from "react";
import { Box, Container, Paper, Typography, Button, Tabs, Tab } from "@mui/material";
import { alpha } from "@mui/material/styles";

import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import BackupRoundedIcon from "@mui/icons-material/BackupRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import CsvImportExport from "../componentes/administrativa/baseDatos/CsvImportExport";
import MonitorDashboard from "../componentes/administrativa/baseDatos/MonitorDashboard";

function PaginaAdminBaseDatos() {
  const COLORS = {
    bg: "#F1F5F9",
    surface: "#FFFFFF",
    surfaceAlt: "#F8FAFC",
    border: "#E2E8F0",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    primary: "#1E293B"
  };

  const [tabActiva, setTabActiva] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const generarRespaldo = async () => {
  try {
    setCargando(true);
    setMensaje("Generando respaldo...");

    const res = await fetch("http://localhost:4000/api/respaldo/generar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    let data = null;

    try {
      data = await res.json();
    } catch {
      throw new Error("Respuesta inválida del servidor");
    }

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || "Error al generar respaldo");
    }

    setMensaje("✅ Respaldo generado y subido correctamente");

    console.log("Archivo:", data.archivo);
    console.log("Drive ID:", data.driveId);

  } catch (error) {
    console.error(error);
    setMensaje("❌ " + error.message);
  } finally {
    setCargando(false);
  }
};

  const handleCambiarTab = (_event, value) => setTabActiva(value);
  return (
    <Box
      sx={{
        bgcolor: COLORS.bg,
        py: 1,
        fontFamily: "'Geist Sans', Arial, sans-serif"
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.surfaceAlt} 100%)`,
              color: COLORS.textPrimary,
              px: { xs: 3, md: 4 },
              py: 4,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderBottom: `1px solid ${COLORS.border}`
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(COLORS.primary, 0.1)
              }}
            >
              <StorageRoundedIcon sx={{ fontSize: 30, color: COLORS.primary }} />
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: { xs: "1.9rem", md: "2.2rem" },
                  color: COLORS.textPrimary
                }}
              >
                Admin Base de datos
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: COLORS.textSecondary, fontSize: { xs: "1rem", md: "1.05rem" } }}
              >
                Herramientas para administración y respaldos.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: { xs: 3, md: 4 }, py: 4 }}>
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 3,
                overflow: "hidden"
              }}
            >
              <Tabs
                value={tabActiva}
                onChange={handleCambiarTab}
                sx={{
                  borderBottom: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.surfaceAlt,
                  "& .MuiTab-root": { fontWeight: 700, textTransform: "none" },
                  "& .Mui-selected": { color: COLORS.primary }
                }}
              >
                <Tab
                  icon={<BackupRoundedIcon />}
                  iconPosition="start"
                  label="Respaldo automático"
                />
                <Tab
                  icon={<UploadFileRoundedIcon />}
                  iconPosition="start"
                  label="Importar / Exportar CSV"
                />
                <Tab
                  icon={<MonitorHeartRoundedIcon />}
                  iconPosition="start"
                  label="Monitoreo"
                />
              </Tabs>

              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                {tabActiva === 0 ? (
                  <>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{ color: COLORS.textPrimary, mb: 1.5, fontSize: { xs: "1.2rem", md: "1.35rem" } }}
                    >
                      Respaldo automático
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: COLORS.textSecondary, mb: 3, fontSize: { xs: "1rem", md: "1.05rem" } }}
                    >
                      ESTE SECCION ES PARA GENEREAR UN RESPALDO DE LA BASE
                      DE DATOS DE EMERGENCIA
                    </Typography>

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<BackupRoundedIcon />}
                      onClick={generarRespaldo}
                      disabled={cargando}
                      sx={{
                        backgroundColor: COLORS.primary,
                        color: "#FFFFFF",
                        fontWeight: 700,
                        px: 3.5,
                        py: 1.4,
                        borderRadius: 3,
                        "&:hover": {
                          backgroundColor: "#0F172A"
                        }
                      }}
                    >
                      {cargando ? "Generando..." : "Generar respaldo automático"}
                    </Button>
                    {mensaje && (
                      <Typography sx={{ mt: 2 }}>
                        {mensaje}
                      </Typography>
                    )}
                  </>
                ) : tabActiva === 1 ? (
                  <CsvImportExport mostrarTitulo={false} />
                ) : (
                  <MonitorDashboard />
                )}
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default PaginaAdminBaseDatos;
