"use client"

import AuthService from "@/lib/auth-service"

// 1. Definimos las interfaces limpias (como las quiere usar tu Frontend)
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
  total_sold?: number        // Usamos total_sold para el histórico
  predicted_quantity?: number // Usamos predicted_quantity para la predicción
  image_url?: string
}

export async function fetchDashboardData() {
  try {
    const token = AuthService.getAccessToken()

    if (!token) {
      return {
        success: false,
        error: "No authentication token found. Please log in.",
      }
    }

    const [historicalRes, predictionRes, topLastMonthRes, topPredictionRes] = await Promise.all([
      fetch(`/api/dashboard/historical-sales`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`/api/dashboard/future-prediction`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`/api/dashboard/top-last-month`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`/api/dashboard/top-prediction`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    let historicalData: SalesData[] = []
    let predictionData: PredictionData | null = null
    let topLastMonth: TopProduct[] = []
    let topPrediction: TopProduct[] = []

    if (historicalRes.ok) {
      const result = await historicalRes.json()
      historicalData = Array.isArray(result)
        ? result.map((item: any) => {
            const dateObj = new Date(item.date)
            return {
              date: item.date,
              month: dateObj.toLocaleString("es-ES", { month: "long" }),
              year: dateObj.getFullYear(),
              total_sales: item.total_sales_bob,
            }
          })
        : []
    }

    if (predictionRes.ok) {
      predictionData = await predictionRes.json()
    }
    
    // --- CORRECCIÓN AQUÍ: Mapeo de datos para Top Histórico ---
    if (topLastMonthRes.ok) {
      const rawData = await topLastMonthRes.json()
      if (Array.isArray(rawData)) {
        topLastMonth = rawData.map((item: any) => ({
          // Aquí arreglamos el doble guion bajo del backend
          product_name: item.product__name, 
          total_sold: item.total_sold,
          image_url: item.product__image_url
        }))
      }
    }

    // --- CORRECCIÓN AQUÍ: Mapeo de datos para Top Predicción ---
    // Aplicamos la misma lógica por si acaso el backend usa la misma convención
    if (topPredictionRes.ok) {
      const rawData = await topPredictionRes.json()
      if (Array.isArray(rawData)) {
        topPrediction = rawData.map((item: any) => ({
          // Intentamos leer con doble guion, si no existe, probamos con uno simple
          product_name: item.product__name || item.product_name,
          predicted_quantity: item.predicted_quantity || 0,
          image_url: item.product__image_url
        }))
      }
    }

    return {
      success: true,
      data: {
        historical: historicalData,
        prediction: predictionData,
        topLastMonth: topLastMonth,
        topPrediction: topPrediction,
      },
    }
  } catch (error) {
    console.error("[v0] Dashboard fetch error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}