/**
 * Convierte el texto base64 guardado en BD a data URL con el MIME correcto.
 * Si siempre se usa image/jpeg y el archivo es PNG/WebP, el logo se ve cortado o corrupto.
 */
export function logoBase64ToDataUrl(base64) {
  if (base64 == null) return "";
  const raw = String(base64).trim().replace(/\s/g, "");
  if (!raw) return "";
  if (raw.startsWith("data:image")) return raw;

  let mime = "image/jpeg";
  if (raw.startsWith("iVBORw0KGgo")) mime = "image/png";
  else if (raw.startsWith("R0lGOD")) mime = "image/gif";
  else if (raw.startsWith("UklGR")) mime = "image/webp";
  else if (raw.startsWith("PHN2Zy")) mime = "image/svg+xml";

  return `data:${mime};base64,${raw}`;
}
