import React from "react";
import { alpha } from "@mui/material/styles";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

import CsvImportExport from "../componentes/administrativa/baseDatos/CsvImportExport";
import AdminPageShell from "../ui/admin/AdminPageShell";
import AdminHeader from "../ui/admin/AdminHeader";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";

function PaginaAdminImportExport() {
  return (
    <AdminPageShell maxWidth="lg" sx={{ "& .pcDisplay": { fontFamily: '"Cinzel", ui-serif, Georgia, serif' } }}>
      <AdminHeader
        eyebrow="Sistema"
        title="Importación y exportación"
        subtitle="Gestiona datos con archivos CSV (plantillas, exportación e importación)."
        icon={<UploadFileRoundedIcon sx={{ color: alpha(P.accent, 0.95), fontSize: 28 }} />}
      />
      <CsvImportExport mostrarTitulo={false} />
    </AdminPageShell>
  );
}

export default PaginaAdminImportExport;

