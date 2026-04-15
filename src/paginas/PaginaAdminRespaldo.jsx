import React from "react";
import { alpha } from "@mui/material/styles";
import BackupRoundedIcon from "@mui/icons-material/BackupRounded";

import Respaldo from "../componentes/administrativa/baseDatos/Respaldo";
import AdminPageShell from "../ui/admin/AdminPageShell";
import AdminHeader from "../ui/admin/AdminHeader";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";

function PaginaAdminRespaldo() {
  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Sistema"
        title="Respaldo automático"
        subtitle="Genera, descarga y revisa el historial de respaldos."
        icon={<BackupRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
      />
      <Respaldo embedded />
    </AdminPageShell>
  );
}

export default PaginaAdminRespaldo;

