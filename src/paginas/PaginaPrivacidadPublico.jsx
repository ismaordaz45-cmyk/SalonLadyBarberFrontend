import React from "react";
import { Box, Container, Typography, Card, CardContent, Button, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

const PALETTE = {
  pageBg: "#F1F5F9",
  card: "#FFFFFF",
  text: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  accent: "#D4AF37",
  primary: "#163050"
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
                bgcolor: "#163050",
                color: "#D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <SecurityOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: PALETTE.text }}>
                POLÍTICA DE PRIVACIDAD Y CONDICIONES DE USO
              </Typography>
              <Typography variant="subtitle2" sx={{ color: PALETTE.textMuted, fontWeight: 500 }}>
                Salón Lady Barber Itza D´M — Protección, transparencia y seguridad de tus datos
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ px: { xs: 3, md: 5 }, py: { xs: 3.5, md: 4.5 } }}>
            {/* 1. Identidad y responsable */}
            <Box
              sx={{
                p: 3,
                mb: 4,
                bgcolor: "#F8FAFC",
                borderRadius: 2.5,
                border: "1px solid #E2E8F0"
              }}
            >
              <Typography sx={{ color: PALETTE.text, fontWeight: 700, mb: 1, fontSize: "1.05rem" }}>
                1. Identidad y responsable del tratamiento de datos
              </Typography>
              <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.7, mb: 2, fontSize: "0.95rem" }}>
                La presente política aplica al <strong>Salón Lady Barber Itza D´M</strong>, responsable del uso y protección de los datos personales recabados a través de nuestro sitio web, aplicaciones móviles y asistentes de voz.
              </Typography>
              <Typography sx={{ color: PALETTE.textMuted, fontSize: "0.92rem", fontWeight: 600 }}>
                Para cualquier asunto relacionado con esta política puede comunicarse a:
              </Typography>
              <Typography sx={{ color: PALETTE.text, fontSize: "0.92rem", mt: 0.5 }}>
                📞 <strong>Teléfono:</strong> <a href="tel:7711136094" style={{ color: "#163050", textDecoration: "none", fontWeight: 700 }}>771 113 6094</a>
                <br />
                ✉️ <strong>Correo electrónico:</strong> <a href="mailto:itzadinorasaenzhernandez@gmail.com" style={{ color: "#163050", textDecoration: "none", fontWeight: 700 }}>itzadinorasaenzhernandez@gmail.com</a>
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {/* 2. Datos personales que se recaban */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  2. Datos personales que se recaban
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1.5, fontSize: "0.96rem" }}>
                  Salón Lady Barber Itza D´M recaba los siguientes datos personales cuando utilizas nuestra plataforma digital:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: PALETTE.textMuted, lineHeight: 1.8, fontSize: "0.95rem" }}>
                  <li>Nombre completo</li>
                  <li>Teléfono de contacto</li>
                  <li>Correo electrónico</li>
                  <li>Fecha de nacimiento</li>
                  <li>Género</li>
                  <li>Métodos de pago e información de facturación/transacción</li>
                </Box>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* 3. Finalidad del uso de los datos */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  3. Finalidad del uso de los datos
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1.5, fontSize: "0.96rem" }}>
                  Los datos recabados serán utilizados para las siguientes finalidades primarias (necesarias para el servicio):
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: PALETTE.textMuted, lineHeight: 1.8, fontSize: "0.95rem" }}>
                  <li>Registrar, gestionar y confirmar citas en el salón.</li>
                  <li>Controlar agenda, tiempos de atención y asignación de personal.</li>
                  <li>Procesar pagos y emitir comprobantes de compra.</li>
                  <li>Enviar recordatorios de citas y avisos operativos.</li>
                  <li>Notificar promociones, descuentos o campañas especiales.</li>
                  <li>Analizar tendencias de uso para la mejora continua del servicio.</li>
                </Box>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* 4. Uso de la Skill de Voz (Alexa) */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  4. Integración y uso con Asistente de Voz (Alexa)
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, fontSize: "0.96rem" }}>
                  Nuestra skill de voz oficial de Alexa ("Lady Barber") se conecta con nuestro backend de manera cifrada para permitirte consultar, agendar y gestionar tus citas mediante comandos de voz. Para verificar tu identidad, el sistema genera un código de vinculación temporal de 6 dígitos desde tu cuenta web, el cual expira tras un periodo breve y <strong>nunca se almacena de forma permanente ni pública</strong> en los servidores de Amazon.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* 5. Transferencia de datos */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  5. Transferencia de datos
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, fontSize: "0.96rem" }}>
                  Los datos personales <strong>no serán vendidos ni compartidos con terceros</strong> con fines publicitarios o ajenos a la operación, salvo por obligación legal o requerimiento expreso de una autoridad competente.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* 6. Derechos ARCO */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  6. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1.5, fontSize: "0.96rem" }}>
                  Como titular de tus datos personales, tienes derecho en todo momento a:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, color: PALETTE.textMuted, lineHeight: 1.8, fontSize: "0.95rem" }}>
                  <li><strong>Acceder</strong> a los datos registrados en tu cuenta.</li>
                  <li><strong>Rectificarlos</strong> en caso de estar desactualizados, inexactos o erróneos.</li>
                  <li><strong>Cancelar</strong> su uso y solicitar la eliminación de tu cuenta cuando consideres que ya no son necesarios para los fines estipulados.</li>
                  <li><strong>Oponerte</strong> al tratamiento de los mismos para finalidades específicas.</li>
                </Box>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* 7. Conservación de la información */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  7. Conservación de la información
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, fontSize: "0.96rem" }}>
                  En caso de inactividad del usuario en un período máximo de <strong>24 meses (2 años)</strong> contados a partir del último inicio de sesión o servicio, se desactivará la cuenta. El Salón Lady Barber Itza D´M conservará los datos personales exclusivamente como registro histórico y contable del sistema con las debidas medidas de disociación y seguridad.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* 8. Seguridad de la información */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  8. Seguridad de la información
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, fontSize: "0.96rem" }}>
                  El Salón Lady Barber Itza D´M implementa medidas técnicas, administrativas y físicas rigurosas para proteger los datos contra acceso no autorizado, alteración, pérdida o divulgación indebida.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* 9. Modificaciones y Aceptación */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "1.08rem" }}>
                  9. Modificaciones y Aceptación
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, fontSize: "0.96rem" }}>
                  El Salón Lady Barber Itza D´M podrá actualizar esta política en cualquier momento. La versión vigente será publicada en el sistema y entrará en vigor desde su fecha de publicación. El uso de nuestros servicios y el registro de datos implica la aceptación plena de esta política.
                </Typography>
              </Box>

              {/* Footer con fecha de actualización */}
              <Box sx={{ mt: 3, pt: 3, borderTop: "2px dashed #E2E8F0", textAlign: "center" }}>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                  Última actualización: 11/09/2025
                </Typography>
                <Typography sx={{ color: "#D4AF37", fontWeight: 800, mt: 0.5, fontSize: "0.95rem" }}>
                  Salón Lady Barber Itza D´M — Comprometidos con tu privacidad
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
