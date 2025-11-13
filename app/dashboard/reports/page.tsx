"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Select ya no es necesario para los filtros principales
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Search, FileDown, Loader2, MessageCircle, User, Eye } from "lucide-react"
import { AIReportChat } from "../sales/ai-report-chat" 
import { fetchSalesData, generateReport } from "../sales/actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Tipos de datos (copiados de la pág de ventas)
interface SaleDetail {
  product: { id: number; name: string; image_url: string };
  quantity: number;
  price_at_purchase: string;
}
interface Warranty {
  product: { id: number; name: string; image_url: string };
  start_date: string;
  expiration_date: string;
}
interface Sale {
  id: number;
  user: { id: number; email: string; full_name: string; phone_number: string; address: string; role: string };
  total_amount: string;
  status: string;
  created_at: string;
  details: SaleDetail[];
  activated_warranties: Warranty[];
}

export default function ReportsPage() {
  // --- ESTADOS DE FILTROS ACTUALIZADOS ---
  const [clientSearch, setClientSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [montoMin, setMontoMin] = useState("")
  const [montoMax, setMontoMax] = useState("")
  // Se eliminaron: status, month, year

  // Estados para el reporte
  const [reportData, setReportData] = useState<Sale[] | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  // Estados para los botones de descarga
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingCsv, setLoadingCsv] = useState(false)
  
  // Estado para el chat de IA
  const [isChatOpen, setIsChatOpen] = useState(false)

  // --- handleReset ACTUALIZADO ---
  const handleReset = () => {
    setClientSearch("")
    setProductSearch("")
    setFechaInicio("")
    setFechaFin("")
    setMontoMin("")
    setMontoMax("")
    // Se eliminaron: setStatus, setMonth, setYear
    setReportData(null) // Limpia el reporte generado
    setReportError(null)
  }

  // --- getFilterParams ACTUALIZADO ---
  const getFilterParams = () => {
    return {
      client_search: clientSearch,
      product_search: productSearch,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      monto_min: montoMin,
      monto_max: montoMax,
      // Se eliminaron: status, month, year
    }
  }
  
  // Función para generar la tabla de reporte
  const handleGenerateReport = async () => {
    setReportLoading(true)
    setReportData(null)
    setReportError(null)
    
    try {
      const filters = getFilterParams()
      // Usamos la misma acción 'fetchSalesData' pero con los filtros
      const result = await fetchSalesData({ ...filters, page: 1 }) 

      if (result.success && result.data) {
        if (result.data.results.length === 0) {
          setReportError("No se encontraron resultados para estos filtros.")
        } else {
          setReportData(result.data.results)
        }
      } else {
        setReportError(result.error || "Error al generar el reporte")
      }
    } catch (err) {
      setReportError("Error al generar el reporte")
      console.error("[v0] Report error:", err)
    } finally {
      setReportLoading(false)
    }
  }
  
  // Función para descargar el reporte (PDF o CSV)
  const handleDownload = async (type: "pdf" | "csv") => {
    const filters = getFilterParams()
    try {
      setReportError(null)
      if (type === "pdf") setLoadingPdf(true)
      else setLoadingCsv(true)

      // Pasamos los filtros (sin status, month, year)
      const result = await generateReport(filters, type)

      if (!result.success) {
        setReportError(result.error || "Error al descargar el reporte")
      }
    } catch (err) {
      setReportError("Error al descargar el reporte")
      console.error("[v0] Download error:", err)
    } finally {
      if (type === "pdf") setLoadingPdf(false)
      else setLoadingCsv(false)
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-600 mt-1">Genera reportes de ventas y usa la IA para análisis de datos.</p>
      </div>

      {/* Tarjeta de Filtros (ahora es la acción principal) */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Filtros para Reportes</h2>
        <p className="text-sm text-slate-600 mb-4">
          Define los filtros y presiona "Generar Reporte" para ver los datos en pantalla.
        </p>

        {/* --- GRID DE FILTROS ACTUALIZADA (lg:grid-cols-3) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Buscar Cliente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar Cliente</label>
            <Input
              placeholder="Nombre, apellido o email..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Buscar Producto */}
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
          
          {/* --- FILTROS DE ESTADO, MES Y AÑO ELIMINADOS --- */}
          
        </div>
        
        {/* Botones de acción de filtros */}
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport} disabled={reportLoading} className="bg-blue-600 hover:bg-blue-700">
            {reportLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {reportLoading ? "Generando..." : "Generar Reporte"}
          </Button>
          <Button onClick={handleReset} variant="outline" disabled={reportLoading}>
            <X className="w-4 h-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      </Card>
      
      {/* ... (El resto del archivo: sección de reporte condicional y botón flotante de IA) ... */}
      
      {reportLoading && (
        <Card className="p-6 text-center text-slate-600">
          <Loader2 className="w-5 h-5 mx-auto animate-spin" />
          <p className="mt-2">Cargando reporte...</p>
        </Card>
      )}

      {reportError && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <p className="text-yellow-800 text-center font-medium">{reportError}</p>
        </Card>
      )}

      {!reportLoading && !reportData && !reportError && (
        <Card className="p-6 border-dashed border-slate-300 bg-slate-50">
          <p className="text-center text-slate-500">
            Usa los filtros para generar un reporte o presiona "Generar Reporte" para ver todas las ventas.
          </p>
        </Card>
      )}

      {reportData && (
        <Card>
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Reporte Generado</h3>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDownload("csv")}
                disabled={loadingCsv || loadingPdf}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loadingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Descargar CSV
              </Button>
              <Button
                onClick={() => handleDownload("pdf")}
                disabled={loadingPdf || loadingCsv}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {loadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Descargar PDF
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Monto Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((sale) => (
                  <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900 font-medium">#{sale.id}</td>
                    <td className="py-3 px-4 text-slate-900">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-slate-200 text-slate-600"><User className="size-4" /></AvatarFallback>
                        </Avatar>
                        {sale.user.full_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{sale.user.email}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">
                      BOB {Number.parseFloat(sale.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          sale.status === "COMPLETED"
                            ? "text-green-700 border-green-200 bg-green-50 font-medium"
                            : "text-yellow-700 border-yellow-200 bg-yellow-50 font-medium"
                        }
                      >
                        {sale.status === "COMPLETED" ? "Completada" : "Pendiente"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">
                      {new Date(sale.created_at).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Botón Flotante de IA */}
      <Button
        className="fixed bottom-8 right-8 rounded-full shadow-lg z-40"
        size="icon-lg"
        onClick={() => setIsChatOpen(true)}
        aria-label="Abrir chat de IA"
      >
        <MessageCircle className="size-6" />
      </Button>

      {/* Pop-up de Chat de IA */}
      {isChatOpen && (
        <Card className="fixed bottom-24 right-8 w-full max-w-md h-[500px] shadow-xl z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-slate-50 rounded-t-xl">
            <h3 className="font-semibold text-slate-900">Generador de Reportes con IA</h3>
            <Button variant="ghost" size="icon-sm" onClick={() => setIsChatOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <AIReportChat />
        </Card>
      )}
    </div>
  )
}