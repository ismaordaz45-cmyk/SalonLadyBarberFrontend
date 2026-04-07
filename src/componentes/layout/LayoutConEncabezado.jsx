// ============================================
// COMPONENTE: LayoutConEncabezado.jsx
// ============================================

import React from "react";
import { useLocation } from "react-router-dom";

// Encabezados
import EncabezadoPublico from "../compartidos/EncabezadoPublico";
import EncabezadoCliente from "../compartidos/EncabezadoCliente";

// Pies de página
import PieDePaginaPublico from "../compartidos/PieDePaginaPublico";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const LayoutConEncabezado = ({ children }) => {

  const location = useLocation();

  let encabezado = null;
  let pie = null;

  // ============================================
  // SELECCIÓN DE LAYOUT SEGÚN RUTA
  // (versión limpia – sin auth ni roles todavía)
  // ============================================

  if (location.pathname.startsWith("/admin")) {
    encabezado = null;
    pie = null;
  } else if (location.pathname.startsWith("/cliente")) {
    encabezado = <EncabezadoCliente />;
    pie = <PieDePaginaPublico />;

  } else {

    // RUTAS PÚBLICAS (por ahora todo lo demás)
    encabezado = <EncabezadoPublico />;
    pie = <PieDePaginaPublico />;

  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="layout-container">

      <header>
        {encabezado}
      </header>

      <main className="layout-content">
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
          background-color: #ffffff;
          color: #000000;
        }

        header, footer {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default LayoutConEncabezado;