import api from "../api";

/**
 * Servicio de Recomendaciones Inteligentes (Reglas de Asociación Market Basket Analysis ML)
 */

const RAZONES_ML = [
  "Clientes que compraron estos artículos también agregaron esto",
  "Basado en patrones de co-compra frecuentes del salón",
  "Asociación estadística con alta confianza",
  "Top producto complementario sugerido por ML"
];

/**
 * Obtiene recomendaciones de productos reales consultando el microservicio ML via backend API.
 * Caída automática a scoring local si el servicio no está disponible o el carrito es nuevo.
 *
 * @param {Array} cart - Lista de productos en el carrito actual
 * @param {Array} productos - Catálogo completo de insumos/productos activos
 * @param {number} limit - Cantidad máxima de recomendaciones
 * @returns {Promise<Array>} Lista de productos del catálogo enriquecidos con métricas ML
 */
export async function simularExtraccionRecomendaciones(cart = [], productos = [], limit = 3) {
  if (!Array.isArray(productos) || productos.length === 0) {
    return [];
  }

  const idsEnCarrito = cart.map((item) => Number(item.id)).filter(Boolean);
  const mapaProductos = new Map(productos.map((p) => [Number(p.id), p]));

  try {
    // 1. Consultar endpoint proxy backend
    const { data } = await api.post("/api/prediccion/recomendar-productos", {
      carrito: idsEnCarrito,
      top_n: limit
    });

    if (data && Array.isArray(data.recomendaciones) && data.recomendaciones.length > 0) {
      const resultadoML = [];

      for (let i = 0; i < data.recomendaciones.length; i++) {
        const rec = data.recomendaciones[i];
        const prodId = Number(rec.producto_id);

        // Si el producto está en el catálogo local y no está en el carrito
        if (mapaProductos.has(prodId) && !idsEnCarrito.includes(prodId)) {
          const prodObj = mapaProductos.get(prodId);
          const stock = Number(prodObj.stockActual ?? 1);
          if (stock <= 0) continue;

          let coincidenciaStr = "Recomendado ML";
          let tagStr = "Patrón Frecuente";

          if (rec.fuente === "regla_asociacion" && rec.confianza != null) {
            const confPct = Math.round(rec.confianza * 100);
            coincidenciaStr = `${confPct}% Confianza`;
            tagStr = rec.lift ? `${Number(rec.lift).toFixed(1)}x Más Probable` : "Regla Frecuente";
          } else if (rec.fuente === "top_populares_fallback") {
            coincidenciaStr = "Top Popular";
            tagStr = "Más Vendido";
          }

          resultadoML.push({
            ...prodObj,
            coincidenciaPorcentaje: coincidenciaStr,
            razonRecomendacion: RAZONES_ML[i % RAZONES_ML.length],
            tagRecomendacion: tagStr,
            _mlFuente: rec.fuente
          });
        }
      }

      if (resultadoML.length > 0) {
        return resultadoML.slice(0, limit);
      }
    }
  } catch (err) {
    console.warn("⚠️ API ML de recomendaciones no disponible, usando fallback local:", err.message);
  }

  // Fallback local determinista si la API no está disponible
  const idsSet = new Set(idsEnCarrito);
  const elegibles = productos.filter((p) => !idsSet.has(Number(p.id)) && Number(p.stockActual ?? 1) > 0);

  if (elegibles.length === 0) return [];

  const ordenados = [...elegibles].sort((a, b) => (Number(b.stockActual || 0) - Number(a.stockActual || 0)));
  return ordenados.slice(0, limit).map((rec, i) => ({
    ...rec,
    coincidenciaPorcentaje: "Sugerencia Top",
    razonRecomendacion: RAZONES_ML[i % RAZONES_ML.length],
    tagRecomendacion: "Más Popular",
    _mlFuente: "fallback_local"
  }));
}

