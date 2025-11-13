"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { generateReport } from "./actions"

interface ReportGeneratorProps {
  clientSearch?: string
  productSearch?: string
  fechaInicio?: string
  fechaFin?: string
  montoMin?: string
  montoMax?: string
  status?: string
  month?: string
  year?: string
}

export function ReportGenerator(props: ReportGeneratorProps) {
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingCsv, setLoadingCsv] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (type: "pdf" | "csv") => {
    try {
      setError(null)
      if (type === "pdf") setLoadingPdf(true)
      else setLoadingCsv(true)

      const result = await generateReport(
        {
          client_search: props.clientSearch,
          product_search: props.productSearch,
          fecha_inicio: props.fechaInicio,
          fecha_fin: props.fechaFin,
          monto_min: props.montoMin,
          monto_max: props.montoMax,
          status: props.status,
          month: props.month,
          year: props.year,
        },
        type,
      )

      if (!result.success) {
        setError(result.error || "Error al descargar el reporte")
      }
    } catch (err) {
      setError("Error al descargar el reporte")
      console.error("[v0] Download error:", err)
    } finally {
      if (type === "pdf") setLoadingPdf(false)
      else setLoadingCsv(false)
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-600" />
            Descargar Reporte
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Genera un reporte de ventas con los filtros actuales en tu formato preferido
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

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
    </Card>
  )
}
