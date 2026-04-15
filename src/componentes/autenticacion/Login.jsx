import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import DOMPurify from "dompurify";
import LoginPage from "./LoginPage";
import { useBarberActionOverlay } from "../../context/BarberActionOverlayContext";

const MySwal = withReactContent(Swal);

const sanitizeInput = (value) =>
  DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim();

const API_URL = "http://localhost:4000";

const MSG_LOGIN_INVALIDO =
  "Los datos ingresados no son válidos. Por favor, verifica tu correo y contraseña.";

function Login() {
  const navigate = useNavigate();
  const { runWithOverlay } = useBarberActionOverlay();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    correo: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    if (name === "correo") {
      sanitizedValue = sanitizeInput(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.correo || !formData.password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API_URL}/api/login`,
        {
          correo: formData.correo,
          password: formData.password
        },
        {
          barberHeadline: "¡Bienvenido!",
          barberMessage: "Iniciando sesión…"
        }
      );

      if (!data?.user) {
        throw new Error("Respuesta inválida del servidor");
      }

      if (data?.token) {
        localStorage.setItem("token", String(data.token));
      }

      const normalizedRole = String(data.user?.rol || "").trim().toUpperCase();
      const normalizedUser = {
        ...data.user,
        rol: normalizedRole || data.user?.rol
      };

      localStorage.setItem("user", JSON.stringify(normalizedUser));

      const rol = normalizedRole;

      let redirectPath = "/";

      switch (rol) {
        case "PROPIETARIA":
          redirectPath = "/admin";
          break;

        case "EMPLEADA":
          redirectPath = "/recepcion";
          break;

        case "CLIENTE":
        default:
          redirectPath = "/cliente";
          break;
      }

      await runWithOverlay(
        () => new Promise((resolve) => setTimeout(resolve, 420)),
        "Preparando tu espacio en el sistema…",
        { headline: "¡Bienvenido!", minMs: 720 }
      );

      navigate(redirectPath, { replace: true });
    } catch (err) {
      const serverMsg = err.response?.data?.error;
      const usarMensajeFigma =
        !serverMsg ||
        /incorrect|inválid|invalid|credencial|password|contraseña|correo/i.test(String(serverMsg));

      setError(usarMensajeFigma ? MSG_LOGIN_INVALIDO : String(serverMsg));

      await MySwal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: usarMensajeFigma ? MSG_LOGIN_INVALIDO : String(serverMsg),
        position: "center",
        timer: 2200,
        showConfirmButton: false,
        timerProgressBar: true,
        background: "#FEF2F2",
        color: "#1E293B",
        iconColor: "#DC2626"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginPage
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword((p) => !p)}
      isLoading={isLoading}
    />
  );
}

export default Login;
