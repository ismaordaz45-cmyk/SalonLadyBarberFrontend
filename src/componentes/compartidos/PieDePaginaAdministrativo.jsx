// ============================================
// COMPONENTE: PieDePaginaAdministrativo.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import axios from "axios";
import { logoBase64ToDataUrl } from '../../utils/logoDataUrl';
import {
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Email,
  LocationOn,
  Lock,
  Description,
  Visibility,
  RocketLaunch
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const API_BASE_URL = "http://localhost:4000";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const PieDePaginaAdministrativo = () => {

  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber ID'M");
  const [logoUrl, setLogoUrl] = useState('');

  const [datosEmpresa, setDatosEmpresa] = useState({
    redesSociales: {
      facebook: "#",
      twitter: "#",
      instagram: "#"
    },
    telefono: "No disponible",
    correo: "No disponible",
    direccion: "No disponible"
  });

  // ============================================
  // Cargar datos desde backend limpio
  // ============================================

  useEffect(() => {

    const fetchPerfil = async () => {
      try {

        const { data } = await axios.get(`${API_BASE_URL}/api/perfil-empresa`, {
          barberOverlay: false
        });

        console.log('📊 Datos del perfil (footer admin):', data);

        if (data) {
          setNombreEmpresa(data.nombre || "Lady Barber ID'M");

          setLogoUrl(data.logo ? logoBase64ToDataUrl(data.logo) : '');
        }

        setDatosEmpresa({
          redesSociales: {
            facebook: data?.facebook || "#",
            twitter: data?.twitter || "#",
            instagram: data?.instagram || "#"
          },
          telefono: data?.telefono || data?.Telefono || "No disponible",
          correo: data?.correo || data?.Correo || "No disponible",
          direccion: data?.direccion || data?.Direccion || "No disponible"
        });

      } catch (err) {
        console.error('❌ Error al cargar datos del footer admin:', err);
      }
    };

    fetchPerfil();

  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <style>{`
        .footer-admin {
          background: linear-gradient(135deg, #2C3E50 0%, #1A252F 100%);
          color: #F9FAFB;
          padding: 48px 24px 32px;
          box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.2);
        }
        .footer-admin .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-admin .footer-seccion h3 {
          color: #D4AF37;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        }
        .footer-admin .footer-link,
        .footer-admin .footer-text {
          display: flex;
          align-items: center;
          color: #F9FAFB;
          font-size: 1.05rem;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.2s ease, transform 0.15s ease;
        }
        .footer-admin .footer-link:hover {
          color: #D4AF37;
          transform: translateX(4px);
        }
        .footer-admin .footer-text {
          opacity: 0.95;
        }
        .footer-admin .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .footer-admin .footer-logo img {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: contain;
          object-position: center;
          background: rgba(248, 250, 252, 0.08);
          padding: 3px;
          box-sizing: border-box;
          border: 2px solid rgba(212, 175, 55, 0.4);
        }
        .footer-admin .footer-logo span {
          font-size: 1.35rem;
          font-weight: 700;
          color: #F9FAFB;
          letter-spacing: 0.02em;
        }
        .footer-admin .footer-redes {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
        .footer-admin .footer-redes a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.15);
          color: #D4AF37;
          transition: background 0.2s, transform 0.15s;
        }
        .footer-admin .footer-redes a:hover {
          background: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }
        .footer-copy-admin {
          background: #1A252F;
          color: #F9FAFB;
          text-align: center;
          padding: 20px;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
        }
      `}</style>

      <footer className="footer-admin">
        <div className="footer-grid">

          {/* Logo y Redes */}
          <div className="footer-seccion">
            <div className="footer-logo">
              {logoUrl && <img src={logoUrl} alt="Logo empresa" />}
              <span>{nombreEmpresa}</span>
            </div>

            <h3>Redes sociales</h3>
            <div className="footer-redes">
              <a href={datosEmpresa.redesSociales.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook sx={{ fontSize: 26 }} />
              </a>
              <a href={datosEmpresa.redesSociales.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter sx={{ fontSize: 26 }} />
              </a>
              <a href={datosEmpresa.redesSociales.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram sx={{ fontSize: 26 }} />
              </a>
            </div>
          </div>

          {/* Atención */}
          <div className="footer-seccion">
            <h3>Atención al cliente</h3>

            <a className="footer-text" href={`tel:${datosEmpresa.telefono}`}>
              <Phone sx={{ color: '#D4AF37', fontSize: 22, marginRight: 8 }} />
              {datosEmpresa.telefono}
            </a>

            <a className="footer-text" href={`mailto:${datosEmpresa.correo}`}>
              <Email sx={{ color: '#D4AF37', fontSize: 22, marginRight: 8 }} />
              {datosEmpresa.correo}
            </a>

            <span className="footer-text">
              <LocationOn sx={{ color: '#D4AF37', fontSize: 22, marginRight: 8 }} />
              {datosEmpresa.direccion}
            </span>
          </div>

          {/* Empresa */}
          <div className="footer-seccion">
            <h3>Datos de la empresa</h3>

            <Link to="/admin/politicas" className="footer-link">
              <Lock sx={{ color: '#D4AF37', fontSize: 20, marginRight: 8 }} />
              Política de Privacidad
            </Link>
            <Link to="/admin/terminos" className="footer-link">
              <Description sx={{ color: '#D4AF37', fontSize: 20, marginRight: 8 }} />
              Términos y condiciones
            </Link>
            <Link to="/admin/mision" className="footer-link">
              <RocketLaunch sx={{ color: '#D4AF37', fontSize: 20, marginRight: 8 }} />
              Misión
            </Link>
            <Link to="/admin/vision" className="footer-link">
              <Visibility sx={{ color: '#D4AF37', fontSize: 20, marginRight: 8 }} />
              Visión
            </Link>
          </div>

        </div>
      </footer>

      <div className="footer-copy-admin">
        © {new Date().getFullYear()} {nombreEmpresa}. Todos los derechos reservados.
      </div>
    </>
  );
};

export default PieDePaginaAdministrativo;