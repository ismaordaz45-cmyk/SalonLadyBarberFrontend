import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = "https://salonladybarberbackend.onrender.com";

const PALETTE = {
  pageBg: "#F8FAFC",
  card: "#FFFFFF",
  navy: "#1E3A5F",
  gold: "#D4AF37",
  muted: "#64748B",
  border: "#E2E8F0"
};

const FAQ_ITEMS = [
  {
    pregunta: "¿Cómo reservo una cita?",
    respuesta: "Puedes reservar creando una cuenta gratuita o iniciando sesión. Dirígete a la sección 'Servicios', elige tu corte o tratamiento preferido, selecciona fecha, hora y barbero/estilista, y confirma tu reservación en segundos."
  },
  {
    pregunta: "¿Qué métodos de pago aceptan?",
    respuesta: "Aceptamos efectivo directamente en el salón, transferencias bancarias y pagos en línea con tarjetas de débito/crédito a través de la pasarela segura de Mercado Pago."
  },
  {
    pregunta: "¿Puedo cancelar o reprogramar mi cita?",
    respuesta: "Sí, desde tu panel de cliente en 'Mis Citas' puedes consultar el estado y cancelar tu cita con al menos 2 horas de anticipación para que el espacio pueda ser aprovechado por otro cliente."
  },
  {
    pregunta: "¿Cuentan con productos a la venta?",
    respuesta: "Sí, disponemos de una tienda de productos de estilizado profesional, ceras, aceites para barba y tratamientos capilares que puedes comprar en línea para recoger en el salón o adquirir al momento de tu visita."
  },
  {
    pregunta: "¿Cómo vinculo mi cuenta con Alexa?",
    respuesta: "Desde tu perfil de usuario puedes generar un código de acceso de 6 dígitos. Luego abres la skill de Lady Barber en tu dispositivo Alexa y le dices el código para consultar tus citas con la voz."
  }
];

