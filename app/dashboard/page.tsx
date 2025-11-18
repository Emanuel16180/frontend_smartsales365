"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { fetchDashboardData } from "./actions"
import { Trophy, TrendingUp } from "lucide-react"

interface SalesData {
  date: string
  month: string
  year: number
  total_sales: number
}

interface PredictionData {
  prediction_period: string
  predicted_sales_bob: number
}

interface TopProduct {
  product_name: string
  total_sold?: number
  predicted_quantity?: number
}

export default function DashboardPage() {
  const [historicalData, setHistoricalData] = useState<SalesData[]>([])
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [topLastMonth, setTopLastMonth] = useState<TopProduct[]>([])
  const [topPrediction, setTopPrediction] = useState<TopProduct[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- FUNCIÓN PARA FORMATO RELATIVO (Mes pasado / Mes siguiente) ---
  const getPeriodLabel = (offset: number) => {
    const date = new Date()
    date.setMonth(date.getMonth() + offset)
    const monthName = date.toLocaleString('es-ES', { month: 'long' })
    const year = date.getFullYear()
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
  }

  const lastMonthLabel = getPeriodLabel(-1)
  const nextMonthLabel = getPeriodLabel(1)

  // --- NUEVA FUNCIÓN: FORMATO DESDE API (Ej: "2025-12" -> "Diciembre 2025") ---
  const formatPeriodFromApi = (periodString: string) => {
    if (!periodString) return ""
    const [year, month] = periodString.split('-').map(Number)
    // Creamos la fecha (restamos 1 al mes porque en JS enero es 0)
    const date = new Date(year, month - 1)
    const monthName = date.toLocaleString('es-ES', { month: 'long' })
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
  }
  // -------------------------------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchDashboardData()

        if (result.success && result.data) {
          setHistoricalData(result.data.historical)
          setPredictionData(result.data.prediction)
          setTopLastMonth(result.data.topLastMonth)
          setTopPrediction(result.data.topPrediction)
        } else {
          setError(result.error || "Error al cargar datos")
        }
      } catch (err) {
        console.error("[v0] Dashboard error:", err)
        setError("Error inesperado")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const chartData = historicalData.map((item) => ({
    name: `${item.month.substring(0, 3)} ${item.year}`,
    sales: item.total_sales,
  }))

  const quickAccess = [
    { title: "Ventas", description: "Ver todas las ventas", href: "/dashboard/sales", icon: "🛒", color: "from-blue-50 to-blue-100" },
    { title: "Productos", description: "Gestionar productos", href: "/dashboard/products", icon: "📦", color: "from-purple-50 to-purple-100" },
    { title: "Reportes", description: "Generar reportes", href: "/dashboard/reports", icon: "📄", color: "from-indigo-50 to-indigo-100" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Resumen de ventas y predicciones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickAccess.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className={`p-6 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br ${item.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-700 font-semibold">{item.title}</p>
                  <p className="text-slate-600 text-sm mt-1">{item.description}</p>
                </div>
                <span className="text-3xl">{item.icon}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {loading ? (
        <Card className="p-6"><p className="text-slate-600 text-center py-8">Cargando datos...</p></Card>
      ) : error ? (
        <Card className="p-6"><p className="text-red-600 text-center py-8">{error}</p></Card>
      ) : (
        <div className="space-y-6">
          
          {/* 1. Predicción Principal */}
          <Card className="p-6 lg:w-2/3 lg:mx-auto border-indigo-100 shadow-md">
            <div className="flex flex-col gap-1 mb-4 text-center">
              <h2 className="text-lg font-semibold text-slate-900">Predicción General Mes Siguiente</h2>
              <p className="text-sm text-slate-500">Modelo: Random Forest</p>
            </div>
            {predictionData ? (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center shadow-lg">
                <p className="text-indigo-100 text-sm mb-2 font-medium uppercase tracking-wider">Venta Total Estimada</p>
                <p className="text-5xl font-bold mb-2">
                  Bs {predictionData.predicted_sales_bob.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                </p>
                {/* --- AQUI APLICAMOS EL FORMATO --- */}
                <p className="text-indigo-200 text-sm">
                  Período: {formatPeriodFromApi(predictionData.prediction_period)}
                </p>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No disponible</p>
            )}
          </Card>

          {/* 2. Sección de Tops */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top 3 Realidad */}
            <Card className="p-6 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Top 3 Más Vendidos</h3>
                  <p className="text-xs text-slate-500">Periodo: {lastMonthLabel}</p>
                </div>
              </div>
              <div className="space-y-3">
                {topLastMonth.length > 0 ? (
                  topLastMonth.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-700' : 'bg-orange-300 text-orange-800'}`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{product.product_name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{product.total_sold} un.</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Sin datos disponibles</p>
                )}
              </div>
            </Card>

            {/* Top 3 Predicción */}
            <Card className="p-6 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Top 3 Tendencia IA</h3>
                  <p className="text-xs text-slate-500">Periodo: {nextMonthLabel}</p>
                </div>
              </div>
              <div className="space-y-3">
                {topPrediction.length > 0 ? (
                  topPrediction.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{product.product_name}</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-700">~{product.predicted_quantity} un.</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">Sin datos disponibles</p>
                )}
              </div>
            </Card>
          </div>

          {/* 3. Gráfico Histórico */}
          <Card className="p-6">
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Histórico de Ventas</h2>
              <p className="text-sm text-slate-500">Evolución en Bolivianos (Bs)</p>
            </div>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  sales: { label: "Ventas (Bs)", color: "hsl(220, 70%, 60%)" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => `Bs ${value.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`}
                    />
                    <Bar 
                      dataKey="sales" 
                      fill="var(--color-sales)" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-slate-600 text-center py-8">No hay datos históricos disponibles</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}