"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"
import { fetchDashboardData } from "./actions"

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

export default function DashboardPage() {
  const [historicalData, setHistoricalData] = useState<SalesData[]>([])
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await fetchDashboardData()

        if (result.success && result.data) {
          const historicalData = Array.isArray(result.data.historical) ? result.data.historical : []
          const predictionData = result.data.prediction

          setHistoricalData(historicalData)
          setPredictionData(predictionData)

          if (historicalData.length === 0 && !predictionData) {
            setError("No hay datos disponibles. Verifica tu conexión.")
          }
        } else {
          setError(result.error || "Error al cargar datos del panel de control")
        }
      } catch (err) {
        console.error("[v0] Dashboard error:", err)
        setError("Error inesperado al cargar el panel de control")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const chartData = historicalData.map((item) => ({
    name: `${item.month.substring(0, 3)} ${item.year}`,
    sales: item.total_sales,
    historical: item.total_sales,
  }))

  const quickAccess = [
    {
      title: "Ventas",
      description: "Ver todas las ventas",
      href: "/dashboard/sales",
      icon: "🛒",
      color: "from-blue-50 to-blue-100",
    },
    {
      title: "Clientes",
      description: "Gestionar clientes",
      href: "/dashboard/customers",
      icon: "👥",
      color: "from-green-50 to-green-100",
    },
    {
      title: "Productos",
      description: "Gestionar productos",
      href: "/dashboard/products",
      icon: "📦",
      color: "from-purple-50 to-purple-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Panel de Control</h1>
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

      {/* Charts Section */}
      {loading ? (
        <Card className="p-6">
          <p className="text-slate-600 text-center py-8">Cargando datos...</p>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <p className="text-red-600 text-center py-8">{error}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historical Sales Chart */}
          <Card className="p-6">
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Ventas Históricas</h2>
              <p className="text-sm text-slate-500">En Bolivianos (Bs)</p>
            </div>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  sales: {
                    label: "Ventas (Bs)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => `Bs ${value.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--chart-1))"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-slate-600 text-center py-8">No hay datos históricos disponibles</p>
            )}
          </Card>

          {/* Future Prediction Chart */}
          <Card className="p-6">
            <div className="flex flex-col gap-1 mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Predicción Siguiente Mes</h2>
              <p className="text-sm text-slate-500">Modelo: Random Forest • En Bolivianos (Bs)</p>
            </div>
            {predictionData ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                  <p className="text-slate-600 text-sm mb-2">Venta Predicha</p>
                  <p className="text-4xl font-bold text-indigo-600 mb-2">
                    Bs {predictionData.predicted_sales_bob.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-slate-600 text-sm">
                    Período: <span className="font-semibold">{predictionData.prediction_period}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 text-center py-8">No hay predicción disponible</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
