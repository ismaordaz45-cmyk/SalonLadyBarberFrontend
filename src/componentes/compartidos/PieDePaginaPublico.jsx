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
  WhatsApp,
  Phone,
  Email
} from '@mui/icons-material';

const API_BASE_URL = "https://salonladybarberbackend.onrender.com";

const PieDePaginaPublico = () => {
  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber ID'M");
  const [logoUrl, setLogoUrl] = useState('');

  const [datosEmpresa, setDatosEmpresa] = useState({
    redesSociales: {
      facebook: 'https://facebook.com/ladybarberidm',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    telefono: '+52 4831197907',
    correo: 'contacto@ladybarberidm.com',
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/perfil-empresa`, {
          barberOverlay: false
        });

        const data = response.data;
        if (data) {
          setNombreEmpresa(data.nombre || "Lady Barber ID'M");
          setLogoUrl(data.logo ? logoBase64ToDataUrl(data.logo) : '');
          setDatosEmpresa(prev => ({
            ...prev,
            telefono: data.telefono || prev.telefono,
            correo: data.correo || prev.correo
          }));
        }
      } catch (error) {
        console.error('❌ Error al obtener datos del perfil para footer:', error);
      }
    };

    fetchPerfil();
  }, []);

  const whatsappNumber = (datosEmpresa.telefono || "").replace(/[^0-9]/g, "");

  return (
    <>
      <style>{`
        .footer-publico {
          background: linear-gradient(180deg, #1A2735 0%, #111A24 100%);
          color: #E2E8F0;
          padding: 44px 24px 28px;
          border-top: 1px solid rgba(212, 175, 55, 0.18);
        }
        .footer-publico .footer-container {
          max-width: 1140px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr 1.1fr 1fr;
          gap: 48px;
        }
        @media (max-width: 900px) {
          .footer-publico .footer-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        .footer-brand .brand-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .footer-brand .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.35);
          padding: 2px;
        }
        .footer-brand .brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.01em;
        }
        .footer-brand .brand-desc {
          color: #94A3B8;
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 18px;
          max-width: 320px;
        }
        .footer-socials {
          display: flex;
          gap: 10px;
        }
        .footer-socials a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.22);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .footer-socials a:hover {
          background: #D4AF37;
          color: #111A24;
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(212, 175, 55, 0.25);
        }
        .footer-col-title {
          color: #D4AF37;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .footer-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .footer-nav-link {
          color: #CBD5E1;
          font-size: 0.94rem;
          text-decoration: none;
          transition: color 0.2s ease, transform 0.15s ease;
          display: inline-block;
          width: fit-content;
        }
        .footer-nav-link:hover {
          color: #D4AF37;
          transform: translateX(3px);
        }
        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #CBD5E1;
          font-size: 0.94rem;
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.2s ease;
        }
        .footer-contact-item:hover {
          color: #D4AF37;
        }
        .footer-contact-icon {
          color: #D4AF37;
          font-size: 18px !important;
        }
        .footer-bottom {
          max-width: 1140px;
          margin: 32px auto 0;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          color: #64748B;
          font-size: 0.86rem;
        }
        .footer-legal-links {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .footer-legal-link {
          color: #94A3B8;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-legal-link:hover {
          color: #D4AF37;
        }
      `}</style>

      <footer className="footer-publico">
        <div className="footer-container">
          
          {/* Columna 1: Identidad y Redes */}
          <div className="footer-brand">
            <div className="brand-header">
              {logoUrl && <img src={logoUrl} alt="Logo Lady Barber" className="brand-logo" />}
              <span className="brand-name">{nombreEmpresa}</span>
            </div>
            <p className="brand-desc">
              Estilo de barbería y acabado de salón profesional. Cuidado, técnica y elegancia en cada servicio.
            </p>
            <div className="footer-socials">
              <a href={datosEmpresa.redesSociales.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook sx={{ fontSize: 20 }} />
              </a>
              <a href={datosEmpresa.redesSociales.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram sx={{ fontSize: 20 }} />
              </a>
              <a href={datosEmpresa.redesSociales.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter sx={{ fontSize: 20 }} />
              </a>
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <WhatsApp sx={{ fontSize: 20 }} />
                </a>
              )}
            </div>
          </div>

          {/* Columna 2: Atención Directa */}
          <div>
            <div className="footer-col-title">Atención al cliente</div>
            <a className="footer-contact-item" href={`tel:${datosEmpresa.telefono}`}>
              <Phone className="footer-contact-icon" />
              <span>{datosEmpresa.telefono}</span>
            </a>
            <a className="footer-contact-item" href={`mailto:${datosEmpresa.correo}`}>
              <Email className="footer-contact-icon" />
              <span>{datosEmpresa.correo}</span>
            </a>
          </div>

          {/* Columna 3: Enlaces Rápidos (Sin íconos empalmados) */}
          <div>
            <div className="footer-col-title">Explora</div>
            <ul className="footer-nav-list">
              <li>
                <Link to="/catalogo" className="footer-nav-link">Catálogo de servicios</Link>
              </li>
              <li>
                <Link to="/nosotros" className="footer-nav-link">Nosotros</Link>
              </li>
              <li>
                <Link to="/mision" className="footer-nav-link">Misión y Visión</Link>
              </li>
              <li>
                <Link to="/ayuda" className="footer-nav-link">Centro de Ayuda y FAQ</Link>
              </li>
              <li>
                <Link to="/contacto" className="footer-nav-link">Contáctanos</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Barra Legal y Copyright */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {nombreEmpresa}. Todos los derechos reservados.
          </div>
          <div className="footer-legal-links">
            <Link to="/privacidad" className="footer-legal-link">Privacidad</Link>
            <span>•</span>
            <Link to="/terminos" className="footer-legal-link">Términos y Condiciones</Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PieDePaginaPublico;
