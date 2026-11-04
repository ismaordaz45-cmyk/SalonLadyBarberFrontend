import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../auth/session";

const VoiceSearchContext = createContext(null);

export function VoiceSearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customCallback, setCustomCallback] = useState(null);
  const navigate = useNavigate();

  const openVoiceSearch = useCallback((callback = null) => {
    setCustomCallback(() => callback);
    setIsOpen(true);
  }, []);

  const closeVoiceSearch = useCallback(() => {
    setIsOpen(false);
    setCustomCallback(null);
  }, []);

  // Procesador inteligente de voz: interpreta lo hablado
  const processVoiceResult = useCallback(
    (query) => {
      if (!query || !query.trim()) return;

      const normalized = query.trim().toLowerCase();
      console.log("🗣️ [Voz] Comando recibido:", normalized);

      // 1. Si quien abrió la búsqueda pasó su propio callback, entregárselo
      if (customCallback) {
        customCallback(query.trim());
        closeVoiceSearch();
        return;
      }

      // 2. Interpretar contexto y roles
      const user = getStoredUser();
      const rol = user?.rol; // 'PROPIETARIA', 'EMPLEADA', 'CLIENTE'

      // ============================================
      // A. COMANDOS DE NAVEGACIÓN DIRECTA POR VOZ
      // ============================================

      // Citas
      if (normalized.includes("cita") || normalized.includes("agenda")) {
        if (rol === "PROPIETARIA") {
          navigate("/admin/citas");
        } else if (rol === "EMPLEADA") {
          navigate("/recepcion/citas");
        } else if (rol === "CLIENTE") {
          navigate("/cliente/mis-citas");
        } else {
          navigate("/login");
        }
        closeVoiceSearch();
        return;
      }

      // Inventario / Productos
      if (normalized.includes("inventario") || normalized.includes("insumo") || normalized.includes("stock")) {
        if (rol === "PROPIETARIA") {
          navigate("/admin/inventario");
        } else if (rol === "EMPLEADA") {
          navigate("/recepcion/ventas");
        } else if (rol === "CLIENTE") {
          navigate("/cliente/productos");
        } else {
          navigate("/catalogo");
        }
        closeVoiceSearch();
        return;
      }

      // Barberos / Estilistas / Personal
      if (normalized.includes("barbero") || normalized.includes("estilista") || normalized.includes("empleada") || normalized.includes("personal")) {
        if (rol === "PROPIETARIA") {
          navigate("/admin/barberos");
        } else if (rol === "EMPLEADA") {
          navigate("/recepcion/horarios");
        } else {
          navigate("/catalogo");
        }
        closeVoiceSearch();
        return;
      }

      // Servicios / Cortes / Peinados
      if (normalized === "servicios" || normalized === "cortes" || normalized === "ver servicios") {
        if (rol === "PROPIETARIA") {
          navigate("/admin/servicios");
        } else if (rol === "CLIENTE") {
          navigate("/cliente/servicios");
        } else {
          navigate("/servicios");
        }
        closeVoiceSearch();
        return;
      }

      // Clientes
      if (normalized.includes("cliente")) {
        if (rol === "PROPIETARIA") {
          navigate("/admin/clientes");
        } else if (rol === "EMPLEADA") {
          navigate("/recepcion/clientes");
        }
        closeVoiceSearch();
        return;
      }

      // Auditoría / Caja
      if (normalized.includes("caja") || normalized.includes("auditoria") || normalized.includes("corte de caja")) {
        if (rol === "PROPIETARIA") {
          navigate("/admin/auditoria-caja");
        }
        closeVoiceSearch();
        return;
      }

      // Promociones / Novedades
      if (normalized.includes("promocion") || normalized.includes("oferta") || normalized.includes("novedad")) {
        if (rol === "PROPIETARIA") {
          navigate("/admin/promociones");
        } else {
          navigate("/novedades");
        }
        closeVoiceSearch();
        return;
      }

      // Inicio / Home
      if (normalized === "inicio" || normalized === "ir a inicio" || normalized === "home" || normalized === "principal") {
        if (rol === "PROPIETARIA") {
          navigate("/admin");
        } else if (rol === "EMPLEADA") {
          navigate("/recepcion");
        } else if (rol === "CLIENTE") {
          navigate("/cliente");
        } else {
          navigate("/");
        }
        closeVoiceSearch();
        return;
      }

      // Reservar cita
      if (normalized.includes("reservar") || normalized.includes("agendar") || normalized.includes("apartar")) {
        if (rol === "CLIENTE") {
          navigate("/cliente/servicios");
        } else {
          navigate("/login");
        }
        closeVoiceSearch();
        return;
      }

      // ============================================
      // B. BÚSQUEDA GENERAL DE TÉRMINO (Servicios, productos, cortes, etc.)
      // ============================================
      if (rol === "CLIENTE") {
        navigate(`/cliente/productos?q=${encodeURIComponent(query.trim())}`);
      } else {
        navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
      }
      closeVoiceSearch();
    },
    [customCallback, navigate, closeVoiceSearch]
  );

  return (
    <VoiceSearchContext.Provider
      value={{
        isOpen,
        openVoiceSearch,
        closeVoiceSearch,
        processVoiceResult
      }}
    >
      {children}
    </VoiceSearchContext.Provider>
  );
}

export function useVoiceSearchContext() {
  const context = useContext(VoiceSearchContext);
  if (!context) {
    throw new Error("useVoiceSearchContext debe ser usado dentro de un VoiceSearchProvider");
  }
  return context;
}

