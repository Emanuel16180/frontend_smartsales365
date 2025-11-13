"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Eye, EyeOff, LayoutDashboard } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    clearError()

    // Validation
    if (!email || !password) {
      setLocalError("Por favor completa todos los campos")
      return
    }

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión"
      setLocalError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white">
        <div className="p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="size-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <LayoutDashboard className="size-8 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">SmartSales365</div>
            <p className="text-slate-600">Accede a tu cuenta de administrador</p>
          </div>

          {/* Error Messages */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error || localError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="sr-only">Correo Electrónico</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Mail className="size-4 text-slate-500" />
                </InputGroupAddon>
                <InputGroupInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </InputGroup>
            </div>

            <div>
              <Label className="sr-only">Contraseña</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Lock className="size-4 text-slate-500" />
                </InputGroupAddon>
                <InputGroupInput
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  disabled={isLoading}
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-500 hover:text-slate-800"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" disabled={isLoading} />
                <Label htmlFor="remember" className="font-normal text-slate-700">
                  Recordar mis datos
                </Label>
              </div>
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-700"
                onClick={(e) => {
                  e.preventDefault()
                  setLocalError("Función de recuperación no implementada.")
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 h-10"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-600 text-xs mt-8">
            © 2025 SmartSales365. Todos los derechos reservados.
          </p>
        </div>
      </Card>
    </div>
  )
}