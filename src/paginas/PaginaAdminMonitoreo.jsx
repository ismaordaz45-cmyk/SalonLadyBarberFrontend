import React from "react";
import { alpha } from "@mui/material/styles";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";

import MonitorDashboard from "../componentes/administrativa/baseDatos/MonitorDashboard";
import AdminPageShell from "../ui/admin/AdminPageShell";
import AdminHeader from "../ui/admin/AdminHeader";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";

function PaginaAdminMonitoreo() {
  return (
    <AdminPageShell maxWidth="xl" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Sistema"
        title="Monitoreo"
        subtitle="Estado en tiempo real del servidor y base de datos."
        icon={<MonitorHeartRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
      />
      <MonitorDashboard />
    </AdminPageShell>
  );
}

export default PaginaAdminMonitoreo;

