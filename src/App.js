import React from "react";
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import { BarberActionOverlayProvider } from "./context/BarberActionOverlayContext";
import MigasDePan from "./componentes/compartidos/MigasDePan";

import LayoutConEncabezado from "./componentes/layout/LayoutConEncabezado";
import AdminLayout from "./componentes/layout/AdminLayout";
import ClienteLayout from "./componentes/layout/ClienteLayout";
import ProtectedRoute from "./auth/ProtectedRoute";

// ===== Páginas / vistas disponibles =====
import PaginaPrincipalPublico from "./paginas/PaginaPrincipalPublico";
import PaginaCatalogoPublico from "./paginas/PaginaCatalogoPublico";
import PaginaNosotrosPublico from "./paginas/PaginaNosotrosPublico";
import PaginaNovedadesPublico from "./paginas/PaginaNovedadesPublico";
import PaginaPrincipalAdministrativa from "./paginas/PaginaPrincipalAdminitrativo";
import PaginaAdminRespaldo from "./paginas/PaginaAdminRespaldo";
import PaginaAdminImportExport from "./paginas/PaginaAdminImportExport";
import PaginaAdminMonitoreo from "./paginas/PaginaAdminMonitoreo";
import InicioCliente from "./componentes/cliente/InicioCliente";
import ServiciosClienteReservar from "./componentes/cliente/ServiciosClienteReservar";
import ProductosCliente from "./componentes/cliente/ProductosCliente";
import MisCitasCliente from "./componentes/cliente/MisCitasCliente";
import MiPerfilCliente from "./componentes/cliente/MiPerfilCliente";
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
import Estadisticas from "./componentes/administrativa/gestionSalon/Estadisticas";
import ProyeccionCitas from "./componentes/administrativa/gestionSalon/ProyeccionCitas";


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
    <BarberActionOverlayProvider>
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
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Perfil />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/terminos"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Terminos />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/politicas"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Politicas />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mision"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Mision />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vision"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Vision />
              </AdminLayout>
            </ProtectedRoute>
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
            <ProtectedRoute allowedRoles={["PROPIETARIA", "EMPLEADA"]}>
              <AdminLayout>
                <Barberos />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clientes"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Clientes />
              </AdminLayout>
            </ProtectedRoute>
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
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Estadisticas />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/proyeccion-citas"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <ProyeccionCitas />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <PaginaError501
                  modulo="Reportes"
                  descripcion="El módulo de reportes estará disponible próximamente."
                />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pagos"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <PaginaError501
                  modulo="Pagos"
                  descripcion="El módulo de pagos aún no ha sido desarrollado."
                />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/configuracion"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <PaginaError501
                  modulo="Configuración"
                  descripcion="La configuración avanzada todavía no está disponible."
                />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/promociones"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA", "EMPLEADA"]}>
              <AdminLayout>
                <Promociones />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/base-datos"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <Navigate to="/admin/base-datos/respaldo" replace />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/base-datos/respaldo"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <PaginaAdminRespaldo />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/base-datos/import-export"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <PaginaAdminImportExport />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/base-datos/monitoreo"
          element={
            <ProtectedRoute allowedRoles={["PROPIETARIA"]}>
              <AdminLayout>
                <PaginaAdminMonitoreo />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cliente"
          element={
            <ProtectedRoute allowedRoles={["CLIENTE"]}>
              <ClienteLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InicioCliente />} />
          <Route path="servicios" element={<ServiciosClienteReservar />} />
          <Route path="productos" element={<ProductosCliente />} />
          <Route path="citas" element={<MisCitasCliente />} />
          <Route path="perfil" element={<MiPerfilCliente />} />
          <Route path="*" element={<Navigate to="/cliente" replace />} />
        </Route>

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
    </BarberActionOverlayProvider>
  );
};

export default App;