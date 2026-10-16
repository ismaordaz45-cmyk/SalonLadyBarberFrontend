export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // Para considerar al usuario autenticado, debe existir tanto el objeto user como el token JWT
    if (!raw || !token) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.rol) return null;

    // Verificar si el token JWT no ha expirado
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          // Token expirado: limpiar almacenamiento
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
          return null;
        }
      }
    } catch {
      // Si el formato del token está corrupto
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getHomeByRole(rol) {
  switch (rol) {
    case "PROPIETARIA":
      return "/admin";
    case "EMPLEADA":
      return "/recepcion";
    case "CLIENTE":
      return "/cliente";
    default:
      return "/";
  }
}

