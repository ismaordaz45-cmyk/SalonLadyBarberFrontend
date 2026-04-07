export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && parsed.rol ? parsed : null;
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

