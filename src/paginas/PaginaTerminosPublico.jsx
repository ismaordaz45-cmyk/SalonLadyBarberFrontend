import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Card, CardContent, Button, Divider, CircularProgress } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import axios from "axios";

const API_URL = "https://salonladybarberbackend.onrender.com";

const PALETTE = {
  pageBg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  accent: "#D4AF37",
  primary: "#1E293B"
};

const TERMINOS_DEFAULT = [
  {
    id: 1,
    titulo: "1. Descripción de los Servicios",
    contenido:
      "El Salón Lady Barber Itza D´M ofrece servicios de barbería y cuidado personal, gestionados a través de un sistema digital para:\n• Reservar y confirmar citas.\n• Procesar pagos y anticipos.\n• Enviar recordatorios y notificaciones.\n• Consultar disponibilidad de productos y promociones.\n\nLos servicios están sujetos a disponibilidad y horarios del salón (lunes a sábado, 9:00 a 20:00 hrs, sujeto a cambios)."
  },
  {
    id: 2,
    titulo: "2. Registro y Cuenta de Usuario",
    contenido:
      "• Debes ser mayor de 15 años para registrarte y usar el sistema.\n• Al registrarte, proporcionas datos precisos y actualizados (ver Política de Privacidad).\n• Eres responsable de mantener confidencial tu contraseña y notificar cualquier uso no autorizado.\n• Nos reservamos el derecho de suspender o cancelar cuentas por incumplimiento de estos términos o inactividad prolongada (más de 24 meses)."
  },
  {
    id: 3,
    titulo: "3. Obligaciones del Usuario",
    contenido:
      "• Usar el sistema de manera responsable y legal, sin interferir en su funcionamiento.\n• Respetar el horario de citas y llegar puntual (retrasos de más de 15 minutos pueden considerarse sanción y pérdida de la cita).\n• Proporcionar información veraz para servicios personalizados (ej. alergias a productos).\n• No reproducir, distribuir o modificar contenido del sistema sin permiso."
  },
  {
    id: 4,
    titulo: "4. Políticas de Citas y Cancelaciones",
    contenido:
      "• Las citas se reservan exclusivamente a través del sistema, sujeto a disponibilidad.\n• Las cancelaciones o reprogramaciones deben realizarse con al menos 48 horas (2 días) de anticipación para evitar cargos.\n• Si no te presentas sin aviso previo (no-show), se aplicará una pérdida del 50% del anticipo o valor total de la cita, según corresponda.\n• En servicios que requieren anticipo o apartado, las cancelaciones tardías (menos de 48 horas) no generan reembolso del monto pagado.\n• El Salón Lady Barber Itza D´M se reserva el derecho de modificar horarios por motivos de fuerza mayor (ej. emergencias, festivos) y notificará con antelación vía correo o SMS."
  },
  {
    id: 5,
    titulo: "5. Pagos y Promociones",
    contenido:
      "• Métodos de pago aceptados: efectivo en salón, transferencias bancarias o tarjetas (sujeto a disponibilidad en el sistema).\n• Todos los pagos son en pesos mexicanos (MXN) e incluyen IVA donde aplique.\n• Promociones o descuentos aplican solo en fechas específicas (ej. regreso a clases, aniversarios, temporadas pico) y no son acumulables, salvo indicación contraria.\n• Los precios de servicios pueden variar según temporada, demanda o ajustes internos. Cualquier cambio se publicará en el sistema y se mostrará antes de confirmar la cita. No aplican retroactivamente."
  },
  {
    id: 6,
    titulo: "6. Inventario y Productos",
    contenido:
      "• El sistema registra consumibles (tintes, navajas, toallas, lociones) y productos a la venta (pomadas, shampoos, aceites) para control interno.\n• Mantenemos un control de stock mínimo y máximo para garantizar disponibilidad.\n• Los clientes pueden consultar la disponibilidad de productos en tiempo real a través del sistema, pero esta está sujeta a actualizaciones y no garantiza reserva inmediata.\n• Las ventas de productos se rigen por políticas de devolución: 7 días para cambios por defecto de fábrica, sin uso y con comprobante."
  },
  {
    id: 7,
    titulo: "7. Limitaciones de Responsabilidad",
    contenido:
      "• El salón no se hace responsable por daños indirectos, pérdidas o inconvenientes derivados del uso del sistema (ej. fallos técnicos temporales).\n• Los servicios se prestan 'tal cual', y no garantizamos resultados específicos en tratamientos (ej. coloración de cabello).\n• En caso de alergias o reacciones adversas, el cliente asume responsabilidad por no informar previamente."
  },
  {
    id: 8,
    titulo: "8. Propiedad Intelectual",
    contenido:
      "Todo el contenido del sistema (imágenes, textos, logos) es propiedad del Salón Lady Barber Itza D´M. No puedes usarlo sin autorización expresa."
  },
  {
    id: 9,
    titulo: "9. Resolución de Controversias",
    contenido:
      "Cualquier disputa se resolverá por acuerdo mutuo. De no lograrse, se someterá a la jurisdicción de los tribunales de Huejutla de Reyes, Hidalgo, México, renunciando a cualquier otro fuero."
  },
  {
    id: 10,
    titulo: "10. Modificaciones a los Términos",
    contenido:
      "Podemos actualizar estos términos en cualquier momento. La versión vigente se publicará en el sistema y entrará en vigor desde su fecha de publicación. Te notificaremos cambios significativos por correo. El uso continuado implica aceptación."
  },
  {
    id: 11,
    titulo: "11. Aceptación",
    contenido:
      "Al usar nuestros servicios, confirmas haber leído, entendido y aceptado estos Términos y Condiciones, junto con nuestra Política de Privacidad."
  }
];

