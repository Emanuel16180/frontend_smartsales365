// hooks/use-speech-recognition.ts
"use client"

import { useState, useEffect, useRef } from "react"

// --- INICIO DE CORRECCIÓN DE TIPOS ---

// 1. Definir los tipos para la API de SpeechRecognition que faltan en TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

// 2. Este es el TIPO de una instancia de SpeechRecognition
// (Lo que antes se llamaba 'SpeechRecognition' y daba error)
interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionEvent) => void
  onend: () => void
  onerror: (event: any) => void // 'any' es más simple para el error
  start: () => void
  stop: () => void
}

// 3. Este es el TIPO del CONSTRUCTOR (new SpeechRecognition())
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

// 4. Extender la interfaz 'Window' para que TypeScript conozca las propiedades
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

// --- FIN DE CORRECCIÓN DE TIPOS ---


interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
}

// Polyfill para compatibilidad entre navegadores (Chrome usa webkitSpeechRecognition)
// Esta variable (con 'S' mayúscula) es el CONSTRUCTOR
const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

/**
 * Hook para manejar el reconocimiento de voz del navegador.
 */
export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  
  // Usamos useRef para mantener la instancia de recognition entre renders
  // CORRECCIÓN: El tipo es 'SpeechRecognitionInstance' (el TIPO de instancia)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    // 'recognition' es de tipo 'SpeechRecognitionInstance'
    const recognition = new SpeechRecognition()
    
    // Configuración de la API
    recognition.continuous = true     // Sigue escuchando
    recognition.interimResults = true // Muestra resultados parciales
    recognition.lang = "es-BO"        // Español (Bolivia)

    // Evento cuando se recibe un resultado
    recognition.onresult = (event: SpeechRecognitionEvent) => { // Añadir tipo al evento
      let finalTranscript = ""
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript
      }
      setTranscript(finalTranscript)
    }

    // Evento cuando deja de escuchar
    recognition.onend = () => {
      setIsListening(false)
    }

    // Evento en caso de error
    recognition.onerror = (event) => {
      // console.error("Speech recognition error:", event.error) // Comentado para que no moleste
      setIsListening(false)
    }

    // Guardamos la instancia en el ref
    recognitionRef.current = recognition

    // Limpieza al desmontar el componente
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("") // Limpia la transcripción anterior
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  return { transcript, isListening, isSupported, startListening, stopListening }
}