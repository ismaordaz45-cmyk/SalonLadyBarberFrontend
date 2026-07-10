import { logoBase64ToDataUrl } from "./logoDataUrl";

/**
 * Base64 estándar o url-safe (sin prefijo data:).
 * Debe evaluarse ANTES de tratar cadenas que empiezan por "/" como rutas:
 * el JPEG en base64 suele comenzar con "/9j/".
 */
function looksLikeRawBase64(s) {
  if (s.length < 32) return false;
  return /^[A-Za-z0-9+/=_-]+$/.test(s);
}

/**
 * Convierte imagenUrl del servicio (o insumo) a URL usable en <img src="...">.
 *
 * @param {string|null|undefined} imagenUrl
 * @param {string|null|undefined} apiBaseUrl Origen del API (p. ej. https://salonladybarberbackend.onrender.com) para rutas bajo /uploads
 */
export function resolveServicioImagenUrl(imagenUrl, apiBaseUrl) {
  if (imagenUrl == null) return null;
  const t = String(imagenUrl).trim();
  if (!t || t === "null" || t === "undefined" || t === '""' || t === "''") return null;

  if (t.startsWith("data:")) return t;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("blob:")) return t;

  const base = apiBaseUrl ? String(apiBaseUrl).replace(/\/$/, "") : "";

  const absolutizeUploads = (path) => {
    const p = path.startsWith("/") ? path : `/${path.replace(/^\//, "")}`;
    if (base && p.startsWith("/uploads")) return `${base}${p}`;
    return p;
  };

  /* Rutas estáticas del frontend (CRA public/) */
  if (t.startsWith("/images/")) return t;

  /* Archivos subidos servidos por el backend */
  if (t.startsWith("/uploads")) return absolutizeUploads(t);

  const clean = t.replace(/\r|\n|\s/g, "");

  if (looksLikeRawBase64(clean)) {
    const dataUrl = logoBase64ToDataUrl(clean);
    return dataUrl || null;
  }

  if (t.startsWith("/")) return t;

  if (/\.(jpe?g|png|gif|webp|svg)(\?|#|$)/i.test(t)) {
    return absolutizeUploads(`/${t.replace(/^\//, "")}`);
  }

  return absolutizeUploads(`/${t.replace(/^\//, "")}`);
}
