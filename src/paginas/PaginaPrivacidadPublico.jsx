import React from "react";
import { Box, Container, Typography, Card, CardContent, Button, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PALETTE = {
  pageBg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  accent: "#FACC15",
  primary: "#1E293B"
};

function PaginaPrivacidadPublico() {
  return (
    <Box
      sx={{
        bgcolor: PALETTE.pageBg,
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        "@keyframes slb-riseIn": {
          "0%": { opacity: 0, transform: "translateY(14px) scale(0.992)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" }
        }
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
            animation: "slb-riseIn 700ms cubic-bezier(0.2,0.8,0.2,1) both",
            mb: 4
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              px: { xs: 3, md: 4.5 },
              py: { xs: 3, md: 3.5 },
              background:
                "radial-gradient(1000px 320px at 20% 0%, rgba(250, 204, 21, 0.30) 0%, rgba(250,204,21,0) 55%), radial-gradient(900px 320px at 90% 60%, rgba(30, 41, 59, 0.10) 0%, rgba(30,41,59,0) 60%)",
              borderBottom: `1px solid ${PALETTE.border}`
            }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1 }}>
              POLÍTICA DE PRIVACIDAD - SALÓN LADY BARBER
            </Typography>
            <Typography variant="subtitle1" sx={{ color: PALETTE.textMuted, fontWeight: 500 }}>
              Última actualización: 20 de julio de 2026
            </Typography>
          </Box>

          <CardContent sx={{ px: { xs: 3, md: 4.5 }, py: { xs: 3, md: 4 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              
              {/* Sección 1 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>
                  1. Información que recolectamos
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1.5 }}>
                  Salón Lady Barber recolecta la siguiente información personal cuando utilizas nuestra aplicación web o nuestra skill de voz (Alexa):
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: PALETTE.textMuted, lineHeight: 1.8 }}>
                  <li>Nombre completo</li>
                  <li>Número de teléfono</li>
                  <li>Historial y detalle de citas (servicio, fecha, hora, empleada asignada)</li>
                  <li>Rol de usuario dentro del sistema (cliente, recepción o administrador)</li>
                </Box>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* Sección 2 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>
                  2. Cómo usamos tu información
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1.5 }}>
                  Utilizamos esta información exclusivamente para:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: PALETTE.textMuted, lineHeight: 1.8 }}>
                  <li>Gestionar el agendamiento, confirmación y cancelación de citas</li>
                  <li>Identificar tu perfil de acceso (cliente, recepción o administrador)</li>
                  <li>Generar reportes internos de operación del salón (citas, ingresos, inventario) visibles únicamente para personal autorizado</li>
                </Box>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* Sección 3 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>
                  3. Uso de la skill de Alexa
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                  Nuestra skill de Alexa (&quot;Lady Barber&quot;) se conecta a nuestro backend para consultar y gestionar tus citas por voz. Para verificar tu identidad, generas un código de acceso de 6 dígitos desde tu cuenta en esta aplicación web, el cual usas al hablar con la skill. Este código expira tras un tiempo limitado y no se almacena de forma permanente en Alexa.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* Sección 4 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>
                  4. Compartir información con terceros
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                  No vendemos ni compartimos tu información personal con terceros con fines publicitarios. Tu información solo se transmite entre esta aplicación, nuestro servidor backend y el servicio de Alexa (Amazon) según sea necesario para el funcionamiento del servicio.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* Sección 5 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>
                  5. Almacenamiento y seguridad
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                  Tu información se almacena de forma segura en nuestra base de datos. Tomamos medidas razonables para proteger tus datos contra accesos no autorizados.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* Sección 6 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>
                  6. Tus derechos
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                  Puedes solicitar la corrección o eliminación de tu información personal contactándonos a través de{" "}
                  <Typography component="span" sx={{ fontWeight: 600, color: PALETTE.text }}>
                    salonladybarberitza@gmail.com
                  </Typography>.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* Sección 7 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.text, mb: 1 }}>
                  7. Contacto
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75 }}>
                  Si tienes preguntas sobre esta política de privacidad, contáctanos en:{" "}
                  <Typography component="span" sx={{ fontWeight: 600, color: PALETTE.text }}>
                    salonladybarberitza@gmail.com
                  </Typography>
                </Typography>
              </Box>

            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default PaginaPrivacidadPublico;
