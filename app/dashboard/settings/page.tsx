"use client"

import { Card } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600 mt-1">Personaliza tu panel administrativo</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Información General</h3>
            <p className="text-slate-600 text-sm">Aquí podrás editar la información de tu negocio</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
