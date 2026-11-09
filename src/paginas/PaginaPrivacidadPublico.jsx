import React, { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Alert
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

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
  const location = useLocation();

  // Desplazamiento automático al hash (ej. #eliminar-cuenta)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const elem = document.getElementById(id);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  const emailDestino = "itzadinorasaenzhernandez@gmail.com";
  const emailAsunto = "Solicitud de eliminación de cuenta LadyBarberApp";
  const mailtoUrl = `mailto:${emailDestino}?subject=${encodeURIComponent(emailAsunto)}`;

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
        {/* Barra superior de navegación */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
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

          <Button
            component={RouterLink}
            to="/terminos"
            startIcon={<DescriptionOutlinedIcon />}
            variant="outlined"
            size="small"
            sx={{
              color: PALETTE.primary,
              borderColor: PALETTE.border,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              "&:hover": { borderColor: PALETTE.primary, bgcolor: "rgba(22, 48, 80, 0.04)" }
            }}
          >
            Ver Términos y Condiciones
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
                justifyContent: "center",
                flexShrink: 0
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
                ✉️ <strong>Correo electrónico:</strong> <a href={`mailto:${emailDestino}`} style={{ color: "#163050", textDecoration: "none", fontWeight: 700 }}>{emailDestino}</a>
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

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* ============================================================== */}
              {/* 10. PRIVACIDAD EN LADYBARBERAPP (APLICACIÓN MÓVIL)             */}
              {/* ============================================================== */}
              <Box
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  bgcolor: "#F8FAFC",
                  borderRadius: 2.5,
                  border: "1px solid #CBD5E1",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "#163050",
                      color: "#38BDF8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <SmartphoneOutlinedIcon sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{ fontWeight: 800, color: PALETTE.text, fontSize: "1.15rem", lineHeight: 1.3 }}
                    >
                      Privacidad en LadyBarberApp
                    </Typography>
                    <Typography variant="caption" sx={{ color: PALETTE.textMuted, fontWeight: 600 }}>
                      Términos de protección específicos para usuarios de la aplicación móvil
                    </Typography>
                  </Box>
                </Box>

                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 2.5, fontSize: "0.96rem" }}>
                  LadyBarberApp es la aplicación móvil de Salón Lady Barber Itza D’M. Esta política también aplica al registro, autenticación, recuperación de acceso, perfil del cliente, consulta de servicios y productos, gestión de citas y demás funciones disponibles en la aplicación móvil.
                </Typography>

                {/* Subsección: DATOS UTILIZADOS POR LA APLICACIÓN */}
                <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "0.98rem" }}>
                  DATOS UTILIZADOS POR LA APLICACIÓN
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1, fontSize: "0.95rem" }}>
                  LadyBarberApp puede utilizar los siguientes datos:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, mb: 2, color: PALETTE.textMuted, lineHeight: 1.8, fontSize: "0.95rem" }}>
                  <li>Nombre y apellidos.</li>
                  <li>Correo electrónico.</li>
                  <li>Número telefónico opcional.</li>
                  <li>Identificador interno de usuario.</li>
                  <li>Credenciales protegidas mediante mecanismos de hash.</li>
                  <li>Información del perfil del cliente.</li>
                  <li>Información de citas y servicios seleccionados.</li>
                  <li>Información operativa relacionada con pagos o transacciones cuando esa función se encuentre disponible.</li>
                </Box>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 2.5, fontSize: "0.95rem", fontStyle: "italic" }}>
                  LadyBarberApp no solicita ni almacena directamente los datos completos de las tarjetas bancarias.
                </Typography>

                {/* Subsección: FINALIDADES */}
                <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "0.98rem" }}>
                  FINALIDADES
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1, fontSize: "0.95rem" }}>
                  Los datos se utilizan para:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, mb: 2.5, color: PALETTE.textMuted, lineHeight: 1.8, fontSize: "0.95rem" }}>
                  <li>Crear y proteger la cuenta.</li>
                  <li>Iniciar sesión.</li>
                  <li>Recuperar el acceso.</li>
                  <li>Mostrar y actualizar el perfil.</li>
                  <li>Consultar servicios y productos.</li>
                  <li>Reservar y administrar citas.</li>
                  <li>Enviar mensajes operativos relacionados con la cuenta, seguridad o citas.</li>
                  <li>Procesar anticipos de servicios físicos cuando la función esté disponible.</li>
                </Box>

                {/* Subsección: PROVEEDORES TECNOLÓGICOS */}
                <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "0.98rem" }}>
                  PROVEEDORES TECNOLÓGICOS
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1, fontSize: "0.95rem" }}>
                  Para prestar sus servicios, LadyBarberApp puede utilizar:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, mb: 1.5, color: PALETTE.textMuted, lineHeight: 1.8, fontSize: "0.95rem" }}>
                  <li><strong>Render</strong> para alojar la API.</li>
                  <li><strong>Hostinger</strong> para almacenar información en la base de datos.</li>
                  <li><strong>Brevo</strong> para enviar correos operativos.</li>
                  <li><strong>Mercado Pago</strong> para procesar pagos cuando el usuario decide utilizar esa función.</li>
                </Box>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 1, fontSize: "0.95rem" }}>
                  Cada proveedor procesa solamente la información necesaria para realizar su función y conforme a sus propias políticas.
                </Typography>
                <Typography sx={{ color: PALETTE.text, fontWeight: 700, lineHeight: 1.75, mb: 2.5, fontSize: "0.95rem" }}>
                  No vendemos los datos personales ni los utilizamos para publicidad de terceros.
                </Typography>

                {/* Subsección: SEGURIDAD */}
                <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "0.98rem" }}>
                  SEGURIDAD
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, mb: 2.5, fontSize: "0.95rem" }}>
                  La aplicación se comunica con su API mediante HTTPS. Las contraseñas no se almacenan en texto legible y las operaciones privadas requieren autenticación.
                </Typography>

                {/* Subsección: EDAD MÍNIMA */}
                <Typography sx={{ fontWeight: 800, color: PALETTE.text, mb: 1, fontSize: "0.98rem" }}>
                  EDAD MÍNIMA
                </Typography>
                <Typography sx={{ color: PALETTE.textMuted, lineHeight: 1.75, fontSize: "0.95rem" }}>
                  LadyBarberApp está dirigida exclusivamente a personas mayores de 18 años. Al registrarse, el usuario declara cumplir esta condición.
                </Typography>
              </Box>

              <Divider sx={{ borderColor: PALETTE.border }} />

              {/* ============================================================== */}
              {/* 11. ELIMINACIÓN DE CUENTA DENTRO DE PRIVACIDAD (id="eliminar-cuenta") */}
              {/* ============================================================== */}
              <Box
                id="eliminar-cuenta"
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  bgcolor: "#FEF2F2",
                  borderRadius: 2.5,
                  border: "1.5px solid #FCA5A5",
                  boxShadow: "0 6px 20px rgba(239, 68, 68, 0.08)",
                  scrollMarginTop: "90px"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "#DC2626",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <DeleteForeverOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{ fontWeight: 800, color: "#991B1B", fontSize: "1.18rem", lineHeight: 1.3 }}
                    >
                      Eliminación de cuenta de LadyBarberApp
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#B91C1C", fontWeight: 600 }}>
                      Derecho a la eliminación y procedimiento formal de baja
                    </Typography>
                  </Box>
                </Box>

                <Typography sx={{ color: "#7F1D1D", lineHeight: 1.75, mb: 2.5, fontSize: "0.96rem" }}>
                  Esta sección es pública, visible y accesible sin necesidad de iniciar sesión, para garantizar en todo momento tu derecho a cancelar el servicio y dar de baja tu información.
                </Typography>

                {/* Paso a paso desde la aplicación */}
                <Typography sx={{ fontWeight: 800, color: "#7F1D1D", mb: 1, fontSize: "1rem" }}>
                  ELIMINACIÓN DESDE LA APLICACIÓN
                </Typography>
                <Typography sx={{ color: "#7F1D1D", lineHeight: 1.75, mb: 1.2, fontSize: "0.95rem" }}>
                  El usuario puede eliminar su cuenta directamente desde LadyBarberApp mediante el siguiente procedimiento:
                </Typography>
                <Box component="ol" sx={{ pl: 3, m: 0, mb: 2, color: "#7F1D1D", lineHeight: 1.85, fontSize: "0.95rem" }}>
                  <li>Iniciar sesión.</li>
                  <li>Abrir la sección Mi Perfil.</li>
                  <li>Seleccionar Eliminar cuenta.</li>
                  <li>Ingresar la contraseña actual.</li>
                  <li>Escribir la palabra ELIMINAR.</li>
                  <li>Confirmar la eliminación definitiva.</li>
                </Box>
                <Typography sx={{ color: "#7F1D1D", lineHeight: 1.75, mb: 3, fontSize: "0.94rem" }}>
                  La eliminación revoca el acceso a la cuenta y elimina o anonimiza los datos personales asociados. Algunos registros pueden conservarse cuando exista una obligación legal, contable, de seguridad o prevención de fraude.
                </Typography>

                <Divider sx={{ borderColor: "#FCA5A5", my: 2.5 }} />

                {/* Solicitud sin tener instalada la aplicación */}
                <Typography sx={{ fontWeight: 800, color: "#7F1D1D", mb: 1, fontSize: "1rem" }}>
                  SOLICITUD SIN TENER INSTALADA LA APLICACIÓN
                </Typography>
                <Typography sx={{ color: "#7F1D1D", lineHeight: 1.75, mb: 1.5, fontSize: "0.95rem" }}>
                  Si el usuario no puede acceder a LadyBarberApp, puede iniciar una solicitud de eliminación enviando un correo a:{" "}
                  <a
                    href={mailtoUrl}
                    style={{ color: "#991B1B", fontWeight: 700, textDecoration: "underline" }}
                  >
                    {emailDestino}
                  </a>
                </Typography>

                {/* Botón directo de correo */}
                <Box sx={{ my: 2 }}>
                  <Button
                    variant="contained"
                    href={mailtoUrl}
                    startIcon={<MailOutlineIcon />}
                    sx={{
                      bgcolor: "#DC2626",
                      color: "#FFFFFF",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 2.5,
                      py: 1,
                      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                      "&:hover": { bgcolor: "#B91C1C" }
                    }}
                  >
                    Enviar correo de solicitud de eliminación
                  </Button>
                </Box>

                <Typography sx={{ color: "#7F1D1D", lineHeight: 1.75, mb: 1, fontSize: "0.95rem" }}>
                  El usuario deberá proporcionar:
                </Typography>
                <Box component="ul" sx={{ pl: 3, m: 0, mb: 2.5, color: "#7F1D1D", lineHeight: 1.8, fontSize: "0.95rem" }}>
                  <li>Nombre registrado.</li>
                  <li>Correo asociado a la cuenta.</li>
                  <li>Número telefónico, solamente si se encuentra registrado.</li>
                </Box>

                {/* Advertencia visible */}
                <Alert
                  severity="warning"
                  icon={<WarningAmberRoundedIcon sx={{ color: "#B45309" }} />}
                  sx={{
                    bgcolor: "#FFFBEB",
                    color: "#92400E",
                    border: "1px solid #FCD34D",
                    borderRadius: 2,
                    mb: 2,
                    "& .MuiAlert-message": { fontSize: "0.92rem", lineHeight: 1.6 }
                  }}
                >
                  <strong>Advertencia:</strong> Nunca envíes tu contraseña, códigos de recuperación, tokens, datos bancarios ni información completa de tarjetas por correo electrónico.
                </Alert>

                <Typography sx={{ color: "#7F1D1D", lineHeight: 1.75, fontSize: "0.92rem", fontStyle: "italic" }}>
                  Podrá solicitarse una verificación razonable de identidad antes de completar la eliminación para proteger la titularidad de tu cuenta.
                </Typography>
              </Box>

              {/* Enlace complementario a Términos y Condiciones */}
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                  border: "1px dashed #CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5
                }}
              >
                <Typography sx={{ color: PALETTE.textMuted, fontSize: "0.92rem" }}>
                  Para revisar las reglas de uso, citas y condiciones del servicio:
                </Typography>
                <Button
                  component={RouterLink}
                  to="/terminos"
                  startIcon={<DescriptionOutlinedIcon />}
                  size="small"
                  sx={{
                    color: PALETTE.primary,
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
                  }}
                >
                  Consultar Términos y Condiciones completos →
                </Button>
              </Box>

              {/* Footer con fecha de actualización */}
              <Box sx={{ mt: 2, pt: 3, borderTop: "2px dashed #E2E8F0", textAlign: "center" }}>
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
