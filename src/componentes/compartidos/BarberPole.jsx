// ============================================
// Poste de barbero decorativo (rayas en movimiento)
// ============================================

import React from "react";
import { Box } from "@mui/material";

/**
 * @param {"vertical" | "horizontal"} variant
 * @param {number} size — alto (vertical) o grosor (horizontal) en px aprox.
 * @param {boolean} fullHeight — vertical: el cilindro crece (top→bottom); usar con padre `position:relative` + `height` o `top`/`bottom` absolutos.
 */
const BarberPole = ({
  variant = "vertical",
  size = 44,
  width = 12,
  fullHeight = false,
  sx = {},
  "aria-hidden": ariaHidden = true
}) => {
  const isVertical = variant === "vertical";

  const stripeBg = {
    backgroundImage: `repeating-linear-gradient(
      -28deg,
      #b91c1c 0px 9px,
      #f8fafc 9px 18px,
      #1e40af 18px 27px,
      #f8fafc 27px 36px
    )`,
    backgroundSize: isVertical ? "200% 200%" : "120px 100%",
    animation: isVertical
      ? "barberPoleScrollY 1.1s linear infinite"
      : "barberPoleScrollX 1.4s linear infinite"
  };

  if (!isVertical) {
    const h = Math.max(6, Math.round(size / 6));
    return (
      <Box
        aria-hidden={ariaHidden}
        sx={{
          width: "100%",
          height: h,
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid rgba(15,23,42,0.18)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
          ...stripeBg,
          ...sx
        }}
      />
    );
  }

  const w = Math.max(8, width);
  const capW = w + 6;
  const capH = Math.max(10, capW * 0.42);
  const baseW = w + 10;

  if (fullHeight) {
    return (
      <Box
        aria-hidden={ariaHidden}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          height: "100%",
          minHeight: 0,
          pointerEvents: "none",
          ...sx
        }}
      >
        <Box
          sx={{
            width: capW,
            height: capH,
            flexShrink: 0,
            borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            bgcolor: "#cbd5e1",
            border: "1px solid #94a3b8",
            boxShadow: "inset 0 -2px 0 rgba(15,23,42,0.12)"
          }}
        />
        <Box
          sx={{
            width: w,
            flex: 1,
            minHeight: 48,
            borderRadius: "2px",
            overflow: "hidden",
            border: "2px solid #64748b",
            borderTop: "none",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.2), 0 4px 14px rgba(15,23,42,0.2)",
            mt: "-1px",
            ...stripeBg
          }}
        />
        <Box
          sx={{
            width: baseW,
            height: 6,
            flexShrink: 0,
            borderRadius: "0 0 3px 3px",
            bgcolor: "#475569",
            border: "1px solid #334155",
            mt: "-1px"
          }}
        />
      </Box>
    );
  }

  const h = Math.max(28, size);

  return (
    <Box
      aria-hidden={ariaHidden}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0,
        ...sx
      }}
    >
      <Box
        sx={{
          width: capW,
          height: capH,
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
          bgcolor: "#cbd5e1",
          border: "1px solid #94a3b8",
          boxShadow: "inset 0 -2px 0 rgba(15,23,42,0.12)"
        }}
      />
      <Box
        sx={{
          width: w,
          height: h,
          borderRadius: "4px 4px 2px 2px",
          overflow: "hidden",
          border: "2px solid #64748b",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.25), 0 2px 8px rgba(15,23,42,0.15)",
          mt: "-1px",
          ...stripeBg
        }}
      />
      <Box
        sx={{
          width: baseW,
          height: 5,
          borderRadius: "0 0 3px 3px",
          bgcolor: "#475569",
          border: "1px solid #334155",
          mt: "-1px"
        }}
      />
    </Box>
  );
};

export default BarberPole;
