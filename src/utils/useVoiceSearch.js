import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook para interactuar con el sensor de micrófono del dispositivo
 * utilizando la Web Speech API nativa (SpeechRecognition / webkitSpeechRecognition)
 */
export function useVoiceSearch({ onResult, lang = "es-MX" } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Detener tras una frase completa
      recognition.interimResults = true; // Mostrar resultados mientras habla
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript;
          } else {
            interimStr += item[0].transcript;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr) {
          const cleanText = finalStr.trim();
          setTranscript(cleanText);
          setInterimTranscript("");
          if (onResult) {
            onResult(cleanText);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn("🎙️ [Voz] Error en reconocimiento de voz:", event.error);
        let errorMsg = "Ocurrió un error con el micrófono.";
        if (event.error === "not-allowed") {
          errorMsg = "Permiso de micrófono denegado. Permite el acceso al micrófono en la barra de direcciones.";
        } else if (event.error === "no-speech") {
          errorMsg = "No se detectó ninguna voz. Intenta hablar nuevamente.";
        } else if (event.error === "audio-capture") {
          errorMsg = "No se encontró ningún micrófono en el dispositivo.";
        } else if (event.error === "network") {
          errorMsg = "Error de red al conectar el servicio de voz.";
        }
        setError(errorMsg);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError("Tu navegador no soporta reconocimiento de voz nativo (Web Speech API).");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, onResult]);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");

    // 1. Solicitar permiso explícito al sensor de micrófono si es posible
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Liberar el stream inmediatamente (sólo para activar el prompt de permisos)
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Acceso al sensor de micrófono denegado. Habilita los permisos en tu navegador.");
          return;
        }
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Si ya estaba activo, detener y reiniciar
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch {
              // ignore
            }
          }, 150);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}

