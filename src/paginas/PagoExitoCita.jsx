import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Box, Typography, Button, CircularProgress, Paper, Divider, Stack } from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { ADMIN_PALETTE as P } from "../ui/admin/adminTokens";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const PagoExitoCita = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirmado, setConfirmado] = useState(false);
  const [cita, setCita] = useState(null);
  const hasCalled = useRef(false);

  const citaId = searchParams.get("citaId");
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const confirmarPagoCita = async () => {
      try {
        if (citaId && paymentId) {
          // 1. Confirmar pago en el backend
          await api.post("/api/mercado-pago/confirmar-pago-cita", {
            citaId,
            mpPaymentId: paymentId,
            mpStatus: status
          });
          setConfirmado(true);

          // 2. Cargar detalles completos de la cita para el recibo y PDF
          const { data } = await api.get(`/api/citas/${citaId}`);
          setCita(data);
        }
      } catch (error) {
        console.error("Error confirmando pago de cita:", error);
        Swal.fire({
          icon: "error",
          title: "Error de confirmación",
          text: error?.response?.data?.error || "Ocurrió un problema al confirmar tu reservación.",
          confirmButtonColor: P.navy
        });
      } finally {
        setLoading(false);
      }
    };

    confirmarPagoCita();
  }, [citaId, paymentId, status]);

  const generatePDF = () => {
    if (!cita) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter"
    });

    const total = Number(cita.precioFinal) || 0;
    const anticipo = total / 2;
    const restante = total - anticipo;

    // Colores corporativos (Lady Barber Theme: Navy & Gold)
    const navyColor = [30, 58, 90]; // #1E3A5A
    const goldColor = [212, 175, 55]; // #D4AF37

    // --- Header ---
    doc.setFillColor(...navyColor);
    doc.rect(0, 0, 216, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SALÓN LADY BARBER", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Comprobante de Anticipo de Reservación", 15, 26);

    doc.setTextColor(...goldColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("50% PAGADO", 160, 20);

    // --- Detalles Cita ---
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    
    // Y-Offset cursor
    let y = 48;

    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE LA RESERVACIÓN", 15, y);
    doc.setDrawColor(229, 231, 235);
    doc.line(15, y + 2, 201, y + 2);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Folio Cita (ID):", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(cita.id), 50, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(cita.clienteNombre || "Cliente Registrado", 50, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Estilista:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(cita.empleadaNombre || "Sin asignar", 50, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", 15, y);
    doc.setFont("helvetica", "normal");
    const f = new Date(cita.fecha ? cita.fecha.replace(/-/g, "/") : Date.now()).toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(f, 50, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Horario:", 15, y);
    doc.setFont("helvetica", "normal");
    const hInicio = new Date(cita.horaInicio).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit', hour12: true });
    const hFin = new Date(cita.horaFin).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit', hour12: true });
    doc.text(`${hInicio} a ${hFin}`, 50, y);

    y += 12;

    // --- Tabla de Servicios ---
    doc.setFont("helvetica", "bold");
    doc.text("SERVICIOS RESERVADOS", 15, y);
    y += 4;

    const tableHeaders = [["Servicio", "Duración Aprox.", "Costo"]];
    const tableRows = (cita.servicios || []).map(s => [
      s.nombre || "Servicio",
      `${s.duracionMinutos || 0} min`,
      `$${(Number(s.precio) || 0).toFixed(2)} MXN`
    ]);

    doc.autoTable({
      startY: y,
      head: tableHeaders,
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: navyColor, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40, halign: "center" },
        2: { cellWidth: 46, halign: "right" }
      }
    });

    // Actualizar posición y después de la tabla
    y = doc.previousAutoTable.finalY + 12;

    // --- Desglose de Pago ---
    doc.setDrawColor(229, 231, 235);
    doc.line(120, y, 201, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Total Servicios:", 120, y);
    doc.setFont("helvetica", "normal");
    doc.text(`$${total.toFixed(2)} MXN`, 201, y, { align: "right" });

    y += 6;
    doc.setFillColor(244, 244, 245);
    doc.rect(118, y - 4, 85, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Anticipo Pagado (50%):", 120, y);
    doc.text(`$${anticipo.toFixed(2)} MXN`, 201, y, { align: "right" });

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Resta por Liquidar:", 120, y);
    doc.setFont("helvetica", "normal");
    doc.text(`$${restante.toFixed(2)} MXN`, 201, y, { align: "right" });

    y += 18;

    // --- Nota Aclaratoria Box ---
    doc.setFillColor(254, 252, 242); // crema suave
    doc.setDrawColor(...goldColor);
    doc.setLineWidth(0.5);
    doc.rect(15, y, 186, 28, "FD");

    doc.setTextColor(...navyColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("POLÍTICA Y RECOMENDACIÓN DE RESERVACIÓN:", 20, y + 6);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    
    const lines = [
      "- El abono del 50% realizado como anticipo para asegurar tu lugar NO TIENE DEVOLUCIÓN.",
      "- Se recomienda asistir 20 minutos antes de la hora programada a tu cita para evitar contratiempos.",
      "¡Gracias por confiar en la barbería y permitirnos consentirte!"
    ];

    doc.text(lines[0], 20, y + 12);
    doc.text(lines[1], 20, y + 17);
    doc.text(lines[2], 20, y + 22);

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Salón Lady Barber - Generado digitalmente de forma segura", 108, 265, { align: "center" });

    // Guardar
    doc.save(`Comprobante_Cita_${(citaId || cita.id || "reserva").slice(0, 8)}.pdf`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <CircularProgress sx={{ color: P.navy }} />
        <Typography sx={{ mt: 2, fontWeight: 700 }}>Procesando tu pago y confirmando reservación...</Typography>
      </Box>
    );
  }

  if (!confirmado || !cita) {
    return (
      <Box sx={{ p: 4, textAlign: "center", maxWidth: 500, mx: "auto", mt: 8 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: P.red, mb: 1 }}>
          No se pudo confirmar tu pago
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 4 }}>
          No encontramos registro de un pago exitoso o la cita ya fue cancelada.
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/cliente/citas")}
          sx={{ bgcolor: P.navy, py: 1.5, fontWeight: 700, borderRadius: 2 }}
        >
          Volver a Mis Citas
        </Button>
      </Box>
    );
  }

  const total = Number(cita.precioFinal) || 0;
  const anticipo = total / 2;
  const restante = total - anticipo;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 650, mx: "auto", mt: { xs: 2, sm: 6 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: "24px",
          border: "1px solid rgba(229, 231, 235, 1)",
          boxShadow: "0 15px 40px rgba(0, 0, 0, 0.04)",
          textAlign: "center"
        }}
      >
        <CheckCircleOutlineRoundedIcon sx={{ fontSize: 72, color: "#15803D", mb: 2.5 }} />
        <Typography variant="h4" sx={{ fontWeight: 900, color: P.navy, mb: 1, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
          ¡Cita Reservada y Confirmada!
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 4, fontSize: "0.95rem" }}>
          Hemos recibido tu abono del 50% correctamente. Tu estilista te estará esperando.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: "#F8FAFC",
            borderRadius: "16px",
            border: "1px solid rgba(241, 245, 249, 1)",
            textAlign: "left",
            mb: 4
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: P.navy, mb: 2 }}>
            RESUMEN DE TU CITA
          </Typography>

          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>Servicios:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", textAlign: "right" }}>
                {(cita.servicios || []).map(s => s.nombre).join(", ") || "—"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>Estilista asignada:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{cita.empleadaNombre || "—"}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>Fecha:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                {new Date(cita.fecha ? cita.fecha.replace(/-/g, "/") : Date.now()).toLocaleDateString("es-MX", { weekday: 'long', day: 'numeric', month: 'long' })}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>Horario:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                {new Date(cita.horaInicio).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>Costo Total:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>${total.toFixed(2)} MXN</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#15803D", fontSize: "0.9rem", fontWeight: 700 }}>Anticipo Pagado (50%):</Typography>
              <Typography sx={{ color: "#15803D", fontWeight: 800, fontSize: "0.9rem" }}>-${anticipo.toFixed(2)} MXN</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", pt: 0.5 }}>
              <Typography sx={{ color: P.navy, fontSize: "0.9rem", fontWeight: 800 }}>Resta por pagar en salón:</Typography>
              <Typography sx={{ color: P.navy, fontWeight: 900, fontSize: "1rem" }}>${restante.toFixed(2)} MXN</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Políticas Aclaratorias en UI */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: "rgba(212, 175, 55, 0.05)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "16px",
            textAlign: "left",
            mb: 4
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800, color: P.navy, mb: 1 }}>
            Políticas e indicaciones importantes:
          </Typography>
          <Typography variant="caption" component="div" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            • El abono del 50% ($ {anticipo.toFixed(2)} MXN) realizado no tiene devolución bajo ninguna circunstancia.<br />
            • Por favor, asiste <strong>20 minutos antes</strong> de la hora acordada a tu cita para garantizar la calidad del servicio.<br />
            • Descarga tu comprobante PDF y preséntalo el día del servicio.<br />
            <strong>¡Muchas gracias por confiar en la barbería!</strong>
          </Typography>
        </Paper>

        <Stack spacing={2} direction={{ xs: "column", sm: "row" }} justifyContent="center">
          <Button
            variant="contained"
            onClick={generatePDF}
            startIcon={<DownloadRoundedIcon />}
            sx={{
              bgcolor: P.accent,
              color: P.oscuro,
              fontWeight: 800,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#c49a2e", boxShadow: "none" }
            }}
          >
            Descargar Comprobante PDF
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/cliente/citas")}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              borderColor: P.border,
              color: P.navy,
              fontWeight: 800,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              "&:hover": { borderColor: P.navy, bgcolor: "rgba(30, 58, 90, 0.04)" }
            }}
          >
            Ir a Mis Citas
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PagoExitoCita;
