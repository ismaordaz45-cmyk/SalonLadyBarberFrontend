import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook para interactuar con el sensor de micrófono del dispositivo
 * utilizando la Web Speech API nativa (SpeechRecognition / webkitSpeechRecognition)
 */
export function useVoiceSearch({ onResult, onInterim, lang = "es-MX" } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);
  const latestTextRef = useRef("");
  const hasDispatchedRef = useRef(false);
  const autoStopTimerRef = useRef(null);

  // Mantener actualizadas las referencias de los callbacks sin reiniciar el recognizer
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onInterimRef.current = onInterim;
  }, [onInterim]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Mantener abierto mientras habla para evitar cortes prematuros
      recognition.interimResults = true; // Mostrar resultados mientras habla en tiempo real
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        hasDispatchedRef.current = false;
        latestTextRef.current = "";
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

        const currentText = (finalStr || interimStr || "").trim();
        if (currentText) {
          latestTextRef.current = currentText;
          setTranscript(currentText);

          // Escribir en tiempo real en el input si se proporcionó onInterim
          if (onInterimRef.current) {
            onInterimRef.current(currentText);
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        // Si tenemos un resultado final
        if (finalStr && finalStr.trim()) {
          const cleanFinal = finalStr.trim();
          latestTextRef.current = cleanFinal;
          setTranscript(cleanFinal);
          setInterimTranscript("");

          // Limpiar temporizador previo si existe
          if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current);
          }

          // Esperar 400ms tras el final para asegurar que no agregue otra palabra y buscar automáticamente
          autoStopTimerRef.current = setTimeout(() => {
            if (!hasDispatchedRef.current && onResultRef.current) {
              hasDispatchedRef.current = true;
              onResultRef.current(cleanFinal);
              try {
                recognition.stop();
              } catch (_) {}
            }
          }, 450);
        } else if (currentText) {
          // Si el usuario dijo algo como interim y hace una pausa de 1.4s, disparar búsqueda automática
          if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current);
          }
          autoStopTimerRef.current = setTimeout(() => {
            if (!hasDispatchedRef.current && latestTextRef.current && onResultRef.current) {
              hasDispatchedRef.current = true;
              onResultRef.current(latestTextRef.current);
              try {
                recognition.stop();
              } catch (_) {}
            }
          }, 1400);
        }
      };

      recognition.onerror = (event) => {
        console.warn("🎙️ [Voz] Evento de error:", event.error);
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
        }

        let errorMsg = "Ocurrió un error con el micrófono.";
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          errorMsg = "Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador.";
        } else if (event.error === "no-speech") {
          errorMsg = "No se detectó voz. Intenta hablar nuevamente.";
        } else if (event.error === "audio-capture") {
          errorMsg = "No se encontró ningún micrófono en el dispositivo.";
        } else if (event.error === "network") {
          errorMsg = "Error de red al procesar el reconocimiento de voz.";
        }

        // Si ya teníamos texto reconocido y fue no-speech, no lo borramos
        if (event.error !== "no-speech") {
          setError(errorMsg);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
        }

        // Si terminó el reconocimiento y teníamos texto que no se había despachado aún, despachar búsqueda automática
        if (!hasDispatchedRef.current && latestTextRef.current && latestTextRef.current.trim()) {
          hasDispatchedRef.current = true;
          if (onResultRef.current) {
            onResultRef.current(latestTextRef.current.trim());
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError("Tu navegador no soporta reconocimiento de voz nativo (Web Speech API).");
    }

    return () => {
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    latestTextRef.current = "";
    hasDispatchedRef.current = false;
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
    }

    if (!recognitionRef.current) {
      setError("Reconocimiento de voz no soportado en este navegador.");
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      // Si ya estaba activo, detener y reiniciar limpiamente
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn("[Voz] Error al reiniciar recognition:", err);
        }
      }, 150);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    latestTextRef.current = "";
    hasDispatchedRef.current = false;
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
