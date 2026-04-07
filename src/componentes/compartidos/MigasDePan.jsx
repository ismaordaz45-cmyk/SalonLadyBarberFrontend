// ============================================
// COMPONENTE: MigasDePan.jsx
// ============================================
// Migas de navegación dinámicas
// Ubicación: src/componentes/compartidos/MigasDePan.jsx
// Funcionalidad: Muestra la ruta actual de navegación automáticamente
// Basado en la URL actual y un mapa de rutas amigables

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Sección: Importaciones de Material-UI
import { Box, Typography, Breadcrumbs as MuiBreadcrumbs } from '@mui/material';

// Sección: Iconos de Material-UI
import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';

// ============================================
// MAPA DE RUTAS (nombres legibles)
// Alineado a tu frontend limpio
// ============================================

const rutasALabel = {
  '/': 'Inicio',

  // Autenticación
  '/login': 'Iniciar sesión',
  '/registro': 'Registro',
  '/recovery': 'Recuperar contraseña',

  // Público
  '/contacto': 'Contáctanos',
  '/ayuda': 'Ayuda',
  '/mapa-sitio': 'Mapa del sitio',
  '/chat': 'Chat',

  // Páginas principales por rol (PROPIETARIA→/admin, EMPLEADA→/recepcion, CLIENTE→/cliente)
  '/admin': 'Administración',
  '/cliente': 'Área cliente',
  '/recepcion': 'Recepción',

  // Errores
  '/error/400': 'Error 400',
  '/error/500': 'Error 500',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const MigasDePan = () => {

  const location = useLocation();

  // Convierte la URL en segmentos
  // ejemplo: /cliente/perfil -> ['cliente','perfil']
  const pathnames = location.pathname
    .split('/')
    .filter(Boolean);

  // Construcción de las migas
  const items = [
    { label: 'Inicio', to: '/' },
    ...pathnames.map((segment, index) => {

      const path = '/' + pathnames.slice(0, index + 1).join('/');

      const label =
        rutasALabel[path] ||
        segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

      return { label, to: path };
    }),
  ];

  // No mostrar en la página principal
  if (items.length <= 1) return null;

  return (
    <Box
      sx={{
        py: 1,
        px: 2,
        bgcolor: '#F8FAFC',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <MuiBreadcrumbs
        separator={
          <NavigateNextRounded
            fontSize="small"
            sx={{ color: '#94A3B8' }}
          />
        }
        aria-label="breadcrumb"
      >
        {items.map((item, i) =>
          i === items.length - 1 ? (
            // Último elemento (actual)
            <Typography
              key={item.to}
              color="text.primary"
              fontWeight={600}
              fontSize="0.9rem"
            >
              {item.label}
            </Typography>
          ) : (
            // Enlaces anteriores
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: '#1E293B',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              {item.to === '/' && (
                <HomeRounded
                  sx={{ fontSize: 18, color: '#64748B' }}
                />
              )}
              {item.label}
            </Link>
          )
        )}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default MigasDePan;