/**
 * Servicio de Recomendaciones Inteligentes (Simulación de extracción BD & Algoritmo Cross-Selling)
 */

// Reglas de asociación y palabras clave simulares para afinidad
const AFINIDADES_CATEGORIA = {
  shampoo: ["acondicionador", "mascarilla", "tónico", "shampoo"],
  barba: ["aceite", "bálsamo", "peine", "jabón"],
  cera: ["spray", "pomada", "peine", "gel"],
  aceite: ["bálsamo", "shampoo", "jabón"],
  corte: ["cera", "pomada", "laca"]
};

const RAZONES_SIMULADAS = [
  "Clientes que compraron estos artículos también agregaron esto",
  "Ideal para complementar los productos de tu carrito",
  "Recomendado según patrones de compra en el salón",
  "Top complemento con alto índice de satisfacción"
];

const TAGS_SIMULADOS = [
  "98% Coincidencia",
  "Más Popular Junto",
  "Recomendado para ti",
  "Complemento Top"
];

/**
 * Simula la extracción de la BD y la ejecución del motor de recomendación
 * @param {Array} cart - Lista de productos en el carrito actual
 * @param {Array} productos - Catálogo completo de insumos/productos
 * @param {number} limit - Cantidad máxima de recomendaciones
 * @returns {Promise<Array>} Lista de productos recomendados enriquecidos con métricas simuladas
 */
export async function simularExtraccionRecomendaciones(cart = [], productos = [], limit = 3) {
  // Simular un pequeño retardo de consulta a la BD (150ms - 300ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!Array.isArray(productos) || productos.length === 0) {
    return [];
  }

  const idsEnCarrito = new Set(cart.map((item) => Number(item.id)));
  
  // Filtrar productos disponibles y que NO estén ya en el carrito
  const elegibles = productos.filter((p) => {
    const stock = Number(p.stockActual ?? 1);
    return !idsEnCarrito.has(Number(p.id)) && stock > 0;
  });

  if (elegibles.length === 0) return [];

  // Calcular score de afinidad para cada producto elegible
  const puntuados = elegibles.map((p, index) => {
    let score = 50; // Base score
    const pNombre = String(p.nombre || "").toLowerCase();

    // Si hay items en el carrito, buscar coincidencias de afinidad
    if (cart.length > 0) {
      cart.forEach((cItem) => {
        const cNombre = String(cItem.nombre || "").toLowerCase();
        
        // Coincidencias de palabras clave
        Object.keys(AFINIDADES_CATEGORIA).forEach((cat) => {
          if (cNombre.includes(cat)) {
            AFINIDADES_CATEGORIA[cat].forEach((rel) => {
              if (pNombre.includes(rel)) {
                score += 35;
              }
            });
          }
        });

        // Simulación de rango de precio complementario
        const diffPrecio = Math.abs(Number(p.precioUnitario || 0) - Number(cItem.precioUnitario || 0));
        if (diffPrecio < 150) {
          score += 15;
        }
      });
    } else {
      // Si el carrito está vacío, dar prioridad a stock alto y precios populares
      score += (Number(p.stockActual || 0) > 5 ? 20 : 5);
    }

    // Variación determinista para simular ponderación de BD
    score += (Number(p.id) * 7) % 25;

    return { ...p, _score: score, _origIndex: index };
  });

  // Ordenar por score descendente
  puntuados.sort((a, b) => b._score - a._score);

  // Tomar los N mejores
  const recomendados = puntuados.slice(0, limit);

  // Enriquecer con metadatos simulados de Inteligencia/BD
  return recomendados.map((rec, i) => {
    const coincidencia = Math.min(99, Math.max(82, 98 - i * 4 - ((rec.id * 3) % 5)));
    return {
      ...rec,
      coincidenciaPorcentaje: `${coincidencia}% Coincidencia`,
      razonRecomendacion: RAZONES_SIMULADAS[i % RAZONES_SIMULADAS.length],
      tagRecomendacion: TAGS_SIMULADOS[i % TAGS_SIMULADOS.length]
    };
  });
}
