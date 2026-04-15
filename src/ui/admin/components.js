import { Box, Card } from "@mui/material";
import { alpha, keyframes, styled } from "@mui/material/styles";
import { ADMIN_PALETTE as P } from "./adminTokens";

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const GlassCard = styled(Card)(() => ({
  background: `linear-gradient(145deg, ${P.card} 0%, ${alpha(P.cream, 0.4)} 100%)`,
  backdropFilter: "blur(20px)",
  border: `1px solid ${alpha(P.accent, 0.15)}`,
  borderRadius: 20,
  boxShadow: `0 8px 32px ${alpha(P.navy, 0.08)}, 0 2px 8px ${alpha(P.accent, 0.04)}`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden",
  position: "relative",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 16px 48px ${alpha(P.navy, 0.12)}, 0 4px 16px ${alpha(P.accent, 0.08)}`,
    borderColor: alpha(P.accent, 0.3)
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${P.accent}, ${P.darkGold}, ${P.accent})`,
    backgroundSize: "200% 100%",
    animation: `${shimmer} 3s ease-in-out infinite`
  }
}));

export const IconWrapper = styled(Box)(({ bgcolor }) => ({
  width: 52,
  height: 52,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(145deg, ${alpha(bgcolor, 0.15)}, ${alpha(bgcolor, 0.08)})`,
  border: `1px solid ${alpha(bgcolor, 0.2)}`,
  transition: "all 0.3s ease"
}));

