import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";

import MigasDePan from "./componentes/compartidos/MigasDePan";

import LayoutConEncabezado from "./componentes/layout/LayoutConEncabezado";
import AdminLayout from "./componentes/layout/AdminLayout";
import ProtectedRoute from "./auth/ProtectedRoute";

// ===== Páginas / vistas disponibles =====
import PaginaPrincipalPublico from "./paginas/PaginaPrincipalPublico";
import PaginaCatalogoPublico from "./paginas/PaginaCatalogoPublico";
import PaginaNosotrosPublico from "./paginas/PaginaNosotrosPublico";
import PaginaNovedadesPublico from "./paginas/PaginaNovedadesPublico";
import PaginaPrincipalAdministrativa from "./paginas/PaginaPrincipalAdminitrativo";
import PaginaAdminBaseDatos from "./paginas/PaginaAdminBaseDatos";
import PaginaPrincipalCliente from "./paginas/PaginaPrincipalCliente";
import PaginaPrincipalRecepcion from "./paginas/PaginaPrincipalRecepcion";
import PaginaError404 from "./paginas/PaginaError404";
import PaginaError501 from "./paginas/PaginaError501";
import Login from "./componentes/autenticacion/Login";
import Registro from "./componentes/autenticacion/Registro";

// ===== Componentes administrativa (PROPIETARIA) =====
import Perfil from "./componentes/administrativa/datosEmpresa/Perfil";
import Terminos from "./componentes/administrativa/datosEmpresa/Terminos";
import Politicas from "./componentes/administrativa/datosEmpresa/Politicas";
import Mision from "./componentes/administrativa/datosEmpresa/Mision";
import Vision from "./componentes/administrativa/datosEmpresa/Vision";
import Citas from "./componentes/administrativa/gestionSalon/Citas";
import Servicios from "./componentes/administrativa/gestionSalon/Servicios";
import Barberos from "./componentes/administrativa/gestionSalon/Barberos";
import Clientes from "./componentes/administrativa/gestionSalon/Clientes";
import Inventario from "./componentes/administrativa/gestionSalon/Inventario";
import Promociones from "./componentes/administrativa/gestionSalon/Promociones";


// ============================================
// Layout público usando componentes nuevos
// ============================================
const LayoutPublico = ({ children }) => {
  return (
    <>
      <MigasDePan />
      {children}
    </>
  );
};


// ============================================
// APP
// ============================================
const App = () => {
  return (
    <LayoutConEncabezado>
      <Routes>

        <Route
          path="/"
          element={
            <LayoutPublico>
              <PaginaPrincipalPublico />
            </LayoutPublico>
          }
        />

        <Route
          path="/login"
          element={
            <LayoutPublico>
              <Login />
            </LayoutPublico>
          }
        />

        <Route
          path="/registro"
          element={
            <LayoutPublico>
              <Registro />
            </LayoutPublico>
          }
        />

        <Route
          path="/catalogo"
          element={
            <LayoutPublico>
              <PaginaCatalogoPublico />
            </LayoutPublico>
          }
        />

        <Route
          path="/servicios"
          element={
            <LayoutPublico>
              <PaginaCatalogoPublico />
            </LayoutPublico>
          }
        />

        <Route
          path="/nosotros"
          element={
            <LayoutPublico>
              <PaginaNosotrosPublico />
            </LayoutPublico>
          }
        />

        <Route
          path="/novedades"
          element={
            <LayoutPublico>
              <PaginaNovedadesPublico />
            </LayoutPublico>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <PaginaPrincipalAdministrativa />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/perfil"
          element={
            <AdminLayout>
              <Perfil />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/terminos"
          element={
            <AdminLayout>
              <Terminos />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/politicas"
          element={
            <AdminLayout>
              <Politicas />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/mision"
          element={
            <AdminLayout>
              <Mision />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/vision"
          element={
            <AdminLayout>
              <Vision />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/citas"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA", "EMPLEADA"]}>
              <AdminLayout>
                <Citas />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/servicios"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA", "EMPLEADA"]}>
              <AdminLayout>
                <Servicios />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/barberos"
          element={
            <AdminLayout>
              <Barberos />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/clientes"
          element={
            <AdminLayout>
              <Clientes />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/inventario"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA", "EMPLEADA"]}>
              <AdminLayout>
                <Inventario />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/estadisticas"
          element={
            <AdminLayout>
              <PaginaError501
                modulo="Estadísticas"
                descripcion="El módulo de estadísticas está en construcción."
              />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <AdminLayout>
              <PaginaError501
                modulo="Reportes"
                descripcion="El módulo de reportes estará disponible próximamente."
              />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/pagos"
          element={
            <AdminLayout>
              <PaginaError501
                modulo="Pagos"
                descripcion="El módulo de pagos aún no ha sido desarrollado."
              />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/configuracion"
          element={
            <AdminLayout>
              <PaginaError501
                modulo="Configuración"
                descripcion="La configuración avanzada todavía no está disponible."
              />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/promociones"
          element={
            <AdminLayout>
              <Promociones />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/base-datos"
          element={
            <AdminLayout>
              <PaginaAdminBaseDatos />
            </AdminLayout>
          }
        />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute allowedRoles={["CLIENTE"]}>
              <LayoutPublico>
                <PaginaPrincipalCliente />
              </LayoutPublico>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recepcion"
          element={
            <ProtectedRoute allowedRoles={["EMPLEADA"]}>
              <LayoutPublico>
                <PaginaPrincipalRecepcion />
              </LayoutPublico>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <LayoutPublico>
              <PaginaError404 />
            </LayoutPublico>
          }
        />

      </Routes>
    </LayoutConEncabezado>
  );
};

export default App;