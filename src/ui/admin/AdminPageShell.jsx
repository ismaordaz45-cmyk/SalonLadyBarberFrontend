import React from "react";
import { Box, Container } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ADMIN_PALETTE as P } from "./adminTokens";

export default function AdminPageShell({ maxWidth = "lg", children, sx }) {
  return (
    <Box
      sx={{
        bgcolor: P.pageBg,
        minHeight: "100%",
        py: { xs: 2, md: 3 },
        background: `linear-gradient(180deg, ${P.pageBg} 0%, ${alpha(P.cream, 0.3)} 100%)`,
        ...sx
      }}
    >
      <Container maxWidth={maxWidth} disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}