export default function PaginaTerminosPublico() {
  const [terminos, setTerminos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchTerminos = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/terminos-condiciones`);
        if (Array.isArray(data) && data.length > 0) {
          const activos = data.filter((t) => t.activo !== 0 && t.activo !== false);
          setTerminos(activos.length > 0 ? activos : TERMINOS_DEFAULT);
        } else {
          setTerminos(TERMINOS_DEFAULT);
        }
      } catch (err) {
        setTerminos(TERMINOS_DEFAULT);
      } finally {
        setCargando(false);
      }
    };
    fetchTerminos();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 3 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: PALETTE.textMuted,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { color: PALETTE.text, bgcolor: "transparent" }
            }}
          >
            Volver al inicio
          </Button>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            bgcolor: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.10)",
            overflow: "hidden",
            mb: 4
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              px: { xs: 3, md: 4.5 },
              py: { xs: 3, md: 3.5 },
              background:
                "radial-gradient(1000px 320px at 20% 0%, rgba(212, 175, 55, 0.25) 0%, rgba(212,175,55,0) 55%), radial-gradient(900px 320px at 90% 60%, rgba(30, 41, 59, 0.10) 0%, rgba(30,41,59,0) 60%)",
              borderBottom: `1px solid ${PALETTE.border}`,
              display: "flex",
              alignItems: "center",
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "#1E3A5F",
                color: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: PALETTE.text }}>
                TÉRMINOS Y CONDICIONES
              </Typography>
              <Typography variant="subtitle2" sx={{ color: PALETTE.textMuted, fontWeight: 500 }}>
                Lady Barber ID'M — Transparencia y compromiso con nuestros clientes
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ px: { xs: 3, md: 5 }, py: { xs: 3.5, md: 4.5 } }}>
            {/* Caja de bienvenida y contacto */}
            <Box
              sx={{
                p: 3,
                mb: 4,
                bgcolor: "#F8FAFC",
                borderRadius: 2.5,
                border: "1px solid #E2E8F0"
              }}
            >
              <Typography sx={{ color: PALETTE.text, fontWeight: 500, lineHeight: 1.7, mb: 2 }}>
                Estos Términos y Condiciones regulan el uso de los servicios del <strong>Salón Lady Barber Itza D´M</strong> a través de nuestro sistema en línea (sitio web o app), incluyendo la reserva de citas, pagos y consulta de productos. Al registrar una cuenta, reservar una cita o utilizar cualquier funcionalidad del sistema, aceptas cumplir con estos términos en su totalidad. Si no estás de acuerdo, no uses nuestros servicios.
              </Typography>
              <Typography sx={{ color: PALETTE.textMuted, fontSize: "0.92rem", fontWeight: 600 }}>
                Para cualquier duda, contáctanos en:
              </Typography>
              <Typography sx={{ color: PALETTE.text, fontSize: "0.92rem", mt: 0.5 }}>
                📞 <strong>Teléfono:</strong> <a href="tel:7711136094" style={{ color: "#1E3A5F", textDecoration: "none", fontWeight: 700 }}>771 113 6094</a>
                <br />
                ✉️ <strong>Correo electrónico:</strong> <a href="mailto:itzadinorasaenzhernandez@gmail.com" style={{ color: "#1E3A5F", textDecoration: "none", fontWeight: 700 }}>itzadinorasaenzhernandez@gmail.com</a>
              </Typography>
            </Box>

            {cargando ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={36} sx={{ color: "#1E3A5F" }} />
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                {terminos.map((t, index) => (
                  <Box key={t.id || index}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                      {t.titulo}
                    </Typography>
                    <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.8, whiteSpace: "pre-line", fontSize: "0.96rem" }}>
                      {t.contenido}
                    </Typography>
                    {index < terminos.length - 1 && (
                      <Divider sx={{ borderColor: PALETTE.border, mt: 3.5 }} />
                    )}
                  </Box>
                ))}

                <Box sx={{ mt: 3, pt: 3, borderTop: "2px dashed #E2E8F0", textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                    Última actualización: 11/09/2025
                  </Typography>
                  <Typography sx={{ color: "#D4AF37", fontWeight: 800, mt: 0.5, fontSize: "0.95rem" }}>
                    ¡Gracias por elegir Salón Lady Barber Itza D´M!
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
