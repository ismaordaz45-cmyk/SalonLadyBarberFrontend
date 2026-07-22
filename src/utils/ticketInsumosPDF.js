import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function moneyMXN(value) {
  if (value == null || value === "") return "$0.00";
  const n = Number(value);
  if (!Number.isFinite(n)) return "$0.00";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

export const descargarTicketInsumosPDF = (pedido) => {
  try {
    if (!pedido) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter"
    });

    const total = Number(pedido.total) || 0;
    const dateStr = pedido.fecha ? new Date(pedido.fecha).toLocaleDateString("es-MX", { dateStyle: "long" }) : "—";
    const timeStr = pedido.fecha ? new Date(pedido.fecha).toLocaleTimeString("es-MX", { hour12: false }) : "—";

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
    doc.text("Comprobante de Compra de Productos", 15, 26);

    doc.setTextColor(...goldColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TOTAL PAGADO", 160, 20);

    // --- Detalles Pedido ---
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    
    let y = 50;
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL PEDIDO", 15, y);
    
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Pedido ID: #${pedido.id}`, 15, y);
    doc.text(`Fecha: ${dateStr}`, 110, y);

    y += 6;
    doc.text(`Hora de Pago: ${timeStr}`, 15, y);
    doc.text(`Estado del Pago: APROBADO (Mercado Pago)`, 110, y);

    y += 6;
    doc.text(`Referencia Pago: ${pedido.mp_payment_id || "—"}`, 15, y);

    // --- Recoger en Local Notice ---
    y += 12;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, y, 186, 18, "FD");

    doc.setTextColor(30, 58, 90);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("⚠️ INDICACIONES IMPORTANTES DE ENTREGA:", 20, y + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Con este comprobante deberá recoger sus productos de manera presencial en el local del salón.", 20, y + 12);

    // --- Tabla de Productos ---
    y += 28;
    
    const headers = [["Producto/Insumo", "Cantidad", "Precio Unitario", "Subtotal"]];
    const data = (pedido.items || []).map((item) => [
      item.nombre,
      `${item.cantidad} pza(s)`,
      moneyMXN(item.precio_unitario),
      moneyMXN(item.precio_unitario * item.cantidad)
    ]);

    autoTable(doc, {
      startY: y,
      head: headers,
      body: data,
      headStyles: { fillColor: navyColor, textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 28, halign: "right" },
        3: { cellWidth: 28, halign: "right" }
      },
      margin: { left: 15, right: 15 }
    });

    // --- Total ---
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setTextColor(30, 58, 90);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Total Liquidado: ${moneyMXN(total)} MXN`, 140, finalY);

    // --- Firma / Sello Mock ---
    doc.setDrawColor(226, 232, 240);
    doc.line(15, finalY + 25, 85, finalY + 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Firma o Sello de Recepción", 28, finalY + 30);

    // Guardar PDF
    doc.save(`Ticket_Compra_LadyBarber_#${pedido.id}.pdf`);
  } catch (err) {
    console.error("Error al generar PDF de insumos:", err);
  }
};
