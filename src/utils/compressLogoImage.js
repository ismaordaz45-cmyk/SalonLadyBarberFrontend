/**
 * Redimensiona y convierte a JPEG para reducir el base64 enviado al backend.
 * Evita errores MySQL "Got a packet bigger than max_allowed_packet" con PNG grandes.
 * Fondo blanco en zonas transparentes (típico para logo en cabeceras claras).
 */
const MAX_EDGE = 800;
const JPEG_QUALITY = 0.82;

export function compressLogoImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("No es una imagen"));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { naturalWidth: w, naturalHeight: h } = img;
        if (!w || !h) {
          reject(new Error("Imagen inválida"));
          return;
        }
        const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
        const cw = Math.max(1, Math.round(w * scale));
        const ch = Math.max(1, Math.round(h * scale));

        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas no disponible"));
          return;
        }
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);

        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        const comma = dataUrl.indexOf(",");
        const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };

    img.src = url;
  });
}
