// ============================================
// COMPONENTE: LayoutConEncabezado.jsx
// ============================================

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Encabezados
import EncabezadoPublico from "../compartidos/EncabezadoPublico";

// Pies de página
import PieDePaginaPublico from "../compartidos/PieDePaginaPublico";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const LayoutConEncabezado = ({ children }) => {

  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isCliente = location.pathname.startsWith("/cliente");
  const isRecepcion = location.pathname.startsWith("/recepcion");
  const isPublico = !isAdmin && !isCliente && !isRecepcion;

  useEffect(() => {
    const cls = "publico-scroll-invisible";
    if (isPublico) {
      document.documentElement.classList.add(cls);
      document.body.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    }
    return () => {
      document.documentElement.classList.remove(cls);
      document.body.classList.remove(cls);
    };
  }, [isPublico]);

  let encabezado = null;
  let pie = null;

  // ============================================
  // SELECCIÓN DE LAYOUT SEGÚN RUTA
  // ============================================

  if (isAdmin || isRecepcion) {
    encabezado = null;
    pie = null;
  } else if (isCliente) {
    encabezado = null;
    pie = null;
  } else {
    // RUTAS PÚBLICAS
    encabezado = <EncabezadoPublico />;
    pie = <PieDePaginaPublico />;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`layout-container ${isPublico ? "layout-publico" : ""}`}>

      <header className={isPublico ? "layout-header-publico" : undefined}>
        {encabezado}
      </header>

      <main className={`layout-content ${isPublico ? "layout-content-publico" : ""}`}>
        {children}
      </main>

      <footer>
        {pie}
      </footer>

      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }

        .layout-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .layout-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          color: #000000;
        }

        header, footer {
          width: 100%;
        }

        /* ============================
           SOLO RUTAS PÚBLICAS
           - Encabezado fijo visible
           - Scroll normal de la página (footer al final)
           - Scrollbar derecho invisible
        ============================ */
        .layout-container.layout-publico .layout-header-publico {
          position: sticky;
          top: 0;
          z-index: 1200;
          flex: 0 0 auto;
        }

        html.publico-scroll-invisible,
        body.publico-scroll-invisible {
          -ms-overflow-style: none; /* IE/Edge legacy */
          scrollbar-width: none; /* Firefox */
        }

        html.publico-scroll-invisible::-webkit-scrollbar,
        body.publico-scroll-invisible::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
};

export default LayoutConEncabezado;
