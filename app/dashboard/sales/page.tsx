"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Eye, X } from "lucide-react"
import { fetchSalesData } from "./actions"
import { ReportGenerator } from "./report-generator"
import { AIReportChat } from "./ai-report-chat"

interface SaleDetail {
  product: {
    id: number
    name: string
    image_url: string
  }
  quantity: number
  price_at_purchase: string
}

interface Warranty {
  product: {
    id: number
    name: string
    image_url: string
  }
  start_date: string
  expiration_date: string
}

interface Sale {
  id: number
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    phone_number: string
    address: string
    full_name: string
  }
  total_amount: string
  status: string
  created_at: string
  stripe_payment_intent_id: string
  details: SaleDetail[]
  activated_warranties: Warranty[]
}

interface SalesResponse {
  count: number
  next: string | null
  previous: string | null
  results: Sale[]
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const [clientSearch, setClientSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [montoMin, setMontoMin] = useState("")
  const [montoMax, setMontoMax] = useState("")
  const [status, setStatus] = useState("all")
  const [month, setMonth] = useState("all")
  const [year, setYear] = useState("")

  const loadSales = async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchSalesData({
        page,
        client_search: clientSearch,
        product_search: productSearch,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        monto_min: montoMin,
        monto_max: montoMax,
        status,
        month,
        year,
      })

      if (result.success && result.data) {
        setSales(result.data.results)
        setTotalCount(result.data.count)
        setCurrentPage(page)
      } else {
        setError(result.error || "Error al cargar las ventas")
      }
    } catch (err) {
      setError("Error al cargar las ventas")
      console.error("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const handleFilter = () => {
    loadSales(1)
  }

  const handleReset = () => {
    setClientSearch("")
    setProductSearch("")
    setFechaInicio("")
    setFechaFin("")
    setMontoMin("")
    setMontoMax("")
    setStatus("all")
    setMonth("all")
    setYear("")
    setCurrentPage(1)
  }

  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ventas</h1>
        <p className="text-slate-600 mt-1">Visualiza y gestiona todas las ventas del sistema</p>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportGenerator
          clientSearch={clientSearch}
          productSearch={productSearch}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          montoMin={montoMin}
          montoMax={montoMax}
          status={status}
          month={month}
          year={year}
        />

        <AIReportChat />
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Cliente Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar Cliente</label>
            <Input
              placeholder="Nombre, apellido o email..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Producto Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar Producto</label>
            <Input
              placeholder="Nombre o categoría..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Fin</label>
            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full" />
          </div>

          {/* Monto Mínimo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monto Mínimo</label>
            <Input
              type="number"
              placeholder="0.00"
              value={montoMin}
              onChange={(e) => setMontoMin(e.target.value)}
              step="0.01"
              className="w-full"
            />
          </div>

          {/* Monto Máximo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monto Máximo</label>
            <Input
              type="number"
              placeholder="999999.99"
              value={montoMax}
              onChange={(e) => setMontoMax(e.target.value)}
              step="0.01"
              className="w-full"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mes</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mes..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">Enero</SelectItem>
                <SelectItem value="2">Febrero</SelectItem>
                <SelectItem value="3">Marzo</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Mayo</SelectItem>
                <SelectItem value="6">Junio</SelectItem>
                <SelectItem value="7">Julio</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Septiembre</SelectItem>
                <SelectItem value="10">Octubre</SelectItem>
                <SelectItem value="11">Noviembre</SelectItem>
                <SelectItem value="12">Diciembre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Año</label>
            <Input
              type="number"
              placeholder="2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleFilter} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button onClick={handleReset} variant="outline">
            Limpiar Filtros
          </Button>
        </div>
      </Card>

      {/* Sales Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-600">Cargando ventas...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No hay ventas registradas con estos filtros</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Cliente</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Productos</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Monto Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900 font-medium">#{sale.id}</td>
                      <td className="py-3 px-4 text-slate-900">{sale.user.full_name}</td>
                      <td className="py-3 px-4 text-slate-600 text-sm">{sale.user.email}</td>
                      <td className="py-3 px-4 text-slate-600 text-sm">{sale.details.length} producto(s)</td>
                      <td className="py-3 px-4 text-slate-900 font-semibold">
                        BOB {Number.parseFloat(sale.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            sale.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {sale.status === "COMPLETED" ? "Completada" : "Pendiente"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {new Date(sale.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-600">Mostrando resultados | Total: {totalCount} ventas</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => loadSales(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 py-2 text-sm text-slate-600">
                    Página {currentPage} de {totalPages || 1}
                  </span>
                  <Button
                    onClick={() => loadSales(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Detalles de Venta #{selectedSale.id}</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Información del Cliente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Nombre:</p>
                    <p className="font-medium text-slate-900">{selectedSale.user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Email:</p>
                    <p className="font-medium text-slate-900">{selectedSale.user.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Teléfono:</p>
                    <p className="font-medium text-slate-900">{selectedSale.user.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Dirección:</p>
                    <p className="font-medium text-slate-900">{selectedSale.user.address}</p>
                  </div>
                </div>
              </div>

              {/* Sale Info */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Información de la Venta</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Fecha:</p>
                    <p className="font-medium text-slate-900">
                      {new Date(selectedSale.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Estado:</p>
                    <p
                      className={`font-medium ${selectedSale.status === "COMPLETED" ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {selectedSale.status === "COMPLETED" ? "Completada" : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Productos</h3>
                <div className="space-y-3">
                  {selectedSale.details.map((detail, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <img
                        src={detail.product.image_url || "/placeholder.svg"}
                        alt={detail.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{detail.product.name}</p>
                        <p className="text-sm text-slate-600">Cantidad: {detail.quantity}</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">
                          BOB {Number.parseFloat(detail.price_at_purchase).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warranties if any */}
              {selectedSale.activated_warranties.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Garantías Activadas</h3>
                  <div className="space-y-3">
                    {selectedSale.activated_warranties.map((warranty, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <img
                          src={warranty.product.image_url || "/placeholder.svg"}
                          alt={warranty.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{warranty.product.name}</p>
                          <p className="text-sm text-slate-600">
                            Desde: {new Date(warranty.start_date).toLocaleDateString("es-ES")}
                          </p>
                          <p className="text-sm text-slate-600">
                            Hasta: {new Date(warranty.expiration_date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Monto Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    BOB {Number.parseFloat(selectedSale.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
