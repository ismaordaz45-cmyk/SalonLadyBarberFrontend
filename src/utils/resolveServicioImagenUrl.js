/**
 * Convierte imagenUrl del servicio (API) a una URL usable en <img src="...">.
 * Soporta:
 * - data: URL completa
 * - http(s) absolutas
 * - rutas relativas o absolutas (/uploads/foo.jpg)
 * - base64 crudo (como lo guarda Servicios.jsx en admin: solo el payload tras la coma)
 */
export function resolveServicioImagenUrl(imagenUrl) {
  if (imagenUrl == null) return null;
  const t = String(imagenUrl).trim();
  if (!t) return null;

  if (t.startsWith("data:")) return t;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("blob:")) return t;

  if (t.startsWith("/")) return t;

  if (/\.(jpe?g|png|gif|webp|svg)(\?|#|$)/i.test(t)) {
    return `/${t.replace(/^\//, "")}`;
  }

  const clean = t.replace(/\r|\n|\s/g, "");
  if (/^[A-Za-z0-9+/=]+$/.test(clean) && clean.length >= 50) {
    if (clean.startsWith("iVBOR")) return `data:image/png;base64,${clean}`;
    if (clean.startsWith("/9j/")) return `data:image/jpeg;base64,${clean}`;
    if (clean.startsWith("R0lGOD")) return `data:image/gif;base64,${clean}`;
    if (clean.startsWith("UklGR")) return `data:image/webp;base64,${clean}`;
    return `data:image/jpeg;base64,${clean}`;
  }

  return `/${t.replace(/^\//, "")}`;
}
