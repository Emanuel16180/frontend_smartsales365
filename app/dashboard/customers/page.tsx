// app/dashboard/customers/page.tsx

"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCustomers } from "@/hooks/use-customers" // Importar hook
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CustomersPage() {
  const {
    customers,
    isLoading,
    error,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    totalCount,
  } = useCustomers()

  // Asumiendo que la API pagina de 10 en 10, o usamos el count total
  // La API que me diste parece paginar de 25 en 25 (71 count / 3 páginas)
  const itemsPerPage = 25 // Ajusta esto si tu backend pagina diferente
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
        <p className="text-slate-600 mt-1">
          Gestiona la información de tus clientes. Total: {totalCount}
        </p>
      </div>

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-slate-600">Cargando clientes...</p>
        </Card>
      ) : customers.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <p className="text-slate-600">No hay clientes registrados aún</p>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{customer.full_name}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{customer.email}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {customer.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Página {currentPage} de {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={!hasPreviousPage || isLoading}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasNextPage || isLoading}
                variant="outline"
                size="sm"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}