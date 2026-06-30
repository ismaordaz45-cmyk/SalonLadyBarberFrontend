// ============================================
// COMPONENTE: PieDePaginaCliente.jsx
// (variante compacta del footer público)
// ============================================

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  ChatBubbleOutline,
  ContactMail,
  Description,
  Email,
  Facebook,
  HelpOutline,
  Instagram,
  LocationOn,
  Lock,
  LockReset,
  MapOutlined,
  Phone,
  RocketLaunch,
  Twitter,
  Visibility
} from "@mui/icons-material";
import { logoBase64ToDataUrl } from "../../utils/logoDataUrl";

const API_BASE_URL = "https://salonladybarberbackend.onrender.com";

const PieDePaginaCliente = () => {
  const [nombreEmpresa, setNombreEmpresa] = useState("Lady Barber ID'M");
  const [logoUrl, setLogoUrl] = useState("");

  const [datosEmpresa, setDatosEmpresa] = useState({
    redesSociales: {
      facebook: "https://facebook.com/ladybarberidm",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com"
    },
    telefono: "+52 4831197907",
    correo: "contacto@ladybarberidm.com",
    direccion: "Parque de Poblamiento"
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/perfil-empresa`, {
          barberOverlay: false
        });
        const data = response.data;
        if (!data) return;

        setNombreEmpresa(data.nombre || "Lady Barber ID'M");
        setLogoUrl(data.logo ? logoBase64ToDataUrl(data.logo) : "");
        setDatosEmpresa((prev) => ({
          ...prev,
          telefono: data.telefono || prev.telefono,
          correo: data.correo || prev.correo,
          direccion: data.direccion || prev.direccion
        }));
      } catch {
        // fallback: datos estáticos
      }
    };

    fetchPerfil();
  }, []);

  const linkClass = "footer-link";
  const iconGold = { color: "#D4AF37", fontSize: 18, marginRight: 8 };

  return (
    <>
      <style>{`
        /* Variante compacta para el área cliente (menos altura / tipografía más pequeña). */
        .footer-cliente {
          background: linear-gradient(135deg, #2C3E50 0%, #1A252F 100%);
          color: #F9FAFB;
          padding: 26px 18px 18px;
          box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.16);
        }
        .footer-cliente .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 28px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .footer-cliente .footer-seccion h3 {
          color: #D4AF37;
          font-size: 1.05rem;
          font-weight: 750;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.26);
        }
        .footer-cliente .footer-link,
        .footer-cliente .footer-text {
          display: flex;
          align-items: center;
          color: #F9FAFB;
          font-size: 0.95rem;
          text-decoration: none;
          margin-bottom: 8px;
          transition: color 0.2s ease, transform 0.15s ease;
        }
        .footer-cliente .footer-link:hover {
          color: #D4AF37;
          transform: translateX(3px);
        }
        .footer-cliente .footer-text {
          opacity: 0.95;
        }
        .footer-cliente .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .footer-cliente .footer-logo img {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          object-fit: contain;
          object-position: center;
          background: rgba(248, 250, 252, 0.08);
          padding: 3px;
          box-sizing: border-box;
          border: 2px solid rgba(212, 175, 55, 0.35);
        }
        .footer-cliente .footer-logo span {
          font-size: 1.1rem;
          font-weight: 800;
          color: #F9FAFB;
          letter-spacing: 0.01em;
        }
        .footer-cliente .footer-redes {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .footer-cliente .footer-redes a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.14);
          color: #D4AF37;
          transition: background 0.2s, transform 0.15s;
        }
        .footer-cliente .footer-redes a:hover {
          background: rgba(212, 175, 55, 0.26);
          transform: translateY(-2px);
        }
        .footer-cliente-copy {
          background: #1A252F;
          color: rgba(249, 250, 251, 0.92);
          text-align: center;
          padding: 14px 16px;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
        }
      `}</style>

      <footer className="footer-cliente">
        <div className="footer-grid">
          <div className="footer-seccion">
            <div className="footer-logo">
              {logoUrl && <img src={logoUrl} alt="Logo empresa" />}
              <span>{nombreEmpresa}</span>
            </div>

            <h3>Redes sociales</h3>
            <div className="footer-redes">
              <a href={datosEmpresa.redesSociales.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook sx={{ fontSize: 22 }} />
              </a>
              <a href={datosEmpresa.redesSociales.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter sx={{ fontSize: 22 }} />
              </a>
              <a href={datosEmpresa.redesSociales.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram sx={{ fontSize: 22 }} />
              </a>
            </div>
          </div>

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

          <div className="footer-seccion">
            <h3>Navegación y ayuda</h3>
            <Link to="/ayuda" className={linkClass}>
              <HelpOutline sx={iconGold} /> Ayuda
            </Link>
            <Link to="/contacto" className={linkClass}>
              <ContactMail sx={iconGold} /> Contáctanos
            </Link>
            <Link to="/mapa-sitio" className={linkClass}>
              <MapOutlined sx={iconGold} /> Mapa del sitio
            </Link>
            <Link to="/recovery" className={linkClass}>
              <LockReset sx={iconGold} /> Recuperar contraseña
            </Link>
            <Link to="/chat" className={linkClass}>
              <ChatBubbleOutline sx={iconGold} /> Chat
            </Link>
          </div>

          <div className="footer-seccion">
            <h3>Datos de la empresa</h3>
            <Link to="/politicaspca" className={linkClass}>
              <Lock sx={iconGold} /> Política de Privacidad
            </Link>
            <Link to="/terminospca" className={linkClass}>
              <Description sx={iconGold} /> Términos y condiciones
            </Link>
            <Link to="/misionpca" className={linkClass}>
              <RocketLaunch sx={iconGold} /> Misión
            </Link>
            <Link to="/visionpca" className={linkClass}>
              <Visibility sx={iconGold} /> Visión
            </Link>
          </div>
        </div>
      </footer>

      <div className="footer-cliente-copy">
        © {new Date().getFullYear()} {nombreEmpresa}. Todos los derechos reservados.
      </div>
    </>
  );
};

export default PieDePaginaCliente;

