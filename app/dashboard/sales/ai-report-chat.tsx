// app/dashboard/sales/ai-report-chat.tsx
"use client"

import { useState, useRef, useEffect } from "react"
// Se elimina Card
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Mic } from "lucide-react" // Se elimina MessageCircle
import { generateDynamicReport } from "./actions"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { cn } from "@/lib/utils"

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

  const { 
    transcript, 
    isListening, 
    isSupported, 
    startListening, 
    stopListening 
  } = useSpeechRecognition()

  useEffect(() => {
    if (transcript) {
      setInputValue(transcript)
    }
  }, [transcript])

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
    // Se elimina la Card y se reemplaza por un div flexible
    <div className="flex flex-col h-full p-6">
      
      {/* Se eliminó el Título y Descripción */}

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
          disabled={loading || isListening}
          className="flex-1"
        />
        
        <Button
          type="button"
          onClick={() => (isListening ? stopListening() : startListening())}
          disabled={loading || !isSupported}
          className={cn(
            isListening
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          )}
          title={isListening ? "Detener dictado" : "Iniciar dictado"}
        >
          <Mic className="w-4 h-4" />
        </Button>

        <Button
          onClick={handleSendMessage}
          disabled={loading || !inputValue.trim() || isListening}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {!isSupported && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          El dictado por voz no es compatible con este navegador.
        </p>
      )}
    </div>
  )
}