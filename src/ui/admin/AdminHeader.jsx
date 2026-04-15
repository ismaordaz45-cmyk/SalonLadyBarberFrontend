import React from "react";
import { Box, CardContent, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import { GlassCard } from "./components";
import { ADMIN_PALETTE as P } from "./adminTokens";

export default function AdminHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  right,
  showBarberiaChip = true
}) {
  return (
    <GlassCard
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 4,
        border: "0px solid transparent",
        color: "#fff",
        background: "linear-gradient(90deg, #0B1220 0%, #0F172A 35%, #0B1220 100%)",
        boxShadow: "0 26px 70px rgba(2,6,23,0.28)"
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 260px at 20% 0%, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0) 62%), radial-gradient(900px 260px at 90% 25%, rgba(212,175,56,0.18) 0%, rgba(212,175,56,0) 58%)"
          }}
          aria-hidden
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
          sx={{ position: "relative" }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)"
              }}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              {eyebrow ? (
                <Typography
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    color: alpha(P.accent, 0.95)
                  }}
                >
                  {eyebrow}
                </Typography>
              ) : null}
              <Typography
                className="pcDisplay"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.45rem", md: "2rem" },
                  lineHeight: 1.12,
                  mt: 0.35,
                  color: "#FFFFFF"
                }}
              >
                {title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                {showBarberiaChip ? (
                  <Chip
                    icon={<ContentCutRoundedIcon sx={{ fontSize: 14 }} />}
                    label="Barbería"
                    size="small"
                    sx={{
                      bgcolor: alpha(P.accent, 0.15),
                      color: alpha(P.accent, 0.95),
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      "& .MuiChip-icon": { color: P.accent }
                    }}
                  />
                ) : null}
                {subtitle ? (
                  <Typography sx={{ color: alpha("#CBD5E1", 0.92), lineHeight: 1.55, fontSize: "0.92rem" }}>
                    {subtitle}
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          </Stack>
          {right || null}
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

