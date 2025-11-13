// components/top-bar.tsx

"use client"

import { useRouter } from "next/navigation"
// import { useAuth } from "@/contexts/auth-context" // Ya no se usa
import { Button } from "@/components/ui/button"

export function TopBar() {
  const router = useRouter()
  // const { logout } = useAuth() // No llamamos a logout

  const handleLogout = () => {
    // logout() // No limpiamos el token
    router.push("/login") // Solo redirigimos al login
  }

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Bienvenido al Panel Administrativo</h2>
      </div>
      <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-6">
        Cerrar Sesión
      </Button>
    </div>
  )
}