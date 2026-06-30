import React, { useState } from "react";
import { Box, Paper, Typography, Tabs, Tab, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";

import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import BackupRoundedIcon from "@mui/icons-material/BackupRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import CsvImportExport from "../componentes/administrativa/baseDatos/CsvImportExport";
import MonitorDashboard from "../componentes/administrativa/baseDatos/MonitorDashboard";
import Respaldo from "../componentes/administrativa/baseDatos/Respaldo";

import AdminPageShell from "../ui/admin/AdminPageShell";
import AdminHeader from "../ui/admin/AdminHeader";
import { GlassCard } from "../ui/admin/components";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";

function PaginaAdminBaseDatos() {
  const [tabActiva, setTabActiva] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const generarRespaldo = async () => {
  try {
    setCargando(true);
    setMensaje("Generando respaldo...");

    const res = await fetch("https://salonladybarberbackend.onrender.com/api/respaldo/generar", {
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
    <AdminPageShell maxWidth="md" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Sistema"
        title="Base de datos"
        subtitle="Respaldo, importación/exportación y monitoreo."
        icon={<StorageRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
        right={
          <Button
            variant="contained"
            color="primary"
            startIcon={<BackupRoundedIcon />}
            onClick={generarRespaldo}
            disabled={cargando}
          >
            {cargando ? "Generando..." : "Generar respaldo"}
          </Button>
        }
      />

      <GlassCard elevation={0} sx={{ borderRadius: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "transparent" }}>
          <Box sx={{ px: { xs: 2.5, md: 3 }, py: 2.5 }}>
            {mensaje ? (
              <Typography sx={{ color: P.secondary, fontWeight: 700, mb: 2 }}>
                {mensaje}
              </Typography>
            ) : null}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${alpha(P.border, 0.9)}`,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "transparent"
              }}
            >
              <Tabs
                value={tabActiva}
                onChange={handleCambiarTab}
                sx={{
                  borderBottom: `1px solid ${alpha(P.border, 0.9)}`,
                  bgcolor: alpha(P.navy, 0.06),
                  "& .MuiTab-root": { fontWeight: 700, textTransform: "none" },
                  "& .Mui-selected": { color: P.navy }
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
                  <Respaldo embedded />
                ) : tabActiva === 1 ? (
                  <CsvImportExport mostrarTitulo={false} />
                ) : (
                  <MonitorDashboard />
                )}
              </Box>
            </Paper>
          </Box>
        </Paper>
      </GlassCard>
    </AdminPageShell>
  );
}

export default PaginaAdminBaseDatos;
