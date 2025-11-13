"use client"

import AuthService from "@/lib/auth-service"

export async function fetchDashboardData() {
  try {
    const token = AuthService.getAccessToken()

    if (!token) {
      return {
        success: false,
        error: "No authentication token found. Please log in.",
      }
    }

    const [historicalRes, predictionRes] = await Promise.all([
      fetch(`/api/dashboard/historical-sales`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(`/api/dashboard/future-prediction`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
    ])

    let historicalData = []
    let predictionData = null

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
        : result.data || []
    } else {
      console.error("[v0] Historical sales failed:", historicalRes.status)
    }

    if (predictionRes.ok) {
      const result = await predictionRes.json()
      predictionData = result
    } else {
      console.error("[v0] Prediction failed:", predictionRes.status)
    }

    return {
      success: true,
      data: {
        historical: historicalData,
        prediction: predictionData,
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
