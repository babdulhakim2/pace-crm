"use client";
/// <reference path="./speech.d.ts" />
import { useState, useRef, useCallback, useEffect } from "react";

export interface UseSpeechReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!isSupported) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }
    setError(null);
    setTranscript("");
    setInterimTranscript("");

    // Request mic permission first
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Stop the stream immediately — we only needed permission
        stream.getTracks().forEach((t) => t.stop());

        const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Ctor) return;
        const recognition = new Ctor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-GB";
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let final = "";
          let interim = "";
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript;
            } else {
              interim += result[0].transcript;
            }
          }
          setTranscript(final);
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const errMap: Record<string, string> = {
            "not-allowed": "Microphone access was denied. Please allow microphone access in your browser settings.",
            "no-speech": "No speech was detected. Please try again.",
            "audio-capture": "No microphone was found. Please check your device.",
            "network": "Network error occurred. Please check your connection.",
          };
          setError(errMap[event.error] || `Speech recognition error: ${event.error}`);
          setIsListening(false);
          restartRef.current = false;
        };

        recognition.onend = () => {
          if (restartRef.current) {
            // Intentionally stopped
            restartRef.current = false;
          }
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        restartRef.current = true;
        recognition.start();
        setIsListening(true);
      })
      .catch(() => {
        setError("Microphone access was denied. Please allow microphone access in your browser settings.");
      });
  }, [isSupported]);

  const stop = useCallback(() => {
    restartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, [stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        restartRef.current = false;
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isListening, transcript, interimTranscript, error, isSupported, start, stop, reset };
}