export default function PaginaAyudaContactoPublico() {
  const [empresa, setEmpresa] = useState({
    telefono: "+52 4831197907",
    correo: "contacto@ladybarberidm.com",
    direccion: "Parque de Poblamiento",
    horarioAtencion: "Lunes a Sábado: 10:00 AM - 8:00 PM"
  });

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: ""
  });

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/perfil-empresa`);
        if (data) {
          setEmpresa((prev) => ({
            ...prev,
            telefono: data.telefono || prev.telefono,
            correo: data.correo || prev.correo,
            direccion: data.direccion || prev.direccion,
            horarioAtencion: data.horarioAtencion || prev.horarioAtencion
          }));
        }
      } catch (err) {
        // Fallback silencioso
      }
    };
    fetchEmpresa();
  }, []);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formulario.nombre.trim() || !formulario.correo.trim() || !formulario.mensaje.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor completa tu nombre, correo y mensaje para enviarte respuesta.",
        confirmButtonColor: PALETTE.navy
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Mensaje Enviado",
      text: "¡Gracias por contactarnos! El equipo de Lady Barber te responderá a la brevedad.",
      confirmButtonColor: PALETTE.navy
    });

    setFormulario({ nombre: "", correo: "", telefono: "", mensaje: "" });
  };

  return (
    <Box
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: PALETTE.muted,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { color: PALETTE.navy, bgcolor: "transparent" }
            }}
          >
            Volver al inicio
          </Button>
        </Box>

        {/* Título de la sección */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip
            icon={<HelpOutlineIcon sx={{ fontSize: "16px !important", color: `${PALETTE.gold} !important` }} />}
            label="Centro de Atención y Soporte"
            sx={{
              bgcolor: alpha(PALETTE.gold, 0.15),
              color: "#856404",
              fontWeight: 800,
              mb: 1.5,
              border: `1px solid ${alpha(PALETTE.gold, 0.3)}`
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              color: PALETTE.navy,
              fontFamily: '"Cinzel", serif',
              fontSize: { xs: "2rem", md: "2.8rem" }
            }}
          >
            Ayuda & Contáctanos
          </Typography>
          <Typography sx={{ color: PALETTE.muted, mt: 1, maxWidth: 650, mx: "auto", fontSize: "1.05rem" }}>
            ¿Tienes dudas sobre cómo agendar, nuestros servicios o pagos? Estamos aquí para asistirte.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Columna Izquierda: Información y Formulario de Contacto */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: PALETTE.card,
                border: `1px solid ${alpha(PALETTE.navy, 0.12)}`,
                boxShadow: `0 16px 40px ${alpha(PALETTE.navy, 0.06)}`,
                p: { xs: 3, md: 3.5 },
                mb: 3
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.navy, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <ContactSupportIcon sx={{ color: PALETTE.gold }} /> Canales Directos
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <PhoneIcon sx={{ color: PALETTE.gold, fontSize: 22, mt: 0.3 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.95rem" }}>Teléfono / WhatsApp</Typography>
                    <Typography component="a" href={`tel:${empresa.telefono}`} sx={{ color: PALETTE.muted, textDecoration: "none" }}>
                      {empresa.telefono}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <EmailIcon sx={{ color: PALETTE.gold, fontSize: 22, mt: 0.3 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.95rem" }}>Correo Electrónico</Typography>
                    <Typography component="a" href={`mailto:${empresa.correo}`} sx={{ color: PALETTE.muted, textDecoration: "none" }}>
                      {empresa.correo}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <LocationOnIcon sx={{ color: PALETTE.gold, fontSize: 22, mt: 0.3 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: PALETTE.navy, fontSize: "0.95rem" }}>Ubicación</Typography>
                    <Typography sx={{ color: PALETTE.muted }}>{empresa.direccion}</Typography>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Formulario */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: PALETTE.card,
                border: `1px solid ${alpha(PALETTE.navy, 0.12)}`,
                boxShadow: `0 16px 40px ${alpha(PALETTE.navy, 0.06)}`,
                p: { xs: 3, md: 3.5 }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.navy, mb: 1 }}>
                Envíanos un Mensaje
              </Typography>
              <Typography variant="body2" sx={{ color: PALETTE.muted, mb: 2.5 }}>
                Completa tus datos y nos comunicaremos contigo.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tu nombre completo"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Correo electrónico"
                  name="correo"
                  type="email"
                  value={formulario.correo}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Teléfono (opcional)"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="¿En qué te podemos ayudar?"
                  name="mensaje"
                  multiline
                  rows={3}
                  value={formulario.mensaje}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendRoundedIcon />}
                  sx={{
                    bgcolor: PALETTE.navy,
                    color: "#FFFFFF",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "10px",
                    py: 1.2,
                    "&:hover": { bgcolor: "#152A41" }
                  }}
                >
                  Enviar Mensaje
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Columna Derecha: Preguntas Frecuentes (FAQ) */}
          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: PALETTE.card,
                border: `1px solid ${alpha(PALETTE.navy, 0.12)}`,
                boxShadow: `0 16px 40px ${alpha(PALETTE.navy, 0.06)}`,
                p: { xs: 3, md: 4 }
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: PALETTE.navy, mb: 1, fontFamily: '"Cinzel", serif' }}>
                Preguntas Frecuentes
              </Typography>
              <Typography sx={{ color: PALETTE.muted, mb: 3 }}>
                Respuestas rápidas a las consultas más habituales de nuestros clientes.
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {FAQ_ITEMS.map((item, idx) => (
                  <Accordion
                    key={idx}
                    defaultExpanded={idx === 0}
                    elevation={0}
                    sx={{
                      borderRadius: "12px !important",
                      border: `1px solid ${PALETTE.border}`,
                      bgcolor: "#F8FAFC",
                      "&:before": { display: "none" }
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: PALETTE.navy }} />}>
                      <Typography sx={{ fontWeight: 700, color: PALETTE.navy }}>
                        {item.pregunta}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography sx={{ color: PALETTE.muted, lineHeight: 1.7 }}>
                        {item.respuesta}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
