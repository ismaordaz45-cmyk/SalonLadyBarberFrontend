import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import BarberPole from "../componentes/compartidos/BarberPole";
import apiClient from "../api";

const BarberActionOverlayContext = createContext(null);

/** Mínimo visible en overlay manual (login, logout, etc.) */
export const BARBER_OVERLAY_MIN_MS = 920;

/** GET: esperar antes de mostrar (evita destello en respuestas muy rápidas) */
export const BARBER_AXIOS_GET_DELAY_MS = 320;

/** Mínimo visible cuando el overlay lo dispara Axios (cargas en todo el proyecto) */
export const BARBER_AXIOS_MIN_VISIBLE_MS = 560;

/** Estado compartido entre axios default y apiClient */
const httpBarber = {
  pending: 0,
  delayTimer: null,
  shown: false,
  showRef: { current: null },
  hideRef: { current: null }
};

function attachBarberInterceptors(client) {
  const reqId = client.interceptors.request.use((config) => {
    if (config.barberOverlay === false) return config;

    httpBarber.pending += 1;
    if (httpBarber.pending === 1) {
      httpBarber.shown = false;
      const method = String(config.method || "get").toLowerCase();
      const mutating = ["post", "put", "patch", "delete"].includes(method);
      const msg =
        config.barberMessage ||
        (mutating ? "Guardando…" : "Cargando datos…");
      const headline = config.barberHeadline ? String(config.barberHeadline) : "";
      const minMs =
        config.barberMinMs != null
          ? Number(config.barberMinMs)
          : mutating
            ? BARBER_OVERLAY_MIN_MS
            : BARBER_AXIOS_MIN_VISIBLE_MS;

      if (mutating) {
        httpBarber.shown = true;
        httpBarber.showRef.current?.(msg, { minMs, headline });
      } else {
        httpBarber.delayTimer = setTimeout(() => {
          httpBarber.delayTimer = null;
          if (httpBarber.pending > 0 && !httpBarber.shown) {
            httpBarber.shown = true;
            httpBarber.showRef.current?.(msg, { minMs, headline });
          }
        }, BARBER_AXIOS_GET_DELAY_MS);
      }
    }
    return config;
  });

  const onDone = (config) => {
    if (!config || config.barberOverlay === false) return;
    httpBarber.pending = Math.max(0, httpBarber.pending - 1);
    if (httpBarber.pending === 0) {
      if (httpBarber.delayTimer) {
        clearTimeout(httpBarber.delayTimer);
        httpBarber.delayTimer = null;
      }
      if (httpBarber.shown) {
        httpBarber.hideRef.current?.();
      }
      httpBarber.shown = false;
    }
  };

  const resId = client.interceptors.response.use(
    (response) => {
      onDone(response.config);
      return response;
    },
    (error) => {
      onDone(error?.config);
      return Promise.reject(error);
    }
  );

  return () => {
    client.interceptors.request.eject(reqId);
    client.interceptors.response.eject(resId);
  };
}

export function BarberActionOverlayProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [headline, setHeadline] = useState("");
  const [mountKey, setMountKey] = useState(0);

  const openedAtRef = useRef(0);
  const hideTimeoutRef = useRef(null);
  const activeMinMsRef = useRef(BARBER_OVERLAY_MIN_MS);

  const show = useCallback((msg = "Un momento…", opts = {}) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    activeMinMsRef.current =
      opts.minMs != null ? Number(opts.minMs) : BARBER_OVERLAY_MIN_MS;
    openedAtRef.current = Date.now();
    const h =
      opts.headline != null && opts.headline !== ""
        ? String(opts.headline)
        : "";
    setHeadline(h);
    setMessage(String(msg || (h ? "" : "Un momento…")));
    setMountKey((k) => k + 1);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    const started = openedAtRef.current;
    if (started === 0) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    const elapsed = Date.now() - started;
    const minMs = activeMinMsRef.current;
    const wait = Math.max(0, minMs - elapsed);

    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      openedAtRef.current = 0;
      setOpen(false);
      setMessage("");
      setHeadline("");
    }, wait);
  }, []);

  const showRef = useRef(show);
  const hideRef = useRef(hide);
  showRef.current = show;
  hideRef.current = hide;

  useEffect(() => {
    httpBarber.showRef = showRef;
    httpBarber.hideRef = hideRef;
    const detachAxios = attachBarberInterceptors(axios);
    const detachApi = attachBarberInterceptors(apiClient);
    return () => {
      if (httpBarber.delayTimer) {
        clearTimeout(httpBarber.delayTimer);
        httpBarber.delayTimer = null;
      }
      httpBarber.pending = 0;
      httpBarber.shown = false;
      detachAxios();
      detachApi();
    };
  }, []);

  const runWithOverlay = useCallback(
    async (fn, msg = "Un momento…", opts = {}) => {
      show(msg, opts);
      try {
        return await fn();
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  const value = useMemo(
    () => ({ show, hide, runWithOverlay }),
    [show, hide, runWithOverlay]
  );

  return (
    <BarberActionOverlayContext.Provider value={value}>
      {children}
      {open && (
        <Box
          key={mountKey}
          className="barber-action-overlay-root"
          role="status"
          aria-live="polite"
          aria-busy="true"
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 20000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(6px)"
          }}
        >
          <Box
            className="barber-action-overlay-burst"
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0
            }}
          />
          <Box
            className="barber-action-overlay-flash"
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              background:
                "linear-gradient(118deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
              backgroundSize: "240% 100%",
              animation: "barberOverlayShimmer 1.2s ease-in-out infinite"
            }}
          />

          <Box
            className="barber-action-pole-wrap"
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5
            }}
          >
            <BarberPole size={96} width={18} />
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.25, opacity: 0.95 }}>
              <BarberPole size={36} width={9} />
              <BarberPole size={44} width={10} />
              <BarberPole size={36} width={9} />
            </Box>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.75,
              px: 2,
              maxWidth: 380,
              textAlign: "center"
            }}
          >
            {headline ? (
              <Typography
                component="p"
                sx={{
                  m: 0,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#F8FAFC",
                  fontWeight: 700,
                  fontSize: { xs: "1.35rem", sm: "1.55rem" },
                  letterSpacing: "0.02em",
                  lineHeight: 1.25,
                  textShadow: "0 2px 14px rgba(0,0,0,0.5)"
                }}
              >
                {headline}
              </Typography>
            ) : null}
            {message ? (
              <Typography
                component="p"
                sx={{
                  m: 0,
                  color: "rgba(248, 250, 252, 0.9)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  letterSpacing: "0.04em",
                  lineHeight: 1.45,
                  textShadow: "0 1px 8px rgba(0,0,0,0.45)"
                }}
              >
                {message}
              </Typography>
            ) : null}
          </Box>
        </Box>
      )}
    </BarberActionOverlayContext.Provider>
  );
}

export function useBarberActionOverlay() {
  const ctx = useContext(BarberActionOverlayContext);
  if (!ctx) {
    throw new Error(
      "useBarberActionOverlay debe usarse dentro de BarberActionOverlayProvider"
    );
  }
  return ctx;
}
