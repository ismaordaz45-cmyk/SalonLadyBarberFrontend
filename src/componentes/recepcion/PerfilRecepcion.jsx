import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Stack,
  CardContent,
  Chip
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  EmailRounded,
  AdminPanelSettingsRounded,
  PhoneRounded
} from "@mui/icons-material";
import { GlassCard } from "../../ui/admin/components";
import { ADMIN_PALETTE as P } from "../../ui/admin/adminTokens";
import ConectarAlexa from "../autenticacion/ConectarAlexa";

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PerfilRecepcion() {
  const user = useMemo(() => readStoredUser(), []);
  const name = user?.nombre || user?.correo || "Recepción";
  const email = user?.correo || "recepcion@ladybarber.com";
  const phone = user?.telefono || "—";

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease" }}>
      {/* Cabecera */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#1E3A5F",
            fontFamily: '"Cinzel", ui-serif, Georgia, serif',
            letterSpacing: "-0.01em"
          }}
        >
          Mi Perfil
        </Typography>
        <Typography sx={{ color: "#64748B", mt: 0.5, fontSize: "0.9rem", fontWeight: 650 }}>
          Detalles de tu cuenta y vinculación con la Skill de Alexa.
        </Typography>
      </Box>

      <Grid container spacing={3.5}>
        {/* Tarjeta Detalle Perfil */}
        <Grid item xs={12} md={6}>
          <GlassCard elevation={0} sx={{ height: "100%" }}>
            <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <Box sx={{ position: "relative", mb: 3 }}>
                <Avatar
                  sx={{
                    width: 90,
                    height: 90,
                    bgcolor: P.navy,
                    color: "#FFFFFF",
                    fontSize: "2.2rem",
                    fontWeight: 900,
                    border: "3.5px solid #E2E8F0",
                    boxShadow: "0 10px 24px rgba(30, 58, 90, 0.12)"
                  }}
                >
                  {name.charAt(0).toUpperCase()}
                </Avatar>
                {/* Status Indicator */}
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    bgcolor: "#22C55E",
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    border: "3px solid #FFFFFF"
                  }}
                />
              </Box>

              <Typography sx={{ fontWeight: 900, color: P.navy, fontSize: "1.3rem" }}>
                {name}
              </Typography>
              
              <Chip
                icon={<AdminPanelSettingsRounded sx={{ color: `${P.accent} !important`, fontSize: 16 }} />}
                label="Recepcionista Autorizada"
                size="small"
                sx={{
                  mt: 1.5,
                  mb: 4,
                  bgcolor: alpha(P.accent, 0.14),
                  color: P.navy,
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  px: 1
                }}
              />

              <Stack spacing={2.2} sx={{ width: "100%", textAlign: "left", px: { xs: 0, sm: 2 } }}>
                {/* Email */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: alpha(P.navy, 0.05), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EmailRounded sx={{ color: P.navy, fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: P.secondary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                      Correo Electrónico
                    </Typography>
                    <Typography sx={{ fontSize: "0.88rem", color: P.primary, fontWeight: 800 }}>
                      {email}
                    </Typography>
                  </Box>
                </Stack>

                {/* Teléfono */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: alpha(P.navy, 0.05), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PhoneRounded sx={{ color: P.navy, fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "0.72rem", color: P.secondary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                      Teléfono
                    </Typography>
                    <Typography sx={{ fontSize: "0.88rem", color: P.primary, fontWeight: 800 }}>
                      {phone}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Tarjeta Alexa Vinculación */}
        <Grid item xs={12} md={6}>
          <ConectarAlexa />
        </Grid>
      </Grid>
    </Box>
  );
}
