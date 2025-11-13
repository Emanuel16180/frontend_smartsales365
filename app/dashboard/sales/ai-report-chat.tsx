// app/dashboard/sales/ai-report-chat.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader2, Mic } from "lucide-react" // <--- Importa Mic
import { generateDynamicReport } from "./actions"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition" // <--- Importa el hook
import { cn } from "@/lib/utils" // <--- Importa cn (classnames)

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIReportChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hola! Soy tu asistente de reportes. Puedo ayudarte a generar reportes de ventas. Intenta decirme algo como: 'Quiero un reporte PDF del cliente Juan Perez' o 'Dame un CSV con ventas de diciembre 2024'",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // --- Lógica de Reconocimiento de Voz ---
  const { 
    transcript, 
    isListening, 
    isSupported, 
    startListening, 
    stopListening 
  } = useSpeechRecognition()

  // Actualiza el input con la transcripción
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript)
    }
  }, [transcript])
  // --- Fin Lógica de Voz ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setLoading(true)

    try {
      const result = await generateDynamicReport(inputValue)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: result.success
          ? "Reporte generado y descargado correctamente!"
          : result.error || "Error al generar el reporte",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "assistant",
        content: "Error al procesar tu solicitud. Intenta de nuevo.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      console.error("[v0] Chat error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-200 flex flex-col h-[500px]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-600" />
          Generador de Reportes con IA
        </h3>
        <p className="text-sm text-slate-600 mt-1">Describe en lenguaje natural el reporte que necesitas</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-white rounded-lg p-4 border border-slate-200">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                message.type === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-900 rounded-bl-none"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generando reporte...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- SECCIÓN DE INPUT MODIFICADA --- */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !loading && !isListening && handleSendMessage()}
          placeholder="Describe el reporte que necesitas..."
          disabled={loading || isListening} // Deshabilita el input mientras escucha
          className="flex-1"
        />
        
        {/* Botón de Micrófono */}
        <Button
          type="button"
          onClick={() => (isListening ? stopListening() : startListening())}
          disabled={loading || !isSupported} // Deshabilita si carga o no es compatible
          className={cn(
            isListening
              ? "bg-red-600 hover:bg-red-700" // Rojo si está escuchando
              : "bg-blue-600 hover:bg-blue-700" // Azul si no está escuchando
          )}
          title={isListening ? "Detener dictado" : "Iniciar dictado"}
        >
          <Mic className="w-4 h-4" />
        </Button>

        {/* Botón de Enviar */}
        <Button
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim() || isListening} // Deshabilita si escucha
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Mensaje de compatibilidad */}
      {!isSupported && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          El dictado por voz no es compatible con este navegador.
        </p>
      )}
      {/* --- FIN DE SECCIÓN MODIFICADA --- */}
    </Card>
  )
}