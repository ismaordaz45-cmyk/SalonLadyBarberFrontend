// ============================================
// COMPONENTE: PieDePaginaPublico.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { logoBase64ToDataUrl } from '../../utils/logoDataUrl';
import { Link } from 'react-router-dom';

import {
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Email,
  LocationOn,
  Lock,
  Description,
  RocketLaunch,
  Visibility,
  HelpOutline,
  ContactMail,
  MapOutlined,
  LockReset,
  ChatBubbleOutline,
} from '@mui/icons-material';

const API_BASE_URL = "https://salonladybarberbackend.onrender.com";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const PieDePaginaPublico = () => {

  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber ID'M");
  const [logoUrl, setLogoUrl] = useState('');

  // Datos estáticos (se conservan)
  const [datosEmpresa, setDatosEmpresa] = useState({
    redesSociales: {
      facebook: 'https://facebook.com/ladybarberidm',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    telefono: '+52 4831197907',
    correo: 'contacto@ladybarberidm.com',
    direccion: 'Parque de Poblamiento',
  });

  // Cargar datos del perfil desde backend limpio
  useEffect(() => {

    const fetchPerfil = async () => {
      try {

        const response = await axios.get(`${API_BASE_URL}/api/perfil-empresa`, {
          barberOverlay: false
        });

        const data = response.data;

        /*
          Se asume que el backend devuelve:
          {
            nombre,
            telefono,
            correo,
            direccion,
            logo
          }
        */

        if (data) {

          setNombreEmpresa(data.nombre || "Lady Barber ID'M");

          setLogoUrl(data.logo ? logoBase64ToDataUrl(data.logo) : '');

          setDatosEmpresa(prev => ({
            ...prev,
            telefono: data.telefono || prev.telefono,
            correo: data.correo || prev.correo,
            direccion: data.direccion || prev.direccion
          }));
        }

      } catch (error) {
        console.error('❌ Error al obtener datos del perfil para footer:', error);
      }
    };

    fetchPerfil();

  }, []);

  const linkClass = 'footer-link';
  const iconGold = { color: '#D4AF37', fontSize: 20, marginRight: 8 };

  return (
    <>
      <style>{`
        .footer-publico {
          background: linear-gradient(135deg, #2C3E50 0%, #1A252F 100%);
          color: #F9FAFB;
          padding: 48px 24px 32px;
          box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.2);
        }
        .footer-publico .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-publico .footer-seccion h3 {
          color: #D4AF37;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        }
        .footer-publico .footer-link,
        .footer-publico .footer-text {
          display: flex;
          align-items: center;
          color: #F9FAFB;
          font-size: 1.05rem;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.2s ease, transform 0.15s ease;
        }
        .footer-publico .footer-link:hover {
          color: #D4AF37;
          transform: translateX(4px);
        }
        .footer-publico .footer-text {
          opacity: 0.95;
        }
        .footer-publico .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .footer-publico .footer-logo img {
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
        .footer-publico .footer-logo span {
          font-size: 1.35rem;
          font-weight: 700;
          color: #F9FAFB;
          letter-spacing: 0.02em;
        }
        .footer-publico .footer-redes {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
        .footer-publico .footer-redes a {
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
        .footer-publico .footer-redes a:hover {
          background: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }
        .footer-copy {
          background: #1A252F;
          color: #F9FAFB;
          text-align: center;
          padding: 20px;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
        }
      `}</style>

      <footer className="footer-publico">
        <div className="footer-grid">

          {/* Logo y Redes */}
          <div className="footer-seccion">
            <div className="footer-logo">
              {logoUrl && <img src={logoUrl} alt="Logo empresa" />}
              <span>{nombreEmpresa}</span>
            </div>

            <h3>Redes sociales</h3>
            <div className="footer-redes">
              <a href={datosEmpresa.redesSociales.facebook} target="_blank" rel="noopener noreferrer">
                <Facebook sx={{ fontSize: 26 }} />
              </a>
              <a href={datosEmpresa.redesSociales.twitter} target="_blank" rel="noopener noreferrer">
                <Twitter sx={{ fontSize: 26 }} />
              </a>
              <a href={datosEmpresa.redesSociales.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram sx={{ fontSize: 26 }} />
              </a>
            </div>
          </div>

          {/* Atención */}
          <div className="footer-seccion">
            <h3>Atención al cliente</h3>

            <a className="footer-text" href={`tel:${datosEmpresa.telefono}`}>
              <Phone sx={iconGold} /> {datosEmpresa.telefono}
            </a>

            <a className="footer-text" href={`mailto:${datosEmpresa.correo}`}>
              <Email sx={iconGold} /> {datosEmpresa.correo}
            </a>

            <span className="footer-text">
              <LocationOn sx={iconGold} /> {datosEmpresa.direccion}
            </span>
          </div>

          {/* Navegación */}
          <div className="footer-seccion">
            <h3>Navegación y ayuda</h3>

            <Link to="/ayuda" className={linkClass}><HelpOutline sx={iconGold} /> Ayuda</Link>
            <Link to="/contacto" className={linkClass}><ContactMail sx={iconGold} /> Contáctanos</Link>
            <Link to="/mapa-sitio" className={linkClass}><MapOutlined sx={iconGold} /> Mapa del sitio</Link>
            <Link to="/recovery" className={linkClass}><LockReset sx={iconGold} /> Recuperar contraseña</Link>
            <Link to="/chat" className={linkClass}><ChatBubbleOutline sx={iconGold} /> Chat</Link>
          </div>

          {/* Empresa */}
          <div className="footer-seccion">
            <h3>Datos de la empresa</h3>

            <Link to="/privacidad" className={linkClass}><Lock sx={iconGold} /> Política de Privacidad</Link>
            <Link to="/terminospca" className={linkClass}><Description sx={iconGold} /> Términos y condiciones</Link>
            <Link to="/misionpca" className={linkClass}><RocketLaunch sx={iconGold} /> Misión</Link>
            <Link to="/visionpca" className={linkClass}><Visibility sx={iconGold} /> Visión</Link>
          </div>

        </div>
      </footer>

      <div className="footer-copy">
        © {new Date().getFullYear()} {nombreEmpresa}. Todos los derechos reservados.
      </div>
    </>
  );
};

export default PieDePaginaPublico;
