"use client"

import { Card } from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
        <p className="text-slate-600 mt-1">Visualiza y gestiona todos los pedidos de clientes</p>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <p className="text-slate-600">No hay pedidos registrados aún</p>
        </div>
      </Card>
    </div>
  )
}
