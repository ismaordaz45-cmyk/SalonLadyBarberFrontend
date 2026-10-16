import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Grid,
  Button,
  Stack
} from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import DirectionsRoundedIcon from "@mui/icons-material/DirectionsRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { motion } from "framer-motion";

const DEFAULT_DIRECCION = "Parque de Poblamiento, Huejutla de Reyes, Hidalgo";

export default function SeccionUbicacion({ perfil }) {

  // Extraer dirección o coordenadas del perfil o del .env
  const direccionTexto = perfil?.direccion || process.env.REACT_APP_SALON_DIRECCION || DEFAULT_DIRECCION;
  const telefono = perfil?.telefono || "+52 4831197907";
  const correo = perfil?.correo || "contacto@ladybarberidm.com";
  const horario = perfil?.horarioAtencion || "Lunes a Sábado: 10:00 AM - 8:00 PM";
  const ubicacionRaw = perfil?.ubicacion || "";

  // Determinar la query para Google Maps
  // Si ubicacionRaw tiene formato de coordenadas 'lat,lng' o texto de calle
  let queryMapa = encodeURIComponent(direccionTexto);
  if (ubicacionRaw && ubicacionRaw.trim().length > 3) {
    if (ubicacionRaw.startsWith("http")) {
      // Si pegaron link completo de Google Maps
      queryMapa = encodeURIComponent(direccionTexto);
    } else {
      queryMapa = encodeURIComponent(ubicacionRaw.trim());
    }
  } else if (process.env.REACT_APP_SALON_LAT && process.env.REACT_APP_SALON_LNG) {
    queryMapa = `${process.env.REACT_APP_SALON_LAT},${process.env.REACT_APP_SALON_LNG}`;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

  // URL del iframe de Google Maps (Usa Embed API oficial con la API key o modo vista universal)
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${queryMapa}&zoom=16`
    : `https://maps.google.com/maps?q=${queryMapa}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  // URL para abrir Google Maps en app nativa o pestaña nueva
  const openMapsUrl = `https://www.google.com/maps/search/?api=1&query=${queryMapa}`;

  return (
    <Box
      id="ubicacion"
      sx={{
        py: { xs: 8, md: 11 },
        bgcolor: "#FFFFFF",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Container maxWidth="lg">
        {/* Encabezado de la sección */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.75, borderRadius: "999px", bgcolor: "rgba(212, 175, 55, 0.12)", border: "1px solid rgba(212, 175, 55, 0.3)", color: "#856404", fontWeight: 800, fontSize: "0.82rem", mb: 2, letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            <LocationOnRoundedIcon sx={{ fontSize: 16, color: "#D4AF37" }} />
            Encuéntranos Fácilmente
          </Box>

          <Typography
            variant="h3"
            component="h2"
            sx={{
              color: "#163050",
              fontWeight: 900,
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.2rem" },
              letterSpacing: "-0.02em",
              mb: 1.5
            }}
          >
            Nuestra Ubicación
          </Typography>

          <Typography
            sx={{
              color: "#64748B",
              maxWidth: 620,
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.6
            }}
          >
            Visítanos en nuestras instalaciones diseñadas para ofrecerte el máximo confort, privacidad y la mejor experiencia de salón.
          </Typography>
        </Box>

        {/* Tarjeta contenedora con layout 2 columnas */}
        <Grid container spacing={4} alignItems="stretch">
          
          {/* Columna Izquierda: Información de Contacto y Cómo Llegar */}
          <Grid item xs={12} md={5}>
            <Card
              component={motion.div}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: "24px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                p: { xs: 3.5, md: 4.5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 14px 40px -10px rgba(15, 23, 42, 0.06)"
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      bgcolor: "#163050",
                      color: "#D4AF37",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 16px rgba(22, 48, 80, 0.2)"
                    }}
                  >
                    <StorefrontRoundedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: "#163050", fontSize: "1.2rem" }}>
                      Salón Lady Barber
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#D4AF37", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Instalaciones Oficiales
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2.5} sx={{ mb: 4 }}>
                  {/* Dirección */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <LocationOnRoundedIcon sx={{ color: "#D4AF37", fontSize: 22, mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#163050", fontSize: "0.95rem" }}>
                        Dirección
                      </Typography>
                      <Typography sx={{ color: "#64748B", fontSize: "0.92rem", lineHeight: 1.5 }}>
                        {direccionTexto}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Horario */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <AccessTimeRoundedIcon sx={{ color: "#D4AF37", fontSize: 22, mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#163050", fontSize: "0.95rem" }}>
                        Horario de Atención
                      </Typography>
                      <Typography sx={{ color: "#64748B", fontSize: "0.92rem", lineHeight: 1.5 }}>
                        {horario}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Teléfono */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <PhoneRoundedIcon sx={{ color: "#D4AF37", fontSize: 22, mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#163050", fontSize: "0.95rem" }}>
                        Teléfono / Citas
                      </Typography>
                      <Typography component="a" href={`tel:${telefono}`} sx={{ color: "#64748B", fontSize: "0.92rem", textDecoration: "none", "&:hover": { color: "#163050" } }}>
                        {telefono}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Correo */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <EmailRoundedIcon sx={{ color: "#D4AF37", fontSize: 22, mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#163050", fontSize: "0.95rem" }}>
                        Contacto Digital
                      </Typography>
                      <Typography component="a" href={`mailto:${correo}`} sx={{ color: "#64748B", fontSize: "0.92rem", textDecoration: "none", "&:hover": { color: "#163050" } }}>
                        {correo}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Botón de acción Google Maps */}
              <Button
                component="a"
                href={openMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                startIcon={<DirectionsRoundedIcon />}
                endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
                fullWidth
                sx={{
                  bgcolor: "#163050",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  py: 1.4,
                  borderRadius: "14px",
                  textTransform: "none",
                  boxShadow: "0 8px 24px rgba(22, 48, 80, 0.25)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    bgcolor: "#D4AF37",
                    color: "#163050",
                    boxShadow: "0 12px 28px rgba(212, 175, 55, 0.35)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                Cómo llegar (Google Maps)
              </Button>
            </Card>
          </Grid>

          {/* Columna Derecha: Mapa Interactivo con Bordes Redondeados */}
          <Grid item xs={12} md={7}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              sx={{
                height: "100%",
                minHeight: { xs: 350, md: 440 },
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid #E2E8F0",
                boxShadow: "0 18px 50px -12px rgba(15, 23, 42, 0.12)",
                position: "relative",
                bgcolor: "#E2E8F0"
              }}
            >
              <Box
                component="iframe"
                title="Ubicación Lady Barber en Google Maps"
                src={mapUrl}
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  minHeight: "100%",
                  display: "block"
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Indicador Flotante sobre el Mapa */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: "rgba(22, 48, 80, 0.90)",
                  backdropFilter: "blur(8px)",
                  color: "#FFFFFF",
                  px: 2,
                  py: 0.8,
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                  border: "1px solid rgba(250, 204, 21, 0.3)"
                }}
              >
                <VerifiedRoundedIcon sx={{ fontSize: 16, color: "#D4AF37" }} />
                Ubicación Verificada
              </Box>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}
